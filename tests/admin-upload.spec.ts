import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";

const adminPassword = process.env.KCG_TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "0000";
const allowRealUploadSmoke = process.env.KCG_ALLOW_REAL_UPLOAD_SMOKE === "1";
const externalUploadFile = process.env.KCG_UPLOAD_SMOKE_FILE;
const externalBaseUrl = process.env.SITE_AUDIT_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const operatorUploadBytes = 8_200_000;
const tinyJpeg = Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Ap//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z", "base64");
const smokeProductSlug = "investment-gold-bar-consulting";
const fallbackMediaBucket = "site-assets-meta";

type UploadSmokeDatabase = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          image_asset_id?: string | null;
          image_url: string | null;
          slug: string;
        };
        Insert: {
          id?: string;
          image_asset_id?: string | null;
          image_url?: string | null;
          slug?: string;
        };
        Update: {
          image_asset_id?: string | null;
          image_url?: string | null;
        };
        Relationships: [];
      };
      site_assets: {
        Row: {
          asset_id: string;
          id: string;
          original_filename: string | null;
          storage_path: string | null;
        };
        Insert: {
          asset_id?: string;
          id?: string;
          original_filename?: string | null;
          storage_path?: string | null;
        };
        Update: {
          asset_id?: string;
          original_filename?: string | null;
          storage_path?: string | null;
        };
        Relationships: [];
      };
      site_asset_usages: {
        Row: {
          asset_id: string;
          id: string;
        };
        Insert: {
          asset_id?: string;
          id?: string;
        };
        Update: {
          asset_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
type SupabaseTestClient = ReturnType<typeof createClient<UploadSmokeDatabase>>;
type ProductImageSnapshot = {
  id: string;
  imageUrl: string | null;
  imageAssetId?: string | null;
  hasImageAssetId: boolean;
};

function createOperatorSizedJpeg() {
  return Buffer.concat([tinyJpeg, Buffer.alloc(operatorUploadBytes - tinyJpeg.length, 0)]);
}

function getUploadExtension() {
  if (!externalUploadFile || !existsSync(externalUploadFile)) return ".jpeg";
  const extension = path.extname(externalUploadFile).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg" || extension === ".png" || extension === ".webp") return extension;
  return ".jpeg";
}

function isMissingSchemaError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string; details?: string; hint?: string };
  const message = `${maybeError.message ?? ""} ${maybeError.details ?? ""} ${maybeError.hint ?? ""}`;
  return maybeError.code === "42P01" || maybeError.code === "PGRST205" || /site_assets|schema cache|does not exist/i.test(message);
}

function isMissingImageAssetColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string; details?: string; hint?: string };
  const message = `${maybeError.message ?? ""} ${maybeError.details ?? ""} ${maybeError.hint ?? ""}`;
  return maybeError.code === "42703" || /image_asset_id/i.test(message);
}

function getSupabaseTestClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) return;

  return createClient<UploadSmokeDatabase>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}

async function getProductImageSnapshot(client: SupabaseTestClient): Promise<ProductImageSnapshot | null> {
  const withAssetId = await client
    .from("products")
    .select("id, image_url, image_asset_id")
    .eq("slug", smokeProductSlug)
    .maybeSingle();

  if (!withAssetId.error && withAssetId.data) {
    return {
      id: withAssetId.data.id,
      imageUrl: withAssetId.data.image_url,
      imageAssetId: withAssetId.data.image_asset_id,
      hasImageAssetId: true,
    };
  }

  if (withAssetId.error && !isMissingImageAssetColumnError(withAssetId.error)) throw withAssetId.error;

  const withoutAssetId = await client
    .from("products")
    .select("id, image_url")
    .eq("slug", smokeProductSlug)
    .maybeSingle();

  if (withoutAssetId.error) throw withoutAssetId.error;
  if (!withoutAssetId.data) return null;

  return {
    id: withoutAssetId.data.id,
    imageUrl: withoutAssetId.data.image_url,
    hasImageAssetId: false,
  };
}

async function restoreProductImageSnapshot(client: SupabaseTestClient, snapshot: ProductImageSnapshot | null) {
  if (!snapshot) return;

  const payload = snapshot.hasImageAssetId
    ? { image_url: snapshot.imageUrl, image_asset_id: snapshot.imageAssetId ?? null }
    : { image_url: snapshot.imageUrl };
  const { error } = await client.from("products").update(payload).eq("id", snapshot.id);
  if (error) throw error;
}

