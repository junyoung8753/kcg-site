import { formatWon } from "@/lib/format";
import { isApprovedImageAssetForUsage, isTrustedSiteAssetUrl } from "@/lib/image-asset-manifest";
import type { PriceCategory, PriceRecord } from "@/types/price";
import type { Product, ProductCategory, ProductPriceBasis, ProductStatus } from "@/types/product";

export const productCategoryLabels: Record<ProductCategory, string> = {
  gold_bar: "골드바",
  silver_bar: "실버바",
  pure_gold: "순금제품",
  jewelry: "고금 주얼리 매입",
  purchase_guide: "매입 안내",
  custom_order: "B2B·기업",
};

export const productStatusLabels: Record<ProductStatus, string> = {
  active: "확인 가능",
  inquiry_required: "사전 확인",
  hidden: "비공개",
};

export const productPriceBasisLabels: Record<ProductPriceBasis, string> = {
  gold_24k_sell: "순금 내가 살 때",
  gold_24k_buy: "순금 내가 팔 때",
  gold_18k_buy: "18K 내가 팔 때",
  gold_14k_buy: "14K 내가 팔 때",
  platinum_sell: "백금 내가 살 때",
  platinum_buy: "백금 내가 팔 때",
  silver_sell: "은 내가 살 때",
  silver_buy: "은 내가 팔 때",
  manual: "수동 가격",
  inquiry: "확인 기준",
};

export const productCatalogTabs = [
  { slug: "all", label: "전체", category: null },
  { slug: "gold-bar", label: "골드바", category: "gold_bar" },
  { slug: "silver-bar", label: "실버바", category: "silver_bar" },
  { slug: "pure-gold", label: "순금제품", category: "pure_gold" },
  { slug: "jewelry", label: "고금 주얼리 매입", category: "jewelry" },
  { slug: "b2b", label: "B2B·기업", category: "custom_order" },
] as const satisfies ReadonlyArray<{
  slug: string;
  label: string;
  category: ProductCategory | null;
}>;

export const publicProductCatalogTabs = productCatalogTabs.filter(
  (tab) => tab.category !== "silver_bar" && tab.category !== "pure_gold",
);

export const publicProductCategories = publicProductCatalogTabs
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
  const label = product.priceLabel?.trim();
  if (label?.includes("사전 문의")) return "사전 확인";
  if (label?.includes("전화 문의")) return "본사 확인";
  if (label?.includes("문의 기준")) return "확인 기준";
  if (product.priceVisible) return label || product.priceLabel;
  return label || "본사 확인";
}

export function getProductPriceBasisLabel(priceBasis: ProductPriceBasis) {
  return productPriceBasisLabels[priceBasis];
}

export type ProductImageRole =
  | "verified_product"
  | "representative_lineup"
  | "representative_category"
  | "image_pending"
  | "fallback_brand";

export interface ProductImagePresentation {
  src: string | null;
  role: ProductImageRole;
  label: string;
  alt: string;
  isExactProductImage: boolean;
}

interface ProductImageRule {
  src: string;
  role: Exclude<ProductImageRole, "fallback_brand" | "image_pending">;
  label: string;
  alt: string;
  isExactProductImage: boolean;
}

const canonicalProductTimestamp = "2026-05-20T09:00:00+09:00";

