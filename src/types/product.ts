export type ProductCategory =
  | "gold_bar"
  | "silver_bar"
  | "jewelry"
  | "purchase_guide"
  | "coming_soon";

export type ProductStatus = "active" | "coming_soon" | "hidden";

export interface Product {
  id: string;
  category: ProductCategory;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageUrl: string | null;
  status: ProductStatus;
  priceVisible: boolean;
  priceNote: string | null;
  createdAt: string;
  updatedAt: string;
}
