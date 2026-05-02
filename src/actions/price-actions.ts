"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRepository } from "@/lib/data";
import {
  buildPriceAutoSuggestionInput,
  buildPriceUpdatesFromSuggestion,
} from "@/lib/price-auto";
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
  return value === "emergency_publish" ? "emergency_publish" : "draft";
}

function ensureIntervalHours(value: FormDataEntryValue | null): 1 | 2 {
  return ensureNumber(value, 2) === 1 ? 1 : 2;
}

function revalidatePriceSurfaces() {
  revalidatePath("/");
  revalidatePath("/prices");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/prices");
}

export async function updatePriceAutoSettingsAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/admin/prices?status=demo");
  }

  const repository = getRepository();
  const result = await repository.updatePriceAutoSettings({
    isEnabled: toBoolean(formData.get("autoEnabled")),
    source: ensurePriceAutoSource(formData.get("autoSource")),
    intervalHours: ensureIntervalHours(formData.get("intervalHours")),
    mode: ensurePriceAutoMode(formData.get("autoMode")),
    roundingUnit: ensureNumber(formData.get("roundingUnit"), 100),
    goldSellPremiumRate: ensureNumber(formData.get("goldSellPremiumRate"), 0.135),
    goldBuyDiscountRate: ensureNumber(formData.get("goldBuyDiscountRate"), 0.05),
    gold18kBuyRate: ensureNumber(formData.get("gold18kBuyRate"), 0.735),
    gold14kBuyRate: ensureNumber(formData.get("gold14kBuyRate"), 0.57),
    platinumSellPremiumRate: ensureNumber(formData.get("platinumSellPremiumRate"), 0.1),
    platinumBuyDiscountRate: ensureNumber(formData.get("platinumBuyDiscountRate"), 0.1),
    silverSellPremiumRate: ensureNumber(formData.get("silverSellPremiumRate"), 0.08),
    silverBuyDiscountRate: ensureNumber(formData.get("silverBuyDiscountRate"), 0.11),
    maxAutoChangePercent: ensureNumber(formData.get("maxAutoChangePercent"), 0.15),
    updatedBy: ensureString(formData.get("updatedBy"), "관리자"),
  });

  revalidatePriceSurfaces();
  redirect(`/admin/prices?status=${result.success ? "auto-settings-saved" : "auto-schema"}`);
}

export async function generatePriceAutoSuggestionAction() {
  const repository = getRepository();
  let redirectPath = "/admin/prices?status=auto-error";

  try {
    const [prices, settings] = await Promise.all([
      repository.getPrices(),
      repository.getPriceAutoSettings(),
    ]);
    const input = await buildPriceAutoSuggestionInput(prices, settings);
    const suggestion = await repository.createPriceAutoSuggestion(input);
    revalidatePriceSurfaces();
    redirectPath =
      suggestion.id === "schema-not-ready"
        ? "/admin/prices?status=auto-schema"
        : "/admin/prices?status=auto-draft";
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
  const changedBy = ensureString(formData.get("changedBy"), "자동입력 초안 적용");
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