const canonicalGoldbarDonProducts: Product[] = [
  {
    id: "product-gold-1don",
    category: "gold_bar",
    subcategory: "1돈 골드바",
    name: "KCG 골드바 1돈",
    slug: "investment-gold-bar-consulting",
    shortDescription: "1돈 기준 투자·선물용 순금 골드바",
    description:
      "가장 많이 찾는 1돈 단위 골드바입니다. 가격은 현재 회사 고시가와 상담 기준 공임 기준 참고가이며, 재고와 브랜드·포장 상태는 문의 후 확인합니다.",
    imageUrl: "/products/kcg-approved-goldbar-1don-20260517.jpg",
    imageAssetId: null,
    specs: ["순금 999.9", "1돈 단위 상담", "보증서·패키지 확인"],
    status: "active",
    displayOrder: 10,
    isFeatured: true,
    priceVisible: false,
    priceBasis: "gold_24k_sell",
    weightGrams: 3.75,
    makingFee: 35000,
    manualPrice: null,
    priceLabel: "현재 고시가 기준 참고가",
    priceNote: "공임과 수급 상황에 따라 실제 안내 금액이 달라질 수 있습니다.",
    publicNote: "희망 수량을 알려주시면 당일 수급 가능 범위를 먼저 확인해 드립니다.",
    createdAt: canonicalProductTimestamp,
    updatedAt: canonicalProductTimestamp,
  },
  {
    id: "product-gold-2don",
    category: "gold_bar",
    subcategory: "2돈 골드바",
    name: "KCG 골드바 2돈",
    slug: "kcg-gold-bar-2don",
    shortDescription: "2돈 기준 순금 골드바 상담",
    description:
      "2돈 골드바는 선물과 실물 보유 수요에 맞춘 상담 단위입니다. 현재 회사 고시가 기준 참고가를 확인하고 수급 가능 여부를 문의해 주세요.",
    imageUrl: "/products/kcg-approved-goldbar-2don-20260517.jpg",
    imageAssetId: null,
    specs: ["순금 999.9", "2돈 단위 상담", "수량별 수급 확인"],
    status: "active",
    displayOrder: 20,
    isFeatured: true,
    priceVisible: false,
    priceBasis: "gold_24k_sell",
    weightGrams: 7.5,
    makingFee: 45000,
    manualPrice: null,
    priceLabel: "현재 고시가 기준 참고가",
    priceNote: "공임과 수급 상황에 따라 실제 안내 금액이 달라질 수 있습니다.",
    publicNote: "희망 수량과 방문 일정을 알려주시면 상담이 빠릅니다.",
    createdAt: canonicalProductTimestamp,
    updatedAt: canonicalProductTimestamp,
  },
  {
    id: "product-gold-3don",
    category: "gold_bar",
    subcategory: "3돈 골드바",
    name: "KCG 골드바 3돈",
    slug: "kcg-gold-bar-3don",
    shortDescription: "3돈 기준 순금 골드바 상담",
    description:
      "3돈 골드바는 여러 개 구매나 중량 선물 상담에 맞춘 단위입니다. 가격은 회사 고시가 기준 참고가이며, 재고와 공임 조건은 문의 후 확인합니다.",
    imageUrl: "/products/kcg-approved-goldbar-3don-20260517.jpg",
    imageAssetId: null,
    specs: ["순금 999.9", "3돈 단위 상담", "수급·공임 확인"],
    status: "active",
    displayOrder: 30,
    isFeatured: false,
    priceVisible: false,
    priceBasis: "gold_24k_sell",
    weightGrams: 11.25,
    makingFee: 55000,
    manualPrice: null,
    priceLabel: "현재 고시가 기준 참고가",
    priceNote: "공임과 수급 상황에 따라 실제 안내 금액이 달라질 수 있습니다.",
    publicNote: "희망 중량과 수량을 함께 알려주시면 수급 가능 범위를 확인합니다.",
    createdAt: canonicalProductTimestamp,
    updatedAt: canonicalProductTimestamp,
  },
  {
    id: "product-gold-5don",
    category: "gold_bar",
    subcategory: "5돈 골드바",
    name: "KCG 골드바 5돈",
    slug: "kcg-gold-bar-5don",
    shortDescription: "5돈 기준 중량 골드바 상담",
    description:
      "5돈 골드바는 중량감 있는 선물과 실물 보유 상담에 맞춘 단위입니다. 현재 고시가 기준 참고가와 별도로 수급·공임 조건 확인이 필요합니다.",
    imageUrl: "/products/kcg-approved-goldbar-5don-20260517.jpg",
    imageAssetId: null,
    specs: ["순금 999.9", "5돈 단위 상담", "중량 수급 확인"],
    status: "inquiry_required",
    displayOrder: 40,
    isFeatured: false,
    priceVisible: false,
    priceBasis: "gold_24k_sell",
    weightGrams: 18.75,
    makingFee: 0,
    manualPrice: null,
    priceLabel: "현재 고시가 기준 참고가",
    priceNote: "고중량은 공임과 수급 조건을 별도 확인합니다.",
    publicNote: "당일 상담 가능 여부와 수급 조건을 본사 전화로 확인해 주세요.",
    createdAt: canonicalProductTimestamp,
    updatedAt: canonicalProductTimestamp,
  },
  {
    id: "product-gold-10don",
    category: "gold_bar",
    subcategory: "10돈 골드바",
    name: "KCG 골드바 10돈",
    slug: "kcg-gold-bar-37-5g",
    shortDescription: "10돈 기준 고중량 순금 골드바",
    description:
      "10돈 골드바는 고중량 실물 보유 수요에 맞춘 상품입니다. 현재 고시가 기준 참고가와 별도로 수급·공임 조건 확인이 필요합니다.",
    imageUrl: "/products/kcg-approved-goldbar-10don-20260517.jpg",
    imageAssetId: null,
    specs: ["순금 999.9", "10돈 단위 상담", "고중량 수급 확인"],
    status: "inquiry_required",
    displayOrder: 50,
    isFeatured: false,
    priceVisible: false,
    priceBasis: "gold_24k_sell",
    weightGrams: 37.5,
    makingFee: 0,
    manualPrice: null,
    priceLabel: "현재 고시가 기준 참고가",
    priceNote: "고중량은 공임과 수급 조건을 별도 확인합니다.",
    publicNote: "당일 상담 가능 여부와 수급 조건을 본사 전화로 확인해 주세요.",
    createdAt: canonicalProductTimestamp,
    updatedAt: canonicalProductTimestamp,
  },
];

