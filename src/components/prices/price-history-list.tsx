import { formatCurrencyKRW, formatDateTimeKorean } from "@/lib/format";
import type { PriceHistoryEntry } from "@/types/price";

interface PriceHistoryListProps {
  history: PriceHistoryEntry[];
}

export function PriceHistoryList({ history }: PriceHistoryListProps) {
  return (
    <div className="border-y border-[var(--color-line)] py-6 sm:py-8">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] pb-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[var(--color-muted)]">
            시세 조정 이력
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold">최근 조정 이력</h3>
        </div>
        <p className="text-sm text-[var(--color-muted)]">{history.length}건 표시</p>
      </div>
      <div>
        {history.map((entry) => (
          <div key={entry.id} className="border-b border-[var(--color-line)] py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[var(--color-ink)]">{entry.label}</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {formatDateTimeKorean(entry.changedAt)} / {entry.changedBy}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-[var(--color-muted)]">
                  {formatCurrencyKRW(entry.previousValue)} →{" "}
                  <span className="font-semibold text-[var(--color-ink)]">
                    {formatCurrencyKRW(entry.newValue)}
                  </span>
                </p>
                <p
                  className={`mt-2 text-xs font-semibold ${
                    entry.newValue > entry.previousValue
                      ? "text-emerald-600"
                      : entry.newValue < entry.previousValue
                        ? "text-rose-600"
                        : "text-[var(--color-muted)]"
                  }`}
                >
                  {entry.newValue > entry.previousValue
                    ? "상향 조정"
                    : entry.newValue < entry.previousValue
                      ? "하향 조정"
                      : "변동 없음"}
                </p>
                {entry.note ? (
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{entry.note}</p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
