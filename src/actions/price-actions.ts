"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRepository } from "@/lib/data";
import {
  buildPriceUpdatesFromSuggestion,
} from "@/lib/price-auto";
import { runPriceAutoRefresh } from "@/lib/price-auto-runner";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { ensureNumber, ensureString, toBoolean } from "@/lib/utils";
import type {
  PriceAutoMode,
  PriceAutoSource,
  PriceCategory,
  PriceRecord,
  PriceSanityWarning,
  UpdatePriceInput,
} from "@/types/price";

const spreadRules: Array<{
  sellCategory: PriceCategory;
  buyCategory: PriceCategory;
  label: string;
  ratioThreshold: number;
}> = [
  {
    sellCategory: "gold_24k_sell",
    buyCategory: "gold_24k_buy",
    label: "순금시세",
    ratioThreshold: 0.25,
  },
  {
    sellCategory: "platinum_sell",
    buyCategory: "platinum_buy",
    label: "백금시세",
    ratioThreshold: 0.75,
  },
  {
    sellCategory: "silver_sell",
    buyCategory: "silver_buy",
    label: "은시세",
    ratioThreshold: 0.8,
  },
];

function buildPriceWarnings(currentPrices: PriceRecord[], payload: UpdatePriceInput[]): PriceSanityWarning[] {
  const warnings: PriceSanityWarning[] = [];
  const currentById = new Map(currentPrices.map((price) => [price.id, price] as const));
  const nextByCategory = new Map(
    payload
      .map((item) => {
        const current = currentById.get(item.id);
        if (!current) return null;
        return [current.category, item.value] as const;
      })
      .filter((entry): entry is readonly [PriceCategory, number] => Boolean(entry)),
  );

  const announcedAt = new Date(payload[0]?.announcedAt ?? "");
  if (!Number.isNaN(announcedAt.getTime())) {
    const ageHours = (Date.now() - announcedAt.getTime()) / 1000 / 60 / 60;
    if (ageHours > 24) {
      warnings.push({
        kind: "stale-announced-at",
        level: "warning",
        message: "기준 시각이 24시간 이상 지난 값입니다. 전일 고시값인지 다시 확인해 주세요.",
      });
    }
  }

  payload.forEach((item) => {
    const current = currentById.get(item.id);
    if (!current || current.value <= 0) return;

    const ratio = Math.abs(item.value - current.value) / current.value;
    if (ratio >= 0.15) {
      warnings.push({
        kind: "large-change",
        level: "warning",
        message: `${current.label} 값이 이전 고시 대비 ${(ratio * 100).toFixed(1)}% 변경되었습니다. 입력값을 다시 확인해 주세요.`,
      });
    }
  });

  spreadRules.forEach((rule) => {
    const sellValue = nextByCategory.get(rule.sellCategory);
    const buyValue = nextByCategory.get(rule.buyCategory);
    if (!sellValue || !buyValue || sellValue <= 0) return;

    const spreadRatio = (sellValue - buyValue) / sellValue;
    if (spreadRatio > rule.ratioThreshold) {
      warnings.push({
        kind: "wide-spread",
        level: "notice",
        message: `${rule.label} 매입/판매 간격이 크게 벌어져 있습니다. 현장 기준값인지 다시 확인해 주세요.`,
      });
    }
  });

  return warnings;
}

export async function updatePricesAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/admin/prices?status=demo");
  }

  const ids = formData.getAll("priceIds").map(String);
  const announcedAt = ensureString(formData.get("announcedAt"));
  const changedBy = ensureString(formData.get("changedBy"), "관리자");

  const payload = ids.map((id) => ({
    id,
    value: ensureNumber(formData.get(`value:${id}`)),
    note: ensureString(formData.get(`note:${id}`)).trim() || null,
    isVisible: toBoolean(formData.get(`visible:${id}`)),
    announcedAt,
    changedBy,
    changeOrigin: "manual" as const,
    source: "admin",
  }));

  let redirectPath = "/admin/prices?status=error";

  try {
    const repository = getRepository();
    const currentPrices = await repository.getPrices();
    const warnings = buildPriceWarnings(currentPrices, payload);
    await repository.updatePrices(payload);

    const search = new URLSearchParams({ status: "saved" });
    warnings.forEach((warning) => {
      search.append("warning", warning.message);
    });

    revalidatePath("/");
    revalidatePath("/prices");
    revalidatePath("/products");
    revalidatePath("/products/[slug]", "page");
    revalidatePath("/admin/prices");
    redirectPath = `/admin/prices?${search.toString()}`;
  } catch {
    redirectPath = "/admin/prices?status=error";
  }

  redirect(redirectPath);
}