const canonicalPublicProducts: Product[] = [
  ...canonicalGoldbarDonProducts,
  {
    id: "product-buy-old-gold-jewelry",
    category: "jewelry",
    subcategory: "고금 매입",
    name: "고금 주얼리 매입",
    slug: "old-gold-jewelry-buying",
    shortDescription: "고금·예물·주얼리 통합 매입 상담",
    description:
      "고금 주얼리 매입은 순금, 18K, 14K, 백금, 은, 예물, 파손 제품을 한 항목에서 상담합니다. 최종 매입 금액은 실물의 순도, 중량, 부속, 제품 상태를 현장에서 확인한 뒤 안내합니다.",
    imageUrl: "/products/kcg-product-jewelry-buying-20260503.webp",
    imageAssetId: null,
    specs: ["순도·각인 확인", "중량 계근", "스톤·부속 별도 확인"],
    status: "active",
    displayOrder: 110,
    isFeatured: true,
    priceVisible: false,
    priceBasis: "inquiry",
    weightGrams: null,
    makingFee: null,
    manualPrice: null,
    priceLabel: "실물 확인 후 안내",
    priceNote: "최종 매입 금액은 실물 확인 후 확정됩니다.",
    publicNote: "신분증과 보증서가 있으면 함께 준비해 주세요. 품목이 섞여 있어도 한 번에 상담합니다.",
    createdAt: canonicalProductTimestamp,
    updatedAt: canonicalProductTimestamp,
  },
  {
    id: "product-b2b-bulk-bar",
    category: "custom_order",
    subcategory: "대량 상담",
    name: "대량 골드바 상담",
    slug: "bulk-gold-bar-consulting",
    shortDescription: "골드바 대량 수량 상담",
    description:
      "골드바 대량 상담은 중량, 수량, 납기, 결제 방식, 서류 필요 여부를 함께 확인합니다.",
    imageUrl: "/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
    imageAssetId: null,
    specs: ["중량·수량 확인", "납기 조건 확인", "법인 서류 확인"],
    status: "inquiry_required",
    displayOrder: 210,
    isFeatured: false,
    priceVisible: false,
    priceBasis: "inquiry",
    weightGrams: null,
    makingFee: null,
    manualPrice: null,
    priceLabel: "사전 문의 필요",
    priceNote: "대량 수급 조건과 고시 기준을 함께 확인합니다.",
    publicNote: "희망 중량과 수량을 알려주시면 수급 가능 범위를 확인합니다.",
    createdAt: canonicalProductTimestamp,
    updatedAt: canonicalProductTimestamp,
  },
];

