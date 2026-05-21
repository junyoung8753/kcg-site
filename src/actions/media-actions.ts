"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminActionSession } from "@/lib/auth/admin-action";
import { getRepository } from "@/lib/data";
import type { ImageAllowedUsage, ImageApprovalStatus, ImageSourceType } from "@/lib/image-asset-manifest";
import { getCanonicalPublicProductBySlug } from "@/lib/product-presenter";
import { siteImageUploadAllowedMimeTypes, siteImageUploadMaxBytes } from "@/lib/site-upload-policy";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ensureNumber, ensureString, slugify, toBoolean } from "@/lib/utils";
import type { SiteAssetUsageSlot } from "@/types/media";

const allowedMimeTypes: ReadonlySet<string> = new Set(siteImageUploadAllowedMimeTypes);
const allowedSourceTypes: ImageSourceType[] = ["A1", "A2", "A3", "B", "C", "D", "E", "F"];
const allowedApprovalStatuses: ImageApprovalStatus[] = ["approved", "candidate", "needs_review", "quarantined", "rejected"];
const siteAssetsBucket = "site-assets";
const maxUploadBytes = siteImageUploadMaxBytes;
const allowedUsages: ImageAllowedUsage[] = [
  "admin_reference",
  "b2b_category",
  "brand_identity",
  "candidate_preview",
  "category_card",
  "company_hero",
  "hero",
  "notice_template",
  "product_card",
  "product_detail",
  "product_guide",
  "product_placeholder",
  "service_hero",
  "social_preview",
  "store_guide_hero",
];
const slotAllowedUsage: Record<SiteAssetUsageSlot, ImageAllowedUsage[]> = {
  home_hero: ["hero"],
  products_hero: ["hero", "product_guide"],
  services_hero: ["service_hero"],
  store_guide_hero: ["store_guide_hero"],
  company_hero: ["company_hero", "brand_identity"],
  product_image: ["product_card", "product_detail", "category_card"],
};
const operatorUploadPresets: Record<
  string,
  {
    sourceType: ImageSourceType;
    allowedUsage: ImageAllowedUsage[];
    aspectRatio: string;
    skuMatch: string;
    pageUsage: string[];
    sectionUsage: string[];
    mobileCropRule: string;
  }
> = {
  home_hero: {
    sourceType: "C",
    allowedUsage: ["hero"],
    aspectRatio: "16:9",
    skuMatch: "not_applicable",
    pageUsage: ["/"],
    sectionUsage: ["home-hero"],
    mobileCropRule: "모바일에서는 중앙 주요 피사체와 로고가 잘리지 않게 확인합니다.",
  },
  products_hero: {
    sourceType: "C",
    allowedUsage: ["hero", "product_guide"],
    aspectRatio: "16:9",
    skuMatch: "not_applicable",
    pageUsage: ["/products"],
    sectionUsage: ["products-hero"],
    mobileCropRule: "상품 라인업이나 상담 피사체가 모바일에서도 중앙에 남도록 확인합니다.",
  },
  service_hero: {
    sourceType: "D",
    allowedUsage: ["service_hero"],
    aspectRatio: "16:9",
    skuMatch: "not_applicable",
    pageUsage: ["/services"],
    sectionUsage: ["services-hero"],
    mobileCropRule: "상담 장면과 손동작이 중앙에 남도록 모바일 crop을 확인합니다.",
  },
  store_guide_hero: {
    sourceType: "D",
    allowedUsage: ["store_guide_hero"],
    aspectRatio: "16:9",
    skuMatch: "not_applicable",
    pageUsage: ["/about"],
    sectionUsage: ["store-guide-hero"],
    mobileCropRule: "방문 안내 맥락이 유지되도록 중앙 crop을 확인합니다.",
  },
  company_hero: {
    sourceType: "B",
    allowedUsage: ["company_hero", "brand_identity"],
    aspectRatio: "16:9",
    skuMatch: "not_applicable",
    pageUsage: ["/company"],
    sectionUsage: ["company-hero"],
    mobileCropRule: "회사 신뢰 이미지가 과도하게 잘리지 않도록 모바일 crop을 확인합니다.",
  },
  notice_template: {
    sourceType: "B",
    allowedUsage: ["notice_template"],
    aspectRatio: "16:9",
    skuMatch: "not_applicable",
    pageUsage: ["/announcements"],
    sectionUsage: ["notice-thumbnail"],
    mobileCropRule: "공지 제목은 HTML 텍스트로 유지하고 썸네일은 장식 정보를 최소화합니다.",
  },
  product_image: {
    sourceType: "A3",
    allowedUsage: ["product_card", "product_detail"],
    aspectRatio: "1:1",
    skuMatch: "needs_review",
    pageUsage: ["/products"],
    sectionUsage: ["product-card"],
    mobileCropRule: "제품 전체 외곽과 중량 표기가 잘리지 않는지 확인합니다.",
  },
};

