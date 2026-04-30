"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRepository } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { ensureNumber, ensureString, toBoolean } from "@/lib/utils";
import type { PriceCategory, PriceRecord, PriceSanityWarning, UpdatePriceInput } from "@/types/price";

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
    revalidatePath("/admin/prices");
    redirectPath = `/admin/prices?${search.toString()}`;
  } catch {
    redirectPath = "/admin/prices?status=error";
  }

  redirect(redirectPath);
}
