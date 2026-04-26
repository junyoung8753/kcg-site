export type ProductCategory =
  | "gold_bar"
  | "silver_bar"
  | "jewelry"
  | "purchase_guide"
  | "custom_order";

export type ProductStatus = "active" | "inquiry_required" | "hidden";

export interface Product {
  id: string;
  category: ProductCategory;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageUrl: string | null;
  specs: string[];
  status: ProductStatus;
  displayOrder: number;
  isFeatured: boolean;
  priceVisible: boolean;
  priceLabel: string;
  priceNote: string | null;
  publicNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductUpsertInput {
  id?: string;
  category: ProductCategory;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageUrl: string | null;
  specs: string[];
  status: ProductStatus;
  displayOrder: number;
  isFeatured: boolean;
  priceVisible: boolean;
  priceLabel: string;
  priceNote: string | null;
  publicNote: string | null;
}
