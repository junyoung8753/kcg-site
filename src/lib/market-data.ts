import { mockMarketData } from "@/mock/market";
import type {
  BlockedMarketProvider,
  DomesticMarketPrice,
  MarketCapabilities,
  MarketDashboardData,
  MarketBriefItem,
  MarketHeadlineItem,
  MarketMetal,
  MarketProvider,
  MarketSourceTier,
  MarketSpot,
  TradingBenchmark,
  UpgradeReadyProvider,
} from "@/types/market";

const metals: MarketMetal[] = ["gold", "silver", "platinum", "palladium"];
const TROY_OUNCE_GRAMS = 31.1034768;
const DON_GRAMS = 3.75;
const STALE_AFTER_MINUTES = 30;
const KRX_BLOCKED_PROVIDER_REASON =
  "KRX Open API/Koscom 데이터는 인증키, API 활용 승인, 공개·상업 표시 범위, 출처 문구, 제3자 제공 가능 여부가 확인되기 전에는 KCG production 참고 시세로 사용하지 않습니다.";

const metalLabels: Record<MarketMetal, { label: string; symbol: string; goldApiSymbol: string }> = {
  gold: { label: "국제 금시세", symbol: "Gold", goldApiSymbol: "XAU" },
  silver: { label: "국제 은시세", symbol: "Silver", goldApiSymbol: "XAG" },
  platinum: { label: "국제 백금시세", symbol: "Platinum", goldApiSymbol: "XPT" },
  palladium: { label: "국제 팔라듐시세", symbol: "Palladium", goldApiSymbol: "XPD" },
};

const providerCapabilities: Record<MarketProvider, MarketCapabilities> = {
  "metals-dev": {
    bidAsk: true,
    change: true,
    history: true,
    directKrw: false,
  },
  "gold-api": {
    bidAsk: false,
    change: false,
    history: false,
    directKrw: true,
  },
  mock: {
    bidAsk: true,
    change: true,
    history: true,
    directKrw: false,
  },
};

interface SpotResponse {
  status: "success" | "failure";
  timestamp?: string;
  currency?: string;
  unit?: string;
  metal?: MarketMetal;
  rate?: {
    price?: number;
    ask?: number;
    bid?: number;
    change?: number;
    change_percent?: number;
  };
}

interface CurrencyResponse {
  status: "success" | "failure";
  currencies?: Record<string, number>;
}

interface GoldApiPriceResponse {
  currency: string;
  currencySymbol: string;
  exchangeRate: number;
  name: string;
  price: number;
  symbol: string;
  updatedAt: string;
  updatedAtReadable: string;
}

type HeadlineCategory = "domestic" | "global";

function revalidateSeconds() {
  return Number(process.env.MARKET_DATA_REVALIDATE_SECONDS || "60");
}

function marketProviderPreference() {
  return (process.env.MARKET_DATA_PROVIDER || "auto").toLowerCase();
}

function isBlockedKrxProviderPreference(provider: string) {
  return ["krx", "krx-open-api", "krx-openapi", "koscom"].includes(provider);
}

function buildFreshnessMeta(updatedAt: string) {
  const updated = new Date(updatedAt);
  const staleMinutes = Math.max(
    0,
    Math.floor((Date.now() - updated.getTime()) / 1000 / 60),
  );

  return {
    isStale: staleMinutes > STALE_AFTER_MINUTES,
    staleMinutes,
  };
}

function buildDisplayModeLabel(provider: MarketProvider, isStale: boolean) {
  const providerLabel =
    provider === "metals-dev"
      ? "프리미엄 실시간 참고"
      : provider === "gold-api"
        ? "무료 실시간 참고"
        : "운영형 fallback";

  return isStale ? `${providerLabel} · 지연` : providerLabel;
}

