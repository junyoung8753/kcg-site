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
  PriceDailySnapshot,
  PriceFreshness,
  PriceHistoryOrigin,
  PriceHistoryEntry,
  PriceRecord,
  UpdatePriceInput,
} from "@/types/price";
import type { Product, ProductUpsertInput } from "@/types/product";
import type {
  SiteAsset,
  SiteAssetInput,
  SiteAssetUsage,
  SiteAssetUsageInput,
  SiteAssetUsageSlot,
} from "@/types/media";
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
  change_origin?: PriceHistoryOrigin | null;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
};

type SupabasePriceDailySnapshotRow = {
  id: string;
  snapshot_date: string;
  price_id: string;
  category: PriceRecord["category"];
  label: string;
  value: number;
  announced_at: string;
  source: string;
  created_at: string;
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
  stale_guard_enabled?: boolean | null;
  stale_after_hours?: number | null;
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
  image_asset_id?: string | null;
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

type SupabaseSiteAssetRow = {
  id: string;
  asset_id: string;
  file_path: string;
  public_url: string;
  storage_bucket: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  checksum: string;
  image_source_type: SiteAsset["imageSourceType"];
  approval_status: SiteAsset["approvalStatus"];
  allowed_usage: SiteAsset["allowedUsage"] | null;
  related_sku: string[] | null;
  sku_match: string;
  page_usage: string[] | null;
  section_usage: string[] | null;
  alt_text: string;
  aspect_ratio: string;
  mobile_crop_rule: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type SupabaseSiteAssetUsageRow = {
  id: string;
  usage_key: SiteAssetUsageSlot;
  asset_id: string;
  page_path: string;
  section_usage: string;
  sort_order: number;
  is_active: boolean;
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
    changeOrigin: row.change_origin ?? "manual",
    source: row.source ?? null,
    metadata: row.metadata ?? {},
  };
}

function mapDailySnapshot(row: SupabasePriceDailySnapshotRow): PriceDailySnapshot {
  return {
    id: row.id,
    snapshotDate: row.snapshot_date,
    priceId: row.price_id,
    category: row.category,
    label: row.label,
    value: row.value,
    announcedAt: row.announced_at,
    source: row.source,
    createdAt: row.created_at,
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
    staleGuardEnabled: row.stale_guard_enabled ?? true,
    staleAfterHours: Number(row.stale_after_hours ?? 24),
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

function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  const message = maybeError.message || "";
  return (
    maybeError.code === "42703" ||
    /column .* does not exist/i.test(message) ||
    /could not find .*column/i.test(message)
  );
}

function isMissingRpcError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  const message = maybeError.message || "";
  return maybeError.code === "42883" || maybeError.code === "PGRST202" || /function .* does not exist/i.test(message);
}

function getKoreaDateKey(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
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
    imageAssetId: row.image_asset_id ?? null,
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

function mapSiteAsset(row: SupabaseSiteAssetRow): SiteAsset {
  return {
    id: row.id,
    assetId: row.asset_id,
    filePath: row.file_path,
    publicUrl: row.public_url,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    checksum: row.checksum,
    imageSourceType: row.image_source_type,
    approvalStatus: row.approval_status,
    allowedUsage: row.allowed_usage ?? [],
    relatedSku: row.related_sku ?? [],
    skuMatch: row.sku_match,
    pageUsage: row.page_usage ?? [],
    sectionUsage: row.section_usage ?? [],
    altText: row.alt_text,
    aspectRatio: row.aspect_ratio,
    mobileCropRule: row.mobile_crop_rule,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSiteAssetUsage(row: SupabaseSiteAssetUsageRow): SiteAssetUsage {
  return {
    id: row.id,
    usageKey: row.usage_key,
    assetId: row.asset_id,
    pagePath: row.page_path,
    sectionUsage: row.section_usage,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    updatedAt: row.updated_at,
  };
}

const fallbackMediaBucket = "site-assets-meta";
const fallbackAssetsPath = "site-assets.json";
const fallbackUsagesPath = "site-asset-usages.json";

type FallbackSiteAssetsPayload = {
  assets: SiteAsset[];
  updatedAt: string;
};

type FallbackSiteAssetUsagesPayload = {
  usages: SiteAssetUsage[];
  updatedAt: string;
};

function createLocalId() {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isMissingStorageObjectError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { message?: string; status?: number | string; statusCode?: number | string };
  const status = Number(maybeError.statusCode ?? maybeError.status);
  const message = maybeError.message || "";
  return status === 400 || status === 404 || /not found|does not exist/i.test(message);
}

function isImageAssetIdPersistenceError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  const message = maybeError.message || "";
  return isMissingColumnError(error) || (maybeError.code === "23503" && /image_asset_id|site_assets/i.test(message));
}

async function ensureFallbackMediaBucket() {
  const client = getSupabaseAdminClient();
  const bucketOptions = {
    public: false,
    fileSizeLimit: 512 * 1024,
    allowedMimeTypes: ["application/json"],
  };
  const { data: bucket, error } = await client.storage.getBucket(fallbackMediaBucket);

  if (!error && bucket) {
    const storedLimit = Number(bucket.file_size_limit ?? bucketOptions.fileSizeLimit);
    const storedMimeTypes = new Set(bucket.allowed_mime_types ?? bucketOptions.allowedMimeTypes);
    const mimeTypesMatch = bucketOptions.allowedMimeTypes.every((mimeType) => storedMimeTypes.has(mimeType));
    if (bucket.public || storedLimit !== bucketOptions.fileSizeLimit || !mimeTypesMatch) {
      const { error: updateError } = await client.storage.updateBucket(fallbackMediaBucket, bucketOptions);
      if (updateError) throw updateError;
    }
    return;
  }

  if (error && !isMissingStorageObjectError(error)) throw error;

  const { error: createError } = await client.storage.createBucket(fallbackMediaBucket, bucketOptions);
  if (createError && !/already exists|duplicate/i.test(createError.message || "")) {
    throw createError;
  }
}

async function readFallbackJson<T>(path: string, fallback: T): Promise<T> {
  await ensureFallbackMediaBucket();
  const client = getSupabaseAdminClient();
  const { data, error } = await client.storage.from(fallbackMediaBucket).download(path);
  if (error) {
    if (isMissingStorageObjectError(error)) return fallback;
    throw error;
  }

  try {
    return JSON.parse(await data.text()) as T;
  } catch {
    return fallback;
  }
}

async function writeFallbackJson(path: string, payload: unknown) {
  await ensureFallbackMediaBucket();
  const { error } = await getSupabaseAdminClient()
    .storage
    .from(fallbackMediaBucket)
    .upload(path, JSON.stringify(payload, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (error) throw error;
}

async function readFallbackSiteAssets() {
  const payload = await readFallbackJson<FallbackSiteAssetsPayload>(fallbackAssetsPath, {
    assets: [],
    updatedAt: new Date(0).toISOString(),
  });
  return payload.assets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function writeFallbackSiteAsset(input: SiteAssetInput) {
  const nowIso = new Date().toISOString();
  const existing = await readFallbackSiteAssets();
  const asset: SiteAsset = {
    id: createLocalId(),
    assetId: input.assetId,
    filePath: input.filePath,
    publicUrl: input.publicUrl,
    storageBucket: input.storageBucket,
    storagePath: input.storagePath,
    originalFilename: input.originalFilename,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    checksum: input.checksum,
    imageSourceType: input.imageSourceType,
    approvalStatus: input.approvalStatus,
    allowedUsage: input.allowedUsage,
    relatedSku: input.relatedSku,
    skuMatch: input.skuMatch,
    pageUsage: input.pageUsage,
    sectionUsage: input.sectionUsage,
    altText: input.altText,
    aspectRatio: input.aspectRatio,
    mobileCropRule: input.mobileCropRule,
    notes: input.notes,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  const nextAssets = [asset, ...existing.filter((item) => item.assetId !== asset.assetId)].slice(0, 250);
  await writeFallbackJson(fallbackAssetsPath, { assets: nextAssets, updatedAt: nowIso } satisfies FallbackSiteAssetsPayload);
  return asset;
}

async function readFallbackSiteAssetUsages() {
  const payload = await readFallbackJson<FallbackSiteAssetUsagesPayload>(fallbackUsagesPath, {
    usages: [],
    updatedAt: new Date(0).toISOString(),
  });
  return payload.usages.sort((a, b) => a.sortOrder - b.sortOrder);
}

async function writeFallbackSiteAssetUsage(input: SiteAssetUsageInput) {
  const nowIso = new Date().toISOString();
  const existing = await readFallbackSiteAssetUsages();
  const usage: SiteAssetUsage = {
    id: createLocalId(),
    usageKey: input.usageKey,
    assetId: input.assetId,
    pagePath: input.pagePath,
    sectionUsage: input.sectionUsage,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    updatedAt: nowIso,
  };
  const nextUsages = [
    usage,
    ...existing.filter(
      (item) =>
        item.usageKey !== input.usageKey ||
        item.assetId !== input.assetId ||
        item.sectionUsage !== input.sectionUsage,
    ),
  ].slice(0, 250);
  await writeFallbackJson(fallbackUsagesPath, { usages: nextUsages, updatedAt: nowIso } satisfies FallbackSiteAssetUsagesPayload);
  return {
    success: true,
    message: "이미지 연결이 저장되었습니다.",
    mode: "supabase",
  } satisfies RepositoryMutationResult;
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

  async getPriceDailySnapshots(limit = 90) {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("price_daily_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: false })
      .limit(limit);

    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }

    return (data as SupabasePriceDailySnapshotRow[]).map(mapDailySnapshot);
  }

  async getPriceFreshness(): Promise<PriceFreshness> {
    const client = getSupabaseAdminClient();

    const { data: latestAny, error: latestAnyError } = await client
      .from("price_history")
      .select("changed_at")
      .order("changed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestAnyError && !isMissingTableError(latestAnyError)) {
      throw latestAnyError;
    }

    let latestManualChangedAt: string | null = null;
    const { data: latestManual, error: latestManualError } = await client
      .from("price_history")
      .select("changed_at")
      .eq("change_origin", "manual")
      .order("changed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestManualError) {
      if (!isMissingTableError(latestManualError) && !isMissingColumnError(latestManualError)) {
        throw latestManualError;
      }
    } else {
      latestManualChangedAt = (latestManual as { changed_at?: string } | null)?.changed_at ?? null;
    }

    const { count: historyCount, error: historyCountError } = await client
      .from("price_history")
      .select("id", { count: "exact", head: true });

    if (historyCountError && !isMissingTableError(historyCountError)) {
      throw historyCountError;
    }

    const { count: snapshotCount, error: snapshotCountError } = await client
      .from("price_daily_snapshots")
      .select("id", { count: "exact", head: true });

    if (snapshotCountError && !isMissingTableError(snapshotCountError)) {
      throw snapshotCountError;
    }

    return {
      latestManualChangedAt,
      latestAnyChangedAt: (latestAny as { changed_at?: string } | null)?.changed_at ?? null,
      historyCount: historyCount ?? 0,
      dailySnapshotCount: snapshotCount ?? 0,
    };
  }

  async ensurePriceHistoryBaseline(changedBy = "시스템: 기준 시세 보관") {
    const client = getSupabaseAdminClient();
    const prices = await this.getPrices();
    const nowIso = new Date().toISOString();
    const categories = prices.map((price) => price.category);

    if (!prices.length) {
      return {
        success: true,
        message: "현재 고시 시세 기준 이력 보관 상태를 확인했습니다.",
        mode: "supabase",
      } satisfies RepositoryMutationResult;
    }

    const { data: existingHistory, error: historyLookupError } = await client
      .from("price_history")
      .select("category")
      .in("category", categories);

    if (historyLookupError) {
      if (isMissingTableError(historyLookupError)) {
        return {
          success: false,
          message: "시세 이력 테이블이 아직 적용되지 않았습니다.",
          mode: "supabase",
        } satisfies RepositoryMutationResult;
      }
      throw historyLookupError;
    }

    const existingCategories = new Set(
      ((existingHistory ?? []) as Array<{ category: string | null }>).map((row) => row.category),
    );
    const missingHistoryRows = prices
      .filter((price) => !existingCategories.has(price.category))
      .map((price) => ({
        price_id: price.id,
        category: price.category,
        label: price.label,
        previous_value: price.value,
        new_value: price.value,
        changed_at: price.announcedAt || nowIso,
        changed_by: changedBy,
        note: price.note ?? "현재 공개 시세 기준으로 이력 보관을 시작했습니다.",
        change_origin: "system",
        source: "baseline",
        metadata: {
          reason: "initial_price_history_baseline",
        },
      }));

    if (missingHistoryRows.length) {
      const { error: insertError } = await client.from("price_history").insert(missingHistoryRows);

      if (insertError && !isMissingColumnError(insertError)) {
        throw insertError;
      }
    }

    const snapshotRows = prices.map((price) => ({
      snapshot_date: getKoreaDateKey(new Date(price.announcedAt || nowIso)),
      price_id: price.id,
      category: price.category,
      label: price.label,
      value: price.value,
      announced_at: price.announcedAt || nowIso,
      source: "baseline",
    }));
    const { error: snapshotError } = await client.from("price_daily_snapshots").upsert(
      snapshotRows,
      { onConflict: "snapshot_date,category" },
    );

    if (snapshotError) {
      if (isMissingTableError(snapshotError)) {
        return {
          success: false,
          message: "일별 시세 스냅샷 테이블이 아직 적용되지 않았습니다.",
          mode: "supabase",
        } satisfies RepositoryMutationResult;
      }
      throw snapshotError;
    }

    return {
      success: true,
      message: "현재 고시 시세 기준 이력 보관 상태를 확인했습니다.",
      mode: "supabase",
    } satisfies RepositoryMutationResult;
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
        stale_guard_enabled: defaults.staleGuardEnabled,
        stale_after_hours: defaults.staleAfterHours,
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
      stale_guard_enabled: input.staleGuardEnabled,
      stale_after_hours: input.staleAfterHours,
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

    if (!ids.length) {
      return {
        success: true,
        message: "시세가 저장되었습니다.",
        mode: "supabase",
      } satisfies RepositoryMutationResult;
    }

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

    const { error: rpcError } = await client.rpc("kcg_update_prices_atomic", { items: input });

    if (!rpcError) {
      return {
        success: true,
        message: "시세가 저장되었습니다.",
        mode: "supabase",
      } satisfies RepositoryMutationResult;
    }

    if (!isMissingRpcError(rpcError)) {
      throw rpcError;
    }

    const nowIso = new Date().toISOString();
    const updateJobs = input
      .filter((item) => rows.has(item.id))
      .map((item) =>
        client
          .from("prices")
          .update({
            value: item.value,
            note: item.note,
            is_visible: item.isVisible,
            announced_at: item.announcedAt,
            updated_at: nowIso,
          })
          .eq("id", item.id),
      );

    const updateResults = await Promise.all(updateJobs);

    for (const { error: updateError } of updateResults) {
      if (updateError) {
        throw updateError;
      }
    }

    const changedItems = input
      .map((item) => ({ item, current: rows.get(item.id) }))
      .filter(
        (entry): entry is { item: UpdatePriceInput; current: SupabasePriceRow } =>
          Boolean(entry.current) &&
          (entry.current?.value !== entry.item.value ||
            entry.current.note !== entry.item.note ||
            entry.current.announced_at !== entry.item.announcedAt),
      );

    if (changedItems.length) {
      const historyRows = changedItems.map(({ item, current }) => ({
        price_id: item.id,
        category: current.category,
        label: current.label,
        previous_value: current.value,
        new_value: item.value,
        changed_at: nowIso,
        changed_by: item.changedBy,
        note: item.note,
        change_origin: item.changeOrigin ?? "manual",
        source: item.source ?? null,
        metadata: item.metadata ?? {},
      }));
      const { error: historyError } = await client.from("price_history").insert(historyRows);

      if (historyError) {
        throw historyError;
      }

      const snapshotRows = changedItems.map(({ item, current }) => ({
        snapshot_date: getKoreaDateKey(new Date(item.announcedAt)),
        price_id: item.id,
        category: current.category,
        label: current.label,
        value: item.value,
        announced_at: item.announcedAt,
        source: item.source ?? item.changeOrigin ?? "manual",
      }));
      const { error: snapshotError } = await client.from("price_daily_snapshots").upsert(
        snapshotRows,
        { onConflict: "snapshot_date,category" },
      );

      if (snapshotError && !isMissingTableError(snapshotError)) {
        throw snapshotError;
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
    const previous = input.id
      ? await client.from("products").select("*").eq("id", input.id).maybeSingle()
      : { data: null, error: null };

    if (previous.error) {
      throw previous.error;
    }

    const payload = {
      category: input.category,
      subcategory: input.subcategory,
      name: input.name,
      slug: input.slug,
      short_description: input.shortDescription,
      description: input.description,
      image_url: input.imageUrl,
      image_asset_id: input.imageAssetId,
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
    const payloadWithoutImageAssetId = { ...payload };
    delete (payloadWithoutImageAssetId as Partial<typeof payload>).image_asset_id;
    let persistedPayload: typeof payload = payload;

    if (input.id) {
      const { error } = await client.from("products").update(payload).eq("id", input.id);

      if (error) {
        if (!isImageAssetIdPersistenceError(error)) throw error;
        const retry = await client.from("products").update(payloadWithoutImageAssetId).eq("id", input.id);
        if (retry.error) throw retry.error;
        persistedPayload = payloadWithoutImageAssetId;
      }
    } else {
      const { error } = await client.from("products").insert({
        ...payload,
        created_at: new Date().toISOString(),
      });

      if (error) {
        if (!isImageAssetIdPersistenceError(error)) throw error;
        const retry = await client.from("products").insert({
          ...payloadWithoutImageAssetId,
          created_at: new Date().toISOString(),
        });
        if (retry.error) throw retry.error;
        persistedPayload = payloadWithoutImageAssetId;
      }
    }

    const { error: historyError } = await client.from("product_change_history").insert({
      product_id: input.id ?? null,
      slug: input.slug,
      changed_by: "관리자",
      change_type: input.id ? "update" : "insert",
      previous_payload: previous.data ?? null,
      next_payload: persistedPayload,
    });

    if (historyError && !isMissingTableError(historyError)) {
      throw historyError;
    }

    return {
      success: true,
      message: "상품 정보가 저장되었습니다.",
      mode: "supabase",
    } satisfies RepositoryMutationResult;
  }

  async getSiteAssets() {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("site_assets")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      if (isMissingTableError(error)) return readFallbackSiteAssets();
      throw error;
    }

    return (data as SupabaseSiteAssetRow[]).map(mapSiteAsset);
  }

  async getSiteAssetUsages() {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("site_asset_usages")
      .select("*")
      .order("usage_key", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      if (isMissingTableError(error)) return readFallbackSiteAssetUsages();
      throw error;
    }

    return (data as SupabaseSiteAssetUsageRow[]).map(mapSiteAssetUsage);
  }

  async createSiteAsset(input: SiteAssetInput) {
    const client = getSupabaseAdminClient();
    const nowIso = new Date().toISOString();
    const payload = {
      asset_id: input.assetId,
      file_path: input.filePath,
      public_url: input.publicUrl,
      storage_bucket: input.storageBucket,
      storage_path: input.storagePath,
      original_filename: input.originalFilename,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      checksum: input.checksum,
      image_source_type: input.imageSourceType,
      approval_status: input.approvalStatus,
      allowed_usage: input.allowedUsage,
      related_sku: input.relatedSku,
      sku_match: input.skuMatch,
      page_usage: input.pageUsage,
      section_usage: input.sectionUsage,
      alt_text: input.altText,
      aspect_ratio: input.aspectRatio,
      mobile_crop_rule: input.mobileCropRule,
      notes: input.notes,
      created_at: nowIso,
      updated_at: nowIso,
    };
    const { data, error } = await client
      .from("site_assets")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      if (isMissingTableError(error)) return writeFallbackSiteAsset(input);
      throw error;
    }

    const created = mapSiteAsset(data as SupabaseSiteAssetRow);
    const { error: historyError } = await client.from("media_change_history").insert({
      asset_id: created.id,
      changed_by: "관리자",
      change_type: "upload",
      payload,
    });

    if (historyError && !isMissingTableError(historyError)) {
      throw historyError;
    }

    return created;
  }

  async upsertSiteAssetUsage(input: SiteAssetUsageInput) {
    const client = getSupabaseAdminClient();
    const { error } = await client.from("site_asset_usages").upsert(
      {
        usage_key: input.usageKey,
        asset_id: input.assetId,
        page_path: input.pagePath,
        section_usage: input.sectionUsage,
        sort_order: input.sortOrder,
        is_active: input.isActive,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "usage_key,asset_id,section_usage" },
    );

    if (error) {
      if (isMissingTableError(error)) return writeFallbackSiteAssetUsage(input);
      throw error;
    }

    return {
      success: true,
      message: "이미지 사용 위치가 저장되었습니다.",
      mode: "supabase",
    } satisfies RepositoryMutationResult;
  }
}
