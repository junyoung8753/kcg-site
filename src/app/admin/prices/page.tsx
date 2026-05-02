import {
  applyPriceAutoSuggestionAction,
  generatePriceAutoSuggestionAction,
  rejectPriceAutoSuggestionAction,
  updatePriceAutoSettingsAction,
  updatePricesAction,
} from "@/actions/price-actions";
import { getRepository } from "@/lib/data";
import { formatDateTimeKorean } from "@/lib/format";
import type { PriceAutoSettings, PriceAutoSuggestion, PriceRecord } from "@/types/price";

interface AdminPricesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getStatusMessage(status?: string | string[]) {
  if (status === "saved") return "시세가 저장되었습니다.";
  if (status === "demo") return "Supabase 미연결 상태에서는 저장이 비활성화됩니다.";
  if (status === "error") return "저장 중 오류가 발생했습니다.";
  if (status === "auto-settings-saved") return "자동입력 설정이 저장되었습니다.";
  if (status === "auto-schema") return "자동입력 테이블이 아직 Supabase에 적용되지 않았습니다.";
  if (status === "auto-draft") return "자동입력 초안이 생성되었습니다.";
  if (status === "auto-applied") return "자동입력 초안이 공개 시세에 적용되었습니다.";
  if (status === "auto-rejected") return "자동입력 초안을 폐기했습니다.";
  if (status === "auto-error") return "자동입력 처리 중 오류가 발생했습니다.";
  return null;
}