const canonicalPublicProductsBySlug = new Map(canonicalPublicProducts.map((product) => [product.slug, product]));
const publicCatalogAllowedSlugs = new Set(canonicalPublicProducts.map((product) => product.slug));
const hiddenLegacyPublicProductSlugs = new Set([
  "kcg-gold-bar-1g",
  "kcg-gold-bar-10g",
  "kcg-gold-bar-100g",
  "pure-gold-baby-ring-3-75g",
  "pure-gold-card-1g",
  "pure-gold-commemorative-medal",
  "pure-gold-gift-consulting",
  "pure-gold-baby-ring-buying",
  "18k-jewelry-buying",
  "14k-jewelry-buying",
  "platinum-silver-buying",
  "corporate-gift-production",
  "corporate-precious-metal-buying",
  "bulk-gold-silver-bar-consulting",
]);

export function getCanonicalPublicProductBySlug(slug: string) {
  const product = canonicalPublicProductsBySlug.get(slug);
  return product ? { ...product, specs: [...product.specs] } : null;
}

export function getProductFallbackImage(category: ProductCategory) {
  if (category === "gold_bar") return "/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg";
  if (category === "pure_gold") return "/products/kcg-product-pure-gold-gifts-20260506.webp";
  if (category === "jewelry") return "/products/kcg-product-jewelry-buying-20260503.webp";
  if (category === "purchase_guide") return "/campaign/kcg-old-gold-process-20260506.webp";
  if (category === "custom_order") return "/products/kcg-product-pure-gold-gifts-20260506.webp";
  return "/brand/kcg-logo.png";
}

const trustedPublicProductImageRulesBySlug: Record<string, ProductImageRule> = {
  "investment-gold-bar-consulting": {
    src: "/products/kcg-approved-goldbar-1don-20260517.jpg",
    role: "verified_product",
    label: "실물 기준",
    alt: "KCG 골드바 1돈 실물 기준 이미지",
    isExactProductImage: true,
  },
  "kcg-gold-bar-2don": {
    src: "/products/kcg-approved-goldbar-2don-20260517.jpg",
    role: "verified_product",
    label: "실물 기준",
    alt: "KCG 골드바 2돈 실물 기준 이미지",
    isExactProductImage: true,
  },
  "kcg-gold-bar-3don": {
    src: "/products/kcg-approved-goldbar-3don-20260517.jpg",
    role: "verified_product",
    label: "실물 기준",
    alt: "KCG 골드바 3돈 실물 기준 이미지",
    isExactProductImage: true,
  },
  "kcg-gold-bar-5don": {
    src: "/products/kcg-approved-goldbar-5don-20260517.jpg",
    role: "verified_product",
    label: "실물 기준",
    alt: "KCG 골드바 5돈 실물 기준 이미지",
    isExactProductImage: true,
  },
  "kcg-gold-bar-37-5g": {
    src: "/products/kcg-approved-goldbar-10don-20260517.jpg",
    role: "verified_product",
    label: "실물 기준",
    alt: "KCG 골드바 10돈 실물 기준 이미지",
    isExactProductImage: true,
  },
  "bulk-gold-bar-consulting": {
    src: "/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
    role: "representative_lineup",
    label: "라인업 상담",
    alt: "KCG 골드바 라인업 상담 이미지",
    isExactProductImage: false,
  },
};

const representativePublicProductImageRulesBySlug: Record<string, ProductImageRule> = {
  "old-gold-jewelry-buying": {
    src: "/products/kcg-product-jewelry-buying-20260503.webp",
    role: "representative_category",
    label: "상담 이미지",
    alt: "KCG 고금 주얼리 매입 상담 이미지",
    isExactProductImage: false,
  },
};

const representativePublicProductImageRulesByCategory: Partial<Record<ProductCategory, ProductImageRule>> = {
  pure_gold: {
    src: "/products/kcg-product-pure-gold-gifts-20260506.webp",
    role: "representative_category",
    label: "상담 이미지",
    alt: "KCG 순금 제품 상담 이미지",
    isExactProductImage: false,
  },
  jewelry: {
    src: "/products/kcg-product-jewelry-buying-20260503.webp",
    role: "representative_category",
    label: "상담 이미지",
    alt: "KCG 고금·주얼리 매입 상담 이미지",
    isExactProductImage: false,
  },
  custom_order: {
    src: "/products/kcg-product-pure-gold-gifts-20260506.webp",
    role: "representative_category",
    label: "상담 이미지",
    alt: "KCG 기업·대량 상담 이미지",
    isExactProductImage: false,
  },
  purchase_guide: {
    src: "/campaign/kcg-old-gold-process-20260506.webp",
    role: "representative_category",
    label: "상담 이미지",
    alt: "KCG 귀금속 매입 절차 상담 이미지",
    isExactProductImage: false,
  },
};