function ensurePriceAutoSource(value: FormDataEntryValue | null): PriceAutoSource {
  return value === "metals-dev" ? "metals-dev" : "gold-api";
}

function ensurePriceAutoMode(value: FormDataEntryValue | null): PriceAutoMode {
  if (value === "auto_publish" || value === "emergency_publish") return "auto_publish";
  return "manual_review";
}

function ensureIntervalHours(value: FormDataEntryValue | null): 1 | 2 {
  return ensureNumber(value, 2) === 1 ? 1 : 2;
}

function ensureCheckIntervalMinutes(value: FormDataEntryValue | null): 30 | 60 | 120 {
  const minutes = ensureNumber(value, 60);
  if (minutes === 30 || minutes === 120) return minutes;
  return 60;
}

function ensureRateFromPercentOrDecimal(
  percentValue: FormDataEntryValue | null,
  decimalValue: FormDataEntryValue | null,
  fallback: number,
) {
  if (percentValue !== null) {
    return ensureNumber(percentValue, fallback * 100) / 100;
  }
  return ensureNumber(decimalValue, fallback);
}

function revalidatePriceSurfaces() {
  revalidatePath("/");
  revalidatePath("/prices");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/prices");
}

function mapAutoRefreshStatus(status: string) {
  switch (status) {
    case "applied":
      return "auto-applied";
    case "schema-not-ready":
      return "auto-schema";
    case "auto-fill-disabled":
      return "auto-disabled";
    case "outside-business-hours":
      return "auto-outside-hours";
    case "not-due":
      return "auto-not-due";
    case "small-change":
      return "auto-small-change";
    case "needs-review":
      return "auto-needs-review";
    case "data-not-safe":
      return "auto-data-not-safe";
    default:
      return "auto-held";
  }
}

export async function updatePriceAutoSettingsAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/admin/prices?status=demo");
  }

  const isEnabled = toBoolean(formData.get("autoEnabled"));
  const mode = ensurePriceAutoMode(formData.get("autoMode"));
  const repository = getRepository();
  const result = await repository.updatePriceAutoSettings({
    isEnabled,
    source: ensurePriceAutoSource(formData.get("autoSource")),
    intervalHours: ensureIntervalHours(formData.get("intervalHours")),
    checkIntervalMinutes: ensureCheckIntervalMinutes(formData.get("checkIntervalMinutes")),
    mode,
    roundingUnit: ensureNumber(formData.get("roundingUnit"), 100),
    goldSellPremiumRate: ensureRateFromPercentOrDecimal(
      formData.get("goldSellPremiumRatePct"),
      formData.get("goldSellPremiumRate"),
      0.135,
    ),
    goldBuyDiscountRate: ensureRateFromPercentOrDecimal(
      formData.get("goldBuyDiscountRatePct"),
      formData.get("goldBuyDiscountRate"),
      0.05,
    ),
    gold18kBuyRate: ensureNumber(formData.get("gold18kBuyRate"), 0.735),
    gold14kBuyRate: ensureNumber(formData.get("gold14kBuyRate"), 0.57),
    platinumSellPremiumRate: ensureRateFromPercentOrDecimal(
      formData.get("platinumSellPremiumRatePct"),
      formData.get("platinumSellPremiumRate"),
      0.1,
    ),
    platinumBuyDiscountRate: ensureRateFromPercentOrDecimal(
      formData.get("platinumBuyDiscountRatePct"),
      formData.get("platinumBuyDiscountRate"),
      0.1,
    ),
    silverSellPremiumRate: ensureRateFromPercentOrDecimal(
      formData.get("silverSellPremiumRatePct"),
      formData.get("silverSellPremiumRate"),
      0.08,
    ),
    silverBuyDiscountRate: ensureRateFromPercentOrDecimal(
      formData.get("silverBuyDiscountRatePct"),
      formData.get("silverBuyDiscountRate"),
      0.11,
    ),
    minApplyChangeWon: ensureNumber(formData.get("minApplyChangeWon"), 500),
    maxAutoPublishChangePercent: ensureRateFromPercentOrDecimal(
      formData.get("maxAutoPublishChangePercentPct"),
      formData.get("maxAutoPublishChangePercent"),
      0.05,
    ),
    businessHoursOnly: toBoolean(formData.get("businessHoursOnly")),
    staleGuardEnabled: formData.has("staleGuardEnabled")
      ? formData.getAll("staleGuardEnabled").some((value) => toBoolean(value))
      : true,
    staleAfterHours: ensureNumber(formData.get("staleAfterHours"), 24),
    updatedBy: ensureString(formData.get("updatedBy"), "관리자"),
  });

  revalidatePriceSurfaces();
  const status = result.success
    ? isEnabled && mode === "auto_publish"
      ? "auto-on-saved"
      : "auto-off-saved"
    : "auto-schema";
  redirect(`/admin/prices?status=${status}`);
}

