import imageAssetManifestJson from "@/data/imageAssetManifest.json";

export type ImageSourceType = "A1" | "A2" | "A3" | "B" | "C" | "D" | "E" | "F";
export type ImageApprovalStatus = "approved" | "candidate" | "rejected" | "quarantined" | "needs_review";
export type ImageAllowedUsage =
  | "admin_reference"
  | "b2b_category"
  | "brand_identity"
  | "candidate_preview"
  | "category_card"
  | "company_hero"
  | "hero"
  | "notice_template"
  | "product_card"
  | "product_detail"
  | "product_guide"
  | "product_placeholder"
  | "quarantine_reference"
  | "service_hero"
  | "social_preview"
  | "store_guide_hero";

export interface ImageAssetManifestEntry {
  asset_id: string;
  file_path: string;
  image_source_type: ImageSourceType;
  approval_status: ImageApprovalStatus;
  allowed_usage: ImageAllowedUsage[];
  related_sku: string[];
  sku_match: string;
  page_usage: string[];
  section_usage: string[];
  alt_text: string;
  aspect_ratio: string;
  mobile_crop_rule: string;
  hash_or_checksum: string;
  notes: string;
}

export const imageAssetManifest = imageAssetManifestJson as ImageAssetManifestEntry[];

const imageAssetByPath = new Map(imageAssetManifest.map((asset) => [asset.file_path, asset]));
const generatedCandidatePrefix = "/assets/generated/candidates/";
const productUsages: ImageAllowedUsage[] = ["product_card", "product_detail", "product_placeholder", "category_card"];

export function getImageAssetByPath(filePath: string) {
  return imageAssetByPath.get(filePath) ?? null;
}

export function isGeneratedCandidateAssetPath(filePath: string) {
  return filePath.startsWith(generatedCandidatePrefix);
}

export function isApprovedImageAssetForUsage(filePath: string, usage: ImageAllowedUsage) {
  if (isGeneratedCandidateAssetPath(filePath)) return false;
  const asset = getImageAssetByPath(filePath);
  return Boolean(asset && asset.approval_status === "approved" && asset.allowed_usage.includes(usage));
}

export function isApprovedOperationalProductImagePath(filePath: string) {
  if (isGeneratedCandidateAssetPath(filePath)) return false;
  const asset = getImageAssetByPath(filePath);
  return Boolean(
    asset &&
      asset.approval_status === "approved" &&
      productUsages.some((usage) => asset.allowed_usage.includes(usage)),
  );
}

export function isLockedGoldbarSkuImagePath(filePath: string) {
  const asset = getImageAssetByPath(filePath);
  return Boolean(
    asset &&
      asset.approval_status === "approved" &&
      (asset.image_source_type === "A1" || asset.image_source_type === "A2") &&
      asset.related_sku.length > 0 &&
      asset.allowed_usage.some((usage) => usage === "product_card" || usage === "product_detail"),
  );
}

export function getApprovedProductImageAssets() {
  return imageAssetManifest
    .filter((asset) => isApprovedOperationalProductImagePath(asset.file_path))
    .sort((a, b) => a.alt_text.localeCompare(b.alt_text, "ko"));
}

export function isTrustedSiteAssetUrl(value: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;
  return value.startsWith(`${supabaseUrl}/storage/v1/object/public/site-assets/`);
}
