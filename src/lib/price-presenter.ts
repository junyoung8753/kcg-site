import type { PriceCategory } from "@/types/price";

export type PriceLineupRow = {
  id: string;
  title: string;
  subtitle: string;
  sellCategory?: PriceCategory;
  buyCategory?: PriceCategory;
  sellText?: string;
  buyNote?: string;
};

export const priceLineupRows: PriceLineupRow[] = [
  {
    id: "gold-24k",
    title: "순금시세",
    subtitle: "24K · 3.75g 기준",
    sellCategory: "gold_24k_sell",
    buyCategory: "gold_24k_buy",
  },
  {
    id: "gold-18k",
    title: "18K 금시세",
    subtitle: "18K · 3.75g 기준",
    sellText: "제품시세적용",
    buyCategory: "gold_18k_buy",
  },
  {
    id: "gold-14k",
    title: "14K 금시세",
    subtitle: "14K · 3.75g 기준",
    sellText: "제품시세적용",
    buyCategory: "gold_14k_buy",
  },
  {
    id: "platinum",
    title: "백금시세",
    subtitle: "백금 · 3.75g 기준",
    sellCategory: "platinum_sell",
    buyCategory: "platinum_buy",
    buyNote: "(자사백금바기준)",
  },
  {
    id: "silver",
    title: "은시세",
    subtitle: "은 · 3.75g 기준",
    sellCategory: "silver_sell",
    buyCategory: "silver_buy",
    buyNote: "(자사실버바기준)",
  },
];

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
