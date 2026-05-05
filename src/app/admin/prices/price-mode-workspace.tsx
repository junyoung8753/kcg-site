"use client";

import { useState } from "react";
import {
  applyPriceAutoSuggestionAction,
  generatePriceAutoSuggestionAction,
  rejectPriceAutoSuggestionAction,
  updatePriceAutoSettingsAction,
  updatePricesAction,
} from "@/actions/price-actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { formatDateTimeKorean } from "@/lib/format";
import type { PriceAutoSettings, PriceAutoSuggestion, PriceRecord } from "@/types/price";

interface AdminPricesWorkspaceProps {
  prices: PriceRecord[];
  settings: PriceAutoSettings;
  suggestion: PriceAutoSuggestion | null;
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
      <input type="hidden" name="updatedBy" value="관리자" />
    </>
  );
}

function CurrentPriceSnapshot({ prices }: { prices: PriceRecord[] }) {
  const visiblePrices = prices.filter((price) => price.isVisible).slice(0, 8);

  return (
    <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-soft)]">
            현재 공개 시세
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">사이트에 보이는 가격</h3>
        </div>
        <p className="text-xs text-white/45">기준 {formatDateTimeKorean(prices[0]?.announcedAt ?? new Date().toISOString())}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {visiblePrices.map((price) => (
          <div key={price.id} className="rounded-2xl border border-white/8 bg-black/18 px-4 py-3">
            <p className="text-xs text-white/45">{getAdminPriceSnapshotLabel(price)}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-white">{formatWon(price.value)}</p>
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
  isAutoOn,
}: {
  prices: PriceRecord[];
  settings: PriceAutoSettings;
  suggestion: PriceAutoSuggestion | null;
  isAutoOn: boolean;
}) {
  const latestUpdate = getLatestUpdate(prices);
  const draftCount = suggestion?.status === "draft" ? suggestion.items.length : 0;
  const stats = [
    { label: "운영 상태", value: isAutoOn ? "자동시세 ON" : "직접 입력" },
    { label: "마지막 저장", value: formatDateTimeKorean(latestUpdate) },
    { label: "최근 자동 반영", value: settings.lastAutoAppliedAt ? formatDateTimeKorean(settings.lastAutoAppliedAt) : "아직 없음" },
    { label: "다음 확인 예정", value: getNextCheckLabel(settings, isAutoOn) },
    { label: "검토 대기", value: draftCount ? `${draftCount}개 항목` : "없음" },
  ];

  return (
    <section className="rounded-[1.8rem] border border-white/10 bg-[#111] p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-5">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl bg-white/[0.045] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-white/42">{item.label}</p>
            <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
          </div>
        ))}
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
      className="rounded-[1.8rem] border border-white/10 bg-[#111] p-5 sm:p-6"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-soft)]">
            자동시세
          </p>
          <h3 className="mt-2 font-display text-xl text-white">
            {isAutoOn ? "자동 계산 후 조건 통과 시 바로 반영" : "직접 입력 모드"}
          </h3>
          <p className="mt-2 text-sm leading-7 text-white/58">
            ON을 누르면 자동 운영으로 저장되고, OFF를 누르면 직접 입력표가 열립니다.
          </p>
        </div>

        <div className="w-full max-w-[430px] space-y-3">
          <form action={updatePriceAutoSettingsAction}>
            <HiddenAutoSettingsFields
              settings={settings}
              enabled={!isAutoOn}
              mode={isAutoOn ? "manual_review" : "auto_publish"}
            />
            <AdminSubmitButton
              type={canPersist ? "submit" : "button"}
              pendingLabel={isAutoOn ? "자동시세 OFF 저장 중..." : "자동시세 ON 저장 중..."}
              data-testid="admin-price-mode-toggle"
              onClick={(event) => {
                onModeChange(!isAutoOn);
                if (!canPersist) event.preventDefault();
              }}
              aria-pressed={isAutoOn}
              aria-label="자동시세 ON/OFF 전환"
              className={[
                "group flex w-full appearance-none items-center justify-between gap-4 rounded-[1.7rem] border px-5 py-4 text-left transition",
                isAutoOn
                  ? "border-[var(--color-gold)]/55 bg-[var(--color-gold)]/10"
                  : "border-white/12 bg-black/24 hover:border-white/22 hover:bg-white/[0.04]",
              ].join(" ")}
            >
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/44">
                  현재 상태
                </span>
                <span className="mt-1 block text-base font-semibold text-white">
                  {isAutoOn ? "자동시세 ON" : "자동시세 OFF"}
                </span>
                <span className="mt-1 block text-xs text-white/46">
                  {isAutoOn ? "클릭하면 직접 입력으로 전환" : "클릭하면 자동 운영으로 전환"}
                </span>
              </span>
              <span
                className={[
                  "relative h-8 w-16 shrink-0 rounded-full border transition",
                  isAutoOn
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)]"
                    : "border-white/16 bg-white/8",
                ].join(" ")}
                aria-hidden="true"
              >
                <span
                  className={[
                    "absolute top-1 h-6 w-6 rounded-full bg-[#171717] shadow transition",
                    isAutoOn ? "left-[2.15rem]" : "left-1 bg-white/82",
                  ].join(" ")}
                />
              </span>
            </AdminSubmitButton>
          </form>
          <p className="text-xs leading-5 text-white/45">
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
    <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-soft)]">
            계산 기준
          </p>
          <h4 className="mt-2 text-lg font-semibold text-white">자동 계산 공식</h4>
        </div>
        <span className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-semibold text-white/58">
          {settings.businessHoursOnly ? "영업시간만 반영" : "항상 확인"}
        </span>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {formulas.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3">
            <p className="text-sm font-semibold text-white">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-white/62">{item.body}</p>
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
    <label className="block text-sm text-white/74">
      <span className="font-semibold text-white/82">{label}</span>
      {help ? <span className="mt-1 block text-xs leading-5 text-white/44">{help}</span> : null}
      <input
        name={name}
        type="number"
        step={step}
        defaultValue={value}
        className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
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
    <details className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <summary className="cursor-pointer text-sm font-semibold text-white">
        자동 계산 기준 자세히 보기
      </summary>
      <form action={updatePriceAutoSettingsAction} className="mt-4 grid gap-4">
        <input type="hidden" name="autoEnabled" value="on" />
        <input type="hidden" name="autoMode" value="auto_publish" />
        <input type="hidden" name="intervalHours" value={settings.checkIntervalMinutes === 120 ? 2 : 1} />
        <label className="block text-sm text-white/74">
          <span className="font-semibold text-white/82">참고 데이터</span>
          <span className="mt-1 block text-xs leading-5 text-white/44">
            회사 시세를 바로 가져오는 것이 아니라, 아래 산식의 원천 참고값입니다.
          </span>
          <select
            name="autoSource"
            defaultValue={settings.source}
            className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
          >
            <option value="gold-api">Gold API</option>
            <option value="metals-dev" disabled={!hasMetalsKey}>
              Metals.Dev{hasMetalsKey ? "" : " (API key 필요)"}
            </option>
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-white/74">
          <span className="font-semibold text-white/82">확인 주기</span>
          <span className="mt-1 block text-xs leading-5 text-white/44">
              자동 작업이 이 시간보다 빨리 다시 실행되면 사이트 시세를 그대로 둡니다.
          </span>
            <select
              name="checkIntervalMinutes"
              defaultValue={settings.checkIntervalMinutes}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
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

        <label className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white/74">
          <input name="businessHoursOnly" type="checkbox" defaultChecked={settings.businessHoursOnly} />
          평일 09:00-18:30에만 자동 반영
        </label>

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
          className="rounded-full border border-white/14 px-5 py-3 text-sm font-semibold text-white transition hover:border-[var(--color-gold-soft)] hover:bg-white/6"
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
    <div className="mt-5 rounded-[1.6rem] border border-[var(--color-gold)]/25 bg-[#241f12] p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#ffd77a]">
            {needsReview ? "검토 필요 항목" : "최근 자동 계산 기록"}
          </p>
          <p className="mt-1 text-xs text-white/55">
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
                className="rounded-full bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-[#171717]"
              >
                검토 후 반영
              </AdminSubmitButton>
            </form>
          ) : null}
          <form action={rejectPriceAutoSuggestionAction}>
            <input type="hidden" name="suggestionId" value={suggestion.id} />
            <AdminSubmitButton
              pendingLabel="폐기 중..."
              className="rounded-full border border-white/14 px-4 py-2 text-sm font-semibold text-white/72"
            >
              {needsReview ? "검토 항목 폐기" : "계산 기록 폐기"}
            </AdminSubmitButton>
          </form>
        </div>
      </div>
      {suggestion.warnings.length ? (
        <div className="mt-4 space-y-1 text-sm leading-7 text-[#f8e2ab]">
          {suggestion.warnings.map((warning) => (
            <p key={warning}>· {warning}</p>
          ))}
        </div>
      ) : null}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs text-white/48">
            <tr className="border-b border-white/10">
              <th className="py-3">품목</th>
              <th className="py-3">현재</th>
              <th className="py-3">계산값</th>
              <th className="py-3">차액</th>
              <th className="py-3">상태</th>
            </tr>
          </thead>
          <tbody>
            {suggestion.items.map((item) => (
              <tr key={item.category} className="border-b border-white/8">
                <td className="py-3 font-semibold text-white">{item.label}</td>
                <td className="py-3 text-white/68">{formatWon(item.currentValue)}</td>
                <td className="py-3 font-semibold text-white">{formatWon(item.proposedValue)}</td>
                <td className="py-3 text-white/68">
                  {formatSigned(item.difference)} / {formatRate(item.changePercent)}
                </td>
                <td className="py-3">
                  <span className={item.needsReview ? "text-[#ffd77a]" : "text-white/55"}>
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
  hasMetalsKey,
  statusCode,
  statusMessage,
  warnings,
}: {
  settings: PriceAutoSettings;
  suggestion: PriceAutoSuggestion | null;
  hasMetalsKey: boolean;
  statusCode?: string;
  statusMessage?: string | null;
  warnings?: string[];
}) {
  const draft = suggestion?.status === "draft" ? suggestion : null;

  return (
    <section
      data-testid="admin-price-auto-panel"
      className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6"
    >
      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <AutoCalculationGuide settings={settings} />
        <div className="space-y-4">
          <div className="rounded-[1.6rem] border border-white/10 bg-black/18 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-soft)]">
                  자동 운영
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">현재 자동 운영 중</h3>
              </div>
              <form action={generatePriceAutoSuggestionAction}>
                <AdminSubmitButton
                  pendingLabel="계산 중..."
                  className="rounded-full bg-[var(--color-gold)] px-4 py-2.5 text-sm font-semibold text-[#171717] transition hover:bg-[var(--color-gold-soft)]"
                >
                  지금 계산 실행
                </AdminSubmitButton>
              </form>
            </div>
            <div className="mt-4">
              <AdminActionFeedback statusCode={statusCode} message={statusMessage} warnings={warnings} scope="auto" />
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-white/[0.035] px-4 py-3">
                <dt className="text-white/48">참고 데이터</dt>
                <dd className="mt-1 font-semibold text-white">{settings.source === "metals-dev" ? "Metals.Dev" : "Gold API"}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.035] px-4 py-3">
                <dt className="text-white/48">확인 주기</dt>
                <dd className="mt-1 font-semibold text-white">{settings.checkIntervalMinutes}분마다</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.035] px-4 py-3">
                <dt className="text-white/48">최소 반영 금액</dt>
                <dd className="mt-1 font-semibold text-white">{settings.minApplyChangeWon.toLocaleString("ko-KR")}원 이상 차이</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.035] px-4 py-3">
                <dt className="text-white/48">자동 게시 허용 변동폭</dt>
                <dd className="mt-1 font-semibold text-white">{formatRate(settings.maxAutoPublishChangePercent)} 미만</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-5 text-white/42">
              현재 Vercel 무료 플랜에서는 자동 호출이 하루 1회로 배포됩니다. 30분/1시간 주기는 Pro 또는 외부
              스케줄러를 연결하면 그대로 적용됩니다.
              수동으로 누르는 지금 계산 실행도 안전 기준을 통과해야 공개 시세를 바꿉니다.
            </p>
          </div>

          <AutoSettingsForm settings={settings} hasMetalsKey={hasMetalsKey} />
        </div>
      </div>

      {!settings.schemaReady ? (
        <p className="mt-5 rounded-2xl border border-[#f2c35a]/25 bg-[#2a2212] px-4 py-3 text-sm leading-7 text-[#f8e2ab]">
          Supabase에 자동시세 테이블을 적용하면 설정 저장과 자동 반영 이력이 활성화됩니다.
        </p>
      ) : null}

      {draft ? (
        <AutoSuggestionPanel suggestion={draft} />
      ) : (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/14 px-4 py-3 text-sm text-white/52">
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
            className="rounded-full border border-white/10 px-4 py-2 text-white/72 transition hover:border-[var(--color-gold-soft)] hover:text-white"
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
  statusCode,
  statusMessage,
  warnings,
}: {
  prices: PriceRecord[];
  statusCode?: string;
  statusMessage?: string | null;
  warnings?: string[];
}) {
  const announcedAt = prices[0]?.announcedAt ?? new Date().toISOString();

  return (
    <form
      action={updatePricesAction}
      data-testid="admin-price-editor"
      className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-soft)]">
            직접 입력
          </p>
          <h3 className="mt-2 font-display text-xl text-white">직접 입력</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-white/74">
            기준 시각
            <input
              name="announcedAt"
              type="datetime-local"
              defaultValue={announcedAt.slice(0, 16)}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="text-sm text-white/74">
            변경자
            <input
              name="changedBy"
              defaultValue="관리자"
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
        </div>
      </div>

      <div className="mt-4">
        <AdminActionFeedback statusCode={statusCode} message={statusMessage} warnings={warnings} scope="manual" />
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="text-xs text-white/46">
            <tr className="border-b border-white/10">
              <th className="py-3 pr-3">품목</th>
              <th className="py-3 pr-3">현재 공개가</th>
              <th className="py-3 pr-3">새 입력값</th>
              <th className="py-3 pr-3">차액</th>
              <th className="py-3 pr-3">노출</th>
              <th className="py-3">비고</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((price) => (
              <tr key={price.id} className="border-b border-white/8 align-top">
                <td className="py-4 pr-3">
                  <input type="hidden" name="priceIds" value={price.id} />
                  <p className="font-semibold text-white">{price.label}</p>
                  <p className="mt-1 text-xs text-white/45">{price.unit}</p>
                </td>
                <td className="py-4 pr-3 font-semibold text-white/76">{formatWon(price.value)}</td>
                <td className="py-4 pr-3">
                  <input
                    name={`value:${price.id}`}
                    type="number"
                    defaultValue={price.value}
                    className="w-36 rounded-xl border border-white/12 bg-black/18 px-3 py-2 text-white outline-none focus:border-[var(--color-gold-soft)]"
                  />
                </td>
                <td className="py-4 pr-3 text-white/45">저장 후 계산</td>
                <td className="py-4 pr-3">
                  <label className="inline-flex items-center gap-2 text-white/68">
                    <input name={`visible:${price.id}`} type="checkbox" defaultChecked={price.isVisible} />
                    노출
                  </label>
                </td>
                <td className="py-4">
                  <textarea
                    name={`note:${price.id}`}
                    defaultValue={price.note || ""}
                    rows={2}
                    className="min-w-72 w-full rounded-xl border border-white/12 bg-black/18 px-3 py-2 text-white outline-none focus:border-[var(--color-gold-soft)]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminSubmitButton
        pendingLabel="저장 중..."
        className="mt-6 rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[var(--color-gold-soft)]"
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
      <OperationSummary prices={prices} settings={settings} suggestion={suggestion} isAutoOn={isAutoOn} />
      {isAutoOn ? (
        <AutoModePanel
          settings={settings}
          suggestion={suggestion}
          hasMetalsKey={hasMetalsKey}
          statusCode={statusCode}
          statusMessage={statusMessage}
          warnings={warnings}
        />
      ) : (
        <PriceEditor prices={prices} statusCode={statusCode} statusMessage={statusMessage} warnings={warnings} />
      )}
    </>
  );
}
