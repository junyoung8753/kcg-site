import {
  AdminMediaWorkspace,
  type MediaPreviewImage,
  type MediaReplacementTarget,
} from "@/app/admin/media/admin-media-workspace";
import { getRepository } from "@/lib/data";
import {
  isLockedGoldbarSkuImagePath,
  isTrustedSiteAssetUrl,
} from "@/lib/image-asset-manifest";
import {
  getPublicCatalogProducts,
  getPublicProductImage,
} from "@/lib/product-presenter";
import {
  defaultCompanyHeroImages,
  defaultHomeHeroImages,
  defaultProductsHeroImages,
  defaultServicesHeroImages,
  defaultStoreGuideHeroImages,
} from "@/lib/site-assets";
import { siteImageUploadMaxLabel } from "@/lib/site-upload-policy";
import type { SiteAsset, SiteAssetUsage, SiteAssetUsageSlot } from "@/types/media";
import type { Product } from "@/types/product";

interface AdminMediaPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getStatusMessage(status?: string | string[]) {
  if (status === "uploaded") return "업로드됨 · 바로 사용 가능한 이미지로 저장했습니다.";
  if (status === "image-applied") return "교체 완료 · 선택한 파일이 이 위치에 바로 반영되었습니다.";
  if (status === "connected") return "저장됨 · 선택한 이미지를 해당 위치에 연결했습니다.";
  if (status === "approval-updated") return "저장됨 · 이미지 사용 상태가 저장되었습니다.";
  if (status === "demo") return "Supabase 미연결 상태에서는 업로드/연결이 비활성화됩니다.";
  if (status === "invalid-file") return `이미지 파일을 확인해 주세요. JPEG/PNG/WebP, 최대 ${siteImageUploadMaxLabel}만 가능합니다.`;
  if (status === "invalid-meta") return "이미지 이름과 대체 텍스트를 확인해 주세요.";
  if (status === "connect-blocked") return "사용 가능한 이미지와 위치가 맞을 때만 연결할 수 있습니다.";
  if (status === "storage-setup-error") return "Storage bucket 준비 중 오류가 발생했습니다. 환경변수와 site-assets bucket 설정을 확인해 주세요.";
  if (status === "media-schema-error") return "이미지 DB 테이블이 아직 준비되지 않았습니다. site_assets 스키마 적용 상태를 확인해 주세요.";
  if (status === "upload-error") return "Storage 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.";
  if (status === "metadata-error") return "이미지 정보 저장 중 오류가 발생했습니다. 다시 시도해 주세요.";
  if (status === "connect-error") return "이미지 사용 위치 저장 중 오류가 발생했습니다. 다시 시도해 주세요.";
  return null;
}

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeInitialTarget(value?: string | string[]) {
  const target = getSingleParam(value);
  if (target === "home-banner" || target === "product-image" || target === "products-hero" || target === "service-image" || target === "store-guide-image" || target === "company-image" || target === "notice-thumbnail") return target;
  if (target === "product") return "product-image";
  if (target === "products-hero") return "products-hero";
  if (target === "service") return "service-image";
  if (target === "store-guide") return "store-guide-image";
  if (target === "company") return "company-image";
  if (target === "notice") return "notice-thumbnail";
  if (target === "home") return "home-banner";
  return "home-banner";
}

