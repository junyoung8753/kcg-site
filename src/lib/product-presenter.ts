import type { Product, ProductCategory, ProductStatus } from "@/types/product";

export const productCategoryLabels: Record<ProductCategory, string> = {
  gold_bar: "골드바",
  silver_bar: "실버바",
  jewelry: "고금·주얼리",
  purchase_guide: "매입 안내",
  custom_order: "기념품·특수 제작",
};

export const productStatusLabels: Record<ProductStatus, string> = {
  active: "상담 가능",
  inquiry_required: "사전 문의 필요",
  hidden: "비공개",
};

export function getProductCategoryLabel(category: ProductCategory) {
  return productCategoryLabels[category];
}

export function getProductStatusLabel(status: ProductStatus) {
  return productStatusLabels[status];
}

export function getProductPriceLabel(product: Product) {
  if (product.priceVisible) return product.priceLabel;
  return product.priceLabel || "전화 문의";
}

export function getProductFallbackImage(category: ProductCategory) {
  if (category === "gold_bar") return "/campaign/kcg-hero-gold-bars.jpg";
  if (category === "silver_bar" || category === "custom_order") return "/campaign/kcg-hero-metal-bars.jpg";
  return "/campaign/kcg-hero-consulting.jpg";
}

export function getProductImageSrc(product: Product) {
  const imageUrl = product.imageUrl?.trim();
  if (imageUrl?.startsWith("/")) return imageUrl;
  return getProductFallbackImage(product.category);
}

export function sortProductsForPublic(products: Product[]) {
  return [...products].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return a.name.localeCompare(b.name, "ko");
  });
}