const imagePendingProductSlugs = new Set<string>();

const forcedDefaultImageSlugs = new Set([
  "investment-gold-bar-consulting",
  "kcg-gold-bar-37-5g",
  "bulk-gold-silver-bar-consulting",
  "bulk-gold-bar-consulting",
]);

const replaceablePlaceholderImages = new Set([
  "/campaign/kcg-home-price-desk-20260506.webp",
  "/campaign/kcg-home-product-keyvisual-20260503.webp",
  "/campaign/kcg-hero-metal-bars.jpg",
  "/products/kcg-product-pure-gold-gifts-20260506.webp",
  "/campaign/kcg-old-gold-process-20260506.webp",
  "/products/kcg-pure-gold-products-20260427-v2.jpg",
  "/products/kcg-product-jewelry-buying-20260503.webp",
  "/products/kcg-jewelry-buying-tray-20260430.webp",
  "/products/kcg-b2b-gift-packaging-20260430.webp",
]);

export const approvedRepresentativeProductImagePaths = new Set(
  Object.values(representativePublicProductImageRulesBySlug)
    .concat(Object.values(representativePublicProductImageRulesByCategory))
    .filter((rule): rule is ProductImageRule => Boolean(rule))
    .map((rule) => rule.src),
);

const legacyProductImageReplacements: Record<string, string> = {
  "/products/kcg-gold-bar-catalog-20260427-v2.jpg": "/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
  "/products/kcg-old-gold-jewelry-20260427-v2.jpg": "/products/kcg-product-jewelry-buying-20260503.webp",
  "/products/kcg-b2b-bulk-consulting-20260427-v2.jpg": "/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
  "/products/kcg-pure-gold-products-20260427-v2.jpg": "/products/kcg-product-pure-gold-gifts-20260506.webp",
  "/products/kcg-buying-process-20260427-v2.jpg": "/campaign/kcg-old-gold-process-20260506.webp",
};

const publicProductOverridesBySlug: Record<string, Partial<Product>> = {
  "bulk-gold-silver-bar-consulting": {
    slug: "bulk-gold-bar-consulting",
    name: "대량 골드바 상담",
    shortDescription: "골드바 대량 수량 상담",
    description: "골드바 대량 상담은 중량, 수량, 납기, 결제 방식, 서류 필요 여부를 함께 확인합니다.",
    imageUrl: "/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
    specs: ["중량·수량 확인", "납기 조건 확인", "법인 서류 확인"],
    priceNote: "대량 수급 조건과 고시 기준을 함께 확인합니다.",
    publicNote: "희망 중량과 수량을 알려주시면 수급 가능 범위를 확인합니다.",
  },
};

export function isPublicCatalogProduct(product: Product) {
  return (
    product.status !== "hidden" &&
    product.category !== "purchase_guide" &&
    publicProductCategories.includes(product.category) &&
    !hiddenLegacyPublicProductSlugs.has(product.slug)
  );
}

export function getPublicCatalogProduct(product: Product) {
  if (!isPublicCatalogProduct(product)) return null;
  const transformed = {
    ...product,
    ...publicProductOverridesBySlug[product.slug],
  };
  if (!publicCatalogAllowedSlugs.has(transformed.slug)) return null;

  const canonical = canonicalPublicProductsBySlug.get(transformed.slug);
  if (!canonical) return transformed;

  const imageUrlOverride = transformed.imageUrl?.trim() ?? "";
  const shouldUseImageOverride =
    imageUrlOverride &&
    imageUrlOverride !== canonical.imageUrl &&
    (isTrustedSiteAssetUrl(imageUrlOverride) ||
      (imageUrlOverride.startsWith("/") &&
        (isApprovedImageAssetForUsage(imageUrlOverride, "product_card") ||
          isApprovedImageAssetForUsage(imageUrlOverride, "category_card"))));

  return {
    ...transformed,
    ...canonical,
    id: transformed.id || canonical.id,
    imageUrl: shouldUseImageOverride ? imageUrlOverride : canonical.imageUrl,
    imageAssetId: shouldUseImageOverride ? transformed.imageAssetId ?? null : canonical.imageAssetId,
    createdAt: transformed.createdAt || canonical.createdAt,
    updatedAt: transformed.updatedAt || canonical.updatedAt,
  };
}

