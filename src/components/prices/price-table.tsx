import { formatCurrencyKRW, formatDateTimeKorean } from "@/lib/format";
import { getPriceReferenceLabel, getPriceTradeGuide } from "@/lib/price-presenter";
import type { PriceRecord } from "@/types/price";

interface PriceTableProps {
  prices: PriceRecord[];
  compact?: boolean;
}

export function PriceTable({ prices, compact = false }: PriceTableProps) {
  return (
    <div className="thin-panel overflow-hidden rounded-[2rem]">
      <div className="md:hidden">
        {prices.map((price) => (
          <article key={price.id} className="border-b border-[var(--color-line)] bg-white/72 px-5 py-5 last:border-b-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                  {getPriceReferenceLabel(price.category)}
                </p>
                <span className="mt-2 inline-flex rounded-full border border-[var(--color-line-strong)] px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--color-muted)]">
                  {getPriceTradeGuide(price.category)}
                </span>
              </div>
              <p className="shrink-0 text-right text-xl font-semibold tracking-[-0.05em] text-[var(--color-ink)]">
                {formatCurrencyKRW(price.value)}
              </p>
            </div>
            <div className="mt-4 grid gap-2 text-sm leading-6 text-[var(--color-muted)]">
              <p>단위: {price.unit}</p>
              <p>기준 시각: {formatDateTimeKorean(price.announcedAt)}</p>
              {!compact ? <p>{price.note || "상담 후 안내"}</p> : null}
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] text-left text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
              <th className="px-5 py-4">종류</th>
              <th className="px-5 py-4">거래 기준</th>
              <th className="px-5 py-4">고시가</th>
              {!compact && <th className="px-5 py-4">단위</th>}
              <th className="px-5 py-4">기준 시각</th>
              {!compact && <th className="px-5 py-4">안내</th>}
            </tr>
          </thead>
          <tbody>
            {prices.map((price) => (
              <tr key={price.id} className="border-b border-[var(--color-line)] last:border-b-0">
                <td className="px-5 py-5 align-top">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">
                      {getPriceReferenceLabel(price.category)}
                    </p>
                    {compact ? (
                      <p className="mt-1 text-sm text-[var(--color-muted)]">{price.unit}</p>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-5 align-top">
                  <span className="inline-flex rounded-full border border-[var(--color-line-strong)] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[var(--color-muted)]">
                    {getPriceTradeGuide(price.category)}
                  </span>
                </td>
                <td className="px-5 py-5 align-top text-lg font-semibold text-[var(--color-ink)]">
                  {formatCurrencyKRW(price.value)}
                </td>
                {!compact && (
                  <td className="px-5 py-5 align-top text-sm text-[var(--color-muted)]">
                    {price.unit}
                  </td>
                )}
                <td className="px-5 py-5 align-top text-sm text-[var(--color-muted)]">
                  {formatDateTimeKorean(price.announcedAt)}
                </td>
                {!compact && (
                  <td className="px-5 py-5 align-top text-sm leading-7 text-[var(--color-muted)]">
                    {price.note || "-"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
