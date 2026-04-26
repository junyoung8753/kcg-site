"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRepository } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { ensureNumber, ensureString, slugify, toBoolean } from "@/lib/utils";
import type { ProductCategory, ProductStatus } from "@/types/product";

const validCategories: ProductCategory[] = ["gold_bar", "silver_bar", "jewelry", "purchase_guide", "custom_order"];
const validStatuses: ProductStatus[] = ["active", "inquiry_required", "hidden"];

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

export async function upsertProductAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/admin/products?status=demo");
  }

  const name = ensureString(formData.get("name")).trim();
  const slugInput = ensureString(formData.get("slug")).trim();
  const shortDescription = ensureString(formData.get("shortDescription")).trim();
  const description = ensureString(formData.get("description")).trim();
  const priceLabel = ensureString(formData.get("priceLabel"), "전화 문의").trim();

  if (!name || !shortDescription || !description || !priceLabel) {
    redirect("/admin/products?status=invalid");
  }

  try {
    const repository = getRepository();
    await repository.upsertProduct({
      id: ensureString(formData.get("id")).trim() || undefined,
      category: asProductCategory(ensureString(formData.get("category"))),
      name,
      slug: slugify(slugInput || name),
      shortDescription,
      description,
      imageUrl: ensureString(formData.get("imageUrl")).trim() || null,
      specs: parseSpecs(formData.get("specs")),
      status: asProductStatus(ensureString(formData.get("status"))),
      displayOrder: ensureNumber(formData.get("displayOrder"), 100),
      isFeatured: toBoolean(formData.get("isFeatured")),
      priceVisible: toBoolean(formData.get("priceVisible")),
      priceLabel,
      priceNote: ensureString(formData.get("priceNote")).trim() || null,
      publicNote: ensureString(formData.get("publicNote")).trim() || null,
    });
  } catch {
    redirect("/admin/products?status=error");
  }

  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products?status=saved");
}
