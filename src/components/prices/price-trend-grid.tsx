import { formatCurrencyKRW } from "@/lib/format";
import { getPriceLineLabel } from "@/lib/price-presenter";
import { getPriceTrends, getTrendSummary } from "@/lib/price-trends";
import { cn } from "@/lib/utils";
import type { PriceRecord } from "@/types/price";

interface PriceTrendGridProps {
  prices: PriceRecord[];
  variant?: "light" | "dark";
  compact?: boolean;
}

function Sparkline({
  values,
  lineClassName,
}: {
  values: number[];
  lineClassName: string;
}) {
  const width = 160;
  const height = 48;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);

  const points = values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-12 w-full">
      <polyline
        points={points}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={lineClassName}
      />
    </svg>
  );
}

export function PriceTrendGrid({
  prices,
  variant = "light",
  compact = false,
}: PriceTrendGridProps) {
  const trends = getPriceTrends(prices);
  const textMuted =
    variant === "dark" ? "text-white/58" : "text-[var(--color-muted)]";
  const panelClass =
    variant === "dark"
      ? "border-white/10 bg-white/6"
      : "border-[var(--color-line)] bg-white/84";

  return (
    <div
      className={cn(
        "grid gap-4",
        compact ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {prices.map((price) => {
        const series = trends.find((item) => item.category === price.category);

        if (!series) {
          return null;
        }

        const summary = getTrendSummary(series);
        const tone =
          summary.direction === "up"
            ? "text-emerald-500"
            : summary.direction === "down"
              ? "text-rose-500"
              : variant === "dark"
                ? "text-white"
                : "text-[var(--color-ink)]";

        return (
          <div
            key={price.id}
            className={cn(
              "rounded-[1.7rem] border p-5 transition",
              panelClass,
              variant === "dark" ? "backdrop-blur-xl" : "",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={cn("text-sm", textMuted)}>
                  {getPriceLineLabel(price.category)}
                </p>
                <p
                  className={cn(
                    "mt-2 font-semibold",
                    variant === "dark"
                      ? "text-2xl text-white"
                      : "text-2xl text-[var(--color-ink)]",
                  )}
                >
                  {formatCurrencyKRW(price.value)}
                </p>
              </div>
              <div className="text-right">
                <p className={cn("text-xs tracking-[0.2em]", textMuted)}>최근 7일</p>
                <p className={cn("mt-2 text-sm font-semibold", tone)}>
                  {summary.delta > 0 ? "▲" : summary.delta < 0 ? "▼" : "•"}{" "}
                  {Math.abs(summary.percent).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Sparkline
                values={series.points.map((point) => point.value)}
                lineClassName={
                  summary.direction === "up"
                    ? "stroke-emerald-500"
                    : summary.direction === "down"
                      ? "stroke-rose-500"
                      : variant === "dark"
                        ? "stroke-white"
                        : "stroke-[var(--color-ink)]"
                }
              />
            </div>

            <div className={cn("mt-3 flex items-center justify-between text-xs", textMuted)}>
              <span>저점 {formatCurrencyKRW(summary.min)}</span>
              <span>고점 {formatCurrencyKRW(summary.max)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
