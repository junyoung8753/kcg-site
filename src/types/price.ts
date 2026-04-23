export type PriceCategory =
  | "gold_24k_sell"
  | "gold_24k_buy"
  | "gold_18k_buy"
  | "gold_14k_buy"
  | "platinum_sell"
  | "platinum_buy"
  | "silver_sell"
  | "silver_buy";

export interface PriceRecord {
  id: string;
  category: PriceCategory;
  label: string;
  value: number;
  unit: string;
  announcedAt: string;
  note: string | null;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistoryEntry {
  id: string;
  priceId: string;
  category: PriceCategory;
  label: string;
  previousValue: number;
  newValue: number;
  changedAt: string;
  changedBy: string;
  note: string | null;
}

export interface UpdatePriceInput {
  id: string;
  value: number;
  note: string | null;
  isVisible: boolean;
  announcedAt: string;
  changedBy: string;
}

export interface PriceTrendPoint {
  date: string;
  value: number;
}

export interface PriceTrendSeries {
  category: PriceCategory;
  points: PriceTrendPoint[];
}

export type PriceSanityWarningKind =
  | "stale-announced-at"
  | "large-change"
  | "wide-spread";

export interface PriceSanityWarning {
  kind: PriceSanityWarningKind;
  level: "notice" | "warning";
  message: string;
}
