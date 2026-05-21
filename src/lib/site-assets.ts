import { getRepository } from "@/lib/data";
import type { ImageAllowedUsage } from "@/lib/image-asset-manifest";
import { isTrustedSiteAssetUrl } from "@/lib/image-asset-manifest";
import type { SiteAssetUsageSlot } from "@/types/media";

export type OperationalSlotImage = {
  src: string;
  alt: string;
  objectPosition?: string;
  fit?: "cover" | "contain";
};

export const defaultHomeHeroImages: OperationalSlotImage[] = [
  {
    src: "/campaign/kcg-approved-goldbar-lineup-reflection-20260517.jpg",
    alt: "KCG 골드바 1돈 2돈 3돈 5돈 10돈 라인업 배너",
    objectPosition: "50% center",
    fit: "cover",
  },
  {
    src: "/campaign/kcg-home-human-consultation-20260506.webp",
    alt: "KCG 상담과 방문 준비 이미지",
    objectPosition: "58% center",
    fit: "cover",
  },
  {
    src: "/campaign/kcg-home-seoul-retail-20260506.webp",
    alt: "KCG 종로 매장 방문 안내 이미지",
    objectPosition: "50% center",
    fit: "cover",
  },
];

export const defaultProductsHeroImages: OperationalSlotImage[] = [
  {
    src: "/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
    alt: "KCG 실물 골드바 1돈 2돈 3돈 5돈 10돈 라인업 이미지",
    objectPosition: "50% center",
    fit: "contain",
  },
];

export const defaultServicesHeroImages: OperationalSlotImage[] = [
  {
    src: "/campaign/kcg-old-gold-process-20260506.webp",
    alt: "고금과 주얼리 매입 절차 상담 데스크",
    objectPosition: "50% center",
    fit: "cover",
  },
];

export const defaultStoreGuideHeroImages: OperationalSlotImage[] = [
  {
    src: "/campaign/kcg-home-seoul-retail-20260506.webp",
    alt: "종로 귀금속 매장 방문 분위기 이미지",
    objectPosition: "50% center",
    fit: "cover",
  },
];

export const defaultCompanyHeroImages: OperationalSlotImage[] = [
  {
    src: "/campaign/kcg-home-human-consultation-20260506.webp",
    alt: "한국센터금거래소 회사소개 상담 장면 이미지",
    objectPosition: "50% center",
    fit: "cover",
  },
];

const slotAllowedUsage = {
  home_hero: ["hero"],
  products_hero: ["hero", "category_card"],
  services_hero: ["service_hero"],
  store_guide_hero: ["store_guide_hero"],
  company_hero: ["company_hero"],
  product_image: ["product_card", "product_detail"],
} satisfies Record<SiteAssetUsageSlot, ImageAllowedUsage[]>;

export async function getOperationalSlotImages(
  slot: SiteAssetUsageSlot,
  fallbackImages: OperationalSlotImage[],
): Promise<OperationalSlotImage[]> {
  try {
    const repository = getRepository();
    const [assets, usages] = await Promise.all([
      repository.getSiteAssets(),
      repository.getSiteAssetUsages(),
    ]);
    const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
    const allowedUsage = slotAllowedUsage[slot];
    const images = usages
      .filter((usage) => usage.usageKey === slot && usage.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .flatMap((usage) => {
        const asset = assetsById.get(usage.assetId);
        if (!asset) return [];
        if (asset.approvalStatus !== "approved") return [];
        if (!isTrustedSiteAssetUrl(asset.publicUrl)) return [];
        if (!allowedUsage.some((usage) => asset.allowedUsage.includes(usage))) return [];

        return [
          {
            src: asset.publicUrl,
            alt: asset.altText,
            objectPosition: "50% center",
            fit: "cover" as const,
          },
        ];
      })
      .slice(0, 7);

    if (slot === "home_hero" && images.length > 0 && images.length < fallbackImages.length) {
      const seen = new Set(images.map((image) => image.src));
      const fallbackFill = fallbackImages.filter((image) => !seen.has(image.src));
      return [...images, ...fallbackFill].slice(0, 7);
    }

    return images.length > 0 ? images : fallbackImages;
  } catch {
    return fallbackImages;
  }
}
