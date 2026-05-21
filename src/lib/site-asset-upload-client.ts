"use client";

import {
  cleanupSiteAssetSignedUploadAction,
  createSiteAssetSignedUploadAction,
  finalizeSiteAssetSignedUploadAction,
  type SiteAssetSignedUploadInput,
  type SiteAssetSignedUploadResult,
} from "@/actions/media-actions";
import { siteImageUploadMaxBytes } from "@/lib/site-upload-policy";

export type SiteAssetUploadPhase = "idle" | "preparing" | "hashing" | "uploading" | "saving" | "done" | "error";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getFormStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

export function getUploadStatusRedirect(form: HTMLFormElement, status: string) {
  const formData = new FormData(form);
  const returnTo = getFormString(formData, "returnTo") || "/admin/media";
  const [pathname, query = ""] = returnTo.split("?");
  const params = new URLSearchParams(query);
  params.set("status", status);
  return `${pathname}?${params.toString()}`;
}

function buildUploadInput(form: HTMLFormElement, file: File): SiteAssetSignedUploadInput {
  const formData = new FormData(form);
  return {
    returnTo: getFormString(formData, "returnTo"),
    targetKind: getFormString(formData, "targetKind"),
    applyToProduct: getFormString(formData, "applyToProduct"),
    connectToSlot: getFormString(formData, "connectToSlot"),
    usageKey: getFormString(formData, "usageKey"),
    productKey: getFormString(formData, "productKey"),
    assetId: getFormString(formData, "assetId"),
    originalFilename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    imageSourceType: getFormString(formData, "imageSourceType"),
    approvalStatus: getFormString(formData, "approvalStatus"),
    allowedUsage: getFormStringList(formData, "allowedUsage"),
    relatedSku: getFormStringList(formData, "relatedSku"),
    skuMatch: getFormString(formData, "skuMatch"),
    pageUsage: getFormStringList(formData, "pageUsage"),
    sectionUsage: getFormStringList(formData, "sectionUsage"),
    altText: getFormString(formData, "altText"),
    aspectRatio: getFormString(formData, "aspectRatio"),
    mobileCropRule: getFormString(formData, "mobileCropRule"),
    notes: getFormString(formData, "notes"),
    sortOrder: getFormString(formData, "sortOrder"),
  };
}

async function getSha256Checksum(file: File) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Browser crypto.subtle is required for upload checksum creation.");
  }
  const digest = await globalThis.crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return `sha256:${Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

async function uploadFileToSignedUrl(signedUrl: string, file: File) {
  const body = new FormData();
  body.append("cacheControl", "31536000");
  body.append("", file, file.name);

  const response = await fetch(signedUrl, {
    method: "PUT",
    headers: {
      "x-upsert": "false",
    },
    body,
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Supabase signed upload failed with ${response.status}: ${details.slice(0, 180)}`);
  }
}

export async function uploadSiteAssetFromForm(
  form: HTMLFormElement,
  file: File,
  onPhase?: (phase: SiteAssetUploadPhase) => void,
): Promise<SiteAssetSignedUploadResult> {
  if (file.size <= 0 || file.size > siteImageUploadMaxBytes) {
    return {
      ok: false,
      status: "invalid-file",
      redirectTo: getUploadStatusRedirect(form, "invalid-file"),
    };
  }

  onPhase?.("preparing");
  const prepared = await createSiteAssetSignedUploadAction(buildUploadInput(form, file));
  if (!prepared.ok) {
    onPhase?.("error");
    return prepared;
  }

  try {
    onPhase?.("hashing");
    const checksum = await getSha256Checksum(file);
    onPhase?.("uploading");
    await uploadFileToSignedUrl(prepared.upload.signedUrl, file);
    onPhase?.("saving");
    const finalized = await finalizeSiteAssetSignedUploadAction({
      ...prepared.upload,
      checksum,
    });
    onPhase?.(finalized.status === "uploaded" || finalized.status === "image-saved" || finalized.status === "image-applied" ? "done" : "error");
    return finalized;
  } catch (error) {
    onPhase?.("error");
    console.error("[media-upload] browser signed upload failed", error);
    await cleanupSiteAssetSignedUploadAction(prepared.upload).catch((cleanupError) => {
      console.error("[media-upload] browser signed upload cleanup failed", cleanupError);
    });
    return {
      ok: false,
      status: "upload-error",
      redirectTo: prepared.upload.uploadErrorRedirectTo,
    };
  }
}