async function removeFallbackSmokeUpload(client: SupabaseTestClient, smokeAssetPrefix: string, originalFilename: string) {
  const download = await client.storage.from(fallbackMediaBucket).download("site-assets.json");
  if (download.error) return;

  const payload = JSON.parse(await download.data.text()) as {
    assets?: Array<{
      assetId?: string;
      id?: string;
      originalFilename?: string;
      storagePath?: string;
    }>;
    updatedAt?: string;
  };
  const assets = Array.isArray(payload.assets) ? payload.assets : [];
  const smokeAssets = assets.filter(
    (asset) => asset.assetId?.startsWith(`${smokeAssetPrefix}-`) || asset.originalFilename === originalFilename,
  );

  const storagePaths = smokeAssets.map((asset) => asset.storagePath).filter(Boolean) as string[];
  const smokeAssetIds = new Set(smokeAssets.map((asset) => asset.id).filter(Boolean));
  if (storagePaths.length > 0) {
    const { error: storageError } = await client.storage.from("site-assets").remove(storagePaths);
    if (storageError) throw storageError;
  }

  if (smokeAssetIds.size > 0) {
    const usagesDownload = await client.storage.from(fallbackMediaBucket).download("site-asset-usages.json");
    if (!usagesDownload.error) {
      const usagesPayload = JSON.parse(await usagesDownload.data.text()) as {
        usages?: Array<{ assetId?: string }>;
      };
      const nextUsages = Array.isArray(usagesPayload.usages)
        ? usagesPayload.usages.filter((usage) => !usage.assetId || !smokeAssetIds.has(usage.assetId))
        : [];
      const { error: usagesUploadError } = await client.storage
        .from(fallbackMediaBucket)
        .upload(
          "site-asset-usages.json",
          JSON.stringify({ usages: nextUsages, updatedAt: new Date().toISOString() }, null, 2),
          { contentType: "application/json", upsert: true },
        );
      if (usagesUploadError) throw usagesUploadError;
    }
  }

  const nextAssets = assets.filter((asset) => !smokeAssets.includes(asset));
  const { error: uploadError } = await client.storage
    .from(fallbackMediaBucket)
    .upload(
      "site-assets.json",
      JSON.stringify({ assets: nextAssets, updatedAt: new Date().toISOString() }, null, 2),
      { contentType: "application/json", upsert: true },
    );
  if (uploadError) throw uploadError;
}

async function removeSmokeUpload(client: SupabaseTestClient, smokeAssetPrefix: string, originalFilename: string) {
  const { data: assets, error } = await client
    .from("site_assets")
    .select("id, asset_id, storage_path, original_filename")
    .or(`original_filename.eq.${originalFilename},asset_id.like.${smokeAssetPrefix}-%`);

  if (error) {
    if (isMissingSchemaError(error)) {
      await removeFallbackSmokeUpload(client, smokeAssetPrefix, originalFilename);
      return;
    }
    throw error;
  }
  if (!assets?.length) return;

  const assetIds = assets.map((asset) => asset.id);
  const { error: usageDeleteError } = await client.from("site_asset_usages").delete().in("asset_id", assetIds);
  if (usageDeleteError && !isMissingSchemaError(usageDeleteError)) throw usageDeleteError;

  const storagePaths = assets.map((asset) => asset.storage_path).filter((value): value is string => Boolean(value));
  if (storagePaths.length > 0) {
    const { error: storageError } = await client.storage.from("site-assets").remove(storagePaths);
    if (storageError) throw storageError;
  }

  const { error: deleteError } = await client
    .from("site_assets")
    .delete()
    .in(
      "id",
      assets.map((asset) => asset.id),
    );
  if (deleteError) throw deleteError;
}

test("admin media image upload accepts 8MB-class files and applies to the selected page image", async ({
  page,
}, testInfo) => {
  test.skip(
    Boolean(process.env.SITE_AUDIT_URL) && !allowRealUploadSmoke,
    "External admin upload smoke is opt-in to avoid production media mutations.",
  );
  test.skip(
    Boolean(supabaseUrl && supabaseServiceRoleKey) && !allowRealUploadSmoke,
    "Local Supabase-backed upload smoke is opt-in to avoid production media mutations.",
  );

  if (allowRealUploadSmoke) {
    if (externalBaseUrl) {
      expect(adminPassword).not.toBe("0000");
    }
    expect(supabaseUrl).toBeTruthy();
    expect(supabaseServiceRoleKey).toBeTruthy();
  }

  const uploadExtension = getUploadExtension();
  const smokeAssetPrefix = allowRealUploadSmoke ? `codex-media-image-smoke-${Date.now()}` : "operator-media-image-8mb";
  const originalFilename = allowRealUploadSmoke
    ? `codex-media-upload-smoke-${Date.now()}${uploadExtension}`
    : `operator-media-image-8mb${uploadExtension}`;
  const uploadPath = testInfo.outputPath(originalFilename);
  if (externalUploadFile && existsSync(externalUploadFile)) {
    copyFileSync(externalUploadFile, uploadPath);
  } else {
    writeFileSync(uploadPath, createOperatorSizedJpeg());
  }
  const client = allowRealUploadSmoke ? getSupabaseTestClient() : undefined;

  try {
    await page.goto("/admin/media?target=service", { waitUntil: "domcontentloaded" });
    if (/\/admin\/login/.test(page.url())) {
      await page.getByLabel("관리자 비밀번호").fill(adminPassword);
      await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
    }

    await expect(page).toHaveURL(/\/admin\/media/);
    await expect(page.getByRole("heading", { name: "서비스 이미지 교체" })).toBeVisible();
    await expect(page.getByTestId("admin-media-upload-form")).toBeVisible();
    await expect(page.getByTestId("admin-media-upload-form").locator('input[name="assetId"]')).toHaveValue("service-image");
    await page.locator('input[name="assetFile"]').setInputFiles(uploadPath);
    await expect(page.getByTestId("admin-media-selected-file")).toContainText("선택됨:");
    await expect(page.getByTestId("admin-media-selected-file")).toContainText(originalFilename);
    await page.getByTestId("admin-media-upload-form").getByRole("button", { name: "이 이미지로 바로 반영" }).click();

    if (allowRealUploadSmoke) {
      await expect(page).toHaveURL(/\/admin\/media\?target=service&status=image-applied&uploadedAssetId=[^&]+/);
      await expect(page.getByText("교체 완료 · 선택한 파일이 이 위치에 바로 반영되었습니다.")).toBeVisible();
    } else {
      await expect(page).toHaveURL(/\/admin\/media\?target=service&status=demo/);
      await expect(page.getByText("Supabase 미연결 상태에서는 업로드/연결이 비활성화됩니다.")).toBeVisible();
    }
  } finally {
    if (allowRealUploadSmoke && client) {
      await removeSmokeUpload(client, smokeAssetPrefix, originalFilename);
    }
  }
});

