import { mockPriceTrends } from "@/mock/prices";
import type { PriceCategory, PriceRecord, PriceTrendSeries } from "@/types/price";

const fallbackOffsets: Record<PriceCategory, number[]> = {
  gold_24k_sell: [-0.020, -0.014, -0.010, -0.006, -0.009, -0.003, 0],
  gold_24k_buy: [-0.016, -0.014, -0.011, -0.008, -0.005, -0.002, 0],
  gold_18k_buy: [-0.021, -0.017, -0.013, -0.010, -0.007, -0.004, 0],
  gold_14k_buy: [-0.024, -0.020, -0.015, -0.012, -0.009, -0.005, 0],
  platinum_sell: [-0.026, -0.021, -0.016, -0.011, -0.006, -0.003, 0],
  platinum_buy: [-0.030, -0.022, -0.017, -0.013, -0.010, -0.006, 0],
  silver_sell: [-0.060, -0.048, -0.036, -0.024, -0.014, -0.008, 0],
  silver_buy: [-0.090, -0.070, -0.055, -0.046, -0.029, -0.012, 0],
};

const fallbackDates = [
  "2026-04-16",
  "2026-04-17",
  "2026-04-18",
  "2026-04-19",
  "2026-04-20",
  "2026-04-21",
  "2026-04-22",
];

export function getPriceTrends(prices: PriceRecord[]): PriceTrendSeries[] {
  return prices.map((price) => {
    const existing = mockPriceTrends.find((trend) => trend.category === price.category);

    if (existing) {
      const lastValue = existing.points.at(-1)?.value;

      if (!lastValue || lastValue === price.value) {
        return existing;
      }

      const ratio = price.value / lastValue;
      return {
        category: existing.category,
        points: existing.points.map((point) => ({
          date: point.date,
          value: Math.round(point.value * ratio),
        })),
      };
    }

    const offsets = fallbackOffsets[price.category];
    return {
      category: price.category,
      points: fallbackDates.map((date, index) => ({
        date,
        value: Math.round(price.value * (1 + offsets[index])),
      })),
    };
  });
}

export function getTrendSummary(series: PriceTrendSeries) {
  const first = series.points[0]?.value ?? 0;
  const last = series.points.at(-1)?.value ?? 0;
  const delta = last - first;
  const percent = first ? (delta / first) * 100 : 0;

  return {
    delta,
    percent,
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
    min: Math.min(...series.points.map((point) => point.value)),
    max: Math.max(...series.points.map((point) => point.value)),
  };
}
