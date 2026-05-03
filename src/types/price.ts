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

export type PriceAutoSource = "gold-api" | "metals-dev";
export type PriceAutoMode = "manual_review" | "auto_publish";
export type PriceAutoSuggestionStatus = "draft" | "applied" | "rejected" | "expired";

export interface PriceAutoSettings {
  id: "default";
  isEnabled: boolean;
  source: PriceAutoSource;
  intervalHours: 1 | 2;
  checkIntervalMinutes: 30 | 60 | 120;
  mode: PriceAutoMode;
  roundingUnit: number;
  goldSellPremiumRate: number;
  goldBuyDiscountRate: number;
  gold18kBuyRate: number;
  gold14kBuyRate: number;
  platinumSellPremiumRate: number;
  platinumBuyDiscountRate: number;
  silverSellPremiumRate: number;
  silverBuyDiscountRate: number;
  minApplyChangeWon: number;
  maxAutoPublishChangePercent: number;
  businessHoursOnly: boolean;
  lastCheckedAt: string | null;
  lastAutoAppliedAt: string | null;
  updatedBy: string;
  updatedAt: string;
  schemaReady: boolean;
}

export interface PriceAutoSettingsInput {
  isEnabled: boolean;
  source: PriceAutoSource;
  intervalHours: 1 | 2;
  checkIntervalMinutes: 30 | 60 | 120;
  mode: PriceAutoMode;
  roundingUnit: number;
  goldSellPremiumRate: number;
  goldBuyDiscountRate: number;
  gold18kBuyRate: number;
  gold14kBuyRate: number;
  platinumSellPremiumRate: number;
  platinumBuyDiscountRate: number;
  silverSellPremiumRate: number;
  silverBuyDiscountRate: number;
  minApplyChangeWon: number;
  maxAutoPublishChangePercent: number;
  businessHoursOnly: boolean;
  updatedBy: string;
}

export interface PriceAutoRunStateInput {
  lastCheckedAt?: string | null;
  lastAutoAppliedAt?: string | null;
}

export interface PriceAutoSuggestionItem {
  category: PriceCategory;
  label: string;
  currentValue: number;
  proposedValue: number;
  difference: number;
  changePercent: number;
  note: string;
  needsReview: boolean;
}

export interface PriceAutoSuggestion {
  id: string;
  status: PriceAutoSuggestionStatus;
  source: PriceAutoSource | "mock";
  providerLabel: string;
  sourceUpdatedAt: string;
  generatedAt: string;
  settingsSnapshot: PriceAutoSettings;
  items: PriceAutoSuggestionItem[];
  warnings: string[];
  appliedAt: string | null;
  appliedBy: string | null;
}

export interface PriceAutoSuggestionInput {
  source: PriceAutoSource | "mock";
  providerLabel: string;
  sourceUpdatedAt: string;
  settingsSnapshot: PriceAutoSettings;
  items: PriceAutoSuggestionItem[];
  warnings: string[];
}