export interface SiteAssetSignedUploadInput {
  returnTo?: string;
  targetKind?: string;
  applyToProduct?: boolean | string;
  connectToSlot?: boolean | string;
  usageKey?: string;
  productKey?: string;
  assetId?: string;
  originalFilename?: string;
  mimeType?: string;
  sizeBytes?: number;
  imageSourceType?: string;
  approvalStatus?: string;
  allowedUsage?: string[];
  relatedSku?: string[];
  skuMatch?: string;
  pageUsage?: string[];
  sectionUsage?: string[];
  altText?: string;
  aspectRatio?: string;
  mobileCropRule?: string;
  notes?: string | null;
  sortOrder?: number | string;
}

export interface PreparedSiteAssetSignedUpload {
  returnTo: string;
  targetKind: string;
  applyToProduct: boolean;
  connectToSlot: boolean;
  usageKey: SiteAssetUsageSlot | "";
  productKey: string;
  assetId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  imageSourceType: ImageSourceType;
  approvalStatus: ImageApprovalStatus;
  allowedUsage: ImageAllowedUsage[];
  relatedSku: string[];
  skuMatch: string;
  pageUsage: string[];
  sectionUsage: string[];
  altText: string;
  aspectRatio: string;
  mobileCropRule: string;
  notes: string | null;
  sortOrder: number;
  signedUrl: string;
  storageBucket: typeof siteAssetsBucket;
  storagePath: string;
  uploadErrorRedirectTo: string;
}

export interface SiteAssetFinalizeSignedUploadInput
  extends Omit<PreparedSiteAssetSignedUpload, "signedUrl" | "uploadErrorRedirectTo"> {
  checksum: string;
}

export type SiteAssetSignedUploadResult =
  | {
      ok: true;
      upload: PreparedSiteAssetSignedUpload;
      redirectTo?: never;
      status?: never;
    }
  | {
      ok: false;
      status: string;
      redirectTo: string;
      upload?: never;
    };

function normalizeStringList(values: unknown) {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

function asBooleanFlag(value: unknown) {
  return value === true || value === "true" || value === "1" || value === "on";
}

function asSourceType(value: string): ImageSourceType {
  return allowedSourceTypes.includes(value as ImageSourceType) ? (value as ImageSourceType) : "A3";
}

function asApprovalStatus(value: string): ImageApprovalStatus {
  if (allowedApprovalStatuses.includes(value as ImageApprovalStatus)) return value as ImageApprovalStatus;
  return "approved";
}

function asAllowedUsageList(values: string[]) {
  const selected = values.filter((value): value is ImageAllowedUsage =>
    allowedUsages.includes(value as ImageAllowedUsage),
  );
  return selected.length ? selected : (["candidate_preview"] as ImageAllowedUsage[]);
}

function asUsageSlot(value: unknown): SiteAssetUsageSlot | "" {
  if (typeof value !== "string") return "";
  if (Object.prototype.hasOwnProperty.call(slotAllowedUsage, value)) return value as SiteAssetUsageSlot;
  return "";
}

function asSortOrder(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 0;
  return Math.max(-2_000_000_000, Math.min(2_000_000_000, Math.trunc(numberValue)));
}

function getExtension(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function getSafeReturnPath(value: string) {
  if (value === "/admin/products" || value.startsWith("/admin/products?")) return value;
  if (value === "/admin/media" || value.startsWith("/admin/media?")) return value;
  return "/admin/media";
}

function withStatus(path: string, status: string, extraParams: Record<string, string> = {}) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("status", status);
  for (const [key, value] of Object.entries(extraParams)) {
    if (value) params.set(key, value);
  }
  return `${pathname}?${params.toString()}`;
}

function getSafeFilename(value: string) {
  return value.replace(/\\/g, "/").split("/").pop()?.trim() || "image";
}

function isSafeStoragePath(value: string, mimeType: string) {
  const extension = getExtension(mimeType);
  return new RegExp(`^uploads/\\d{4}/\\d{2}/[a-z0-9가-힣-]+\\.${extension}$`).test(value);
}

function isMissingBucketError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { statusCode?: string | number; status?: string | number; message?: string; error?: string };
  const status = Number(maybeError.statusCode ?? maybeError.status);
  const message = `${maybeError.message ?? ""} ${maybeError.error ?? ""}`;
  return status === 404 || /bucket.*not.*found|not.*found|does not exist/i.test(message);
}