function activeImagesForSlot({
  slot,
  assets,
  usages,
  fallback,
}: {
  slot: SiteAssetUsageSlot;
  assets: SiteAsset[];
  usages: SiteAssetUsage[];
  fallback: MediaPreviewImage[];
}) {
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  const active = usages
    .filter((usage) => usage.usageKey === slot && usage.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((usage, index) => {
      const asset = assetsById.get(usage.assetId);
      if (!asset || asset.approvalStatus !== "approved" || !isTrustedSiteAssetUrl(asset.publicUrl)) return [];
      return [
        {
          src: asset.publicUrl,
          alt: asset.altText,
          label: `사용 중 이미지 ${index + 1}`,
        },
      ];
    });
  if (slot === "home_hero" && active.length > 0 && active.length < fallback.length) {
    const seen = new Set(active.map((image) => image.src));
    return [...active, ...fallback.filter((image) => !seen.has(image.src))];
  }
  return active.length ? active : fallback;
}

function productImageSrc(product: Product, assets: SiteAsset[]) {
  if (product.imageAssetId) {
    const asset = assets.find((item) => item.id === product.imageAssetId);
    if (asset?.publicUrl) return asset.publicUrl;
  }
  return getPublicProductImage(product).src ?? null;
}

function buildProductSummary(products: Product[], assets: SiteAsset[]) {
  const visible = getPublicCatalogProducts(products);
  const missing = visible.filter((product) => !productImageSrc(product, assets));
  const locked = visible.filter((product) => {
    const src = getPublicProductImage(product).src;
    return Boolean(src && isLockedGoldbarSkuImagePath(src));
  });
  return {
    totalCount: visible.length,
    missingCount: missing.length,
    lockedCount: locked.length,
    sampleNames: missing.slice(0, 3).map((product) => product.name),
  };
}

function productPreviewImages(products: Product[], assets: SiteAsset[]) {
  return getPublicCatalogProducts(products)
    .flatMap((product) => {
      const src = productImageSrc(product, assets);
      if (!src) return [];
      return [{ src, alt: `${product.name} 이미지`, label: product.name }];
    })
    .slice(0, 3);
}

export default async function AdminMediaPage({ searchParams }: AdminMediaPageProps) {
  const repository = getRepository();
  const [assets, usages, products, params] = await Promise.all([
    repository.getSiteAssets(),
    repository.getSiteAssetUsages(),
    repository.getProducts({ includeHidden: true }),
    searchParams,
  ]);
  const fallbackHome = defaultHomeHeroImages.map((image, index) => ({
    src: image.src,
    alt: image.alt,
    label: `기본 슬라이드 ${index + 1}`,
  }));
  const targets: MediaReplacementTarget[] = [
    {
      id: "home-banner",
      label: "홈 배너 이미지",
      shortLabel: "홈 배너",
      description: "메인 첫 화면 자동 슬라이드에 들어가는 이미지입니다.",
      targetKind: "home_hero",
      slot: "home_hero",
      pagePath: "/",
      sectionUsage: "home-hero",
      sourceType: "C",
      allowedUsage: ["hero", "candidate_preview"],
      aspectRatio: "16:9",
      skuMatch: "not_applicable",
      mobileCropRule: "모바일에서 로고와 주요 피사체가 잘리지 않게 중앙 crop을 확인합니다.",
      currentImages: activeImagesForSlot({ slot: "home_hero", assets, usages, fallback: fallbackHome }),
      ctaLabel: "이미지 교체",
      minActive: 3,
    },
    {
      id: "product-image",
      label: "상품 이미지",
      shortLabel: "상품",
      description: "상품 카드와 상세에 쓰는 이미지입니다. 상품별 교체는 상품 관리에서 바로 처리합니다.",
      targetKind: "product_image",
      slot: "product_image",
      pagePath: "/products",
      sectionUsage: "product-card",
      sourceType: "A3",
      allowedUsage: ["product_card", "product_detail", "candidate_preview"],
      aspectRatio: "1:1",
      skuMatch: "needs_review",
      mobileCropRule: "제품 전체 외곽과 중량 표기가 잘리지 않는지 확인합니다.",
      currentImages: productPreviewImages(products, assets),
      ctaLabel: "이미지 교체",
      productHref: "/admin/products",
    },
    {
      id: "products-hero",
      label: "상품/매입 상단 이미지",
      shortLabel: "상품 상단",
      description: "상품/매입 페이지 맨 위 대표 이미지입니다.",
      targetKind: "products_hero",
      slot: "products_hero",
      pagePath: "/products",
      sectionUsage: "products-hero",
      sourceType: "C",
      allowedUsage: ["hero", "product_guide", "candidate_preview"],
      aspectRatio: "16:9",
      skuMatch: "not_applicable",
      mobileCropRule: "골드바 라인업이나 매입 상담 피사체가 모바일에서도 중앙에 남도록 확인합니다.",
      currentImages: activeImagesForSlot({
        slot: "products_hero",
        assets,
        usages,
        fallback: defaultProductsHeroImages.map((image) => ({ src: image.src, alt: image.alt, label: "기본 상품 상단 이미지" })),
      }),
      ctaLabel: "상단 이미지 교체",
    },
    {
      id: "service-image",
      label: "서비스 이미지",
      shortLabel: "서비스",
      description: "고금 매입, 상담, 절차 안내에 쓰는 서비스 화면 이미지입니다.",
      targetKind: "service_hero",
      slot: "services_hero",
      pagePath: "/services",
      sectionUsage: "services-hero",
      sourceType: "D",
      allowedUsage: ["service_hero", "candidate_preview"],
      aspectRatio: "16:9",
      skuMatch: "not_applicable",
      mobileCropRule: "상담 장면과 손동작이 중앙에 남도록 모바일 crop을 확인합니다.",
      currentImages: activeImagesForSlot({
        slot: "services_hero",
        assets,
        usages,
        fallback: defaultServicesHeroImages.map((image) => ({ src: image.src, alt: image.alt, label: "기본 서비스 이미지" })),
      }),
      ctaLabel: "이미지 교체",
    },
    {
      id: "store-guide-image",
      label: "매장안내 이미지",
      shortLabel: "매장안내",
      description: "방문 준비와 매장 안내 화면에 쓰는 이미지입니다.",
      targetKind: "store_guide_hero",
      slot: "store_guide_hero",
      pagePath: "/about",
      sectionUsage: "store-guide-hero",
      sourceType: "D",
      allowedUsage: ["store_guide_hero", "candidate_preview"],
      aspectRatio: "16:9",
      skuMatch: "not_applicable",
      mobileCropRule: "방문 안내 맥락이 유지되도록 중앙 crop을 확인합니다.",
      currentImages: activeImagesForSlot({
        slot: "store_guide_hero",
        assets,
        usages,
        fallback: defaultStoreGuideHeroImages.map((image) => ({ src: image.src, alt: image.alt, label: "기본 매장안내 이미지" })),
      }),
      ctaLabel: "이미지 교체",
    },
    {
      id: "company-image",
      label: "회사소개 이미지",
      shortLabel: "회사소개",
      description: "회사 신뢰와 운영 분위기를 보여주는 소개 화면 이미지입니다.",
      targetKind: "company_hero",
      slot: "company_hero",
      pagePath: "/company",
      sectionUsage: "company-hero",
      sourceType: "B",
      allowedUsage: ["company_hero", "brand_identity", "candidate_preview"],
      aspectRatio: "16:9",
      skuMatch: "not_applicable",
      mobileCropRule: "회사 신뢰 이미지가 과도하게 잘리지 않도록 모바일 crop을 확인합니다.",
      currentImages: activeImagesForSlot({
        slot: "company_hero",
        assets,
        usages,
        fallback: defaultCompanyHeroImages.map((image) => ({ src: image.src, alt: image.alt, label: "기본 회사소개 이미지" })),
      }),
      ctaLabel: "이미지 교체",
    },
    {
      id: "notice-thumbnail",
      label: "공지 썸네일",
      shortLabel: "공지",
      description: "공지 목록과 안내 카드에 쓸 텍스트 카드형 썸네일 이미지입니다.",
      targetKind: "notice_template",
      pagePath: "/announcements",
      sectionUsage: "notice-thumbnail",
      sourceType: "B",
      allowedUsage: ["notice_template", "candidate_preview"],
      aspectRatio: "16:9",
      skuMatch: "not_applicable",
      mobileCropRule: "공지 제목은 HTML 텍스트로 유지하고 썸네일은 장식 정보를 최소화합니다.",
      currentImages: [],
      ctaLabel: "이미지 추가",
    },
  ];

  return (
    <AdminMediaWorkspace
      targets={targets}
      assets={assets}
      usages={usages}
      message={getStatusMessage(params.status)}
      initialTargetId={normalizeInitialTarget(params.target)}
      productSummary={buildProductSummary(products, assets)}
    />
  );
}