export function getPublicCatalogProducts(products: Product[]) {
  const publicProductsBySlug = new Map(canonicalPublicProducts.map((product) => [product.slug, product]));

  for (const product of products) {
    const publicProduct = getPublicCatalogProduct(product);
    if (publicProduct) publicProductsBySlug.set(publicProduct.slug, publicProduct);
  }

  return Array.from(publicProductsBySlug.values()).sort((a, b) => a.displayOrder - b.displayOrder);
}

export function findPublicCatalogProductBySlug(products: Product[], slug: string) {
  return getPublicCatalogProducts(products).find((product) => product.slug === slug) ?? null;
}

export function getTrustedProductImageSrc(product: Product) {
  return trustedPublicProductImageRulesBySlug[product.slug]?.src ?? null;
}

function getImagePendingPresentation(product: Product): ProductImagePresentation {
  return {
    src: null,
    role: "image_pending",
    label: "이미지 준비중",
    alt: `${product.name} 이미지 준비중`,
    isExactProductImage: false,
  };
}

function getProductImageOverridePresentation(product: Product): ProductImagePresentation | null {
  const imageUrl = product.imageUrl?.trim();
  if (!imageUrl) return null;

  if (imageUrl.startsWith("/")) {
    const normalizedImageUrl = legacyProductImageReplacements[imageUrl] ?? imageUrl;

    if (isApprovedImageAssetForUsage(normalizedImageUrl, "product_card")) {
      return {
        src: normalizedImageUrl,
        role: "verified_product",
        label: "승인 이미지",
        alt: `${product.name} 승인 상품 이미지`,
        isExactProductImage: true,
      };
    }

    const categoryRule = representativePublicProductImageRulesByCategory[product.category];
    if (
      approvedRepresentativeProductImagePaths.has(normalizedImageUrl) &&
      isApprovedImageAssetForUsage(normalizedImageUrl, "category_card")
    ) {
      return {
        src: normalizedImageUrl,
        role: "representative_category",
        label: "상담 이미지",
        alt: categoryRule?.alt ?? `${getProductCategoryLabel(product.category)} 상담 이미지`,
        isExactProductImage: false,
      };
    }

    return null;
  }

  if (isTrustedSiteAssetUrl(imageUrl)) {
    return {
      src: imageUrl,
      role: "verified_product",
      label: "승인 업로드",
      alt: `${product.name} 승인 업로드 이미지`,
      isExactProductImage: true,
    };
  }

  return null;
}

export function getPublicProductImage(product: Product): ProductImagePresentation {
  const slugRule =
    trustedPublicProductImageRulesBySlug[product.slug] ??
    representativePublicProductImageRulesBySlug[product.slug];
  const imageUrl = product.imageUrl?.trim();
  const defaultComparableImageUrl = imageUrl?.startsWith("/") ? legacyProductImageReplacements[imageUrl] ?? imageUrl : imageUrl;

  if (slugRule && defaultComparableImageUrl === slugRule.src) return slugRule;

  const imageOverride = getProductImageOverridePresentation(product);
  if (imageOverride) return imageOverride;

  if (slugRule) return slugRule;

  if (imagePendingProductSlugs.has(product.slug)) return getImagePendingPresentation(product);

  if (imageUrl?.startsWith("/")) {
    const normalizedImageUrl = legacyProductImageReplacements[imageUrl] ?? imageUrl;
    const categoryRule = representativePublicProductImageRulesByCategory[product.category];

    if (categoryRule && replaceablePlaceholderImages.has(normalizedImageUrl)) {
      return categoryRule;
    }

    if (isApprovedImageAssetForUsage(normalizedImageUrl, "product_card")) {
      return {
        src: normalizedImageUrl,
        role: "verified_product",
        label: "승인 이미지",
        alt: `${product.name} 승인 상품 이미지`,
        isExactProductImage: true,
      };
    }

    if (
      approvedRepresentativeProductImagePaths.has(normalizedImageUrl) &&
      isApprovedImageAssetForUsage(normalizedImageUrl, "category_card")
    ) {
      return {
        src: normalizedImageUrl,
        role: "representative_category",
        label: "상담 이미지",
        alt: categoryRule?.alt ?? `${getProductCategoryLabel(product.category)} 상담 이미지`,
        isExactProductImage: false,
      };
    }
  }

  if (imageUrl && isTrustedSiteAssetUrl(imageUrl)) {
    return {
      src: imageUrl,
      role: "representative_category",
      label: "승인 업로드",
      alt: `${product.name} 승인 업로드 이미지`,
      isExactProductImage: false,
    };
  }

  const categoryRule = representativePublicProductImageRulesByCategory[product.category];
  if (categoryRule) return categoryRule;

  const fallback = getProductFallbackImage(product.category);
  return {
    src: fallback,
    role: fallback === "/brand/kcg-logo.png" ? "fallback_brand" : "representative_category",
    label: fallback === "/brand/kcg-logo.png" ? "KCG" : "상담 이미지",
    alt:
      fallback === "/brand/kcg-logo.png"
        ? "KCG 로고"
        : `${getProductCategoryLabel(product.category)} 상담 이미지`,
    isExactProductImage: false,
  };
}