function isBucketAlreadyExistsError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { statusCode?: string | number; status?: string | number; message?: string; error?: string };
  const status = Number(maybeError.statusCode ?? maybeError.status);
  const message = `${maybeError.message ?? ""} ${maybeError.error ?? ""}`;
  return status === 409 || /already exists|duplicate/i.test(message);
}

function isMissingMediaSchemaError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string; details?: string; hint?: string };
  const message = `${maybeError.message ?? ""} ${maybeError.details ?? ""} ${maybeError.hint ?? ""}`;
  return (
    maybeError.code === "42P01" ||
    maybeError.code === "PGRST205" ||
    /site_assets|site_asset_usages|media_change_history|schema cache|relation .* does not exist/i.test(message)
  );
}

function getUploadErrorSummary(error: unknown) {
  if (!error || typeof error !== "object") {
    return { message: String(error) };
  }

  const maybeError = error as {
    code?: string;
    details?: string;
    error?: string;
    hint?: string;
    message?: string;
    name?: string;
    status?: string | number;
    statusCode?: string | number;
  };

  return {
    name: maybeError.name,
    code: maybeError.code,
    status: maybeError.status,
    statusCode: maybeError.statusCode,
    message: maybeError.message,
    error: maybeError.error,
    details: maybeError.details,
    hint: maybeError.hint,
  };
}

async function ensureSiteAssetsBucket(client: ReturnType<typeof getSupabaseAdminClient>) {
  const bucketOptions = {
    public: true,
    fileSizeLimit: maxUploadBytes,
    allowedMimeTypes: Array.from(allowedMimeTypes),
  };
  const { data: bucket, error: lookupError } = await client.storage.getBucket(siteAssetsBucket);

  if (!lookupError && bucket) {
    const storedLimit = Number(bucket.file_size_limit ?? bucketOptions.fileSizeLimit);
    const storedMimeTypes = new Set(bucket.allowed_mime_types ?? bucketOptions.allowedMimeTypes);
    const mimeTypesMatch = bucketOptions.allowedMimeTypes.every((mimeType) => storedMimeTypes.has(mimeType));
    if (!bucket.public || storedLimit !== bucketOptions.fileSizeLimit || !mimeTypesMatch) {
      const { error: updateError } = await client.storage.updateBucket(siteAssetsBucket, bucketOptions);
      if (updateError) throw updateError;
    }
    return;
  }

  if (lookupError && !isMissingBucketError(lookupError)) {
    throw lookupError;
  }

  const { error: createError } = await client.storage.createBucket(siteAssetsBucket, bucketOptions);
  if (createError && !isBucketAlreadyExistsError(createError)) {
    throw createError;
  }
}

