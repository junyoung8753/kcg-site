"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminActionSession } from "@/lib/auth/admin-action";
import { getRepository } from "@/lib/data";
import {
  isApprovedOperationalProductImagePath,
  isGeneratedCandidateAssetPath,
  isTrustedSiteAssetUrl,
} from "@/lib/image-asset-manifest";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { ensureNumber, ensureString, slugify, toBoolean } from "@/lib/utils";
import type { ProductCategory, ProductPriceBasis, ProductStatus } from "@/types/product";

const validCategories: ProductCategory[] = [
  "gold_bar",
  "silver_bar",
  "pure_gold",
  "jewelry",
  "purchase_guide",
  "custom_order",
];
const validStatuses: ProductStatus[] = ["active", "inquiry_required", "hidden"];
const validPriceBases: ProductPriceBasis[] = [
  "gold_24k_sell",
  "gold_24k_buy",
  "gold_18k_buy",
  "gold_14k_buy",
  "platinum_sell",
  "platinum_buy",
  "silver_sell",
  "silver_buy",
  "manual",
  "inquiry",
];

function parseSpecs(value: FormDataEntryValue | null) {
  return ensureString(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function asProductCategory(value: string): ProductCategory {
  return validCategories.includes(value as ProductCategory) ? (value as ProductCategory) : "gold_bar";
}

function asProductStatus(value: string): ProductStatus {
  return validStatuses.includes(value as ProductStatus) ? (value as ProductStatus) : "inquiry_required";
}

function asPriceBasis(value: string): ProductPriceBasis {
  return validPriceBases.includes(value as ProductPriceBasis) ? (value as ProductPriceBasis) : "inquiry";
}

function optionalNumber(value: FormDataEntryValue | null) {
  const raw = ensureString(value).replace(/,/g, "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function validateProductImagePath(value: string | null) {
  if (!value) return null;
  if (isGeneratedCandidateAssetPath(value)) return null;
  if (value.startsWith("/") && isApprovedOperationalProductImagePath(value)) return value;
  if (isTrustedSiteAssetUrl(value)) return value;
  return null;
}

function getSafeProductsReturnPath(value: string) {
  if (value === "/admin/products" || value.startsWith("/admin/products?")) return value;
  return "/admin/products";
}

function withStatus(path: string, status: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}status=${status}`;
}

export async function upsertProductAction(formData: FormData) {
  await requireAdminActionSession("/admin/products");
  const returnPath = getSafeProductsReturnPath(ensureString(formData.get("returnTo"), "/admin/products"));

  if (!isSupabaseConfigured()) {
    redirect(withStatus(returnPath, "demo"));
  }

  const name = ensureString(formData.get("name")).trim();
  const slugInput = ensureString(formData.get("slug")).trim();
  const shortDescription = ensureString(formData.get("shortDescription")).trim();
  const description = ensureString(formData.get("description")).trim();
  const priceLabel = ensureString(formData.get("priceLabel"), "전화 문의").trim();

  if (!name || !shortDescription || !description || !priceLabel) {
    redirect(withStatus(returnPath, "invalid"));
  }

  try {
    const repository = getRepository();
    const productId = ensureString(formData.get("id")).trim();
    const siteAssetId = ensureString(formData.get("imageAssetId")).trim();
    const clearImage = toBoolean(formData.get("clearImageToPlaceholder"));
    const requestedImageUrl = clearImage ? null : ensureString(formData.get("imageUrl")).trim() || null;
    let imageUrl = validateProductImagePath(requestedImageUrl);
    let imageAssetId: string | null = null;

    if (siteAssetId && !clearImage) {
      const asset = (await repository.getSiteAssets()).find((item) => item.id === siteAssetId);
      if (
        !asset ||
        asset.approvalStatus !== "approved" ||
        !asset.allowedUsage.some((usage) => usage === "product_card" || usage === "product_detail" || usage === "category_card")
      ) {
        throw new Error("invalid-image");
      }
      imageUrl = asset.publicUrl;
      imageAssetId = asset.id;
    }

    if (requestedImageUrl && !imageUrl) {
      throw new Error("invalid-image");
    }

    await repository.upsertProduct({
      id: productId || undefined,
      category: asProductCategory(ensureString(formData.get("category"))),
      subcategory: ensureString(formData.get("subcategory")).trim() || null,
      name,
      slug: slugify(slugInput || name),
      shortDescription,
      description,
      imageUrl,
      imageAssetId,
      specs: parseSpecs(formData.get("specs")),
      status: asProductStatus(ensureString(formData.get("status"))),
      displayOrder: ensureNumber(formData.get("displayOrder"), 100),
      isFeatured: toBoolean(formData.get("isFeatured")),
      priceVisible: toBoolean(formData.get("priceVisible")),
      priceBasis: asPriceBasis(ensureString(formData.get("priceBasis"))),
      weightGrams: optionalNumber(formData.get("weightGrams")),
      makingFee: optionalNumber(formData.get("makingFee")),
      manualPrice: optionalNumber(formData.get("manualPrice")),
      priceLabel,
      priceNote: ensureString(formData.get("priceNote")).trim() || null,
      publicNote: ensureString(formData.get("publicNote")).trim() || null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid-image") {
      redirect(withStatus(returnPath, error.message));
    }
    redirect(withStatus(returnPath, "error"));
  }

  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect(withStatus(returnPath, "saved"));
}
