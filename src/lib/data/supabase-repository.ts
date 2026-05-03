import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  Announcement,
  AnnouncementUpsertInput,
} from "@/types/announcement";
import type { RepositoryMutationResult } from "@/types/admin";
import type {
  PriceAutoSettings,
  PriceAutoSettingsInput,
  PriceAutoRunStateInput,
  PriceAutoSuggestion,
  PriceAutoSuggestionInput,
  PriceAutoSuggestionItem,
  PriceAutoSuggestionStatus,
  PriceHistoryEntry,
  PriceRecord,
  UpdatePriceInput,
} from "@/types/price";
import type { Product, ProductUpsertInput } from "@/types/product";
import { getDefaultPriceAutoSettings } from "@/lib/price-auto";
import type { SiteRepository } from "./repository";

type SupabasePriceRow = {
  id: string;
  category: PriceRecord["category"];
  label: string;
  value: number;
  unit: string;
  announced_at: string;
  note: string | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

type SupabasePriceHistoryRow = {
  id: string;
  price_id: string;
  category: PriceRecord["category"];
  label: string;
  previous_value: number;
  new_value: number;
  changed_at: string;
  changed_by: string;
  note: string | null;
};

type SupabasePriceAutoSettingsRow = {
  id: "default";
  is_enabled: boolean;
  source: PriceAutoSettings["source"];
  interval_hours: 1 | 2;
  check_interval_minutes?: 30 | 60 | 120 | null;
  mode: PriceAutoSettings["mode"] | "draft" | "emergency_publish";
  rounding_unit: number;
  gold_sell_premium_rate: number;
  gold_buy_discount_rate: number;
  gold_18k_buy_rate: number;
  gold_14k_buy_rate: number;
  platinum_sell_premium_rate: number;
  platinum_buy_discount_rate: number;
  silver_sell_premium_rate: number;
  silver_buy_discount_rate: number;
  max_auto_change_percent?: number | null;
  min_apply_change_won?: number | null;
  max_auto_publish_change_percent?: number | null;
  business_hours_only?: boolean | null;
  last_checked_at?: string | null;
  last_auto_applied_at?: string | null;
  updated_by: string;
  updated_at: string;
};

type SupabasePriceAutoSuggestionRow = {
  id: string;
  status: PriceAutoSuggestionStatus;
  source: PriceAutoSuggestion["source"];
  provider_label: string;
  source_updated_at: string;
  generated_at: string;
  settings_snapshot: PriceAutoSettings;
  items: PriceAutoSuggestionItem[];
  warnings: string[] | null;
  applied_at: string | null;
  applied_by: string | null;
};

type SupabaseAnnouncementRow = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  is_pinned: boolean;
  status: Announcement["status"];
  published_at: string;
  created_at: string;
  updated_at: string;
};

type SupabaseProductRow = {
  id: string;
  category: Product["category"];
  subcategory: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  image_url: string | null;
  specs: string[] | null;
  status: Product["status"];
  display_order: number | null;
  is_featured: boolean | null;
  price_visible: boolean;
  price_basis: Product["priceBasis"] | null;
  weight_grams: number | null;
  making_fee: number | null;
  manual_price: number | null;
  price_label: string | null;
  price_note: string | null;
  public_note: string | null;
  created_at: string;
  updated_at: string;
};