export async function generatePriceAutoSuggestionAction() {
  const repository = getRepository();
  let redirectPath = "/admin/prices?status=auto-error";

  try {
    const result = await runPriceAutoRefresh(repository, {
      force: true,
      changedBy: "자동시세",
    });
    revalidatePriceSurfaces();

    const search = new URLSearchParams({
      status: mapAutoRefreshStatus(result.status),
    });
    result.warnings.forEach((warning) => search.append("warning", warning));
    redirectPath = `/admin/prices?${search.toString()}`;
  } catch {
    redirectPath = "/admin/prices?status=auto-error";
  }

  redirect(redirectPath);
}

export async function applyPriceAutoSuggestionAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/admin/prices?status=demo");
  }

  const suggestionId = ensureString(formData.get("suggestionId"));
  const changedBy = ensureString(formData.get("changedBy"), "자동시세 검토 후 반영");
  const repository = getRepository();
  let redirectPath = "/admin/prices?status=auto-error";

  try {
    const [prices, suggestion] = await Promise.all([
      repository.getPrices(),
      repository.getLatestPriceAutoSuggestion(),
    ]);

    if (!suggestion || suggestion.id !== suggestionId || suggestion.status !== "draft") {
      redirectPath = "/admin/prices?status=auto-error";
    } else {
      const updates = buildPriceUpdatesFromSuggestion(prices, suggestion, changedBy);
      const warnings = buildPriceWarnings(prices, updates);
      await repository.updatePrices(updates);
      await repository.updatePriceAutoSuggestionStatus(suggestion.id, "applied", changedBy);

      const search = new URLSearchParams({ status: "auto-applied" });
      warnings.forEach((warning) => {
        search.append("warning", warning.message);
      });

      revalidatePriceSurfaces();
      redirectPath = `/admin/prices?${search.toString()}`;
    }
  } catch {
    redirectPath = "/admin/prices?status=auto-error";
  }

  redirect(redirectPath);
}

export async function rejectPriceAutoSuggestionAction(formData: FormData) {
  const suggestionId = ensureString(formData.get("suggestionId"));
  const repository = getRepository();
  let redirectPath = "/admin/prices?status=auto-error";

  try {
    await repository.updatePriceAutoSuggestionStatus(suggestionId, "rejected", "관리자");
    revalidatePath("/admin/prices");
    redirectPath = "/admin/prices?status=auto-rejected";
  } catch {
    redirectPath = "/admin/prices?status=auto-error";
  }

  redirect(redirectPath);
}