function getPreparedUploadMetadata(input: SiteAssetSignedUploadInput, prepared?: {
  assetId?: string;
  storagePath?: string;
}): Omit<PreparedSiteAssetSignedUpload, "signedUrl" | "uploadErrorRedirectTo"> | null {
  const returnPath = getSafeReturnPath(typeof input.returnTo === "string" ? input.returnTo : "/admin/media");
  const targetKind = typeof input.targetKind === "string" && input.targetKind.trim()
    ? input.targetKind.trim()
    : "media_upload";
  const preset = operatorUploadPresets[targetKind];
  const mimeType = typeof input.mimeType === "string" ? input.mimeType : "";
  const sizeBytes = Number(input.sizeBytes);
  const originalFilename = getSafeFilename(typeof input.originalFilename === "string" ? input.originalFilename : "");
  const altText = typeof input.altText === "string" ? input.altText.trim() : "";

  if (!originalFilename || !allowedMimeTypes.has(mimeType) || !Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > maxUploadBytes) {
    return null;
  }
  if (!altText) {
    return null;
  }

  const assetSlug = slugify(input.assetId || `${targetKind}-${originalFilename.replace(/\.[^.]+$/, "")}`) || "site-asset";
  const now = new Date();
  const monthPath = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const assetId = prepared?.assetId || `${assetSlug}-${now.getTime()}`;
  const storagePath = prepared?.storagePath || `uploads/${monthPath}/${assetId}.${getExtension(mimeType)}`;
  if (!assetId || !isSafeStoragePath(storagePath, mimeType)) {
    return null;
  }

  const pageUsage = normalizeStringList(input.pageUsage);
  const sectionUsage = normalizeStringList(input.sectionUsage);
  const usageKey = asUsageSlot(input.usageKey);
  const connectToSlot = asBooleanFlag(input.connectToSlot) && Boolean(usageKey);

  return {
    returnTo: returnPath,
    targetKind,
    applyToProduct: asBooleanFlag(input.applyToProduct),
    connectToSlot,
    usageKey,
    productKey: typeof input.productKey === "string" ? input.productKey.trim() : "",
    assetId,
    storageBucket: siteAssetsBucket,
    storagePath,
    originalFilename,
    mimeType,
    sizeBytes,
    imageSourceType: preset?.sourceType ?? asSourceType(typeof input.imageSourceType === "string" ? input.imageSourceType : "A3"),
    approvalStatus: asApprovalStatus(typeof input.approvalStatus === "string" ? input.approvalStatus : "approved"),
    allowedUsage: preset?.allowedUsage ?? asAllowedUsageList(normalizeStringList(input.allowedUsage)),
    relatedSku: normalizeStringList(input.relatedSku),
    skuMatch: typeof input.skuMatch === "string" && input.skuMatch.trim()
      ? input.skuMatch.trim()
      : preset?.skuMatch ?? "not_applicable",
    pageUsage: pageUsage.length ? pageUsage : preset?.pageUsage ?? [],
    sectionUsage: sectionUsage.length ? sectionUsage : preset?.sectionUsage ?? [],
    altText,
    aspectRatio: typeof input.aspectRatio === "string" && input.aspectRatio.trim()
      ? input.aspectRatio.trim()
      : preset?.aspectRatio ?? "unknown",
    mobileCropRule: typeof input.mobileCropRule === "string" && input.mobileCropRule.trim()
      ? input.mobileCropRule.trim()
      : preset?.mobileCropRule ?? "Review crop before public use.",
    notes: typeof input.notes === "string" && input.notes.trim() ? input.notes.trim() : null,
    sortOrder: asSortOrder(input.sortOrder),
  };
}

function getFailedUploadResult(returnPath: string, status: string): SiteAssetSignedUploadResult {
  return { ok: false, status, redirectTo: withStatus(returnPath, status) };
}

async function applyUploadedProductImage({
  assetId,
  publicUrl,
  metadata,
}: {
  assetId: string;
  publicUrl: string;
  metadata: Omit<PreparedSiteAssetSignedUpload, "signedUrl" | "uploadErrorRedirectTo">;
}) {
  if (!metadata.applyToProduct || metadata.targetKind !== "product_image") return false;

  const productKeys = [metadata.productKey, ...metadata.relatedSku].map((value) => value.trim()).filter(Boolean);
  if (!productKeys.length) return false;

  const repository = getRepository();
  const products = await repository.getProducts({ includeHidden: true });
  const product = products.find((item) => productKeys.includes(item.id) || productKeys.includes(item.slug));
  const canonicalProduct = productKeys
    .map((key) => getCanonicalPublicProductBySlug(key))
    .find((item) => item !== null);
  const targetProduct = canonicalProduct ?? product;
  if (!targetProduct) return false;

  await repository.upsertProduct({
    id: product?.id || undefined,
    category: targetProduct.category,
    subcategory: targetProduct.subcategory,
    name: targetProduct.name,
    slug: targetProduct.slug,
    shortDescription: targetProduct.shortDescription,
    description: targetProduct.description,
    imageUrl: publicUrl,
    imageAssetId: assetId,
    specs: targetProduct.specs,
    status: targetProduct.status,
    displayOrder: targetProduct.displayOrder,
    isFeatured: targetProduct.isFeatured,
    priceVisible: targetProduct.priceVisible,
    priceBasis: targetProduct.priceBasis,
    weightGrams: targetProduct.weightGrams,
    makingFee: targetProduct.makingFee,
    manualPrice: targetProduct.manualPrice,
    priceLabel: targetProduct.priceLabel,
    priceNote: targetProduct.priceNote,
    publicNote: targetProduct.publicNote,
  });

  return true;
}

