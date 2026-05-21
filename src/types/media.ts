import type {
  ImageAllowedUsage,
  ImageApprovalStatus,
  ImageSourceType,
} from "@/lib/image-asset-manifest";

export type SiteAssetUsageSlot =
  | "home_hero"
  | "products_hero"
  | "services_hero"
  | "store_guide_hero"
  | "company_hero"
  | "product_image";

export interface SiteAsset {
  id: string;
  assetId: string;
  filePath: string;
  publicUrl: string;
  storageBucket: string;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface SiteAssetUsage {
  id: string;
  usageKey: SiteAssetUsageSlot;
  assetId: string;
  pagePath: string;
  sectionUsage: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
}

export interface SiteAssetInput {
  assetId: string;
  filePath: string;
  publicUrl: string;
  storageBucket: string;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
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
}

export interface SiteAssetUsageInput {
  usageKey: SiteAssetUsageSlot;
  assetId: string;
  pagePath: string;
  sectionUsage: string;
  sortOrder: number;
  isActive: boolean;
}