export function getProductImageSrc(product: Product) {
  const publicImage = getPublicProductImage(product);
  if (publicImage.src) return publicImage.src;
  if (publicImage.role === "image_pending") return null;

  const slugDefaultImage = getTrustedProductImageSrc(product);
  if (slugDefaultImage && forcedDefaultImageSlugs.has(product.slug)) return slugDefaultImage;

  const imageUrl = product.imageUrl?.trim();
  if (imageUrl?.startsWith("/")) {
    const normalizedImageUrl = legacyProductImageReplacements[imageUrl] ?? imageUrl;
    if (slugDefaultImage && replaceablePlaceholderImages.has(normalizedImageUrl)) {
      return slugDefaultImage;
    }
    return normalizedImageUrl;
  }

  if (imageUrl && isTrustedSiteAssetUrl(imageUrl)) return imageUrl;

  if (slugDefaultImage) return slugDefaultImage;
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

export function getGoldbarDonUnitLabel(product: Product) {
  if (product.category !== "gold_bar") return null;
  if (product.slug === "investment-gold-bar-consulting") return "1돈";
  if (product.slug === "kcg-gold-bar-2don") return "2돈";
  if (product.slug === "kcg-gold-bar-3don") return "3돈";
  if (product.slug === "kcg-gold-bar-5don") return "5돈";
  if (product.slug === "kcg-gold-bar-37-5g") return "10돈";
  return null;
}

export function getProductWeightDisplayLabel(product: Product) {
  const donUnit = getGoldbarDonUnitLabel(product);
  if (donUnit) return donUnit;
  if (!product.weightGrams) return null;
  return `${product.weightGrams.toFixed(2).replace(/\.?0+$/, "")}g`;
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
      main: "사전 확인",
      detail: "수량·중량·수급 확인 후 안내",
      footnote: "현재 고시가 기준과 실물 확인 결과에 따라 안내 금액이 달라질 수 있습니다.",
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
      footnote: product.priceNote || "본사 확인 후 기준을 안내합니다.",
      numericValue: null,
    };
  }

  const basisPrice = getBasisPrice(product, prices);
  const computedPrice = getComputedProductPrice(product, prices);
  const basisLabel = getProductPriceBasisLabel(product.priceBasis);
  const goldbarDonUnit = getGoldbarDonUnitLabel(product);
  const basisUnit = goldbarDonUnit ? "1돈 기준" : "3.75g 기준";
  const basisDetail = basisPrice ? `${basisLabel} ${formatWon(basisPrice.value)} / ${basisUnit}` : `${basisLabel} 기준`;

  if (computedPrice) {
    const fee = product.makingFee ? ` · 공임 ${formatWon(product.makingFee)}` : "";
    const weight = getProductWeightDisplayLabel(product);

    return {
      main: formatWon(computedPrice),
      detail: `현재 고시가 기준 참고가${weight ? ` · ${weight}` : ""}${fee}`,
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
    footnote: product.priceNote || "본사 확인 후 기준을 안내합니다.",
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