test("admin product image upload accepts 8MB-class files and returns to the 1돈 product selector", async ({
  page,
}, testInfo) => {
  test.skip(
    Boolean(process.env.SITE_AUDIT_URL) && !allowRealUploadSmoke,
    "External admin upload smoke is opt-in to avoid production media mutations.",
  );
  test.skip(
    Boolean(supabaseUrl && supabaseServiceRoleKey) && !allowRealUploadSmoke,
    "Local Supabase-backed upload smoke is opt-in to avoid production media mutations.",
  );

  if (allowRealUploadSmoke) {
    if (externalBaseUrl) {
      expect(adminPassword).not.toBe("0000");
    }
    expect(supabaseUrl).toBeTruthy();
    expect(supabaseServiceRoleKey).toBeTruthy();
  }

  const uploadExtension = getUploadExtension();
  const smokeAssetPrefix = allowRealUploadSmoke ? `codex-product-image-smoke-${Date.now()}` : "operator-product-image-8mb";
  const originalFilename = allowRealUploadSmoke
    ? `codex-upload-smoke-${Date.now()}${uploadExtension}`
    : `operator-product-image-8mb${uploadExtension}`;
  const uploadPath = testInfo.outputPath(originalFilename);
  if (externalUploadFile && existsSync(externalUploadFile)) {
    copyFileSync(externalUploadFile, uploadPath);
  } else {
    writeFileSync(uploadPath, createOperatorSizedJpeg());
  }
  const client = allowRealUploadSmoke ? getSupabaseTestClient() : undefined;
  const productSnapshot = client ? await getProductImageSnapshot(client) : null;

  try {
    await page.goto(`/admin/products?product=${smokeProductSlug}`, { waitUntil: "domcontentloaded" });
    if (/\/admin\/login/.test(page.url())) {
      await page.getByLabel("관리자 비밀번호").fill(adminPassword);
      await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
    }

    await expect(page).toHaveURL(/\/admin\/products/);
    await expect(page.getByTestId("admin-product-image-upload-form")).toBeVisible();
    await expect(page.getByTestId("admin-product-image-upload-form").locator('input[name="assetId"]')).toHaveValue(
      "investment-gold-bar-consulting-image",
    );
    await page.locator('input[name="assetFile"]').setInputFiles(uploadPath);
    await expect(page.getByTestId("admin-product-selected-file")).toContainText("선택됨:");
    await expect(page.getByTestId("admin-product-selected-file")).toContainText(originalFilename);
    await page.getByTestId("admin-product-image-upload-form").getByRole("button", { name: "이 사진으로 바로 교체" }).click();

    if (allowRealUploadSmoke) {
      await expect(page).toHaveURL(
        /\/admin\/products\?product=investment-gold-bar-consulting&status=image-saved&uploadedAssetId=[^&]+/,
      );
      await expect(page.getByText("교체 완료 · 선택한 파일이 이 상품 대표 사진으로 바로 반영되었습니다.")).toBeVisible();
      await expect(page.getByTestId("admin-product-image-workflow")).toContainText("업로드 이미지");
      await expect(page.getByText("업로드 이미지 선택")).toBeHidden();
    } else {
      await expect(page).toHaveURL(/\/admin\/products\?product=investment-gold-bar-consulting&status=demo/);
      await expect(page.getByText("Supabase 미연결 상태에서는 저장이 비활성화됩니다.")).toBeVisible();
    }
  } finally {
    if (allowRealUploadSmoke && client) {
      await restoreProductImageSnapshot(client, productSnapshot);
      await removeSmokeUpload(client, smokeAssetPrefix, originalFilename);
    }
  }
});
