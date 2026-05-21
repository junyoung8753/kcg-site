"use client";

import { useRef, useState } from "react";
import {
  applyPriceAutoSuggestionAction,
  generatePriceAutoSuggestionAction,
  rejectPriceAutoSuggestionAction,
  updatePriceAutoSettingsAction,
  updatePricesAction,
} from "@/actions/price-actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { formatDateTimeKorean, formatDateTimeLocalKorean } from "@/lib/format";
import type { PriceAnnouncementDisplay } from "@/lib/price-announcement";
import { calculateGoldPurityBuyPrices } from "@/lib/price-formulas";
import { priceLineupRows, type PriceLineupRow } from "@/lib/price-presenter";
import type {
  PriceAutoSettings,
  PriceAutoSuggestion,
  PriceFreshness,
  PriceHistoryEntry,
  PriceCategory,
  PriceRecord,
} from "@/types/price";

interface AdminPricesWorkspaceProps {
  prices: PriceRecord[];
  settings: PriceAutoSettings;
  suggestion: PriceAutoSuggestion | null;
  publicPriceStatus: PriceAnnouncementDisplay;
  history: PriceHistoryEntry[];
  freshness: PriceFreshness;
  hasMetalsKey: boolean;
  statusCode?: string;
  statusMessage?: string | null;
  warnings?: string[];
}

