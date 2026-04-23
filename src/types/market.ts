export type MarketMetal = "gold" | "silver" | "platinum" | "palladium";
export type MarketProvider = "metals-dev" | "gold-api" | "mock";
export type MarketStatus = "live" | "fallback";
export type MarketSourceTier = "free" | "premium" | "fallback";
export type UpgradeReadyProvider = "metals-dev" | "premium-fx" | "news-api";

export interface MarketCapabilities {
  bidAsk: boolean;
  change: boolean;
  history: boolean;
  directKrw: boolean;
}

export interface MarketSpot {
  metal: MarketMetal;
  label: string;
  symbol: string;
  currency: "USD";
  unit: "T.oz";
  price: number;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  updatedAt: string;
  source: MarketProvider;
}

export interface DomesticMarketPrice {
  metal: MarketMetal;
  label: string;
  krwPerDon: number;
  krwPerGram: number;
  changePercent: number;
  updatedAt: string;
  source: MarketProvider;
}

export interface TradingBenchmark {
  label: string;
  unit: string;
  value: number;
  note: string;
  updatedAt: string;
  source: MarketProvider;
}

export interface MarketBriefItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  tone: "watch" | "steady" | "guide";
}

export interface MarketHeadlineItem {
  id: string;
  category: "domestic" | "global";
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary?: string;
}

export interface MarketDashboardData {
  spots: MarketSpot[];
  domesticPrices: DomesticMarketPrice[];
  benchmarks: TradingBenchmark[];
  marketBriefs: MarketBriefItem[];
  externalHeadlines: MarketHeadlineItem[];
  updatedAt: string;
  source: MarketProvider;
  sourceName: string;
  sourceTier: MarketSourceTier;
  status: MarketStatus;
  providerLabel: string;
  displayModeLabel: string;
  upgradeReadyProvider?: UpgradeReadyProvider;
  referenceNote: string;
  capabilities: MarketCapabilities;
  isStale: boolean;
  staleMinutes: number;
  headlineSource: "google-news-rss" | "seed";
}
