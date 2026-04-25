import type {
  DomesticMarketPrice,
  MarketDashboardData,
  MarketBriefItem,
  MarketHeadlineItem,
  MarketMetal,
  MarketSpot,
} from "@/types/market";

const updatedAt = "2026-04-22T10:45:00+09:00";
const krwRate = 1477.65;

const labels: Record<MarketMetal, { label: string; symbol: string }> = {
  gold: { label: "국제 금시세", symbol: "Gold" },
  silver: { label: "국제 은시세", symbol: "Silver" },
  platinum: { label: "국제 백금시세", symbol: "Platinum" },
  palladium: { label: "국제 팔라듐시세", symbol: "Palladium" },
};

export const mockMarketBriefs: MarketBriefItem[] = [
  {
    id: "brief-1",
    title: "당일 고시 시세는 매장 기준과 자동 참고 시세를 함께 비교해 안내합니다.",
    summary:
      "상단 시세표는 한국센터금거래소가 직접 고시한 회사 시세이며, 자동 시장 데이터는 참고용 흐름 확인에 사용됩니다.",
    publishedAt: "2026-04-22T09:30:00+09:00",
    tone: "guide",
  },
  {
    id: "brief-2",
    title: "국제 시세와 환율은 자동 반영되지만 실제 거래 금액은 현장 확인 후 확정됩니다.",
    summary:
      "국내 환산 시세와 실시간 참고 시세는 시장 흐름을 읽기 위한 자료이며, 18K·14K·백금·은 매입가는 순도와 상태 확인 결과를 반영합니다.",
    publishedAt: "2026-04-22T09:20:00+09:00",
    tone: "watch",
  },
  {
    id: "brief-3",
    title: "방문 전 전화 문의 시 상담 가능 시간과 준비 사항을 먼저 안내해 드립니다.",
    summary:
      "고중량 거래, 상속·법인 정리, 골드바·실버바 매입 문의는 방문 전 먼저 연락 주시면 처리 가능 범위를 먼저 확인해 드립니다.",
    publishedAt: "2026-04-22T09:00:00+09:00",
    tone: "steady",
  },
];

export const mockMarketHeadlines: MarketHeadlineItem[] = [
  {
    id: "headline-domestic-1",
    category: "domestic",
    title: "국내 금 거래 수요가 환율과 안전자산 선호 흐름 속에 등락하고 있습니다",
    source: "연합뉴스",
    url: "https://www.yna.co.kr/",
    publishedAt: "2026-04-22T08:40:00+09:00",
  },
  {
    id: "headline-domestic-2",
    category: "domestic",
    title: "달러 환율 변동이 국내 금 시세 체감 가격에 영향을 주고 있습니다",
    source: "매일경제",
    url: "https://www.mk.co.kr/",
    publishedAt: "2026-04-22T07:55:00+09:00",
  },
  {
    id: "headline-domestic-3",
    category: "domestic",
    title: "귀금속 매입 상담은 순도·중량·부속 확인 후 최종 금액이 확정됩니다",
    source: "한국센터금거래소 브리핑",
    url: "/announcements",
    publishedAt: "2026-04-22T07:20:00+09:00",
  },
  {
    id: "headline-global-1",
    category: "global",
    title: "Gold prices stay sensitive to rate expectations and dollar moves",
    source: "Reuters",
    url: "https://www.reuters.com/markets/commodities/",
    publishedAt: "2026-04-22T08:15:00+09:00",
  },
  {
    id: "headline-global-2",
    category: "global",
    title: "Precious metals markets remain focused on inflation and safe-haven demand",
    source: "CNBC",
    url: "https://www.cnbc.com/commodities/",
    publishedAt: "2026-04-22T06:45:00+09:00",
  },
  {
    id: "headline-global-3",
    category: "global",
    title: "Silver and platinum flows continue to follow industrial demand outlooks",
    source: "Kitco",
    url: "https://www.kitco.com/news",
    publishedAt: "2026-04-22T05:50:00+09:00",
  },
];

const spotSeeds: Array<
  Pick<MarketSpot, "metal" | "price" | "bid" | "ask" | "change" | "changePercent">
> = [
  { metal: "gold", price: 4748.93, bid: 4748.93, ask: 4752.53, change: -36.55, changePercent: -0.77 },
  { metal: "silver", price: 77.7, bid: 77.7, ask: 77.85, change: -1.12, changePercent: -1.44 },
  { metal: "platinum", price: 2068.88, bid: 2068.88, ask: 2078.38, change: -3.38, changePercent: -0.16 },
  { metal: "palladium", price: 1563.35, bid: 1563.35, ask: 1569.5, change: 5.6, changePercent: 0.36 },
];

const mockSpots: MarketSpot[] = spotSeeds.map((spot) => ({
  ...spot,
  label: labels[spot.metal].label,
  symbol: labels[spot.metal].symbol,
  currency: "USD",
  unit: "T.oz",
  updatedAt,
  source: "mock",
}));

const domesticSeeds: Array<
  Pick<DomesticMarketPrice, "metal" | "label" | "krwPerDon" | "krwPerGram" | "changePercent">
> = [
  { metal: "gold", label: "국내 금시세", krwPerDon: 987000, krwPerGram: 263200, changePercent: -0.2 },
  { metal: "silver", label: "국내 은시세", krwPerDon: 15670, krwPerGram: 4179, changePercent: -1.4 },
  { metal: "platinum", label: "국내 백금시세", krwPerDon: 425000, krwPerGram: 113333, changePercent: -0.47 },
];

const mockDomesticPrices: DomesticMarketPrice[] = domesticSeeds.map((price) => ({
  ...price,
  updatedAt,
  source: "mock",
}));

export const mockMarketData: MarketDashboardData = {
  updatedAt,
  source: "mock",
  sourceName: "운영형 fallback",
  sourceTier: "fallback",
  status: "fallback",
  providerLabel: "운영형 fallback 데이터",
  displayModeLabel: "운영형 fallback",
  upgradeReadyProvider: "metals-dev",
  referenceNote:
    "자동 참고 데이터 연결이 없을 때 표시되는 운영형 fallback입니다. 실제 거래가는 상단 회사 고시 시세와 현장 확인 결과를 기준으로 안내합니다.",
  capabilities: {
    bidAsk: true,
    change: true,
    history: true,
    directKrw: false,
  },
  isStale: false,
  staleMinutes: 0,
  headlineSource: "seed",
  krwRate,
  spots: mockSpots,
  domesticPrices: mockDomesticPrices,
  benchmarks: [
    {
      label: "순금 1돈 자동 환산 참고가",
      unit: "3.75g",
      value: 987000,
      note: "국제 금 시세와 환율을 반영한 참고 기준",
      updatedAt,
      source: "mock",
    },
    {
      label: "골드바 10g 자동 환산 참고가",
      unit: "10g",
      value: 2632000,
      note: "실제 판매가는 중량, 브랜드, 공임 확인 후 안내",
      updatedAt,
      source: "mock",
    },
  ],
  marketBriefs: mockMarketBriefs,
  externalHeadlines: mockMarketHeadlines,
};