function buildSourceMeta(provider: MarketProvider): {
  sourceName: string;
  sourceUrl: string;
  sourceTermsUrl?: string;
  sourceAttribution: string;
  sourceTier: MarketSourceTier;
  upgradeReadyProvider?: UpgradeReadyProvider;
} {
  if (provider === "metals-dev") {
    return {
      sourceName: "Metals.dev",
      sourceUrl: "https://www.metals.dev/docs",
      sourceTermsUrl: "https://metals.dev/terms",
      sourceAttribution:
        "출처: Metals.Dev. 자동 참고 시세이며 회사 고시 시세와 실제 거래 금액은 별도입니다.",
      sourceTier: "premium",
      upgradeReadyProvider: "premium-fx",
    };
  }

  if (provider === "gold-api") {
    return {
      sourceName: "Gold API",
      sourceUrl: "https://gold-api.com/docs",
      sourceTermsUrl: "https://gold-api.com/terms",
      sourceAttribution:
        "출처: Gold API. 무료 현재가 기반 자동 참고 시세이며 회사 고시 시세와 실제 거래 금액은 별도입니다.",
      sourceTier: "free",
      upgradeReadyProvider: "metals-dev",
    };
  }

  return {
    sourceName: "운영형 fallback",
    sourceUrl: "/prices",
    sourceAttribution:
      "출처: KCG 운영형 fallback. 외부 데이터 요청 실패 시 최근 확인된 참고 예시로만 표시됩니다.",
    sourceTier: "fallback",
    upgradeReadyProvider: "metals-dev",
  };
}

function buildHeadlineSourceMeta(source: "google-news-rss" | "seed"): {
  headlineSourceName: string;
  headlineSourceUrl?: string;
  headlineAttribution: string;
} {
  if (source === "google-news-rss") {
    return {
      headlineSourceName: "Google News RSS",
      headlineSourceUrl: "https://news.google.com",
      headlineAttribution:
        "기사 제목·출처·날짜만 링크로 제공하며, 본문·이미지는 재게시하지 않습니다.",
    };
  }

  return {
    headlineSourceName: "운영형 fallback",
    headlineAttribution:
      "fallback 헤드라인은 운영 확인용이며, 외부 기사 본문·이미지는 재게시하지 않습니다.",
  };
}