export async function createSiteAssetSignedUploadAction(
  input: SiteAssetSignedUploadInput,
): Promise<SiteAssetSignedUploadResult> {
  const returnPath = getSafeReturnPath(typeof input.returnTo === "string" ? input.returnTo : "/admin/media");
  await requireAdminActionSession(returnPath);

  if (!isSupabaseConfigured()) {
    return getFailedUploadResult(returnPath, "demo");
  }

  const metadata = getPreparedUploadMetadata(input);
  if (!metadata) {
    return getFailedUploadResult(returnPath, input.altText ? "invalid-file" : "invalid-meta");
  }

  const client = getSupabaseAdminClient();
  try {
    await ensureSiteAssetsBucket(client);
  } catch (error) {
    console.error("[media-upload] site-assets bucket setup failed before signed upload", getUploadErrorSummary(error));
    return getFailedUploadResult(returnPath, "storage-setup-error");
  }

  const { data, error } = await client.storage.from(siteAssetsBucket).createSignedUploadUrl(metadata.storagePath);

  if (error || !data?.signedUrl) {
    console.error("[media-upload] signed upload URL creation failed", getUploadErrorSummary(error));
    return getFailedUploadResult(returnPath, "upload-error");
  }

  return {
    ok: true,
    upload: {
      ...metadata,
      signedUrl: data.signedUrl,
      uploadErrorRedirectTo: withStatus(returnPath, "upload-error"),
    },
  };
}

export async function cleanupSiteAssetSignedUploadAction(input: Pick<SiteAssetFinalizeSignedUploadInput, "returnTo" | "storagePath">) {
  const returnPath = getSafeReturnPath(typeof input.returnTo === "string" ? input.returnTo : "/admin/media");
  await requireAdminActionSession(returnPath);
  if (!isSupabaseConfigured() || typeof input.storagePath !== "string" || !input.storagePath.startsWith("uploads/")) return;
  await getSupabaseAdminClient().storage.from(siteAssetsBucket).remove([input.storagePath]);
}

export async function finalizeSiteAssetSignedUploadAction(
  input: SiteAssetFinalizeSignedUploadInput,
): Promise<SiteAssetSignedUploadResult> {
  const returnPath = getSafeReturnPath(typeof input.returnTo === "string" ? input.returnTo : "/admin/media");
  await requireAdminActionSession(returnPath);

  if (!isSupabaseConfigured()) {
    return getFailedUploadResult(returnPath, "demo");
  }

  const metadata = getPreparedUploadMetadata(input, {
    assetId: input.assetId,
    storagePath: input.storagePath,
  });
  if (!metadata) {
    return getFailedUploadResult(returnPath, "invalid-meta");
  }
  if (!/^sha256:[a-f0-9]{64}$/i.test(input.checksum)) {
    await getSupabaseAdminClient().storage.from(siteAssetsBucket).remove([metadata.storagePath]);
    return getFailedUploadResult(returnPath, "invalid-meta");
  }

  const client = getSupabaseAdminClient();
  const { error: infoError } = await client.storage.from(siteAssetsBucket).info(metadata.storagePath);
  if (infoError) {
    console.error("[media-upload] signed upload object lookup failed", getUploadErrorSummary(infoError));
    return getFailedUploadResult(returnPath, "upload-error");
  }

  const { data: publicUrlData } = client.storage.from(siteAssetsBucket).getPublicUrl(metadata.storagePath);
  const publicUrl = publicUrlData.publicUrl;
  const repository = getRepository();

  let createdAssetId = "";

  try {
    const createdAsset = await repository.createSiteAsset({
      assetId: metadata.assetId,
      filePath: publicUrl,
      publicUrl,
      storageBucket: siteAssetsBucket,
      storagePath: metadata.storagePath,
      originalFilename: metadata.originalFilename,
      mimeType: metadata.mimeType,
      sizeBytes: metadata.sizeBytes,
      checksum: input.checksum.toLowerCase(),
      imageSourceType: metadata.imageSourceType,
      approvalStatus: metadata.approvalStatus,
      allowedUsage: metadata.allowedUsage,
      relatedSku: metadata.relatedSku,
      skuMatch: metadata.skuMatch,
      pageUsage: metadata.pageUsage,
      sectionUsage: metadata.sectionUsage,
      altText: metadata.altText,
      aspectRatio: metadata.aspectRatio,
      mobileCropRule: metadata.mobileCropRule,
      notes: metadata.notes,
    });
    createdAssetId = createdAsset.id;
  } catch (error) {
    await client.storage.from(siteAssetsBucket).remove([metadata.storagePath]);
    console.error("[media-upload] site-assets metadata save failed", getUploadErrorSummary(error));
    return getFailedUploadResult(returnPath, isMissingMediaSchemaError(error) ? "media-schema-error" : "metadata-error");
  }

  let productImageApplied = false;
  let slotImageApplied = false;
  try {
    productImageApplied = await applyUploadedProductImage({
      assetId: createdAssetId,
      publicUrl,
      metadata,
    });
  } catch (error) {
    console.error("[media-upload] product image auto-apply failed", getUploadErrorSummary(error));
    return {
      ok: false,
      status: "product-image-error",
      redirectTo: withStatus(returnPath, "product-image-error", { uploadedAssetId: createdAssetId }),
    };
  }

  if (metadata.connectToSlot && metadata.usageKey) {
    const allowed = slotAllowedUsage[metadata.usageKey] ?? [];
    if (!allowed.some((usage) => metadata.allowedUsage.includes(usage))) {
      return {
        ok: false,
        status: "connect-blocked",
        redirectTo: withStatus(returnPath, "connect-blocked", { uploadedAssetId: createdAssetId }),
      };
    }

    try {
      await repository.upsertSiteAssetUsage({
        usageKey: metadata.usageKey,
        assetId: createdAssetId,
        pagePath: metadata.pageUsage[0] ?? "/",
        sectionUsage: metadata.sectionUsage[0] ?? metadata.usageKey,
        sortOrder: metadata.sortOrder,
        isActive: true,
      });
      slotImageApplied = true;
    } catch (error) {
      console.error("[media-upload] slot image auto-apply failed", getUploadErrorSummary(error));
      return {
        ok: false,
        status: "connect-error",
        redirectTo: withStatus(returnPath, "connect-error", { uploadedAssetId: createdAssetId }),
      };
    }
  }

  const status = productImageApplied ? "image-saved" : slotImageApplied ? "image-applied" : "uploaded";

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/admin/media");
  revalidatePath("/admin/products");
  return {
    ok: false,
    status,
    redirectTo: withStatus(
      returnPath,
      status,
      createdAssetId && (metadata.targetKind === "product_image" || slotImageApplied)
        ? { uploadedAssetId: createdAssetId }
        : {},
    ),
  };
}

