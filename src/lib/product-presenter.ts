import { formatWon } from "@/lib/format";
import type { PriceCategory, PriceRecord } from "@/types/price";
import type { Product, ProductCategory, ProductPriceBasis, ProductStatus } from "@/types/product";

export const productCategoryLabels: Record<ProductCategory, string> = {
  gold_bar: "골드바",
  silver_bar: "실버바",
  pure_gold: "순금제품",
  jewelry: "고금·주얼리 매입",
  purchase_guide: "매입 안내",
  custom_order: "B2B·기업",
};

export const productStatusLabels: Record<ProductStatus, string> = {
  active: "상담 가능",
  inquiry_required: "사전 문의 필요",
  hidden: "비공개",
};

export const productPriceBasisLabels: Record<ProductPriceBasis, string> = {
  gold_24k_sell: "순금 살 때",
  gold_24k_buy: "순금 팔 때",
  gold_18k_buy: "18K 팔 때",
  gold_14k_buy: "14K 팔 때",
  platinum_sell: "백금 살 때",
  platinum_buy: "백금 팔 때",
  silver_sell: "은 살 때",
  silver_buy: "은 팔 때",
  manual: "수동 가격",
  inquiry: "문의 기준",
};

export const productCatalogTabs = [
  { slug: "all", label: "전체", category: null },
  { slug: "gold-bar", label: "골드바", category: "gold_bar" },
  { slug: "silver-bar", label: "실버바", category: "silver_bar" },
  { slug: "pure-gold", label: "순금제품", category: "pure_gold" },
  { slug: "jewelry", label: "고금·주얼리 매입", category: "jewelry" },
  { slug: "b2b", label: "B2B·기업", category: "custom_order" },
] as const satisfies ReadonlyArray<{
  slug: string;
  label: string;
  category: ProductCategory | null;
}>;

export const publicProductCategories = productCatalogTabs
  .filter((tab) => tab.category)
  .map((tab) => tab.category as ProductCategory);

export type ProductCatalogSort = "recommended" | "price-asc" | "price-desc" | "newest";

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

export function getProductPriceBasisLabel(priceBasis: ProductPriceBasis) {
  return productPriceBasisLabels[priceBasis];
}

export function getProductFallbackImage(category: ProductCategory) {
  if (category === "gold_bar") return "/products/kcg-gold-bar-catalog-20260427-v2.jpg";
  if (category === "silver_bar") return "/products/kcg-silver-gift-20260427-v2.jpg";
  if (category === "pure_gold") return "/products/kcg-pure-gold-products-20260427-v2.jpg";
  if (category === "jewelry") return "/products/kcg-jewelry-buying-tray-20260430.png";
  if (category === "purchase_guide") return "/products/kcg-buying-process-20260427-v2.jpg";
  if (category === "custom_order") return "/products/kcg-b2b-gift-packaging-20260430.png";
  return "/products/kcg-gold-bar-catalog-20260427-v2.jpg";
}

const defaultProductImages = new Set([
  "/products/kcg-gold-bar-catalog-20260427-v2.jpg",
  "/products/kcg-gold-bar-catalog-20260427.jpg",
  "/products/kcg-silver-gift-20260427-v2.jpg",
  "/products/kcg-silver-bar-catalog-20260427.jpg",
  "/products/kcg-pure-gold-products-20260427-v2.jpg",
  "/products/kcg-old-gold-jewelry-20260427-v2.jpg",
  "/products/kcg-jewelry-purchase-20260427.jpg",
  "/products/kcg-b2b-bulk-consulting-20260427-v2.jpg",
  "/products/kcg-b2b-consulting-20260427.jpg",
  "/products/kcg-jewelry-buying-tray-20260430.png",
  "/products/kcg-b2b-gift-packaging-20260430.png",
]);

const defaultProductImagesBySlug: Record<string, string> = {
  "kcg-gold-bar-1g": "/products/kcg-gold-bar-catalog-20260427-v2.jpg",
  "investment-gold-bar-consulting": "/products/kcg-gold-bar-catalog-20260427-v2.jpg",
  "kcg-gold-bar-10g": "/products/kcg-gold-bar-catalog-20260427.jpg",
  "kcg-gold-bar-37-5g": "/campaign/kcg-hero-gold-bars.jpg",
  "kcg-gold-bar-100g": "/campaign/kcg-brand-gold-bars-20260427-v4.png",
  "kcg-silver-bar-100g": "/products/kcg-silver-gift-20260427-v2.jpg",
  "kcg-silver-bar-500g": "/products/kcg-silver-bar-catalog-20260427.jpg",
  "kcg-silver-bar-1kg": "/campaign/kcg-hero-metal-bars.jpg",
  "pure-gold-baby-ring-3-75g": "/products/kcg-pure-gold-products-20260427-v2.jpg",
  "pure-gold-card-1g": "/products/kcg-gold-bar-catalog-20260427.jpg",
  "pure-gold-commemorative-medal": "/campaign/kcg-hero-gold-bars.jpg",
  "pure-gold-gift-consulting": "/products/kcg-pure-gold-products-20260427-v2.jpg",
  "pure-gold-baby-ring-buying": "/products/kcg-jewelry-buying-tray-20260430.png",
  "18k-jewelry-buying": "/products/kcg-jewelry-buying-tray-20260430.png",
  "14k-jewelry-buying": "/products/kcg-jewelry-buying-tray-20260430.png",
  "platinum-silver-buying": "/products/kcg-jewelry-buying-tray-20260430.png",
  "corporate-gift-production": "/products/kcg-b2b-gift-packaging-20260430.png",
  "corporate-precious-metal-buying": "/products/kcg-b2b-gift-packaging-20260430.png",
  "bulk-gold-silver-bar-consulting": "/campaign/kcg-hero-metal-bars.jpg",
};

