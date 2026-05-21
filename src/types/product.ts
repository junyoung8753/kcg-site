export type ProductCategory =
  | "gold_bar"
  | "silver_bar"
  | "pure_gold"
  | "jewelry"
  | "purchase_guide"
  | "custom_order";

export type ProductStatus = "active" | "inquiry_required" | "hidden";

export type ProductPriceBasis =
  | "gold_24k_sell"
  | "gold_24k_buy"
  | "gold_18k_buy"
  | "gold_14k_buy"
  | "platinum_sell"
  | "platinum_buy"
  | "silver_sell"
  | "silver_buy"
  | "manual"
  | "inquiry";

export interface Product {
  id: string;
  category: ProductCategory;
  subcategory: string | null;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageUrl: string | null;
  imageAssetId?: string | null;
  specs: string[];
  status: ProductStatus;
  displayOrder: number;
  isFeatured: boolean;
  priceVisible: boolean;
  priceBasis: ProductPriceBasis;
  weightGrams: number | null;
  makingFee: number | null;
  manualPrice: number | null;
  priceLabel: string;
  priceNote: string | null;
  publicNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductUpsertInput {
  id?: string;
  category: ProductCategory;
  subcategory: string | null;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageUrl: string | null;
  imageAssetId?: string | null;
  specs: string[];
  status: ProductStatus;
  displayOrder: number;
  isFeatured: boolean;
  priceVisible: boolean;
  priceBasis: ProductPriceBasis;
  weightGrams: number | null;
  makingFee: number | null;
  manualPrice: number | null;
  priceLabel: string;
  priceNote: string | null;
  publicNote: string | null;
}
