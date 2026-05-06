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
import type {
  PriceAutoSettings,
  PriceAutoSuggestion,
  PriceFreshness,
  PriceHistoryEntry,
  PriceRecord,
} from "@/types/price";

interface AdminPricesWorkspaceProps {
  prices: PriceRecord[];
  settings: PriceAutoSettings;
  suggestion: PriceAutoSuggestion | null;
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
  if (!latest) return "다음 자동 점검 때 ON 전환 가능";
  const date = new Date(latest);
  if (Number.isNaN(date.getTime())) return "수동 등록 시각 확인 필요";
  const elapsedHours = (Date.now() - date.getTime()) / 1000 / 60 / 60;
  return elapsedHours >= settings.staleAfterHours
    ? "다음 자동 점검 때 ON 전환"
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
  if (scope === "manual" && !["saved", "demo", "error"].includes(statusCode ?? "")) {
    return null;
  }

  const tone = getFeedbackTone(statusCode);
  const toneClass =
    tone === "danger"
      ? "admin-status-danger"
      : tone === "warning"
        ? "admin-status-warning"
        : "admin-status-success";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${toneClass}`} data-testid={`admin-feedback-${scope ?? "general"}`}>
      <p className="font-semibold">{message}</p>
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
}: {
  settings: PriceAutoSettings;
  enabled: boolean;
  mode: PriceAutoSettings["mode"];
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
      <input type="hidden" name="gold18kBuyRate" value={settings.gold18kBuyRate} />
      <input type="hidden" name="gold14kBuyRate" value={settings.gold14kBuyRate} />
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
  const modeStatusHelp = canPersist
    ? "클릭하면 운영 모드가 저장됩니다."
    : "저장소 미연결: 화면에서만 전환됩니다.";

  return (
    <section
      data-testid="admin-price-mode-switch"
      className="admin-panel p-5 sm:p-6"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="admin-compact-label">
            자동시세
          </p>
          <h3 className="mt-1 text-2xl font-extrabold text-[var(--admin-ink)]">
            {isAutoOn ? "자동 운영 중" : "직접 입력 중"}
          </h3>
          <p className="admin-help mt-2 max-w-3xl">
            ON이면 승인된 참고 데이터와 KCG 산식으로 계산해 안전 기준 통과 시 공개 시세에 반영합니다.
            OFF이면 아래 표에서 직접 입력한 값만 공개됩니다.
          </p>
        </div>

        <div className="w-full max-w-[430px] space-y-3">
          <form action={updatePriceAutoSettingsAction}>
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
                "group flex w-full appearance-none items-center justify-between gap-4 rounded-[1.25rem] border px-5 py-4 text-left transition",
                isAutoOn
                  ? "border-[#d1a600] bg-[#fff4be]"
                  : "border-[var(--admin-line-strong)] bg-white hover:border-[#d1a600] hover:bg-[#fff9df]",
              ].join(" ")}
            >
              <span>
                <span className="block text-xs font-bold text-[var(--admin-muted)]">
                  현재 상태
                </span>
                <span className="mt-1 block text-lg font-extrabold text-[var(--admin-ink)]">
                  {isAutoOn ? "자동시세 ON" : "자동시세 OFF"}
                </span>
                <span className="mt-1 block text-sm text-[var(--admin-muted)]">
                  {isAutoOn ? "클릭하면 직접 입력으로 전환" : "클릭하면 자동 운영으로 전환"}
                </span>
              </span>
              <span
                className={[
                  "relative h-8 w-16 shrink-0 rounded-full border transition",
                  isAutoOn
                    ? "border-[#d1a600] bg-[var(--color-gold)]"
                    : "border-[var(--admin-line-strong)] bg-[#dfe7e2]",
                ].join(" ")}
                aria-hidden="true"
              >
                <span
                  className={[
                    "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
                    isAutoOn ? "left-[2.15rem]" : "left-1",
                  ].join(" ")}
                />
              </span>
            </AdminSubmitButton>
          </form>
          <p className="text-sm leading-6 text-[var(--admin-muted)]">
            {modeStatusLabel} · {modeStatusHelp}
          </p>
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
        계산 설정 열기
      </summary>
      <form action={updatePriceAutoSettingsAction} className="mt-4 grid gap-4">
        <input type="hidden" name="autoEnabled" value="on" />
        <input type="hidden" name="autoMode" value="auto_publish" />
        <input type="hidden" name="intervalHours" value={settings.checkIntervalMinutes === 120 ? 2 : 1} />
        <label className="block text-sm text-[var(--admin-muted)]">
          <span className="font-bold text-[var(--admin-ink)]">참고 데이터</span>
          <span className="mt-1 block text-xs leading-5 text-[var(--admin-muted)]">
            회사 시세를 바로 가져오는 것이 아니라, 아래 산식의 원천 참고값입니다. KRX는 승인·계약 범위 확인 전 선택할 수 없습니다.
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
              자동 작업이 이 시간보다 빨리 다시 실행되면 사이트 시세를 그대로 둡니다.
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
              <span className="block">24시간 미등록 guard</span>
              <span className="mt-1 block text-xs font-medium leading-5 text-[var(--admin-muted)]">
                수동 등록이 오래 없으면 다음 자동 점검에서 자동시세를 ON으로 전환합니다.
              </span>
            </span>
          </label>
          <NumberField
            name="staleAfterHours"
            label="자동 전환 기준 시간"
            value={settings.staleAfterHours}
            help="이 시간 이상 직접 저장이 없으면 자동시세 OFF도 다음 점검에서 ON으로 바뀝니다."
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
            <form action={applyPriceAutoSuggestionAction}>
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
          <form action={rejectPriceAutoSuggestionAction}>
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
              <form action={generatePriceAutoSuggestionAction}>
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
                <dt className="text-[var(--admin-muted)]">24시간 미등록 guard</dt>
                <dd className="mt-1 font-extrabold text-[var(--admin-ink)]">
                  {settings.staleGuardEnabled ? `${settings.staleAfterHours}시간 기준` : "꺼짐"}
                </dd>
              </div>
            </dl>
            <p className="admin-help mt-3 text-xs">
              예약 자동 실행은 현재 Vercel 무료 플랜 기준 하루 1회입니다. 다만 이 화면의 `지금 계산 실행`은
              즉시 계산하며, 안전 기준을 통과할 때만 공개 시세를 바꿉니다.
              자동시세를 OFF로 꺼도 수동 등록이 {settings.staleAfterHours}시간 이상 없으면 다음 자동 점검에서 다시 ON이 될 수 있습니다.
            </p>
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

function PriceEditor({
  prices,
  history,
  freshness,
  statusCode,
  statusMessage,
  warnings,
}: {
  prices: PriceRecord[];
  history: PriceHistoryEntry[];
  freshness: PriceFreshness;
  statusCode?: string;
  statusMessage?: string | null;
  warnings?: string[];
}) {
  const currentAnnouncedAt = prices[0]?.announcedAt ?? new Date().toISOString();
  const announcedAtInputRef = useRef<HTMLInputElement>(null);
  const defaultAnnouncedAt = formatDateTimeLocalKorean(new Date());

  return (
    <form
      action={updatePricesAction}
      data-testid="admin-price-editor"
      className="admin-panel p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="admin-compact-label">
            직접 입력
          </p>
          <h3 className="mt-1 text-2xl font-extrabold text-[var(--admin-ink)]">시세 직접 입력</h3>
          <p className="admin-help mt-2">자동시세가 꺼져 있을 때만 이 표에서 공개 시세를 직접 저장합니다.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[var(--admin-muted)]">
            기준 시각
            <input
              ref={announcedAtInputRef}
              name="announcedAt"
              type="datetime-local"
              defaultValue={defaultAnnouncedAt}
              suppressHydrationWarning
              className="admin-input mt-2"
            />
            <button
              type="button"
              onClick={() => {
                if (announcedAtInputRef.current) {
                  announcedAtInputRef.current.value = formatDateTimeLocalKorean(new Date());
                }
              }}
              className="mt-2 rounded-full border border-[var(--admin-line-strong)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--admin-ink)] transition hover:border-[#d9ad00] hover:bg-[#fff9df]"
            >
              현재 시각 입력
            </button>
            <span className="mt-1 block text-xs leading-5 text-[var(--admin-muted)]">
              저장하면 고객 화면의 기준 시각이 이 값으로 바뀝니다. 현재 공개 기준은{" "}
              {formatDateTimeKorean(currentAnnouncedAt)}입니다.
            </span>
          </label>
          <label className="text-sm font-semibold text-[var(--admin-muted)]">
            변경자
            <input
              name="changedBy"
              defaultValue="관리자"
              className="admin-input mt-2"
            />
          </label>
        </div>
      </div>

      <div className="mt-4">
        <AdminActionFeedback statusCode={statusCode} message={statusMessage} warnings={warnings} scope="manual" />
      </div>

      <div className="mt-5 rounded-xl border border-[var(--admin-line)] bg-[#fbfdfb] px-4 py-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-extrabold text-[var(--admin-ink)]">최근 시세 조정 이력</p>
          <p className="text-[var(--admin-muted)]">
            이력 {freshness.historyCount.toLocaleString("ko-KR")}건 · 일별 보관 {freshness.dailySnapshotCount.toLocaleString("ko-KR")}건
          </p>
        </div>
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
            아직 실제 변경 이력이 적습니다. 현재 고시 시세 기준으로 기준값을 보관하고 있으며, 직접 저장하거나 자동 반영되면 이곳에 기록이 쌓입니다.
          </p>
        )}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="admin-table min-w-[980px]">
          <thead>
            <tr>
              <th>품목</th>
              <th>현재 공개가</th>
              <th>새 입력값</th>
              <th>차액</th>
              <th>노출</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((price) => (
              <tr key={price.id}>
                <td>
                  <input type="hidden" name="priceIds" value={price.id} />
                  <p className="font-extrabold text-[var(--admin-ink)]">{price.label}</p>
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">{price.unit}</p>
                </td>
                <td className="font-bold tabular-nums">{formatWon(price.value)}</td>
                <td>
                  <input
                    name={`value:${price.id}`}
                    type="number"
                    defaultValue={price.value}
                    className="admin-input w-36"
                  />
                </td>
                <td className="text-[var(--admin-muted)]">저장 후 계산</td>
                <td>
                  <label className="inline-flex items-center gap-2 font-semibold text-[var(--admin-ink)]">
                    <input name={`visible:${price.id}`} type="checkbox" defaultChecked={price.isVisible} />
                    노출
                  </label>
                </td>
                <td>
                  <textarea
                    name={`note:${price.id}`}
                    defaultValue={price.note || ""}
                    rows={2}
                    className="admin-input min-w-72"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminSubmitButton
        pendingLabel="저장 중..."
        className="admin-primary-button mt-6"
      >
        시세 저장
      </AdminSubmitButton>
    </form>
  );
}

export function AdminPricesWorkspace({
  prices,
  settings,
  suggestion,
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
      <CurrentPriceSnapshot prices={prices} />
      <ModeSwitch
        settings={settings}
        isAutoOn={isAutoOn}
        savedIsAutoOn={savedIsAutoOn}
        onModeChange={setIsAutoOn}
        statusCode={statusCode}
        statusMessage={statusMessage}
        warnings={warnings}
      />
      <OperationSummary prices={prices} settings={settings} suggestion={suggestion} freshness={freshness} isAutoOn={isAutoOn} />
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
          history={history}
          freshness={freshness}
          statusCode={statusCode}
          statusMessage={statusMessage}
          warnings={warnings}
        />
      )}
    </>
  );
}
