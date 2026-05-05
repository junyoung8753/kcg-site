import { formatDateTimeKorean, formatWon } from "@/lib/format";
import type { PriceHistoryEntry } from "@/types/price";

interface PriceHistoryListProps {
  history: PriceHistoryEntry[];
}

export function PriceHistoryList({ history }: PriceHistoryListProps) {
  return (
    <div className="border-y border-[var(--color-line)] py-6 sm:py-8">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] pb-5">
        <div>
          <p className="kcg-data-label text-[var(--color-muted)]">
            시세 조정 이력
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold">최근 조정 이력</h3>
        </div>
        <p className="text-sm text-[var(--color-muted)]">{history.length}건 표시</p>
      </div>
      <div>
        {history.length ? history.map((entry) => (
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
                  {formatWon(entry.previousValue)} →{" "}
                  <span className="font-semibold text-[var(--color-ink)]">
                    {formatWon(entry.newValue)}
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
        )) : (
          <div className="rounded-[1.25rem] border border-[var(--color-line)] bg-white px-5 py-5">
            <p className="font-semibold text-[var(--color-ink)]">현재 고시 시세 기준으로 이력을 준비 중입니다.</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              직접 저장 또는 자동시세 반영이 쌓이면 이곳에 최근 조정 이력이 표시됩니다. 공개 시세표는 현재 고시값을 기준으로 계속 확인할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