export async function connectSiteAssetUsageAction(formData: FormData) {
  await requireAdminActionSession("/admin/media");

  if (!isSupabaseConfigured()) {
    redirect("/admin/media?status=demo");
  }

  const usageKey = ensureString(formData.get("usageKey")) as SiteAssetUsageSlot;
  const assetId = ensureString(formData.get("assetId"));
  const repository = getRepository();
  const assets = await repository.getSiteAssets();
  const asset = assets.find((item) => item.id === assetId);
  const allowed = slotAllowedUsage[usageKey] ?? [];

  if (!asset || asset.approvalStatus !== "approved" || !allowed.some((usage) => asset.allowedUsage.includes(usage))) {
    redirect("/admin/media?status=connect-blocked");
  }

  try {
    await repository.upsertSiteAssetUsage({
      usageKey,
      assetId,
      pagePath: ensureString(formData.get("pagePath"), "/"),
      sectionUsage: ensureString(formData.get("sectionUsage"), usageKey),
      sortOrder: ensureNumber(formData.get("sortOrder"), 100),
      isActive: toBoolean(formData.get("isActive")),
    });
  } catch {
    redirect("/admin/media?status=connect-error");
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/services");
  revalidatePath("/about");
  revalidatePath("/company");
  revalidatePath("/admin/media");
  redirect("/admin/media?status=connected");
}

export async function updateSiteAssetApprovalAction(formData: FormData) {
  await requireAdminActionSession("/admin/media");

  if (!isSupabaseConfigured()) {
    redirect("/admin/media?status=demo");
  }

  const assetId = ensureString(formData.get("assetId"));
  const approvalStatus = ensureString(formData.get("approvalStatus"), "needs_review");
  if (!["approved", "needs_review", "candidate", "quarantined", "rejected"].includes(approvalStatus)) {
    redirect("/admin/media?status=invalid-meta");
  }
  const client = getSupabaseAdminClient();
  const { error } = await client
    .from("site_assets")
    .update({
      approval_status: approvalStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assetId);

  if (error) {
    redirect("/admin/media?status=metadata-error");
  }

  await client.from("media_change_history").insert({
    asset_id: assetId,
    changed_by: "관리자",
    change_type: "approval",
    payload: {
      approval_status: approvalStatus,
      operator_direct: true,
    },
  });

  revalidatePath("/admin/media");
  redirect("/admin/media?status=approval-updated");
}