function formatWon(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function formatSigned(value: number) {
  if (value === 0) return "0";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatWon(value)}`;
}

function formatDraftDelta(currentValue: number, draftValue: string) {
  if (draftValue.trim() === "") return "입력 필요";
  const parsed = Number(draftValue);
  if (!Number.isFinite(parsed)) return "입력 확인";
  const delta = Math.round(parsed) - currentValue;
  if (delta === 0) return "변동 없음";
  return formatSigned(delta);
}

function getDraftDeltaTone(currentValue: number, draftValue: string) {
  if (draftValue.trim() === "") return "text-[#8a2c20]";
  const parsed = Number(draftValue);
  if (!Number.isFinite(parsed)) return "text-[#8a2c20]";
  const delta = Math.round(parsed) - currentValue;
  if (delta > 0) return "text-[#9a3a20]";
  if (delta < 0) return "text-[#1d6287]";
  return "text-[var(--admin-muted)]";
}

function formatRate(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatPercentInput(value: number) {
  return Number((value * 100).toFixed(3));
}

function getAutoSourceLabel(source: PriceAutoSettings["source"]) {
  return source === "metals-dev" ? "Metals.Dev" : "Gold API";
}

function getAdminPriceSnapshotLabel(price: PriceRecord) {
  switch (price.category) {
    case "gold_24k_sell":
      return "순금 살 때";
    case "gold_24k_buy":
      return "순금 팔 때";
    case "gold_18k_buy":
      return "18K 팔 때";
    case "gold_14k_buy":
      return "14K 팔 때";
    case "platinum_sell":
      return "백금 살 때";
    case "platinum_buy":
      return "백금 팔 때";
    case "silver_sell":
      return "은 살 때";
    case "silver_buy":
      return "은 팔 때";
    default:
      return price.label;
  }
}

function getLatestUpdate(prices: PriceRecord[]) {
  const sorted = [...prices].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return sorted[0]?.updatedAt ?? prices[0]?.announcedAt ?? new Date().toISOString();
}

function getPostedBasisAt(prices: PriceRecord[]) {
  return prices[0]?.announcedAt ?? new Date().toISOString();
}

function getHoursBetween(laterValue: string, earlierValue: string) {
  const later = new Date(laterValue);
  const earlier = new Date(earlierValue);
  if (Number.isNaN(later.getTime()) || Number.isNaN(earlier.getTime())) return 0;
  return Math.abs(later.getTime() - earlier.getTime()) / 1000 / 60 / 60;
}

function getElapsedHoursLabel(value: string | null) {
  if (!value) return "기록 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "기록 오류";
  const hours = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000 / 60 / 60));
  if (hours < 1) return "1시간 이내";
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

function getStaleGuardLabel(settings: PriceAutoSettings, freshness: PriceFreshness) {
  if (!settings.staleGuardEnabled) return "꺼짐";
  const latest = freshness.latestManualChangedAt ?? freshness.latestAnyChangedAt;
  if (!latest) return "수동 등록 확인 필요";
  const date = new Date(latest);
  if (Number.isNaN(date.getTime())) return "수동 등록 시각 확인 필요";
  const elapsedHours = (Date.now() - date.getTime()) / 1000 / 60 / 60;
  return elapsedHours >= settings.staleAfterHours
    ? "수동 등록 확인 필요"
    : `${Math.ceil(settings.staleAfterHours - elapsedHours)}시간 여유`;
}

function getFeedbackTone(statusCode?: string) {
  if (!statusCode) return "neutral";
  if (statusCode.includes("error") || statusCode.includes("schema") || statusCode.includes("data-not-safe")) {
    return "danger";
  }
  if (
    statusCode.includes("held") ||
    statusCode.includes("disabled") ||
    statusCode.includes("outside") ||
    statusCode.includes("not-due") ||
    statusCode.includes("small-change") ||
    statusCode.includes("needs-review")
  ) {
    return "warning";
  }
  return "success";
}

function AdminActionFeedback({
  statusCode,
  message,
  warnings = [],
  scope,
}: {
  statusCode?: string;
  message?: string | null;
  warnings?: string[];
  scope?: "mode" | "auto" | "manual";
}) {
  if (!message) return null;
  if (scope === "mode" && !["auto-on-saved", "auto-off-saved", "auto-settings-saved", "demo", "auto-schema"].includes(statusCode ?? "")) {
    return null;
  }
  if (scope === "auto" && !String(statusCode ?? "").startsWith("auto-")) {
    return null;
  }
  if (scope === "manual" && !["saved", "saved-derived", "demo", "error"].includes(statusCode ?? "")) {
    return null;
  }

  const tone = getFeedbackTone(statusCode);
  const savedAtLabel = new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const toneClass =
    tone === "danger"
      ? "admin-status-danger"
      : tone === "warning"
        ? "admin-status-warning"
        : "admin-status-success";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${toneClass}`} data-testid={`admin-feedback-${scope ?? "general"}`}>
      <p className="font-semibold">{message}</p>
      {tone === "success" ? (
        <p className="mt-1 text-xs font-bold">저장됨 · 확인 시각 {savedAtLabel}</p>
      ) : null}
      {warnings.length ? (
        <div className="mt-2 space-y-1">
          {warnings.map((warning) => (
            <p key={warning}>· {warning}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getNextCheckLabel(settings: PriceAutoSettings, isAutoOn: boolean) {
  const savedIsAutoOn = settings.isEnabled && settings.mode === "auto_publish";
  if (!isAutoOn) return "자동시세 OFF";
  if (!savedIsAutoOn) return "저장 후 활성화";
  const base = settings.lastCheckedAt ? new Date(settings.lastCheckedAt) : new Date();
  if (Number.isNaN(base.getTime())) return "다음 cron 실행 시";
  return formatDateTimeKorean(addMinutes(base, settings.checkIntervalMinutes).toISOString());
}

function getScheduledRunLabel(settings: PriceAutoSettings, isAutoOn: boolean) {
  if (!isAutoOn) return "자동시세 OFF";
  if (!settings.isEnabled || settings.mode !== "auto_publish") return "저장 후 활성화";
  return "매일 오전 9:00";
}

function HiddenAutoSettingsFields({
  settings,
  enabled,
  mode,
  includeGoldPurityRates = true,
}: {
  settings: PriceAutoSettings;
  enabled: boolean;
  mode: PriceAutoSettings["mode"];
  includeGoldPurityRates?: boolean;
}) {
  return (
    <>
      {enabled ? <input type="hidden" name="autoEnabled" value="on" /> : null}
      <input type="hidden" name="autoSource" value={settings.source} />
      <input type="hidden" name="intervalHours" value={settings.checkIntervalMinutes === 120 ? 2 : 1} />
      <input type="hidden" name="checkIntervalMinutes" value={settings.checkIntervalMinutes} />
      <input type="hidden" name="autoMode" value={mode} />
      <input type="hidden" name="roundingUnit" value={settings.roundingUnit} />
      <input type="hidden" name="goldSellPremiumRate" value={settings.goldSellPremiumRate} />
      <input type="hidden" name="goldBuyDiscountRate" value={settings.goldBuyDiscountRate} />
      {includeGoldPurityRates ? (
        <>
          <input type="hidden" name="gold18kBuyRate" value={settings.gold18kBuyRate} />
          <input type="hidden" name="gold14kBuyRate" value={settings.gold14kBuyRate} />
        </>
      ) : null}
      <input type="hidden" name="platinumSellPremiumRate" value={settings.platinumSellPremiumRate} />
      <input type="hidden" name="platinumBuyDiscountRate" value={settings.platinumBuyDiscountRate} />
      <input type="hidden" name="silverSellPremiumRate" value={settings.silverSellPremiumRate} />
      <input type="hidden" name="silverBuyDiscountRate" value={settings.silverBuyDiscountRate} />
      <input type="hidden" name="minApplyChangeWon" value={settings.minApplyChangeWon} />
      <input type="hidden" name="maxAutoPublishChangePercent" value={settings.maxAutoPublishChangePercent} />
      {settings.businessHoursOnly ? <input type="hidden" name="businessHoursOnly" value="on" /> : null}
      <input type="hidden" name="staleGuardEnabled" value={settings.staleGuardEnabled ? "on" : "off"} />
      <input type="hidden" name="staleAfterHours" value={settings.staleAfterHours} />
      <input type="hidden" name="updatedBy" value="관리자" />
    </>
  );
}

function CurrentPriceSnapshot({ prices }: { prices: PriceRecord[] }) {
  const visiblePrices = prices.filter((price) => price.isVisible).slice(0, 8);

  return (
    <section className="admin-panel p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="admin-compact-label">
            현재 공개 시세
          </p>
          <h3 className="mt-1 text-xl font-bold text-[var(--admin-ink)]">고객 화면에 보이는 가격</h3>
        </div>
        <p className="rounded-full border border-[var(--admin-line)] bg-[#fbf7e8] px-3 py-1.5 text-sm font-semibold text-[var(--admin-ink)]">
          기준 {formatDateTimeKorean(prices[0]?.announcedAt ?? new Date().toISOString())}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {visiblePrices.map((price) => (
          <div key={price.id} className="admin-subpanel px-4 py-3">
            <p className="text-sm font-semibold text-[var(--admin-muted)]">{getAdminPriceSnapshotLabel(price)}</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums text-[var(--admin-ink)]">{formatWon(price.value)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PublicPriceStatusPanel({
  display,
  settings,
}: {
  display: PriceAnnouncementDisplay;
  settings: PriceAutoSettings;
}) {
  return (
    <section
      data-testid="admin-public-price-status"
      className={[
        "admin-panel p-4 sm:p-5",
        display.requiresTradeConfirmation ? "border-[#d9ad00]/45 bg-[#fffaf0]" : "",
      ].join(" ")}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="admin-compact-label">고객 화면 고지</p>
          <h3 className="mt-1 text-xl font-extrabold text-[var(--admin-ink)]">
            {display.requiresTradeConfirmation ? "거래 전 확인 필요" : "정상 고시 노출"}
          </h3>
          <p className="mt-2 text-sm font-semibold leading-7 text-[var(--admin-muted)]">
            공개 시세표에는 <b className="text-[var(--admin-ink)]">{display.statusLabel}</b> 상태와{" "}
            <b className="text-[var(--admin-ink)]">{display.valueLabel}</b> 기준 시각이 표시됩니다.
            화면 금액만으로 거래 확정 답변을 하지 않습니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#d9ad00]/45 bg-white px-3 py-1.5 text-xs font-extrabold text-[#6f4b00]">
            {display.noticeBadgeLabel}
          </span>
          <span className="rounded-full border border-[var(--admin-line)] bg-white px-3 py-1.5 text-xs font-extrabold text-[var(--admin-ink)]">
            {display.operatorActionLabel}
          </span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-xl border border-[#ead48c] bg-white px-4 py-3">
          <p className="text-sm font-extrabold text-[var(--admin-ink)]">{display.noticeTitle}</p>
          <p className="mt-2 text-sm font-semibold leading-7 text-[#725100]">
            {display.noticeBody}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--admin-line)] bg-[#fbfdfb] px-4 py-3">
          <p className="text-sm font-extrabold text-[var(--admin-ink)]">운영 응대 원칙</p>
          <p className="mt-2 text-sm leading-7 text-[var(--admin-muted)]">
            휴무일·영업시간 외 고객 문의는 최근 고시 기준을 설명하되, 실제 적용가는 본사 전화 또는 다음 영업일
            현장 확인 기준으로 안내합니다.
          </p>
          <p className="mt-2 text-xs font-semibold leading-5 text-[var(--admin-muted)]">
            자동시세 시간 제한: {settings.businessHoursOnly ? "영업시간 외 자동 반영 차단" : "꺼짐 - 운영자가 직접 확인 필요"}
          </p>
        </div>
      </div>
    </section>
  );
}

function OperationSummary({
  prices,
  settings,
  suggestion,
  freshness,
  isAutoOn,
}: {
  prices: PriceRecord[];
  settings: PriceAutoSettings;
  suggestion: PriceAutoSuggestion | null;
  freshness: PriceFreshness;
  isAutoOn: boolean;
}) {
  const latestUpdate = getLatestUpdate(prices);
  const postedBasisAt = getPostedBasisAt(prices);
  const basisDiffersFromSave = getHoursBetween(latestUpdate, postedBasisAt) >= 1;
  const draftCount = suggestion?.status === "draft" ? suggestion.items.length : 0;
  const stats = [
    { label: "운영 상태", value: isAutoOn ? "자동시세 ON" : "직접 입력" },
    { label: "고시 기준", value: formatDateTimeKorean(postedBasisAt) },
    { label: "관리자 저장", value: formatDateTimeKorean(latestUpdate) },
    { label: "최근 자동 반영", value: settings.lastAutoAppliedAt ? formatDateTimeKorean(settings.lastAutoAppliedAt) : "아직 없음" },
    { label: "마지막 수동 등록", value: getElapsedHoursLabel(freshness.latestManualChangedAt) },
    { label: "24시간 guard", value: getStaleGuardLabel(settings, freshness) },
    { label: "예약 실행", value: getScheduledRunLabel(settings, isAutoOn) },
    { label: "다음 계산 가능", value: getNextCheckLabel(settings, isAutoOn) },
    { label: "검토 대기", value: draftCount ? `${draftCount}개 항목` : "없음" },
  ];

  return (
    <section className="admin-panel p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-8">
        {stats.map((item) => (
          <div key={item.label} className="rounded-xl border border-[var(--admin-line)] bg-[#fbfdfb] px-4 py-3">
            <p className="text-xs font-bold text-[var(--admin-muted)]">{item.label}</p>
            <p className="mt-1 text-base font-bold text-[var(--admin-ink)]">{item.value}</p>
          </div>
        ))}
      </div>
      <div
        className={[
          "mt-3 rounded-xl border px-4 py-3 text-sm leading-7",
          basisDiffersFromSave
            ? "border-[#d9ad00]/35 bg-[#fff8dc] text-[#6f4b00]"
            : "border-[var(--admin-line)] bg-[#fbfdfb] text-[var(--admin-muted)]",
        ].join(" ")}
        data-testid="admin-price-time-explainer"
      >
        <b className={basisDiffersFromSave ? "text-[#5b3f00]" : "text-[var(--admin-ink)]"}>
          시간 표기 기준:
        </b>{" "}
        고객 화면의 `기준`은 회사 고시 시각이고, `관리자 저장`은 운영 콘솔에서 마지막으로 저장된 시각입니다.
        두 시각이 다르면 가격 저장은 되었지만 고객에게 보이는 고시 기준 시각은 별도 입력값으로 유지된 상태입니다.
      </div>
    </section>
  );
}

function ModeSwitch({
  settings,
  isAutoOn,
  savedIsAutoOn,
  onModeChange,
  statusCode,
  statusMessage,
  warnings,
}: {
  settings: PriceAutoSettings;
  isAutoOn: boolean;
  savedIsAutoOn: boolean;
  onModeChange: (nextMode: boolean) => void;
  statusCode?: string;
  statusMessage?: string | null;
  warnings?: string[];
}) {
  const canPersist = settings.schemaReady;
  const nextIsAutoOn = !isAutoOn;
  const statusMatchesCurrentMode =
    statusCode === "auto-settings-saved" ||
    statusCode === "demo" ||
    statusCode === "auto-schema" ||
    (isAutoOn && statusCode === "auto-on-saved") ||
    (!isAutoOn && statusCode === "auto-off-saved");
  const modeStatusLabel = canPersist
    ? `저장 상태: ${savedIsAutoOn ? "자동시세 ON" : "자동시세 OFF"}`
    : `미리보기 상태: ${isAutoOn ? "자동시세 ON" : "자동시세 OFF"}`;
  const modeStatusHelp = canPersist ? "토글하면 저장됩니다." : "저장소 미연결: 화면에서만 바뀝니다.";

  return (
    <section
      data-testid="admin-price-mode-switch"
      className="admin-panel px-4 py-3 sm:px-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="admin-compact-label">자동시세 적용</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={[
                  "rounded-full border px-3 py-1 text-lg font-extrabold text-[var(--admin-ink)]",
                  isAutoOn ? "border-[#d1a600] bg-[#fff4be]" : "border-[var(--admin-line)] bg-white",
                ].join(" ")}
              >
                {isAutoOn ? "ON" : "OFF"}
              </span>
              <span className="text-sm font-semibold text-[var(--admin-muted)]">
                {modeStatusLabel}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold text-[var(--admin-muted)]">
            <span className="rounded-full border border-[var(--admin-line)] bg-white px-3 py-1.5">
              {isAutoOn ? "자동 계산값 반영 가능" : "직접 입력값 사용"}
            </span>
            <span className="rounded-full border border-[var(--admin-line)] bg-white px-3 py-1.5">
              참고 데이터는 세부 설정에서 확인
            </span>
          </div>
        </div>

        <div className="w-full max-w-[330px] space-y-2">
          <form
            action={updatePriceAutoSettingsAction}
            data-admin-save-guard="true"
            data-admin-pending-message="자동시세 모드 저장 중입니다."
          >
            <HiddenAutoSettingsFields
              settings={settings}
              enabled={nextIsAutoOn}
              mode={nextIsAutoOn ? "auto_publish" : "manual_review"}
            />
            <AdminSubmitButton
              type={canPersist ? "submit" : "button"}
              pendingLabel={isAutoOn ? "자동시세 OFF 저장 중..." : "자동시세 ON 저장 중..."}
              data-testid="admin-price-mode-toggle"
              onClick={(event) => {
                if (!canPersist) {
                  event.preventDefault();
                  onModeChange(nextIsAutoOn);
                }
              }}
              aria-pressed={isAutoOn}
              aria-label="자동시세 ON/OFF 전환"
              className={[
                "group flex w-full appearance-none items-center justify-between gap-4 rounded-full border px-4 py-3 text-left transition",
                isAutoOn
                  ? "border-[#d1a600] bg-[#fff4be]"
                  : "border-[var(--admin-line-strong)] bg-white hover:border-[#d1a600] hover:bg-[#fff9df]",
              ].join(" ")}
            >
              <span>
                <span className="block text-sm font-extrabold text-[var(--admin-ink)]">
                  현재 {isAutoOn ? "자동시세 ON" : "자동시세 OFF"}
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-[var(--admin-muted)]">
                  {isAutoOn ? "직접 입력으로 전환" : "자동시세 ON으로 전환"} · {modeStatusHelp}
                </span>
              </span>
              <span
                className={[
                  "relative h-7 w-14 shrink-0 rounded-full border transition",
                  isAutoOn
                    ? "border-[#d1a600] bg-[var(--color-gold)]"
                    : "border-[var(--admin-line-strong)] bg-[#dfe7e2]",
                ].join(" ")}
                aria-hidden="true"
              >
                <span
                  className={[
                    "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
                    isAutoOn ? "left-[1.9rem]" : "left-1",
                  ].join(" ")}
                />
              </span>
            </AdminSubmitButton>
          </form>
          {statusMatchesCurrentMode ? (
            <AdminActionFeedback statusCode={statusCode} message={statusMessage} warnings={warnings} scope="mode" />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function AutoCalculationGuide({ settings }: { settings: PriceAutoSettings }) {
  const formulas = [
    {
      label: "순금 살 때",
      body: `국제 금 3.75g 환산가 × 판매 프리미엄 ${formatRate(settings.goldSellPremiumRate)} → ${settings.roundingUnit.toLocaleString("ko-KR")}원 단위 반올림`,
    },
    {
      label: "순금 팔 때",
      body: `국제 금 3.75g 환산가 × 매입 할인폭 ${formatRate(settings.goldBuyDiscountRate)} 차감 → 반올림`,
    },
    {
      label: "18K / 14K",
      body: `순금 팔 때 기준 × 18K ${settings.gold18kBuyRate} / 14K ${settings.gold14kBuyRate}`,
    },
    {
      label: "자동 게시 기준",
      body: `${settings.minApplyChangeWon.toLocaleString("ko-KR")}원 이상 차이, ${formatRate(settings.maxAutoPublishChangePercent)} 미만 변동일 때 자동 반영`,
    },
  ];

  return (
    <div className="admin-panel-plain p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="admin-compact-label">계산 기준</p>
          <h4 className="mt-1 text-xl font-extrabold text-[var(--admin-ink)]">자동 계산 공식</h4>
        </div>
        <span className="rounded-full border border-[var(--admin-line)] bg-[#fbf7e8] px-3 py-1.5 text-xs font-bold text-[var(--admin-ink)]">
          {settings.businessHoursOnly ? "영업시간만 반영" : "항상 확인"}
        </span>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {formulas.map((item) => (
          <div key={item.label} className="admin-subpanel px-4 py-3">
            <p className="text-sm font-extrabold text-[var(--admin-ink)]">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NumberField({
  name,
  label,
  value,
  step,
  help,
}: {
  name: string;
  label: string;
  value: number;
  step?: string;
  help?: string;
}) {
  return (
    <label className="block text-sm text-[var(--admin-muted)]">
      <span className="font-bold text-[var(--admin-ink)]">{label}</span>
      {help ? <span className="mt-1 block text-xs leading-5 text-[var(--admin-muted)]">{help}</span> : null}
      <input
        name={name}
        type="number"
        step={step}
        defaultValue={value}
        className="admin-input mt-2"
      />
    </label>
  );
}

function AutoSettingsForm({
  settings,
  hasMetalsKey,
}: {
  settings: PriceAutoSettings;
  hasMetalsKey: boolean;
}) {
  return (
    <details className="admin-panel-plain p-4">
      <summary className="cursor-pointer text-sm font-extrabold text-[var(--admin-ink)]">
        자동시세 세부 설정
      </summary>
      <form
        action={updatePriceAutoSettingsAction}
        data-admin-save-guard="true"
        data-admin-pending-message="자동시세 설정 저장 중입니다."
        className="mt-4 grid gap-4"
      >
        <input type="hidden" name="autoEnabled" value="on" />
        <input type="hidden" name="autoMode" value="auto_publish" />
        <input type="hidden" name="intervalHours" value={settings.checkIntervalMinutes === 120 ? 2 : 1} />
        <label className="block text-sm text-[var(--admin-muted)]">
          <span className="font-bold text-[var(--admin-ink)]">참고 데이터</span>
          <span className="mt-1 block text-xs leading-5 text-[var(--admin-muted)]">
            자동 계산에 쓰는 외부 참고값입니다. KRX는 승인 전 선택할 수 없습니다.
          </span>
          <select
            name="autoSource"
            defaultValue={settings.source}
            className="admin-input mt-2"
          >
            <option value="gold-api">Gold API</option>
            <option value="metals-dev" disabled={!hasMetalsKey}>
              Metals.Dev{hasMetalsKey ? "" : " (API key 필요)"}
            </option>
            <option value="krx" disabled>
              KRX Open API (승인 전 사용 불가)
            </option>
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-[var(--admin-muted)]">
          <span className="font-bold text-[var(--admin-ink)]">확인 주기</span>
          <span className="mt-1 block text-xs leading-5 text-[var(--admin-muted)]">
            이 시간 안에는 중복 실행하지 않습니다.
          </span>
            <select
              name="checkIntervalMinutes"
              defaultValue={settings.checkIntervalMinutes}
              className="admin-input mt-2"
            >
              <option value="30">30분마다</option>
              <option value="60">1시간마다</option>
              <option value="120">2시간마다</option>
            </select>
          </label>
          <NumberField
            name="minApplyChangeWon"
            label="최소 반영 금액"
            value={settings.minApplyChangeWon}
            help="계산값과 현재 공개가 차이가 이 금액보다 작으면 시세를 바꾸지 않습니다."
          />
          <NumberField
            name="maxAutoPublishChangePercentPct"
            label="자동 게시 허용 변동폭(%)"
            value={formatPercentInput(settings.maxAutoPublishChangePercent)}
            step="0.1"
            help="현재 공개가 대비 이 비율 이상 크게 움직이면 실수 방지를 위해 자동으로 바꾸지 않습니다."
          />
          <NumberField
            name="roundingUnit"
            label="반올림 단위"
            value={settings.roundingUnit}
            help="계산값을 이 금액 단위로 정리합니다. 예: 100원 단위"
          />
        </div>

        <label className="inline-flex items-center gap-3 rounded-xl border border-[var(--admin-line)] bg-[#fbf7e8] px-4 py-3 text-sm font-semibold text-[var(--admin-ink)]">
          <input name="businessHoursOnly" type="checkbox" defaultChecked={settings.businessHoursOnly} />
          평일 09:00-18:30에만 자동 반영
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="inline-flex items-start gap-3 rounded-xl border border-[var(--admin-line)] bg-[#fbf7e8] px-4 py-3 text-sm font-semibold text-[var(--admin-ink)]">
            <input type="hidden" name="staleGuardEnabled" value="off" />
            <input name="staleGuardEnabled" type="checkbox" defaultChecked={settings.staleGuardEnabled} className="mt-1" />
            <span>
              <span className="block">24시간 미등록 경고</span>
              <span className="mt-1 block text-xs font-medium leading-5 text-[var(--admin-muted)]">
                오래 직접 저장하지 않으면 경고만 표시합니다.
              </span>
            </span>
          </label>
          <NumberField
            name="staleAfterHours"
            label="미등록 경고 기준 시간"
            value={settings.staleAfterHours}
            help="이 시간 이상 직접 저장이 없으면 경고만 남기고 자동시세 OFF는 유지됩니다."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            name="goldSellPremiumRatePct"
            label="순금 살 때 프리미엄(%)"
            value={formatPercentInput(settings.goldSellPremiumRate)}
            step="0.1"
          />
          <NumberField
            name="goldBuyDiscountRatePct"
            label="순금 팔 때 할인폭(%)"
            value={formatPercentInput(settings.goldBuyDiscountRate)}
            step="0.1"
          />
          <NumberField name="gold18kBuyRate" label="18K 환산 계수" value={settings.gold18kBuyRate} step="0.001" />
          <NumberField name="gold14kBuyRate" label="14K 환산 계수" value={settings.gold14kBuyRate} step="0.001" />
        </div>

        <input type="hidden" name="platinumSellPremiumRate" value={settings.platinumSellPremiumRate} />
        <input type="hidden" name="platinumBuyDiscountRate" value={settings.platinumBuyDiscountRate} />
        <input type="hidden" name="silverSellPremiumRate" value={settings.silverSellPremiumRate} />
        <input type="hidden" name="silverBuyDiscountRate" value={settings.silverBuyDiscountRate} />
        <input type="hidden" name="updatedBy" value="관리자" />
        <AdminSubmitButton
          pendingLabel="설정 저장 중..."
          className="admin-secondary-button justify-self-start"
        >
          설정 저장
        </AdminSubmitButton>
      </form>
    </details>
  );
}

function AutoSuggestionPanel({ suggestion }: { suggestion: PriceAutoSuggestion }) {
  const needsReview =
    suggestion.warnings.length > 0 || suggestion.items.some((item) => item.needsReview);
  const showReviewActions = needsReview;

  return (
    <div className="mt-5 rounded-[1.2rem] border border-[#d9ad00]/35 bg-[#fff8dc] p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold text-[#725100]">
            {needsReview ? "검토 필요 항목" : "최근 자동 계산 기록"}
          </p>
          <p className="mt-1 text-xs text-[var(--admin-muted)]">
            {suggestion.providerLabel} · 기준 {formatDateTimeKorean(suggestion.sourceUpdatedAt)} · 생성{" "}
            {formatDateTimeKorean(suggestion.generatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {showReviewActions ? (
            <form
              action={applyPriceAutoSuggestionAction}
              data-admin-save-guard="true"
              data-admin-pending-message="자동 계산값 반영 중입니다."
            >
              <input type="hidden" name="suggestionId" value={suggestion.id} />
              <input type="hidden" name="changedBy" value="자동시세 검토 후 반영" />
              <AdminSubmitButton
                pendingLabel="반영 중..."
                className="admin-primary-button px-4 py-2"
              >
                검토 후 반영
              </AdminSubmitButton>
            </form>
          ) : null}
          <form
            action={rejectPriceAutoSuggestionAction}
            data-admin-save-guard="true"
            data-admin-pending-message="자동 계산값 폐기 중입니다."
          >
            <input type="hidden" name="suggestionId" value={suggestion.id} />
            <AdminSubmitButton
              pendingLabel="폐기 중..."
              className="admin-secondary-button px-4 py-2"
            >
              {needsReview ? "검토 항목 폐기" : "계산 기록 폐기"}
            </AdminSubmitButton>
          </form>
        </div>
      </div>
      {suggestion.warnings.length ? (
        <div className="mt-4 space-y-1 text-sm leading-7 text-[#725100]">
          {suggestion.warnings.map((warning) => (
            <p key={warning}>· {warning}</p>
          ))}
        </div>
      ) : null}
      <div className="mt-4 overflow-x-auto">
        <table className="admin-table min-w-[720px]">
          <thead>
            <tr>
              <th className="py-3">품목</th>
              <th className="py-3">현재</th>
              <th className="py-3">계산값</th>
              <th className="py-3">차액</th>
              <th className="py-3">상태</th>
            </tr>
          </thead>
          <tbody>
            {suggestion.items.map((item) => (
              <tr key={item.category}>
                <td className="font-semibold">{item.label}</td>
                <td>{formatWon(item.currentValue)}</td>
                <td className="font-semibold">{formatWon(item.proposedValue)}</td>
                <td>
                  {formatSigned(item.difference)} / {formatRate(item.changePercent)}
                </td>
                <td>
                  <span className={item.needsReview ? "font-bold text-[#725100]" : "text-[var(--admin-muted)]"}>
                    {item.needsReview ? "검토 필요" : "자동 가능"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AutoModePanel({
  settings,
  suggestion,
  freshness,
  hasMetalsKey,
  statusCode,
  statusMessage,
  warnings,
}: {
  settings: PriceAutoSettings;
  suggestion: PriceAutoSuggestion | null;
  freshness: PriceFreshness;
  hasMetalsKey: boolean;
  statusCode?: string;
  statusMessage?: string | null;
  warnings?: string[];
}) {
  const draft = suggestion?.status === "draft" ? suggestion : null;

  return (
    <section
      data-testid="admin-price-auto-panel"
      className="admin-panel p-5 sm:p-6"
    >
      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <AutoCalculationGuide settings={settings} />
        <div className="space-y-4">
          <div className="admin-panel-plain p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="admin-compact-label">
                  자동 운영
                </p>
                <h3 className="mt-1 text-xl font-extrabold text-[var(--admin-ink)]">현재 자동 운영 중</h3>
              </div>
              <form
                action={generatePriceAutoSuggestionAction}
                data-admin-save-guard="true"
                data-admin-pending-message="자동시세 계산 실행 중입니다."
              >
                <AdminSubmitButton
                  pendingLabel="계산 중..."
                  className="admin-primary-button"
                >
                  지금 계산 실행
                </AdminSubmitButton>
              </form>
            </div>
            <div className="mt-4">
              <AdminActionFeedback statusCode={statusCode} message={statusMessage} warnings={warnings} scope="auto" />
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="admin-subpanel px-4 py-3">
                <dt className="text-[var(--admin-muted)]">참고 데이터</dt>
                <dd className="mt-1 font-extrabold text-[var(--admin-ink)]">{getAutoSourceLabel(settings.source)}</dd>
              </div>
              <div className="admin-subpanel px-4 py-3">
                <dt className="text-[var(--admin-muted)]">확인 주기</dt>
                <dd className="mt-1 font-extrabold text-[var(--admin-ink)]">{settings.checkIntervalMinutes}분마다</dd>
              </div>
              <div className="admin-subpanel px-4 py-3">
                <dt className="text-[var(--admin-muted)]">최소 반영 금액</dt>
                <dd className="mt-1 font-extrabold text-[var(--admin-ink)]">{settings.minApplyChangeWon.toLocaleString("ko-KR")}원 이상 차이</dd>
              </div>
              <div className="admin-subpanel px-4 py-3">
                <dt className="text-[var(--admin-muted)]">자동 게시 허용 변동폭</dt>
                <dd className="mt-1 font-extrabold text-[var(--admin-ink)]">{formatRate(settings.maxAutoPublishChangePercent)} 미만</dd>
              </div>
              <div className="admin-subpanel px-4 py-3">
                <dt className="text-[var(--admin-muted)]">마지막 수동 등록</dt>
                <dd className="mt-1 font-extrabold text-[var(--admin-ink)]">{getElapsedHoursLabel(freshness.latestManualChangedAt)}</dd>
              </div>
              <div className="admin-subpanel px-4 py-3">
                <dt className="text-[var(--admin-muted)]">24시간 미등록 경고</dt>
                <dd className="mt-1 font-extrabold text-[var(--admin-ink)]">
                  {settings.staleGuardEnabled ? `${settings.staleAfterHours}시간 기준` : "꺼짐"}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[var(--admin-muted)]">
              <span className="rounded-full border border-[var(--admin-line)] bg-white px-3 py-1.5">
                예약 실행: 하루 1회
              </span>
              <span className="rounded-full border border-[var(--admin-line)] bg-white px-3 py-1.5">
                수동 실행: 지금 계산 실행
              </span>
              <span className="rounded-full border border-[var(--admin-line)] bg-white px-3 py-1.5">
                미등록 경고: {settings.staleAfterHours}시간
              </span>
            </div>
          </div>

          <AutoSettingsForm settings={settings} hasMetalsKey={hasMetalsKey} />
        </div>
      </div>

      {!settings.schemaReady ? (
        <p className="mt-5 rounded-xl border border-[#d9ad00]/30 bg-[#fff8dc] px-4 py-3 text-sm leading-7 text-[#725100]">
          Supabase에 자동시세 테이블을 적용하면 설정 저장과 자동 반영 이력이 활성화됩니다.
        </p>
      ) : null}

      {draft ? (
        <AutoSuggestionPanel suggestion={draft} />
      ) : (
        <div className="mt-5 rounded-xl border border-[var(--admin-line)] bg-[#fbfdfb] px-4 py-3 text-sm text-[var(--admin-muted)]">
          검토 대기 항목이 없습니다. 조건을 통과한 자동 계산은 공개 시세에 바로 기록됩니다.
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        {[
          ["한국금거래소 참고 보기", "https://www.koreagoldx.co.kr/"],
          ["삼성금거래소 참고 보기", "https://ssgold.co.kr/"],
          ["GBK 참고 보기", "https://gbkmall.com/"],
        ].map(([label, href]) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="admin-secondary-button px-4 py-2"
          >
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}

function PriceStaticCell({
  row,
  side,
  text,
}: {
  row: PriceLineupRow;
  side: "sell" | "buy";
  text: string;
}) {
  return (
    <div
      data-testid={`admin-price-static-${side}-${row.id}`}
      className="rounded-lg border border-dashed border-[var(--admin-line-strong)] bg-[#f7f4e9] px-3 py-3"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--admin-muted)]">
        고객 화면 표시
      </p>
      <p className="mt-1 text-base font-extrabold text-[var(--admin-ink)]">{text}</p>
      <p className="mt-1 text-[0.68rem] leading-4 text-[var(--admin-muted)]">가격 입력 없이 문구로 표시</p>
    </div>
  );
}

function PriceEditableCell({
  price,
  draftValue,
  onDraftChange,
  readOnly = false,
  helperText,
}: {
  price: PriceRecord;
  draftValue: string;
  onDraftChange: (id: string, value: string) => void;
  readOnly?: boolean;
  helperText?: string;
}) {
  const deltaLabel = formatDraftDelta(price.value, draftValue);
  const deltaTone = getDraftDeltaTone(price.value, draftValue);

  return (
    <div
      data-testid={`admin-price-cell-${price.category}`}
      className="rounded-lg border border-[var(--admin-line)] bg-white px-3 py-3"
    >
      <input type="hidden" name="priceIds" value={price.id} />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--admin-muted)]">
            현재
          </p>
          <p className="mt-0.5 text-base font-extrabold tabular-nums text-[var(--admin-ink)]">
            {formatWon(price.value)}
          </p>
        </div>
        <label className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-line)] bg-[#fbf7e8] px-2 py-1 text-[0.68rem] font-bold text-[var(--admin-ink)]">
          <input name={`visible:${price.id}`} type="checkbox" defaultChecked={price.isVisible} />
          노출
        </label>
      </div>
      <label className="mt-2 block text-xs font-bold text-[var(--admin-ink)]">
        {readOnly ? "자동 계산값" : "새 입력값"}
        <input
          name={`value:${price.id}`}
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          required
          readOnly={readOnly}
          value={draftValue}
          onChange={(event) => onDraftChange(price.id, event.currentTarget.value)}
          className={[
            "admin-input mt-1 max-w-[11rem] !rounded-lg !px-3 !py-2 text-sm tabular-nums",
            readOnly ? "bg-[#fbf7e8] text-[var(--admin-ink)]" : "",
          ].join(" ")}
        />
      </label>
      {helperText ? (
        <p className="mt-1 text-[0.68rem] font-semibold leading-4 text-[#725100]">
          {helperText}
        </p>
      ) : null}
      <p className={`mt-1 text-xs font-extrabold tabular-nums ${deltaTone}`}>
        차액 {deltaLabel}
      </p>
      <label className="mt-2 block text-xs font-bold text-[var(--admin-ink)]">
        <span className="sr-only">비고</span>
        <input
          name={`note:${price.id}`}
          defaultValue={price.note || ""}
          placeholder="비고"
          className="admin-input mt-1 !rounded-lg !px-3 !py-2 text-xs"
        />
      </label>
    </div>
  );
}

function PriceLineupEditorRow({
  row,
  priceByCategory,
  draftValues,
  onDraftChange,
  isGoldPurityAuto,
  settings,
}: {
  row: PriceLineupRow;
  priceByCategory: Map<PriceCategory, PriceRecord>;
  draftValues: Record<string, string>;
  onDraftChange: (id: string, value: string) => void;
  isGoldPurityAuto: boolean;
  settings: PriceAutoSettings;
}) {
  const sellPrice = row.sellCategory ? priceByCategory.get(row.sellCategory) : undefined;
  const buyPrice = row.buyCategory ? priceByCategory.get(row.buyCategory) : undefined;

  return (
    <tr data-testid={`admin-price-lineup-row-${row.id}`}>
      <td className="min-w-[12rem] bg-[#fbf7e8]/45">
        <p className="text-base font-extrabold text-[var(--admin-ink)]">{row.title}</p>
        <p className="mt-1 text-[0.72rem] font-semibold text-[var(--admin-muted)]">{row.subtitle}</p>
      </td>
      <td className="min-w-[17rem]">
        {sellPrice ? (
          <PriceEditableCell
            price={sellPrice}
            draftValue={draftValues[sellPrice.id] ?? String(sellPrice.value)}
            onDraftChange={onDraftChange}
          />
        ) : row.sellText ? (
          <PriceStaticCell row={row} side="sell" text={row.sellText} />
        ) : (
          <PriceStaticCell row={row} side="sell" text="문의" />
        )}
      </td>
      <td className="min-w-[17rem]">
        {buyPrice ? (
          <PriceEditableCell
            price={buyPrice}
            draftValue={draftValues[buyPrice.id] ?? String(buyPrice.value)}
            onDraftChange={onDraftChange}
            readOnly={isGoldPurityAuto && (buyPrice.category === "gold_18k_buy" || buyPrice.category === "gold_14k_buy")}
            helperText={
              isGoldPurityAuto && buyPrice.category === "gold_18k_buy"
                ? `순금 팔 때 입력값 × ${settings.gold18kBuyRate} 후 ${settings.roundingUnit.toLocaleString("ko-KR")}원 단위 반올림`
                : isGoldPurityAuto && buyPrice.category === "gold_14k_buy"
                  ? `순금 팔 때 입력값 × ${settings.gold14kBuyRate} 후 ${settings.roundingUnit.toLocaleString("ko-KR")}원 단위 반올림`
                  : undefined
            }
          />
        ) : (
          <PriceStaticCell row={row} side="buy" text="문의" />
        )}
        {row.buyNote ? (
          <p className="mt-2 text-xs font-semibold text-[var(--admin-muted)]">{row.buyNote}</p>
        ) : null}
      </td>
    </tr>
  );
}

function ManualGoldPuritySettingsForm({
  settings,
  gold24kBuy,
}: {
  settings: PriceAutoSettings;
  gold24kBuy?: PriceRecord;
}) {
  const preview =
    gold24kBuy && gold24kBuy.value > 0
      ? calculateGoldPurityBuyPrices(gold24kBuy.value, settings)
      : null;
  const preservedMode = settings.mode === "auto_publish" ? "auto_publish" : "manual_review";

  return (
    <form
      action={updatePriceAutoSettingsAction}
      data-testid="manual-gold-purity-settings-form"
      data-admin-save-guard="true"
      data-admin-pending-message="18K/14K 계수 저장 중입니다."
      className="rounded-xl border border-[#ead48c] bg-white px-3 py-3"
    >
      <HiddenAutoSettingsFields
        settings={settings}
        enabled={settings.isEnabled}
        mode={preservedMode}
        includeGoldPurityRates={false}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="admin-compact-label">환산 계수</p>
          <h4 className="mt-1 text-base font-extrabold text-[var(--admin-ink)]">
            24K 팔 때 기준
          </h4>
        </div>
        <AdminSubmitButton pendingLabel="계수 저장 중..." className="admin-secondary-button px-3 py-2 text-xs">
          계수 저장
        </AdminSubmitButton>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <NumberField
          name="gold18kBuyRate"
          label="18K"
          value={settings.gold18kBuyRate}
          step="0.001"
        />
        <NumberField
          name="gold14kBuyRate"
          label="14K"
          value={settings.gold14kBuyRate}
          step="0.001"
        />
      </div>

      <div className="mt-3 rounded-lg border border-[#f0df9c] bg-[#fffaf0] px-3 py-2.5">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#725100]">
            현재 24K 기준 미리보기
          </p>
          {preview && gold24kBuy ? (
            <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt className="text-[var(--admin-muted)]">24K</dt>
                <dd className="mt-1 font-extrabold tabular-nums text-[var(--admin-ink)]">
                  {formatWon(gold24kBuy.value)}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--admin-muted)]">18K</dt>
                <dd className="mt-1 font-extrabold tabular-nums text-[var(--admin-ink)]">
                  {formatWon(preview.gold_18k_buy)}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--admin-muted)]">14K</dt>
                <dd className="mt-1 font-extrabold tabular-nums text-[var(--admin-ink)]">
                  {formatWon(preview.gold_14k_buy)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
              24K 팔 때 값이 있으면 계산 결과가 보입니다.
            </p>
          )}
          <p className="mt-2 text-[0.68rem] font-semibold leading-4 text-[#725100]">
            반올림 단위 {settings.roundingUnit.toLocaleString("ko-KR")}원 적용
          </p>
      </div>
    </form>
  );
}

function PriceEditor({
  prices,
  settings,
  history,
  freshness,
  statusCode,
  statusMessage,
  warnings,
}: {
  prices: PriceRecord[];
  settings: PriceAutoSettings;
  history: PriceHistoryEntry[];
  freshness: PriceFreshness;
  statusCode?: string;
  statusMessage?: string | null;
  warnings?: string[];
}) {
  const currentAnnouncedAt = prices[0]?.announcedAt ?? new Date().toISOString();
  const announcedAtInputRef = useRef<HTMLInputElement>(null);
  const defaultAnnouncedAt = formatDateTimeLocalKorean(new Date());
  const priceByCategory = new Map(prices.map((price) => [price.category, price] as const));
  const gold24kBuy = priceByCategory.get("gold_24k_buy");
  const gold18kBuy = priceByCategory.get("gold_18k_buy");
  const gold14kBuy = priceByCategory.get("gold_14k_buy");
  const applyGoldPurityDraft = (
    currentDrafts: Record<string, string>,
    baseValue = gold24kBuy ? currentDrafts[gold24kBuy.id] : undefined,
  ) => {
    if (!gold24kBuy || !gold18kBuy || !gold14kBuy) return currentDrafts;

    const baseNumber = Number(baseValue ?? gold24kBuy.value);
    if (!Number.isFinite(baseNumber) || baseNumber <= 0) return currentDrafts;

    const derived = calculateGoldPurityBuyPrices(baseNumber, settings);
    return {
      ...currentDrafts,
      [gold18kBuy.id]: String(derived.gold_18k_buy),
      [gold14kBuy.id]: String(derived.gold_14k_buy),
    };
  };
  const [isGoldPurityAuto, setIsGoldPurityAuto] = useState(true);
  const [draftValues, setDraftValues] = useState<Record<string, string>>(() => {
    const initialDrafts = Object.fromEntries(prices.map((price) => [price.id, String(price.value)]));
    return applyGoldPurityDraft(initialDrafts);
  });
  const priceEditorFormId = "admin-price-editor-form";
  const handleDraftChange = (id: string, value: string) => {
    setDraftValues((current) => {
      const next = { ...current, [id]: value };
      if (isGoldPurityAuto && gold24kBuy?.id === id) {
        return applyGoldPurityDraft(next, value);
      }
      return next;
    });
  };
  const handleGoldPurityAutoChange = (enabled: boolean) => {
    setIsGoldPurityAuto(enabled);
    if (enabled) {
      setDraftValues((current) => applyGoldPurityDraft(current));
    }
  };

  return (
    <div className="grid gap-4">
      <section
        data-testid="admin-price-editor"
        className="admin-panel p-4 sm:p-5"
      >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.52fr)] lg:items-end">
        <div>
          <p className="admin-compact-label">
            직접 입력
          </p>
          <h3 className="mt-1 text-xl font-extrabold text-[var(--admin-ink)]">시세 직접 입력</h3>
          <p className="admin-help mt-1">
            고객 화면과 같은 품목 순서로 입력합니다.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(13rem,1fr)_minmax(8rem,0.55fr)]">
          <label className="text-xs font-semibold text-[var(--admin-muted)]">
            기준 시각
            <input
              form={priceEditorFormId}
              ref={announcedAtInputRef}
              name="announcedAt"
              type="datetime-local"
              defaultValue={defaultAnnouncedAt}
              suppressHydrationWarning
              className="admin-input mt-1 !rounded-lg !px-3 !py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (announcedAtInputRef.current) {
                  announcedAtInputRef.current.value = formatDateTimeLocalKorean(new Date());
                }
              }}
              className="mt-1 rounded-full border border-[var(--admin-line-strong)] bg-white px-3 py-1 text-[0.7rem] font-bold text-[var(--admin-ink)] transition hover:border-[#d9ad00] hover:bg-[#fff9df]"
            >
              현재 시각 입력
            </button>
            <span className="mt-1 block text-[0.68rem] leading-4 text-[var(--admin-muted)]">
              현재 공개 기준 {formatDateTimeKorean(currentAnnouncedAt)}
            </span>
          </label>
          <label className="text-xs font-semibold text-[var(--admin-muted)]">
            변경자
            <input
              form={priceEditorFormId}
              name="changedBy"
              defaultValue="관리자"
              className="admin-input mt-1 !rounded-lg !px-3 !py-2 text-sm"
            />
          </label>
        </div>
      </div>

      <div className="mt-3">
        <AdminActionFeedback statusCode={statusCode} message={statusMessage} warnings={warnings} scope="manual" />
      </div>

      <div className="mt-4 grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)]">
        <div
          data-testid="manual-gold-purity-helper"
          className="rounded-xl border border-[#ead48c] bg-[#fffaf0] px-3 py-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
              <p className="admin-compact-label">18K/14K 자동 계산</p>
              <h4 className="mt-1 text-base font-extrabold text-[var(--admin-ink)]">
                순금 팔 때 기준으로 채우기
              </h4>
              <p className="mt-1 text-xs font-semibold leading-5 text-[var(--admin-muted)]">
                순금 팔 때 값을 입력하면 18K/14K 팔 때가 같이 채워집니다.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 rounded-full border border-[#dfc56d] bg-white px-3 py-1.5 text-xs font-extrabold text-[var(--admin-ink)]">
              <input
                form={priceEditorFormId}
                data-testid="manual-gold-purity-auto-toggle"
                name="goldPurityAuto"
                type="checkbox"
                value="on"
                checked={isGoldPurityAuto}
                onChange={(event) => handleGoldPurityAutoChange(event.currentTarget.checked)}
                className="h-4 w-4 accent-[#b08600]"
              />
              저장 시 자동 반영
            </label>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.7rem] font-bold text-[var(--admin-muted)]">
            <span className="rounded-full border border-[#ead48c] bg-white px-2.5 py-1">
              18K × {settings.gold18kBuyRate}
            </span>
            <span className="rounded-full border border-[#ead48c] bg-white px-2.5 py-1">
              14K × {settings.gold14kBuyRate}
            </span>
            <span className="rounded-full border border-[#ead48c] bg-white px-2.5 py-1">
              반올림 {settings.roundingUnit.toLocaleString("ko-KR")}원
            </span>
            <button
              data-testid="manual-gold-purity-apply"
              type="button"
              onClick={() => setDraftValues((current) => applyGoldPurityDraft(current))}
              className="rounded-full border border-[#dfc56d] bg-white px-2.5 py-1 text-[0.7rem] font-extrabold text-[var(--admin-ink)] transition hover:border-[#d9ad00] hover:bg-[#fff4c7]"
            >
              현재 24K 값으로 채우기
            </button>
          </div>
        </div>
        <ManualGoldPuritySettingsForm settings={settings} gold24kBuy={gold24kBuy} />
      </div>

      <form
        id={priceEditorFormId}
        action={updatePricesAction}
        data-admin-save-guard="true"
        data-admin-pending-message="시세 저장 중입니다. 저장 완료 메시지를 확인한 뒤 이동하세요."
        className="mt-4"
      >
      <div className="overflow-x-auto">
        <table className="admin-table min-w-[820px]">
          <thead>
            <tr>
              <th>품목</th>
              <th>내가 살 때 (VAT포함)</th>
              <th>내가 팔 때 (현장 기준)</th>
            </tr>
          </thead>
          <tbody>
            {priceLineupRows.map((row) => (
              <PriceLineupEditorRow
                key={row.id}
                row={row}
                priceByCategory={priceByCategory}
                draftValues={draftValues}
                onDraftChange={handleDraftChange}
                isGoldPurityAuto={isGoldPurityAuto}
                settings={settings}
              />
            ))}
          </tbody>
        </table>
      </div>

      <AdminSubmitButton
        pendingLabel="저장 중..."
        className="admin-primary-button mt-4"
      >
        시세 저장
      </AdminSubmitButton>
      </form>
      <details className="mt-4 rounded-xl border border-[var(--admin-line)] bg-[#fbfdfb] px-4 py-3 text-sm">
        <summary className="cursor-pointer font-extrabold text-[var(--admin-ink)]">
          최근 시세 조정 이력 · 이력 {freshness.historyCount.toLocaleString("ko-KR")}건
        </summary>
        {history.length ? (
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {history.slice(0, 4).map((entry) => (
              <div key={entry.id} className="rounded-lg border border-[var(--admin-line)] bg-white px-3 py-2">
                <p className="font-bold text-[var(--admin-ink)]">{entry.label} {formatWon(entry.previousValue)} → {formatWon(entry.newValue)}</p>
                <p className="mt-1 text-xs text-[var(--admin-muted)]">
                  {formatDateTimeKorean(entry.changedAt)} · {entry.changeOrigin === "auto" ? "자동시세" : entry.changeOrigin === "system" ? "기준 보관" : "직접 입력"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 leading-6 text-[var(--admin-muted)]">
            아직 실제 변경 이력이 적습니다. 직접 저장하거나 자동 반영되면 이곳에 기록이 쌓입니다.
          </p>
        )}
        <p className="mt-2 text-xs text-[var(--admin-muted)]">
          일별 보관 {freshness.dailySnapshotCount.toLocaleString("ko-KR")}건
        </p>
      </details>
      </section>
    </div>
  );
}

export function AdminPricesWorkspace({
  prices,
  settings,
  suggestion,
  publicPriceStatus,
  history,
  freshness,
  hasMetalsKey,
  statusCode,
  statusMessage,
  warnings = [],
}: AdminPricesWorkspaceProps) {
  const savedIsAutoOn = settings.isEnabled && settings.mode === "auto_publish";
  const [isAutoOn, setIsAutoOn] = useState(savedIsAutoOn);

  return (
    <>
      <ModeSwitch
        settings={settings}
        isAutoOn={isAutoOn}
        savedIsAutoOn={savedIsAutoOn}
        onModeChange={setIsAutoOn}
        statusCode={statusCode}
        statusMessage={statusMessage}
        warnings={warnings}
      />
      {isAutoOn ? (
        <AutoModePanel
          settings={settings}
          suggestion={suggestion}
          freshness={freshness}
          hasMetalsKey={hasMetalsKey}
          statusCode={statusCode}
          statusMessage={statusMessage}
          warnings={warnings}
        />
      ) : (
        <PriceEditor
          prices={prices}
          settings={settings}
          history={history}
          freshness={freshness}
          statusCode={statusCode}
          statusMessage={statusMessage}
          warnings={warnings}
        />
      )}
      <details className="admin-panel-plain p-4">
        <summary className="cursor-pointer text-sm font-extrabold text-[var(--admin-ink)]">
          현재 공개 시세·고객 고지·운영 요약 보기
        </summary>
        <div className="mt-4 grid gap-5">
          <CurrentPriceSnapshot prices={prices} />
          <PublicPriceStatusPanel display={publicPriceStatus} settings={settings} />
          <OperationSummary prices={prices} settings={settings} suggestion={suggestion} freshness={freshness} isAutoOn={isAutoOn} />
        </div>
      </details>
    </>
  );
}