function mapPrice(row: SupabasePriceRow): PriceRecord {
  return {
    id: row.id,
    category: row.category,
    label: row.label,
    value: row.value,
    unit: row.unit,
    announcedAt: row.announced_at,
    note: row.note,
    isVisible: row.is_visible,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapHistory(row: SupabasePriceHistoryRow): PriceHistoryEntry {
  return {
    id: row.id,
    priceId: row.price_id,
    category: row.category,
    label: row.label,
    previousValue: row.previous_value,
    newValue: row.new_value,
    changedAt: row.changed_at,
    changedBy: row.changed_by,
    note: row.note,
  };
}

function mapPriceAutoSettings(row: SupabasePriceAutoSettingsRow): PriceAutoSettings {
  const checkIntervalMinutes = row.check_interval_minutes === 30 || row.check_interval_minutes === 120
    ? row.check_interval_minutes
    : 60;
  const mode = row.mode === "auto_publish" || row.mode === "emergency_publish"
    ? "auto_publish"
    : "manual_review";

  return getDefaultPriceAutoSettings({
    id: "default",
    isEnabled: row.is_enabled,
    source: row.source,
    intervalHours: checkIntervalMinutes === 120 ? 2 : 1,
    checkIntervalMinutes,
    mode,
    roundingUnit: row.rounding_unit,
    goldSellPremiumRate: Number(row.gold_sell_premium_rate),
    goldBuyDiscountRate: Number(row.gold_buy_discount_rate),
    gold18kBuyRate: Number(row.gold_18k_buy_rate),
    gold14kBuyRate: Number(row.gold_14k_buy_rate),
    platinumSellPremiumRate: Number(row.platinum_sell_premium_rate),
    platinumBuyDiscountRate: Number(row.platinum_buy_discount_rate),
    silverSellPremiumRate: Number(row.silver_sell_premium_rate),
    silverBuyDiscountRate: Number(row.silver_buy_discount_rate),
    minApplyChangeWon: Number(row.min_apply_change_won ?? 500),
    maxAutoPublishChangePercent: Number(
      row.max_auto_publish_change_percent ?? row.max_auto_change_percent ?? 0.05,
    ),
    businessHoursOnly: row.business_hours_only ?? true,
    lastCheckedAt: row.last_checked_at ?? null,
    lastAutoAppliedAt: row.last_auto_applied_at ?? null,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
    schemaReady: true,
  });
}

function mapPriceAutoSuggestion(row: SupabasePriceAutoSuggestionRow): PriceAutoSuggestion {
  return {
    id: row.id,
    status: row.status,
    source: row.source,
    providerLabel: row.provider_label,
    sourceUpdatedAt: row.source_updated_at,
    generatedAt: row.generated_at,
    settingsSnapshot: getDefaultPriceAutoSettings({
      ...row.settings_snapshot,
      schemaReady: true,
    }),
    items: row.items,
    warnings: row.warnings ?? [],
    appliedAt: row.applied_at,
    appliedBy: row.applied_by,
  };
}

function isMissingTableError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  const message = maybeError.message || "";
  return (
    maybeError.code === "42P01" ||
    maybeError.code === "PGRST205" ||
    /relation .* does not exist/i.test(message) ||
    /could not find .*table/i.test(message) ||
    /schema cache/i.test(message)
  );
}

function mapAnnouncement(row: SupabaseAnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    isPinned: row.is_pinned,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProduct(row: SupabaseProductRow): Product {
  return {
    id: row.id,
    category: row.category,
    subcategory: row.subcategory,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    imageUrl: row.image_url,
    specs: row.specs ?? [],
    status: row.status,
    displayOrder: row.display_order ?? 0,
    isFeatured: row.is_featured ?? false,
    priceVisible: row.price_visible,
    priceBasis: row.price_basis ?? "inquiry",
    weightGrams: row.weight_grams,
    makingFee: row.making_fee,
    manualPrice: row.manual_price,
    priceLabel: row.price_label ?? "전화 문의",
    priceNote: row.price_note,
    publicNote: row.public_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseRepository implements SiteRepository {
  async getPrices(options?: { visibleOnly?: boolean }) {
    const client = getSupabaseAdminClient();
    let query = client
      .from("prices")
      .select("*")
      .order("display_order", { ascending: true });

    if (options?.visibleOnly) {
      query = query.eq("is_visible", true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data as SupabasePriceRow[]).map(mapPrice);
  }

  async getPriceHistory(limit = 5) {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("price_history")
      .select("*")
      .order("changed_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data as SupabasePriceHistoryRow[]).map(mapHistory);
  }

  async getPriceAutoSettings() {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("price_auto_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) {
        return getDefaultPriceAutoSettings();
      }
      throw error;
    }

    if (data) {
      return mapPriceAutoSettings(data as SupabasePriceAutoSettingsRow);
    }

    const defaults = getDefaultPriceAutoSettings({ schemaReady: true });
    const { data: inserted, error: insertError } = await client
      .from("price_auto_settings")
      .insert({
        id: "default",
        is_enabled: defaults.isEnabled,
        source: defaults.source,
        interval_hours: defaults.intervalHours,
        check_interval_minutes: defaults.checkIntervalMinutes,
        mode: defaults.mode,
        rounding_unit: defaults.roundingUnit,
        gold_sell_premium_rate: defaults.goldSellPremiumRate,
        gold_buy_discount_rate: defaults.goldBuyDiscountRate,
        gold_18k_buy_rate: defaults.gold18kBuyRate,
        gold_14k_buy_rate: defaults.gold14kBuyRate,
        platinum_sell_premium_rate: defaults.platinumSellPremiumRate,
        platinum_buy_discount_rate: defaults.platinumBuyDiscountRate,
        silver_sell_premium_rate: defaults.silverSellPremiumRate,
        silver_buy_discount_rate: defaults.silverBuyDiscountRate,
        min_apply_change_won: defaults.minApplyChangeWon,
        max_auto_publish_change_percent: defaults.maxAutoPublishChangePercent,
        business_hours_only: defaults.businessHoursOnly,
        last_checked_at: defaults.lastCheckedAt,
        last_auto_applied_at: defaults.lastAutoAppliedAt,
        updated_by: defaults.updatedBy,
      })
      .select("*")
      .single();

    if (insertError) {
      if (isMissingTableError(insertError)) {
        return getDefaultPriceAutoSettings();
      }
      throw insertError;
    }

    return mapPriceAutoSettings(inserted as SupabasePriceAutoSettingsRow);
  }

  async updatePriceAutoSettings(input: PriceAutoSettingsInput) {
    const client = getSupabaseAdminClient();
    const { error } = await client.from("price_auto_settings").upsert({
      id: "default",
      is_enabled: input.isEnabled,
      source: input.source,
      interval_hours: input.intervalHours,
      check_interval_minutes: input.checkIntervalMinutes,
      mode: input.mode,
      rounding_unit: input.roundingUnit,
      gold_sell_premium_rate: input.goldSellPremiumRate,
      gold_buy_discount_rate: input.goldBuyDiscountRate,
      gold_18k_buy_rate: input.gold18kBuyRate,
      gold_14k_buy_rate: input.gold14kBuyRate,
      platinum_sell_premium_rate: input.platinumSellPremiumRate,
      platinum_buy_discount_rate: input.platinumBuyDiscountRate,
      silver_sell_premium_rate: input.silverSellPremiumRate,
      silver_buy_discount_rate: input.silverBuyDiscountRate,
      min_apply_change_won: input.minApplyChangeWon,
      max_auto_publish_change_percent: input.maxAutoPublishChangePercent,
      business_hours_only: input.businessHoursOnly,
      updated_by: input.updatedBy,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      if (isMissingTableError(error)) {
        return {
          success: false,
          message: "자동입력 테이블이 아직 적용되지 않았습니다.",
          mode: "supabase",
        } satisfies RepositoryMutationResult;
      }
      throw error;
    }

    return {
      success: true,
      message: "자동입력 설정이 저장되었습니다.",
      mode: "supabase",
    } satisfies RepositoryMutationResult;
  }

  async updatePriceAutoRunState(input: PriceAutoRunStateInput) {
    const client = getSupabaseAdminClient();
    const payload: Record<string, string | null> = {
      updated_at: new Date().toISOString(),
    };

    if ("lastCheckedAt" in input) {
      payload.last_checked_at = input.lastCheckedAt ?? null;
    }

    if ("lastAutoAppliedAt" in input) {
      payload.last_auto_applied_at = input.lastAutoAppliedAt ?? null;
    }

    const { error } = await client.from("price_auto_settings").update(payload).eq("id", "default");

    if (error) {
      if (isMissingTableError(error)) {
        return {
          success: false,
          message: "자동입력 테이블이 아직 적용되지 않았습니다.",
          mode: "supabase",
        } satisfies RepositoryMutationResult;
      }
      throw error;
    }

    return {
      success: true,
      message: "자동입력 실행 상태가 저장되었습니다.",
      mode: "supabase",
    } satisfies RepositoryMutationResult;
  }

  async getLatestPriceAutoSuggestion() {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("price_auto_suggestions")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) {
        return null;
      }
      throw error;
    }

    return data ? mapPriceAutoSuggestion(data as SupabasePriceAutoSuggestionRow) : null;
  }

  async createPriceAutoSuggestion(input: PriceAutoSuggestionInput) {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("price_auto_suggestions")
      .insert({
        status: "draft",
        source: input.source,
        provider_label: input.providerLabel,
        source_updated_at: input.sourceUpdatedAt,
        settings_snapshot: input.settingsSnapshot,
        items: input.items,
        warnings: input.warnings,
      })
      .select("*")
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        return {
          id: "schema-not-ready",
          status: "draft",
          source: input.source,
          providerLabel: input.providerLabel,
          sourceUpdatedAt: input.sourceUpdatedAt,
          generatedAt: new Date().toISOString(),
          settingsSnapshot: input.settingsSnapshot,
          items: input.items,
          warnings: [
            ...input.warnings,
            "자동입력 테이블이 아직 적용되지 않아 초안을 저장하지 못했습니다.",
          ],
          appliedAt: null,
          appliedBy: null,
        } satisfies PriceAutoSuggestion;
      }
      throw error;
    }

    return mapPriceAutoSuggestion(data as SupabasePriceAutoSuggestionRow);
  }

  async updatePriceAutoSuggestionStatus(
    id: string,
    status: PriceAutoSuggestionStatus,
    appliedBy?: string,
  ) {
    const client = getSupabaseAdminClient();
    const { error } = await client
      .from("price_auto_suggestions")
      .update({
        status,
        applied_by: appliedBy ?? null,
        applied_at: status === "applied" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (error) {
      if (isMissingTableError(error)) {
        return {
          success: false,
          message: "자동입력 테이블이 아직 적용되지 않았습니다.",
          mode: "supabase",
        } satisfies RepositoryMutationResult;
      }
      throw error;
    }

    return {
      success: true,
      message: "자동시세 검토 상태가 변경되었습니다.",
      mode: "supabase",
    } satisfies RepositoryMutationResult;
  }

  async getAnnouncements(options?: { limit?: number; includeDrafts?: boolean }) {
    const client = getSupabaseAdminClient();
    let query = client.from("announcements").select("*");

    if (!options?.includeDrafts) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query.order("is_pinned", { ascending: false }).order(
      "published_at",
      { ascending: false },
    );

    if (error) {
      throw error;
    }

    const announcements = (data as SupabaseAnnouncementRow[]).map(mapAnnouncement);
    return options?.limit ? announcements.slice(0, options.limit) : announcements;
  }

  async getAnnouncementBySlug(slug: string) {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("announcements")
      .select("*")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapAnnouncement(data as SupabaseAnnouncementRow) : null;
  }

  async getProducts(options?: { includeHidden?: boolean }) {
    const client = getSupabaseAdminClient();
    let query = client.from("products").select("*").order("display_order", { ascending: true });

    if (!options?.includeHidden) {
      query = query.neq("status", "hidden");
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data as SupabaseProductRow[]).map(mapProduct);
  }

  async updatePrices(input: UpdatePriceInput[]) {
    const client = getSupabaseAdminClient();
    const ids = input.map((item) => item.id);
    const { data: currentRows, error: currentError } = await client
      .from("prices")
      .select("*")
      .in("id", ids);

    if (currentError) {
      throw currentError;
    }

    const rows = new Map(
      (currentRows as SupabasePriceRow[]).map((row) => [row.id, row] as const),
    );

    for (const item of input) {
      const current = rows.get(item.id);

      if (!current) {
        continue;
      }

      const { error: updateError } = await client
        .from("prices")
        .update({
          value: item.value,
          note: item.note,
          is_visible: item.isVisible,
          announced_at: item.announcedAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (updateError) {
        throw updateError;
      }

      if (
        current.value !== item.value ||
        current.note !== item.note ||
        current.announced_at !== item.announcedAt
      ) {
        const { error: historyError } = await client.from("price_history").insert({
          price_id: item.id,
          category: current.category,
          label: current.label,
          previous_value: current.value,
          new_value: item.value,
          changed_at: new Date().toISOString(),
          changed_by: item.changedBy,
          note: item.note,
        });

        if (historyError) {
          throw historyError;
        }
      }
    }

    return {
      success: true,
      message: "시세가 저장되었습니다.",
      mode: "supabase",
    } satisfies RepositoryMutationResult;
  }

  async upsertAnnouncement(input: AnnouncementUpsertInput) {
    const client = getSupabaseAdminClient();
    const payload = {
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      content: input.content,
      is_pinned: input.isPinned,
      status: input.status,
      published_at: input.publishedAt,
      updated_at: new Date().toISOString(),
    };

    if (input.id) {
      const { error } = await client.from("announcements").update(payload).eq("id", input.id);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await client.from("announcements").insert({
        ...payload,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }
    }

    return {
      success: true,
      message: "공지사항이 저장되었습니다.",
      mode: "supabase",
    } satisfies RepositoryMutationResult;
  }

  async deleteAnnouncement(id: string) {
    const client = getSupabaseAdminClient();
    const { error } = await client.from("announcements").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "공지사항이 삭제되었습니다.",
      mode: "supabase",
    } satisfies RepositoryMutationResult;
  }

  async upsertProduct(input: ProductUpsertInput) {
    const client = getSupabaseAdminClient();
    const payload = {
      category: input.category,
      subcategory: input.subcategory,
      name: input.name,
      slug: input.slug,
      short_description: input.shortDescription,
      description: input.description,
      image_url: input.imageUrl,
      specs: input.specs,
      status: input.status,
      display_order: input.displayOrder,
      is_featured: input.isFeatured,
      price_visible: input.priceVisible,
      price_basis: input.priceBasis,
      weight_grams: input.weightGrams,
      making_fee: input.makingFee,
      manual_price: input.manualPrice,
      price_label: input.priceLabel,
      price_note: input.priceNote,
      public_note: input.publicNote,
      updated_at: new Date().toISOString(),
    };

    if (input.id) {
      const { error } = await client.from("products").update(payload).eq("id", input.id);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await client.from("products").insert({
        ...payload,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }
    }

    return {
      success: true,
      message: "상품 정보가 저장되었습니다.",
      mode: "supabase",
    } satisfies RepositoryMutationResult;
  }
}