function getWarnings(warning?: string | string[]) {
  if (!warning) return [];
  return Array.isArray(warning) ? warning : [warning];
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

function StatusPanel({
  prices,
  settings,
  suggestion,
}: {
  prices: PriceRecord[];
  settings: PriceAutoSettings;
  suggestion: PriceAutoSuggestion | null;
}) {
  const announcedAt = prices[0]?.announcedAt ?? new Date().toISOString();
  const latestUpdate = getLatestUpdate(prices);
  const draftCount = suggestion?.status === "draft" ? suggestion.items.length : 0;

  const stats = [
    { label: "기준 시각", value: formatDateTimeKorean(announcedAt) },
    { label: "마지막 저장", value: formatDateTimeKorean(latestUpdate) },
    { label: "자동입력", value: settings.isEnabled ? `${settings.intervalHours}시간마다 초안` : "꺼짐" },
    { label: "데이터 소스", value: settings.source === "metals-dev" ? "Metals.Dev" : "Gold API" },
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

function AutoSettingsPanel({
  settings,
  suggestion,
}: {
  settings: PriceAutoSettings;
  suggestion: PriceAutoSuggestion | null;
}) {
  const hasMetalsKey = Boolean(process.env.METALS_DEV_API_KEY);
  const draft = suggestion?.status === "draft" ? suggestion : null;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-gold-soft)]">
            자동입력
          </p>
          <h3 className="mt-2 font-display text-2xl text-white">검토 가능한 시세 초안 생성기</h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/62">
            경쟁사 가격은 자동 수집하지 않습니다. 허용 가능한 시장 참고값에 KCG 산식을 적용해 초안을 만들고,
            적용 버튼을 누를 때만 공개 시세가 바뀝니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-white/68">
            초안만 생성
          </span>
          <form action={generatePriceAutoSuggestionAction}>
            <button className="rounded-full bg-[var(--color-gold)] px-5 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[var(--color-gold-soft)]">
              초안 생성
            </button>
          </form>
        </div>
      </div>

      {!settings.schemaReady ? (
        <p className="mt-5 rounded-2xl border border-[#f2c35a]/25 bg-[#2a2212] px-4 py-3 text-sm leading-7 text-[#f8e2ab]">
          Supabase에 자동입력 테이블을 적용하면 설정 저장과 초안 이력이 활성화됩니다. 적용 전에도 UI와 산식 구조는 확인할 수 있습니다.
        </p>
      ) : null}

      <form action={updatePriceAutoSettingsAction} className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
        <input type="hidden" name="autoMode" value="draft" />
        <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white/74">
          자동입력 사용
          <input name="autoEnabled" type="checkbox" defaultChecked={settings.isEnabled} />
        </label>
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
        <label className="block text-sm text-white/74">
          반올림 단위
          <input
            name="roundingUnit"
            type="number"
            defaultValue={settings.roundingUnit}
            className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
          />
        </label>
        <label className="block text-sm text-white/74">
          순금 살 때 프리미엄
          <input
            name="goldSellPremiumRate"
            type="number"
            step="0.001"
            defaultValue={settings.goldSellPremiumRate}
            className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
          />
        </label>
        <label className="block text-sm text-white/74">
          순금 팔 때 할인폭
          <input
            name="goldBuyDiscountRate"
            type="number"
            step="0.001"
            defaultValue={settings.goldBuyDiscountRate}
            className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
          />
        </label>
        <label className="block text-sm text-white/74">
          18K 환산 계수
          <input
            name="gold18kBuyRate"
            type="number"
            step="0.001"
            defaultValue={settings.gold18kBuyRate}
            className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
          />
        </label>
        <label className="block text-sm text-white/74">
          14K 환산 계수
          <input
            name="gold14kBuyRate"
            type="number"
            step="0.001"
            defaultValue={settings.gold14kBuyRate}
            className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
          />
        </label>
        <label className="block text-sm text-white/74">
          최대 자동 변동률
          <input
            name="maxAutoChangePercent"
            type="number"
            step="0.001"
            defaultValue={settings.maxAutoChangePercent}
            className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
          />
        </label>
        <input type="hidden" name="platinumSellPremiumRate" value={settings.platinumSellPremiumRate} />
        <input type="hidden" name="platinumBuyDiscountRate" value={settings.platinumBuyDiscountRate} />
        <input type="hidden" name="silverSellPremiumRate" value={settings.silverSellPremiumRate} />
        <input type="hidden" name="silverBuyDiscountRate" value={settings.silverBuyDiscountRate} />
        <input type="hidden" name="updatedBy" value="관리자" />
        <div className="flex items-end">
          <button className="w-full rounded-full border border-white/14 px-5 py-3 text-sm font-semibold text-white transition hover:border-[var(--color-gold-soft)] hover:bg-white/6">
            자동입력 설정 저장
          </button>
        </div>
      </form>

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
        <table className="min-w-[720px] w-full text-left text-sm">
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
          <h3 className="font-display text-2xl text-white">직접 입력</h3>
          <p className="mt-2 text-sm text-white/58">대표가 직접 넣는 회사 고시가입니다.</p>
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
        <table className="min-w-[980px] w-full text-left text-sm">
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
                    className="w-full min-w-72 rounded-xl border border-white/12 bg-black/18 px-3 py-2 text-white outline-none focus:border-[var(--color-gold-soft)]"
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

export default async function AdminPricesPage({
  searchParams,
}: AdminPricesPageProps) {
  const repository = getRepository();
  const [prices, settings, suggestion, params] = await Promise.all([
    repository.getPrices(),
    repository.getPriceAutoSettings(),
    repository.getLatestPriceAutoSuggestion(),
    searchParams,
  ]);
  const message = getStatusMessage(params.status);
  const warnings = getWarnings(params.warning);

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-gold-soft)]">
            Price Desk
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">오늘 시세 관리</h2>
          <p className="mt-2 text-sm leading-7 text-white/62">
            직접 입력과 자동입력 초안을 같은 자리에서 확인합니다.
          </p>
        </div>
        <a
          href="/prices"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/14 px-5 py-3 text-sm font-semibold text-white/76 transition hover:border-[var(--color-gold-soft)] hover:text-white"
        >
          공개 페이지 보기
        </a>
      </section>

      {message ? (
        <p className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/78">
          {message}
        </p>
      ) : null}
      {warnings.length ? (
        <div className="rounded-[1.6rem] border border-[#f2c35a]/30 bg-[#2c2413] px-5 py-4 text-sm text-[#f8e2ab]">
          <p className="font-semibold text-[#ffd77a]">저장은 완료되었지만 아래 항목을 다시 확인해 주세요.</p>
          <div className="mt-3 space-y-2 leading-7">
            {warnings.map((warning) => (
              <p key={warning}>· {warning}</p>
            ))}
          </div>
        </div>
      ) : null}

      <StatusPanel prices={prices} settings={settings} suggestion={suggestion} />
      <AutoSettingsPanel settings={settings} suggestion={suggestion} />
      <PriceEditor prices={prices} />
    </div>
  );
}