export function getProductImageSrc(product: Product) {
  const imageUrl = product.imageUrl?.trim();
  const slugDefaultImage = defaultProductImagesBySlug[product.slug];
  if (imageUrl?.startsWith("/") && (!slugDefaultImage || !defaultProductImages.has(imageUrl))) {
    return imageUrl;
  }
  if (slugDefaultImage) return slugDefaultImage;
  if (imageUrl?.startsWith("/")) return imageUrl;
  return getProductFallbackImage(product.category);
}

export function sortProductsForPublic(products: Product[]) {
  return [...products].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return a.name.localeCompare(b.name, "ko");
  });
}

function isPriceCategory(value: ProductPriceBasis): value is PriceCategory {
  return value !== "manual" && value !== "inquiry";
}

function getBasisPrice(product: Product, prices: PriceRecord[]) {
  if (!isPriceCategory(product.priceBasis)) return null;
  return prices.find((price) => price.category === product.priceBasis) ?? null;
}

function roundToHundred(value: number) {
  return Math.round(value / 100) * 100;
}

function getComputedProductPrice(product: Product, prices: PriceRecord[]) {
  if (product.priceBasis === "manual") return product.manualPrice;

  const basisPrice = getBasisPrice(product, prices);
  if (!basisPrice || !product.weightGrams) return null;

  const makingFee = product.makingFee ?? 0;
  return roundToHundred((basisPrice.value / 3.75) * product.weightGrams + makingFee);
}

export function getProductPriceDisplay(product: Product, prices: PriceRecord[]) {
  if (product.priceBasis === "inquiry") {
    return {
      main: "사전 문의 필요",
      detail: "수량·중량·수급 확인 후 안내",
      footnote: "현재 고시가 기준과 실물 확인 결과에 따라 상담 금액이 달라질 수 있습니다.",
      numericValue: null,
    };
  }

  if (product.priceBasis === "manual") {
    if (product.manualPrice) {
      return {
        main: formatWon(product.manualPrice),
        detail: "수동 입력 참고가",
        footnote: product.priceNote || "실제 금액은 수급·실물 확인 후 달라질 수 있습니다.",
        numericValue: product.manualPrice,
      };
    }

    return {
      main: getProductPriceLabel(product),
      detail: "수동 가격 확인 필요",
      footnote: product.priceNote || "본사 전화 문의 후 상담 기준을 확인합니다.",
      numericValue: null,
    };
  }

  const basisPrice = getBasisPrice(product, prices);
  const computedPrice = getComputedProductPrice(product, prices);
  const basisLabel = getProductPriceBasisLabel(product.priceBasis);
  const basisDetail = basisPrice ? `${basisLabel} ${formatWon(basisPrice.value)} / 3.75g` : `${basisLabel} 기준`;

  if (computedPrice) {
    const fee = product.makingFee ? ` · 공임 ${formatWon(product.makingFee)}` : "";
    const weight = product.weightGrams ? ` · ${product.weightGrams}g` : "";

    return {
      main: formatWon(computedPrice),
      detail: `현재 고시가 기준 참고가${weight}${fee}`,
      footnote: `${basisDetail}. 실제 금액은 공임·수급·실물 확인 후 달라질 수 있습니다.`,
      numericValue: computedPrice,
    };
  }

  if (basisPrice) {
    return {
      main: `${formatWon(basisPrice.value)} / 3.75g`,
      detail: "현재 고시가 기준",
      footnote: `${basisDetail}. 실물 상태와 중량 확인 후 최종 안내합니다.`,
      numericValue: basisPrice.value,
    };
  }

  return {
    main: getProductPriceLabel(product),
    detail: "현재 고시가 기준 확인 필요",
    footnote: product.priceNote || "본사 전화 문의 후 상담 기준을 확인합니다.",
    numericValue: null,
  };
}

export function sortProductsForCatalog(
  products: Product[],
  prices: PriceRecord[],
  sort: ProductCatalogSort,
) {
  const sorted = sortProductsForPublic(products);

  if (sort === "newest") {
    return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  if (sort === "price-asc" || sort === "price-desc") {
    return sorted.sort((a, b) => {
      const aPrice = getProductPriceDisplay(a, prices).numericValue;
      const bPrice = getProductPriceDisplay(b, prices).numericValue;

      if (aPrice === null && bPrice === null) return a.displayOrder - b.displayOrder;
      if (aPrice === null) return 1;
      if (bPrice === null) return -1;
      return sort === "price-asc" ? aPrice - bPrice : bPrice - aPrice;
    });
  }

  return sorted;
}