async function fetchJson<T>(url: string, headers?: HeadersInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(headers || {}),
    },
    next: { revalidate: revalidateSeconds() },
  });

  if (!response.ok) {
    throw new Error(`Market data request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      "User-Agent": "Mozilla/5.0",
    },
    next: { revalidate: revalidateSeconds() },
  });

  if (!response.ok) {
    throw new Error(`Headline request failed: ${response.status}`);
  }

  return response.text();
}

function buildDomesticLabel(metal: MarketMetal) {
  switch (metal) {
    case "gold":
      return "국내 금시세";
    case "silver":
      return "국내 은시세";
    case "platinum":
      return "국내 백금시세";
    case "palladium":
      return "국내 팔라듐시세";
  }
}

function buildDomesticPrices(spots: MarketSpot[], krwRate: number): DomesticMarketPrice[] {
  return spots
    .filter((spot) => spot.metal !== "palladium")
    .map((spot) => {
      const krwPerGram = Math.round((spot.price * krwRate) / TROY_OUNCE_GRAMS);
      return {
        metal: spot.metal,
        label: buildDomesticLabel(spot.metal),
        krwPerDon: Math.round(krwPerGram * DON_GRAMS),
        krwPerGram,
        changePercent: spot.changePercent,
        updatedAt: spot.updatedAt,
        source: spot.source,
      };
    });
}

function buildDomesticPricesFromGoldApi(
  items: Array<{ metal: MarketMetal; krwPrice: GoldApiPriceResponse; source: MarketProvider }>,
): DomesticMarketPrice[] {
  return items
    .filter((item) => item.metal !== "palladium")
    .map((item) => {
      const krwPerGram = Math.round(item.krwPrice.price / TROY_OUNCE_GRAMS);
      return {
        metal: item.metal,
        label: buildDomesticLabel(item.metal),
        krwPerDon: Math.round(krwPerGram * DON_GRAMS),
        krwPerGram,
        changePercent: 0,
        updatedAt: item.krwPrice.updatedAt,
        source: item.source,
      };
    });
}

function buildBenchmarks(
  domesticPrices: DomesticMarketPrice[],
  provider: MarketProvider,
): TradingBenchmark[] {
  const gold = domesticPrices.find((item) => item.metal === "gold");
  if (!gold) return mockMarketData.benchmarks;

  const noteByProvider =
    provider === "gold-api"
      ? "Gold API 실시간 현재가를 원화 기준으로 환산한 참고 값"
      : "국제 금 시세와 환율을 반영한 자동 환산 참고 기준";

  return [
    {
      label: "순금 3.75g 참고가",
      unit: "3.75g",
      value: gold.krwPerDon,
      note: noteByProvider,
      updatedAt: gold.updatedAt,
      source: provider,
    },
    {
      label: "골드바 10g 참고가",
      unit: "10g",
      value: Math.round(gold.krwPerGram * 10),
      note: "실제 판매가는 브랜드, 공임, 보증 상태 확인 후 안내",
      updatedAt: gold.updatedAt,
      source: provider,
    },
  ];
}

function decodeEntities(text: string) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function stripTags(text: string) {
  return decodeEntities(text).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function readXmlTag(block: string, tag: string) {
  const cdataMatch = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i"));
  if (cdataMatch?.[1]) return cdataMatch[1].trim();
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.trim() || "";
}

function buildGoogleNewsSearchFeed(query: string, locale: string) {
  const [hl, country, language] =
    locale === "ko-KR" ? ["ko", "KR", "KR:ko"] : ["en-US", "US", "US:en"];
  const params = new URLSearchParams({
    q: query,
    hl,
    gl: country,
    ceid: language,
  });

  return `https://news.google.com/rss/search?${params.toString()}`;
}

function normalizeHeadlineTitle(title: string, source: string) {
  if (!title) return source;
  const normalized = stripTags(title);
  if (source && normalized.endsWith(` - ${source}`)) {
    return normalized.slice(0, -(` - ${source}`).length).trim();
  }
  return normalized;
}

function clipHeadline(text: string, maxLength = 68) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function parseHeadlineItems(xml: string, category: HeadlineCategory): MarketHeadlineItem[] {
  const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

  return matches.slice(0, 3).map((match, index) => {
    const block = match[1];
    const source = stripTags(readXmlTag(block, "source")) || "Google News";
    const title = normalizeHeadlineTitle(readXmlTag(block, "title"), source);
    const url = stripTags(readXmlTag(block, "link"));
    const published = new Date(stripTags(readXmlTag(block, "pubDate")));
    const publishedAt = Number.isNaN(published.getTime())
      ? new Date().toISOString()
      : published.toISOString();

    return {
      id: `${category}-${index}-${publishedAt}`,
      category,
      title: clipHeadline(title),
      source,
      url,
      publishedAt,
    };
  });
}

function normalizeHeadlineItems(items: MarketHeadlineItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.category}:${item.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getExternalHeadlines(): Promise<{
  items: MarketHeadlineItem[];
  source: "google-news-rss" | "seed";
}> {
  try {
    const [domesticXml, globalXml] = await Promise.all([
      fetchText(buildGoogleNewsSearchFeed("금값 OR 국제금시세 OR 귀금속", "ko-KR")),
      fetchText(buildGoogleNewsSearchFeed("gold price OR precious metals OR silver price", "en-US")),
    ]);

    const items = normalizeHeadlineItems([
      ...parseHeadlineItems(domesticXml, "domestic"),
      ...parseHeadlineItems(globalXml, "global"),
    ]);

    const domesticItems = items.filter((item) => item.category === "domestic").slice(0, 3);
    const globalItems = items.filter((item) => item.category === "global").slice(0, 3);
    const mergedItems = [...domesticItems, ...globalItems];

    if (mergedItems.length >= 4) {
      return { items: mergedItems, source: "google-news-rss" };
    }
  } catch {
    // Fall through to seed headlines.
  }

  return {
    items: mockMarketData.externalHeadlines,
    source: "seed",
  };
}

function formatSignedPercent(value: number) {
  const direction = value > 0 ? "상승" : value < 0 ? "하락" : "보합";
  return `${direction} ${Math.abs(value).toFixed(2)}%`;
}

function buildMarketBriefs(
  spots: MarketSpot[],
  domesticPrices: DomesticMarketPrice[],
  updatedAt: string,
  provider: MarketProvider,
  capabilities: MarketCapabilities,
): MarketBriefItem[] {
  const goldSpot = spots.find((item) => item.metal === "gold");
  const goldDomestic = domesticPrices.find((item) => item.metal === "gold");
  const silverSpot = spots.find((item) => item.metal === "silver");

  if (!goldSpot || !goldDomestic) {
    return mockMarketData.marketBriefs;
  }

  const providerGuide =
    provider === "gold-api"
      ? "무료 실시간 국제 현재가 기준으로 표시되며, bid/ask와 전일 대비는 제공되지 않습니다."
      : "실시간 국제 시세, bid/ask, 전일 대비 흐름을 함께 참고할 수 있습니다.";

  const movementText =
    capabilities.change && silverSpot
      ? `은 시세는 현재 ${formatSignedPercent(silverSpot.changePercent)} 흐름입니다.`
      : "무료 실시간 모드에서는 현재가 중심으로만 시장 흐름을 참고하실 수 있습니다.";

  return [
    {
      id: "market-brief-1",
      title: "오늘의 고시 시세와 자동 참고 시세를 함께 확인하실 수 있습니다.",
      summary: `국제 금 시세는 ${goldSpot.price.toFixed(
        2,
      )} USD/T.oz 기준이며, 원화 거래 금액은 회사 고시 시세표와 현장 확인을 우선합니다.`,
      publishedAt: updatedAt,
      tone: capabilities.change && goldSpot.changePercent > 0 ? "watch" : "steady",
    },
    {
      id: "market-brief-2",
      title: "자동 시장 데이터는 참고용이며, 실제 거래 금액은 회사 고시 시세와 현장 확인 후 확정됩니다.",
      summary: `${providerGuide} 18K·14K·백금·은 매입가는 순도, 중량, 부속 상태 확인 결과를 반영합니다.`,
      publishedAt: updatedAt,
      tone: "guide",
    },
    {
      id: "market-brief-3",
      title: "거래 전 문의 시 상담 가능 시간과 준비 사항을 먼저 안내해 드립니다.",
      summary: `당일 고시 기준과 거래 준비 사항을 먼저 안내해 드리며, ${movementText}`,
      publishedAt: updatedAt,
      tone: "guide",
    },
  ];
}

function buildFallbackDashboard(headlines: {
  items: MarketHeadlineItem[];
  source: "google-news-rss" | "seed";
}, blockedProvider?: {
  provider: BlockedMarketProvider;
  reason: string;
}): MarketDashboardData {
  const freshness = buildFreshnessMeta(mockMarketData.updatedAt);
  const sourceMeta = buildSourceMeta("mock");
  const headlineMeta = buildHeadlineSourceMeta(headlines.source);
  return {
    ...mockMarketData,
    externalHeadlines: headlines.items,
    headlineSource: headlines.source,
    sourceName: sourceMeta.sourceName,
    sourceUrl: sourceMeta.sourceUrl,
    sourceTermsUrl: sourceMeta.sourceTermsUrl,
    sourceAttribution: sourceMeta.sourceAttribution,
    sourceTier: sourceMeta.sourceTier,
    displayModeLabel: buildDisplayModeLabel("mock", freshness.isStale),
    upgradeReadyProvider: sourceMeta.upgradeReadyProvider,
    providerLabel: blockedProvider ? "KRX 승인 전 fallback" : mockMarketData.providerLabel,
    referenceNote: blockedProvider?.reason ?? mockMarketData.referenceNote,
    blockedProvider: blockedProvider?.provider,
    blockedProviderReason: blockedProvider?.reason,
    headlineSourceName: headlineMeta.headlineSourceName,
    headlineSourceUrl: headlineMeta.headlineSourceUrl,
    headlineAttribution: headlineMeta.headlineAttribution,
    isStale: freshness.isStale,
    staleMinutes: freshness.staleMinutes,
    marketBriefs: buildMarketBriefs(
      mockMarketData.spots,
      mockMarketData.domesticPrices,
      mockMarketData.updatedAt,
      "mock",
      providerCapabilities.mock,
    ),
  };
}

async function getMetalsDevDashboard(
  apiKey: string,
  headlines: {
    items: MarketHeadlineItem[];
    source: "google-news-rss" | "seed";
  },
): Promise<MarketDashboardData> {
  const spotResults = await Promise.all(
    metals.map(async (metal) => {
      const params = new URLSearchParams({
        api_key: apiKey,
        metal,
        currency: "USD",
      });

      const result = await fetchJson<SpotResponse>(
        `https://api.metals.dev/v1/metal/spot?${params.toString()}`,
      );

      if (result.status !== "success" || !result.rate) {
        throw new Error(`Invalid spot response for ${metal}`);
      }

      const label = metalLabels[metal];
      return {
        metal,
        label: label.label,
        symbol: label.symbol,
        currency: "USD",
        unit: "T.oz",
        price: Number(result.rate.price || 0),
        bid: Number(result.rate.bid || result.rate.price || 0),
        ask: Number(result.rate.ask || result.rate.price || 0),
        change: Number(result.rate.change || 0),
        changePercent: Number(result.rate.change_percent || 0),
        updatedAt: result.timestamp || new Date().toISOString(),
        source: "metals-dev",
      } satisfies MarketSpot;
    }),
  );

  const currencyParams = new URLSearchParams({ api_key: apiKey, base: "USD" });
  const currencyResult = await fetchJson<CurrencyResponse>(
    `https://api.metals.dev/v1/currencies?${currencyParams.toString()}`,
  );
  const krwRate = currencyResult.currencies?.KRW;
  if (!krwRate) throw new Error("KRW currency rate missing");

  const domesticPrices = buildDomesticPrices(spotResults, krwRate);
  const updatedAt = spotResults[0]?.updatedAt || new Date().toISOString();
  const freshness = buildFreshnessMeta(updatedAt);
  const sourceMeta = buildSourceMeta("metals-dev");
  const headlineMeta = buildHeadlineSourceMeta(headlines.source);

  return {
    spots: spotResults,
    domesticPrices,
    krwRate,
    benchmarks: buildBenchmarks(domesticPrices, "metals-dev"),
    marketBriefs: buildMarketBriefs(
      spotResults,
      domesticPrices,
      updatedAt,
      "metals-dev",
      providerCapabilities["metals-dev"],
    ),
    externalHeadlines: headlines.items,
    updatedAt,
    source: "metals-dev",
    sourceName: sourceMeta.sourceName,
    sourceUrl: sourceMeta.sourceUrl,
    sourceTermsUrl: sourceMeta.sourceTermsUrl,
    sourceAttribution: sourceMeta.sourceAttribution,
    sourceTier: sourceMeta.sourceTier,
    status: "live",
    providerLabel: "Metals.dev 자동 연동",
    displayModeLabel: buildDisplayModeLabel("metals-dev", freshness.isStale),
    upgradeReadyProvider: sourceMeta.upgradeReadyProvider,
    referenceNote:
      "자동 참고 시세는 Metals.dev 데이터를 사용합니다. 회사 고시 시세와 실제 거래 금액은 별도이며, 현장 확인 후 최종 안내됩니다.",
    capabilities: providerCapabilities["metals-dev"],
    isStale: freshness.isStale,
    staleMinutes: freshness.staleMinutes,
    headlineSource: headlines.source,
    headlineSourceName: headlineMeta.headlineSourceName,
    headlineSourceUrl: headlineMeta.headlineSourceUrl,
    headlineAttribution: headlineMeta.headlineAttribution,
  };
}

async function getGoldApiDashboard(headlines: {
  items: MarketHeadlineItem[];
  source: "google-news-rss" | "seed";
}): Promise<MarketDashboardData> {
  const responses = await Promise.all(
    metals.map(async (metal) => {
      const symbol = metalLabels[metal].goldApiSymbol;
      const [usdPrice, krwPrice] = await Promise.all([
        fetchJson<GoldApiPriceResponse>(`https://api.gold-api.com/price/${symbol}`),
        fetchJson<GoldApiPriceResponse>(`https://api.gold-api.com/price/${symbol}/KRW`),
      ]);

      return {
        metal,
        usdPrice,
        krwPrice,
      };
    }),
  );

  const spots: MarketSpot[] = responses.map(({ metal, usdPrice }) => ({
    metal,
    label: metalLabels[metal].label,
    symbol: metalLabels[metal].symbol,
    currency: "USD",
    unit: "T.oz",
    price: usdPrice.price,
    bid: usdPrice.price,
    ask: usdPrice.price,
    change: 0,
    changePercent: 0,
    updatedAt: usdPrice.updatedAt,
    source: "gold-api",
  }));

  const domesticPrices = buildDomesticPricesFromGoldApi(
    responses.map((item) => ({
      metal: item.metal,
      krwPrice: item.krwPrice,
      source: "gold-api",
    })),
  );

  const krwRate = Number(responses[0]?.krwPrice.exchangeRate || 0);
  const updatedAt = responses[0]?.usdPrice.updatedAt || new Date().toISOString();
  const freshness = buildFreshnessMeta(updatedAt);
  const sourceMeta = buildSourceMeta("gold-api");
  const headlineMeta = buildHeadlineSourceMeta(headlines.source);

  return {
    spots,
    domesticPrices,
    krwRate,
    benchmarks: buildBenchmarks(domesticPrices, "gold-api"),
    marketBriefs: buildMarketBriefs(
      spots,
      domesticPrices,
      updatedAt,
      "gold-api",
      providerCapabilities["gold-api"],
    ),
    externalHeadlines: headlines.items,
    updatedAt,
    source: "gold-api",
    sourceName: sourceMeta.sourceName,
    sourceUrl: sourceMeta.sourceUrl,
    sourceTermsUrl: sourceMeta.sourceTermsUrl,
    sourceAttribution: sourceMeta.sourceAttribution,
    sourceTier: sourceMeta.sourceTier,
    status: "live",
    providerLabel: "Gold API 무료 실시간",
    displayModeLabel: buildDisplayModeLabel("gold-api", freshness.isStale),
    upgradeReadyProvider: sourceMeta.upgradeReadyProvider,
    referenceNote:
      "자동 참고 시세는 Gold API 무료 현재가를 사용합니다. 무료 모드에서는 bid/ask, 전일 대비, 히스토리 차트가 제공되지 않아 현재가 중심으로만 안내합니다.",
    capabilities: providerCapabilities["gold-api"],
    isStale: freshness.isStale,
    staleMinutes: freshness.staleMinutes,
    headlineSource: headlines.source,
    headlineSourceName: headlineMeta.headlineSourceName,
    headlineSourceUrl: headlineMeta.headlineSourceUrl,
    headlineAttribution: headlineMeta.headlineAttribution,
  };
}

export async function getMarketDashboardData(
  providerOverride?: MarketProvider,
): Promise<MarketDashboardData> {
  const configuredProvider = providerOverride || marketProviderPreference();
  const apiKey = process.env.METALS_DEV_API_KEY;
  const headlines = await getExternalHeadlines();

  if (isBlockedKrxProviderPreference(configuredProvider)) {
    return buildFallbackDashboard(headlines, {
      provider: "krx",
      reason: KRX_BLOCKED_PROVIDER_REASON,
    });
  }

  if (configuredProvider === "mock") {
    return buildFallbackDashboard(headlines);
  }

  if ((configuredProvider === "auto" || configuredProvider === "metals-dev") && apiKey) {
    try {
      return await getMetalsDevDashboard(apiKey, headlines);
    } catch {
      if (configuredProvider === "metals-dev") {
        try {
          return await getGoldApiDashboard(headlines);
        } catch {
          return buildFallbackDashboard(headlines);
        }
      }
    }
  }

  if (configuredProvider === "auto" || configuredProvider === "gold-api" || configuredProvider === "metals-dev") {
    try {
      return await getGoldApiDashboard(headlines);
    } catch {
      return buildFallbackDashboard(headlines);
    }
  }

  return buildFallbackDashboard(headlines);
}
