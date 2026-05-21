import type { PriceAutoSettings } from "@/types/price";

export const DEFAULT_PRICE_ROUNDING_UNIT = 100;

export function roundPriceToUnit(value: number, unit = DEFAULT_PRICE_ROUNDING_UNIT) {
  const safeUnit = unit > 0 ? unit : DEFAULT_PRICE_ROUNDING_UNIT;
  return Math.round(value / safeUnit) * safeUnit;
}

export function calculateGoldPurityBuyPrices(
  gold24kBuyValue: number,
  settings: Pick<PriceAutoSettings, "gold18kBuyRate" | "gold14kBuyRate" | "roundingUnit">,
) {
  return {
    gold_18k_buy: roundPriceToUnit(gold24kBuyValue * settings.gold18kBuyRate, settings.roundingUnit),
    gold_14k_buy: roundPriceToUnit(gold24kBuyValue * settings.gold14kBuyRate, settings.roundingUnit),
  };
}
