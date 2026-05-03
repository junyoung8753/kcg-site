import { getMarketDashboardData } from "@/lib/market-data";
import type { MarketDashboardData, MarketMetal } from "@/types/market";
import type {
  PriceAutoSettings,
  PriceAutoSuggestion,
  PriceAutoSuggestionInput,
  PriceAutoSuggestionItem,
  PriceCategory,
  PriceRecord,
} from "@/types/price";

const DEFAULT_ROUNDING_UNIT = 100;

export function getDefaultPriceAutoSettings(
  overrides?: Partial<PriceAutoSettings>,
): PriceAutoSettings {
  return {
    id: "default",
    isEnabled: false,
    source: "gold-api",
    intervalHours: 1,
    checkIntervalMinutes: 60,
    mode: "manual_review",
    roundingUnit: DEFAULT_ROUNDING_UNIT,
    goldSellPremiumRate: 0.135,
    goldBuyDiscountRate: 0.05,
    gold18kBuyRate: 0.735,
    gold14kBuyRate: 0.57,
    platinumSellPremiumRate: 0.1,
    platinumBuyDiscountRate: 0.1,
    silverSellPremiumRate: 0.08,
    silverBuyDiscountRate: 0.11,
    minApplyChangeWon: 500,
    maxAutoPublishChangePercent: 0.05,
    businessHoursOnly: true,
    lastCheckedAt: null,
    lastAutoAppliedAt: null,
    updatedBy: "관리자",
    updatedAt: new Date().toISOString(),
    schemaReady: false,
    ...overrides,
  };
}

function roundToUnit(value: number, unit: number) {
  const safeUnit = unit > 0 ? unit : DEFAULT_ROUNDING_UNIT;
  return Math.round(value / safeUnit) * safeUnit;
}

function getDomesticDon(data: MarketDashboardData, metal: MarketMetal) {
  return data.domesticPrices.find((item) => item.metal === metal)?.krwPerDon;
}

function buildItem(
  price: PriceRecord,
  rawValue: number,
  note: string,
  settings: PriceAutoSettings,
): PriceAutoSuggestionItem {
  const proposedValue = roundToUnit(rawValue, settings.roundingUnit);
  const difference = proposedValue - price.value;
  const changePercent = price.value > 0 ? difference / price.value : 0;

  return {
    category: price.category,
    label: price.label,
    currentValue: price.value,
    proposedValue,
    difference,
    changePercent,
    note,
    needsReview: Math.abs(changePercent) >= settings.maxAutoPublishChangePercent,
  };
}

function proposalByCategory(
  settings: PriceAutoSettings,
  data: MarketDashboardData,
): Partial<Record<PriceCategory, { value: number; note: string }>> {
  const gold = getDomesticDon(data, "gold");
  const platinum = getDomesticDon(data, "platinum");
  const silver = getDomesticDon(data, "silver");
  const result: Partial<Record<PriceCategory, { value: number; note: string }>> = {};

  if (gold) {
    const goldSell = gold * (1 + settings.goldSellPremiumRate);
    const goldBuy = gold * (1 - settings.goldBuyDiscountRate);
    result.gold_24k_sell = {
      value: goldSell,
      note: `국제 금 3.75g 환산값에 살 때 프리미엄 ${Math.round(settings.goldSellPremiumRate * 1000) / 10}% 적용`,
    };
    result.gold_24k_buy = {
      value: goldBuy,
      note: `국제 금 3.75g 환산값에 팔 때 할인폭 ${Math.round(settings.goldBuyDiscountRate * 1000) / 10}% 적용`,
    };
    result.gold_18k_buy = {
      value: goldBuy * settings.gold18kBuyRate,
      note: `순금 팔 때 기준에 18K 환산 계수 ${settings.gold18kBuyRate} 적용`,
    };
    result.gold_14k_buy = {
      value: goldBuy * settings.gold14kBuyRate,
      note: `순금 팔 때 기준에 14K 환산 계수 ${settings.gold14kBuyRate} 적용`,
    };
  }

  if (platinum) {
    result.platinum_sell = {
      value: platinum * (1 + settings.platinumSellPremiumRate),
      note: `국제 백금 3.75g 환산값에 살 때 프리미엄 ${Math.round(settings.platinumSellPremiumRate * 1000) / 10}% 적용`,
    };
    result.platinum_buy = {
      value: platinum * (1 - settings.platinumBuyDiscountRate),
      note: `국제 백금 3.75g 환산값에 팔 때 할인폭 ${Math.round(settings.platinumBuyDiscountRate * 1000) / 10}% 적용`,
    };
  }

  if (silver) {
    result.silver_sell = {
      value: silver * (1 + settings.silverSellPremiumRate),
      note: `국제 은 3.75g 환산값에 살 때 프리미엄 ${Math.round(settings.silverSellPremiumRate * 1000) / 10}% 적용`,
    };
    result.silver_buy = {
      value: silver * (1 - settings.silverBuyDiscountRate),
      note: `국제 은 3.75g 환산값에 팔 때 할인폭 ${Math.round(settings.silverBuyDiscountRate * 1000) / 10}% 적용`,
    };
  }

  return result;
}

export async function buildPriceAutoSuggestionInput(
  prices: PriceRecord[],
  settings: PriceAutoSettings,
): Promise<PriceAutoSuggestionInput> {
  const data = await getMarketDashboardData(settings.source);
  const proposals = proposalByCategory(settings, data);
  const warnings: string[] = [];

  if (data.source === "mock") {
    warnings.push("외부 시세 요청이 실패해 fallback 참고값으로 초안을 만들었습니다.");
  }

  if (data.source !== settings.source) {
    warnings.push(`${settings.source} 요청 대신 ${data.source} 데이터로 초안을 만들었습니다.`);
  }

  if (data.isStale) {
    warnings.push(`참고 데이터가 ${data.staleMinutes}분 전 값입니다. 적용 전 확인이 필요합니다.`);
  }

  const items = prices
    .map((price) => {
      const proposal = proposals[price.category];
      if (!proposal) return null;
      return buildItem(price, proposal.value, proposal.note, settings);
    })
    .filter((item): item is PriceAutoSuggestionItem => Boolean(item));

  if (items.length === 0) {
    warnings.push("자동입력 산식에 연결된 시세 항목이 없습니다.");
  }

  if (items.some((item) => item.needsReview)) {
    warnings.push("직전 고시가 대비 변동폭이 큰 항목이 있어 적용 전 확인이 필요합니다.");
  }

  return {
    source: data.source === "metals-dev" ? "metals-dev" : data.source === "gold-api" ? "gold-api" : "mock",
    providerLabel: data.providerLabel,
    sourceUpdatedAt: data.updatedAt,
    settingsSnapshot: settings,
    items,
    warnings,
  };
}

export function buildPriceUpdatesFromSuggestion(
  prices: PriceRecord[],
  suggestion: PriceAutoSuggestion,
  changedBy: string,
) {
  const priceByCategory = new Map(prices.map((price) => [price.category, price]));
  const announcedAt = new Date().toISOString();

  return suggestion.items
    .map((item) => {
      const price = priceByCategory.get(item.category);
      if (!price) return null;
      return {
        id: price.id,
        value: item.proposedValue,
        note: item.note,
        isVisible: price.isVisible,
        announcedAt,
        changedBy,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}
