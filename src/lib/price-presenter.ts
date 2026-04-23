import type { PriceCategory } from "@/types/price";

export function getPriceReferenceLabel(category: PriceCategory) {
  switch (category) {
    case "gold_24k_sell":
    case "gold_24k_buy":
      return "순금시세";
    case "gold_18k_buy":
      return "18K 금시세";
    case "gold_14k_buy":
      return "14K 금시세";
    case "platinum_sell":
    case "platinum_buy":
      return "백금시세";
    case "silver_sell":
    case "silver_buy":
      return "은시세";
    default:
      return "";
  }
}

export function getPriceTradeGuide(category: PriceCategory) {
  switch (category) {
    case "gold_24k_sell":
    case "platinum_sell":
    case "silver_sell":
      return "내가 살 때 (VAT 포함)";
    case "gold_24k_buy":
    case "platinum_buy":
    case "silver_buy":
      return "내가 팔 때";
    case "gold_18k_buy":
    case "gold_14k_buy":
      return "제품시세 적용";
    default:
      return "";
  }
}

export function getPriceLineLabel(category: PriceCategory) {
  return `${getPriceReferenceLabel(category)} ${getPriceTradeGuide(category)}`.trim();
}
