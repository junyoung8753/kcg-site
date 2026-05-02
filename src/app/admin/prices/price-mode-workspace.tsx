"use client";

import { useState } from "react";
import {
  applyPriceAutoSuggestionAction,
  generatePriceAutoSuggestionAction,
  rejectPriceAutoSuggestionAction,
  updatePriceAutoSettingsAction,
  updatePricesAction,
} from "@/actions/price-actions";
import { formatDateTimeKorean } from "@/lib/format";
import type { PriceAutoSettings, PriceAutoSuggestion, PriceRecord } from "@/types/price";

type PriceInputMode = "auto" | "manual";

interface AdminPricesWorkspaceProps {
  prices: PriceRecord[];
  settings: PriceAutoSettings;
  suggestion: PriceAutoSuggestion | null;
  hasMetalsKey: boolean;
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

function getLatestUpdate(prices: PriceRecord[]) {
  const sorted = [...prices].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return sorted[0]?.updatedAt ?? prices[0]?.announcedAt ?? new Date().toISOString();
}

function HiddenAutoSettingsFields({
  settings,
  enabled,
}: {
  settings: PriceAutoSettings;
  enabled: boolean;
}) {
  return (
    <>
      {enabled ? <input type="hidden" name="autoEnabled" value="on" /> : null}
      <input type="hidden" name="autoSource" value={settings.source} />
      <input type="hidden" name="intervalHours" value={settings.intervalHours} />
      <input type="hidden" name="autoMode" value="draft" />
      <input type="hidden" name="roundingUnit" value={settings.roundingUnit} />
      <input type="hidden" name="goldSellPremiumRate" value={settings.goldSellPremiumRate} />
      <input type="hidden" name="goldBuyDiscountRate" value={settings.goldBuyDiscountRate} />
      <input type="hidden" name="gold18kBuyRate" value={settings.gold18kBuyRate} />
      <input type="hidden" name="gold14kBuyRate" value={settings.gold14kBuyRate} />
      <input type="hidden" name="platinumSellPremiumRate" value={settings.platinumSellPremiumRate} />
      <input type="hidden" name="platinumBuyDiscountRate" value={settings.platinumBuyDiscountRate} />
      <input type="hidden" name="silverSellPremiumRate" value={settings.silverSellPremiumRate} />
      <input type="hidden" name="silverBuyDiscountRate" value={settings.silverBuyDiscountRate} />
      <input type="hidden" name="maxAutoChangePercent" value={settings.maxAutoChangePercent} />
      <input type="hidden" name="updatedBy" value="관리자" />
    </>
  );
}

function StatusPanel({
  prices,
  settings,
  suggestion,
  mode,
}: {
  prices: PriceRecord[];
  settings: PriceAutoSettings;
  suggestion: PriceAutoSuggestion | null;
  mode: PriceInputMode;
}) {
  const announcedAt = prices[0]?.announcedAt ?? new Date().toISOString();
  const latestUpdate = getLatestUpdate(prices);
  const draftCount = suggestion?.status === "draft" ? suggestion.items.length : 0;

  const stats = [
    { label: "기준 시각", value: formatDateTimeKorean(announcedAt) },
    { label: "마지막 저장", value: formatDateTimeKorean(latestUpdate) },
    { label: "현재 작업", value: mode === "auto" ? "자동시세 초안" : "직접 입력" },
    { label: "저장된 자동시세", value: settings.isEnabled ? `${settings.intervalHours}시간마다 초안` : "꺼짐" },
    { label: "대기 초안", value: draftCount ? `${draftCount}개 항목` : "없음" },
  ];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <div className="grid gap-3 md:grid-cols-5">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl bg-black/18 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/45">{item.label}</p>
            <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ModeSwitch({
  mode,
  setMode,
  settings,
}: {
  mode: PriceInputMode;
  setMode: (mode: PriceInputMode) => void;
  settings: PriceAutoSettings;
}) {
  const savedMode: PriceInputMode = settings.isEnabled ? "auto" : "manual";
  const changed = mode !== savedMode;

  return (
    <section
      data-testid="admin-price-mode-switch"
      className="rounded-[2rem] border border-white/10 bg-[#111] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold-soft)]">
            입력 방식
          </p>
          <h3 className="mt-2 font-display text-2xl text-white">자동시세 ON/OFF</h3>
          <p className="mt-2 text-sm leading-7 text-white/58">
            ON은 자동 초안 검토, OFF는 직접 입력으로 화면을 전환합니다.
          </p>
        </div>
        <div
          role="group"
          aria-label="자동시세 사용 여부"
          className="grid w-full max-w-[420px] grid-cols-2 rounded-full border border-white/10 bg-black/28 p-1"
        >
          <button
            type="button"
            aria-pressed={mode === "auto"}
            onClick={() => setMode("auto")}
            className={[
              "rounded-full px-4 py-3 text-sm font-semibold transition",
              mode === "auto"
                ? "bg-[var(--color-gold)] text-[#171717]"
                : "text-white/60 hover:bg-white/8 hover:text-white",
            ].join(" ")}
          >
            자동시세 ON
          </button>
          <button
            type="button"
            aria-pressed={mode === "manual"}
            onClick={() => setMode("manual")}
            className={[
              "rounded-full px-4 py-3 text-sm font-semibold transition",
              mode === "manual"
                ? "bg-white text-[#171717]"
                : "text-white/60 hover:bg-white/8 hover:text-white",
            ].join(" ")}
          >
            자동시세 OFF
          </button>
        </div>
      </div>

      {changed ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f2c35a]/25 bg-[#2a2212] px-4 py-3">
          <p className="text-sm leading-7 text-[#f8e2ab]">
            지금 화면만 전환되었습니다. 다음 접속에도 유지하려면 선택한 모드를 저장하세요.
          </p>
          <form action={updatePriceAutoSettingsAction}>
            <HiddenAutoSettingsFields settings={settings} enabled={mode === "auto"} />
            <button className="rounded-full bg-[var(--color-gold)] px-5 py-2.5 text-sm font-semibold text-[#171717]">
              선택한 모드 저장
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function AutoFormulaGuide({ settings }: { settings: PriceAutoSettings }) {
  const formulas = [
    {
      label: "순금 살 때",
      body: `국제 금 3.75g 환산가 × (1 + ${formatRate(settings.goldSellPremiumRate)}) → ${settings.roundingUnit.toLocaleString("ko-KR")}원 단위 반올림`,
    },
    {
      label: "순금 팔 때",
      body: `국제 금 3.75g 환산가 × (1 - ${formatRate(settings.goldBuyDiscountRate)}) → ${settings.roundingUnit.toLocaleString("ko-KR")}원 단위 반올림`,
    },
    {
      label: "18K / 14K",
      body: `순금 팔 때 기준 × 18K ${settings.gold18kBuyRate} / 14K ${settings.gold14kBuyRate}`,
    },
    {
      label: "백금 / 은",
      body: `각 금속 3.75g 환산가에 판매 프리미엄과 매입 할인폭을 적용`,
    },
    {
      label: "검토 기준",
      body: `직전 고시가 대비 ${formatRate(settings.maxAutoChangePercent)} 이상 변동하면 검토 필요로 표시`,
    },
  ];

  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold-soft)]">
            Formula
          </p>
          <h4 className="mt-2 text-lg font-semibold text-white">자동 계산 공식</h4>
        </div>
        <span className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-semibold text-white/58">
          공개 전 초안만 생성
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
      <p className="mt-4 text-xs leading-6 text-white/45">
        원천값은 선택한 시장 참고 소스와 환율로 만든 3.75g 환산가입니다. 초안 적용 전에는 홈, 시세,
        상품 가격이 바뀌지 않습니다.
      </p>
    </div>
  );
}

function AutoModePanel({
  settings,
  suggestion,
  hasMetalsKey,
}: {
  settings: PriceAutoSettings;
  suggestion: PriceAutoSuggestion | null;
  hasMetalsKey: boolean;
}) {
  const draft = suggestion?.status === "draft" ? suggestion : null;

  return (
    <section
      data-testid="admin-price-auto-panel"
      className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold-soft)]">
            자동입력
          </p>
          <h3 className="mt-2 font-display text-2xl text-white">자동시세 초안</h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/62">
            시장 참고값에 KCG 산식을 적용해 초안을 만들고, 적용 버튼을 누를 때만 공개 시세가 바뀝니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form action={generatePriceAutoSuggestionAction}>
            <button className="rounded-full bg-[var(--color-gold)] px-5 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[var(--color-gold-soft)]">
              초안 생성
            </button>
          </form>
          <form action={updatePriceAutoSettingsAction}>
            <HiddenAutoSettingsFields settings={settings} enabled />
            <button className="rounded-full border border-white/14 px-5 py-3 text-sm font-semibold text-white/76 transition hover:border-[var(--color-gold-soft)] hover:text-white">
              ON 저장
            </button>
          </form>
        </div>
      </div>

      {!settings.schemaReady ? (
        <p className="mt-5 rounded-2xl border border-[#f2c35a]/25 bg-[#2a2212] px-4 py-3 text-sm leading-7 text-[#f8e2ab]">
          Supabase에 자동입력 테이블을 적용하면 설정 저장과 초안 이력이 활성화됩니다. 적용 전에도 UI와 산식 구조는 확인할 수 있습니다.
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AutoFormulaGuide settings={settings} />
        <div className="rounded-[1.6rem] border border-white/10 bg-black/18 p-4">
          <p className="text-sm font-semibold text-white">현재 설정</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/48">소스</dt>
              <dd className="font-semibold text-white">{settings.source === "metals-dev" ? "Metals.Dev" : "Gold API"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/48">주기</dt>
              <dd className="font-semibold text-white">{settings.intervalHours}시간마다 초안</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/48">반올림</dt>
              <dd className="font-semibold text-white">{settings.roundingUnit.toLocaleString("ko-KR")}원 단위</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/48">자동 게시</dt>
              <dd className="font-semibold text-white">비활성</dd>
            </div>
          </dl>

          <details className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <summary className="cursor-pointer text-sm font-semibold text-white">
              세부 설정 수정
            </summary>
            <form action={updatePriceAutoSettingsAction} className="mt-4 grid gap-4">
              <input type="hidden" name="autoEnabled" value="on" />
              <input type="hidden" name="autoMode" value="draft" />
              <label className="block text-sm text-white/74">
                소스
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
              <label className="block text-sm text-white/74">
                실행 주기
                <select
                  name="intervalHours"
                  defaultValue={settings.intervalHours}
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
                >
                  <option value="1">1시간마다</option>
                  <option value="2">2시간마다</option>
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField name="roundingUnit" label="반올림 단위" value={settings.roundingUnit} />
                <NumberField name="maxAutoChangePercent" label="최대 자동 변동률" value={settings.maxAutoChangePercent} step="0.001" />
                <NumberField name="goldSellPremiumRate" label="순금 살 때 프리미엄" value={settings.goldSellPremiumRate} step="0.001" />
                <NumberField name="goldBuyDiscountRate" label="순금 팔 때 할인폭" value={settings.goldBuyDiscountRate} step="0.001" />
                <NumberField name="gold18kBuyRate" label="18K 환산 계수" value={settings.gold18kBuyRate} step="0.001" />
                <NumberField name="gold14kBuyRate" label="14K 환산 계수" value={settings.gold14kBuyRate} step="0.001" />
              </div>
              <input type="hidden" name="platinumSellPremiumRate" value={settings.platinumSellPremiumRate} />
              <input type="hidden" name="platinumBuyDiscountRate" value={settings.platinumBuyDiscountRate} />
              <input type="hidden" name="silverSellPremiumRate" value={settings.silverSellPremiumRate} />
              <input type="hidden" name="silverBuyDiscountRate" value={settings.silverBuyDiscountRate} />
              <input type="hidden" name="updatedBy" value="관리자" />
              <button className="rounded-full border border-white/14 px-5 py-3 text-sm font-semibold text-white transition hover:border-[var(--color-gold-soft)] hover:bg-white/6">
                세부 설정 저장
              </button>
            </form>
          </details>
        </div>
      </div>

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

      {draft ? <AutoSuggestionPanel suggestion={draft} /> : null}
    </section>
  );
}

function NumberField({
  name,
  label,
  value,
  step,
}: {
  name: string;
  label: string;
  value: number;
  step?: string;
}) {
  return (
    <label className="block text-sm text-white/74">
      {label}
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

function AutoSuggestionPanel({ suggestion }: { suggestion: PriceAutoSuggestion }) {
  return (
    <div className="mt-6 rounded-[1.6rem] border border-[var(--color-gold)]/25 bg-[#241f12] p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#ffd77a]">대기 중인 자동입력 초안</p>
          <p className="mt-1 text-xs text-white/55">
            {suggestion.providerLabel} · 기준 {formatDateTimeKorean(suggestion.sourceUpdatedAt)} · 생성{" "}
            {formatDateTimeKorean(suggestion.generatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={applyPriceAutoSuggestionAction}>
            <input type="hidden" name="suggestionId" value={suggestion.id} />
            <input type="hidden" name="changedBy" value="자동입력 초안 적용" />
            <button className="rounded-full bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-[#171717]">
              초안 적용
            </button>
          </form>
          <form action={rejectPriceAutoSuggestionAction}>
            <input type="hidden" name="suggestionId" value={suggestion.id} />
            <button className="rounded-full border border-white/14 px-4 py-2 text-sm font-semibold text-white/72">
              초안 폐기
            </button>
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
              <th className="py-3">제안</th>
              <th className="py-3">차액</th>
              <th className="py-3">확인</th>
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
                    {item.needsReview ? "검토 필요" : "정상 범위"}
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

function PriceEditor({ prices }: { prices: PriceRecord[] }) {
  const announcedAt = prices[0]?.announcedAt ?? new Date().toISOString();

  return (
    <form
      action={updatePricesAction}
      data-testid="admin-price-editor"
      className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold-soft)]">
            Manual
          </p>
          <h3 className="mt-2 font-display text-2xl text-white">직접 입력</h3>
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

      <button className="mt-6 rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[var(--color-gold-soft)]">
        저장
      </button>
    </form>
  );
}

export function AdminPricesWorkspace({
  prices,
  settings,
  suggestion,
  hasMetalsKey,
}: AdminPricesWorkspaceProps) {
  const [mode, setMode] = useState<PriceInputMode>(settings.isEnabled ? "auto" : "manual");

  return (
    <>
      <ModeSwitch mode={mode} setMode={setMode} settings={settings} />
      <StatusPanel prices={prices} settings={settings} suggestion={suggestion} mode={mode} />
      {mode === "auto" ? (
        <AutoModePanel settings={settings} suggestion={suggestion} hasMetalsKey={hasMetalsKey} />
      ) : (
        <PriceEditor prices={prices} />
      )}
    </>
  );
}
