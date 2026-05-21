"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getProductCategoryLabel,
  getProductPriceDisplay,
  getPublicProductImage,
  getPublicCatalogProducts,
  getProductStatusLabel,
  getProductWeightDisplayLabel,
  publicProductCatalogTabs,
  sortProductsForCatalog,
  type ProductCatalogSort,
  type ProductImageRole,
} from "@/lib/product-presenter";
import type { PriceAnnouncementDisplay } from "@/lib/price-announcement";
import type { PriceRecord } from "@/types/price";
import type { Product, ProductCategory } from "@/types/product";

interface ProductCatalogProps {
  products: Product[];
  prices: PriceRecord[];
  priceAnnouncement: PriceAnnouncementDisplay;
}

const sortOptions: Array<{ key: ProductCatalogSort; label: string }> = [
  { key: "recommended", label: "추천순" },
  { key: "price-asc", label: "참고가 낮은순" },
  { key: "price-desc", label: "참고가 높은순" },
  { key: "newest", label: "등록일순" },
];

const productContactPhone = "02-747-1807";
const productContactHref = `tel:${productContactPhone}`;

const promoBanners = [
  {
    title: "오늘 고시 시세",
    body: "내가 살 때·내가 팔 때 기준을 먼저 확인하세요.",
    href: "/prices",
  },
  {
    title: "고금·주얼리 매입",
    body: "고금과 주얼리의 순도·중량을 현장에서 확인합니다.",
    href: "/products?category=jewelry",
  },
  {
    title: "대량 골드바 상담",
    body: "수량, 납기, 서류 필요 여부를 먼저 확인합니다.",
    href: "/products?category=b2b",
  },
  {
    title: "KC 랩그로운 다이아몬드",
    body: "관계 법인 다이아몬드 상품 안내",
    href: "https://www.kcdia.co.kr/",
    external: true,
  },
  {
    title: "다비스 다이아몬드",
    body: "KC주얼리 그룹 다이아몬드 유통",
    href: "https://davisdia.com/",
    external: true,
  },
  {
    title: "KCG 네이버 블로그",
    body: "금값 정보와 KCG 소식",
    href: "https://m.blog.naver.com/kcgoldx?tab=1",
    external: true,
  },
] as const;

const goldbarDonGuide = [
  {
    don: "1돈",
    note: "기본 상담 단위",
    image: "/products/kcg-approved-goldbar-1don-20260517.jpg",
  },
  {
    don: "2돈",
    note: "선물·보유 수량",
    image: "/products/kcg-approved-goldbar-2don-20260517.jpg",
  },
  {
    don: "3돈",
    note: "여러 개 중량 확인",
    image: "/products/kcg-approved-goldbar-3don-20260517.jpg",
  },
  {
    don: "5돈",
    note: "중량 선물·보유",
    image: "/products/kcg-approved-goldbar-5don-20260517.jpg",
  },
  {
    don: "10돈",
    note: "수급·공임 확인",
    image: "/products/kcg-approved-goldbar-10don-20260517.jpg",
  },
] as const;

function normalizeCategory(value: string | null) {
  const matched = publicProductCatalogTabs.find((tab) => tab.slug === value);
  return matched?.slug ?? "all";
}

function normalizeSort(value: string | null): ProductCatalogSort {
  return sortOptions.some((option) => option.key === value) ? (value as ProductCatalogSort) : "recommended";
}

function getCategoryFromSlug(slug: string): ProductCategory | null {
  return publicProductCatalogTabs.find((tab) => tab.slug === slug)?.category ?? null;
}

function getProductImagePositionClass(product: Product) {
  if (product.slug === "kcg-gold-bar-37-5g") return "object-[52%_50%]";
  if (product.slug === "kcg-silver-bar-1kg") return "object-[52%_50%]";
  if (product.slug === "pure-gold-card-1g") return "object-[48%_52%]";
  if (product.slug === "platinum-silver-buying") return "object-[48%_58%]";
  if (product.category === "pure_gold") return "object-[48%_50%]";
  if (product.category === "custom_order") return "object-[52%_54%]";
  return "object-center";
}

function isPackshotProduct(product: Product) {
  return product.category === "gold_bar" || product.category === "pure_gold";
}

function formatProductWeight(product: Product) {
  return getProductWeightDisplayLabel(product);
}

function getProductMerchTag(product: Product) {
  if (product.category === "gold_bar") return "999.9 FINE GOLD";
  if (product.category === "pure_gold") return "순금 선물";
  if (product.category === "jewelry") return "실물 확인 매입";
  if (product.category === "custom_order") return "B2B·기업";
  return getProductCategoryLabel(product.category);
}

function getProductImageClass(product: Product, imageRole: ProductImageRole) {
  if (imageRole === "verified_product") {
    return `object-contain p-4 drop-shadow-[0_18px_18px_rgba(104,83,14,0.16)] transition duration-500 group-hover:scale-[1.02] sm:p-5 ${getProductImagePositionClass(product)}`;
  }

  if (imageRole === "representative_lineup") {
    return `object-contain p-5 drop-shadow-[0_18px_18px_rgba(104,83,14,0.16)] transition duration-500 group-hover:scale-[1.02] sm:p-7 ${getProductImagePositionClass(product)}`;
  }

  if (product.category === "gold_bar") {
    return `object-cover p-0 transition duration-500 group-hover:scale-[1.025] ${getProductImagePositionClass(product)}`;
  }

  if (isPackshotProduct(product)) {
    return `object-contain p-5 drop-shadow-[0_18px_18px_rgba(104,83,14,0.18)] transition duration-500 group-hover:scale-[1.035] sm:p-7 ${getProductImagePositionClass(product)}`;
  }

  return `object-cover transition duration-500 group-hover:scale-[1.035] ${getProductImagePositionClass(product)}`;
}

function getProductImageStageClass(product: Product, imageRole: ProductImageRole) {
  if (product.category === "gold_bar" || imageRole === "representative_lineup") {
    return "bg-[#fffefd]";
  }

  return "bg-[#eef4f2]";
}

function getProductImageAspectClass() {
  return "aspect-[1/1.02]";
}

function getProductImageStatusBadge(
  imageRole: ReturnType<typeof getPublicProductImage>["role"],
  product: Product,
) {
  if (imageRole === "verified_product") return getProductStatusLabel(product.status);
  if (imageRole === "representative_lineup" || imageRole === "representative_category") return "상담 확인";
  if (imageRole === "image_pending") return "이미지 준비중";
  return "전화 확인";
}

function ProductTrustPlaceholder() {
  return (
    <div
      data-testid="product-trust-placeholder"
      className="absolute inset-0 flex items-center justify-center border border-[#dbe4e0] bg-[linear-gradient(145deg,#ffffff_0%,#fbfdfc_52%,#fff8dc_100%)] p-5 text-center"
    >
      <div className="max-w-[13rem]">
        <p className="kcg-fine-label text-[#9a8a00]">이미지 준비중</p>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#687171]">
          승인된 상품 사진이 준비되면 같은 위치에 표시합니다.
        </p>
      </div>
    </div>
  );
}

function ProductPromoCard({
  banner,
  compact = false,
  rail = false,
  onInternalNavigate,
}: {
  banner: (typeof promoBanners)[number];
  compact?: boolean;
  rail?: boolean;
  onInternalNavigate?: (href: string) => void;
}) {
  const content = (
    <span
      className={`group relative block overflow-hidden bg-[#15191b] ${
        compact ? "min-h-28 border border-[#252525]" : rail ? "min-h-[7.15rem] border-b border-white/10" : "min-h-36"
      }`}
    >
      <span className="absolute inset-0 bg-[linear-gradient(135deg,#15191b_0%,#202624_58%,#3b3214_100%)]" />
      <span className="absolute inset-x-0 top-0 h-px bg-[#ffcc00]/50" />
      <span className={`relative z-10 flex h-full min-h-[inherit] flex-col justify-end ${rail ? "p-3" : "p-4"}`}>
        <span className="mb-2 h-px w-10 bg-[#ffcc00]" />
        <span className={`${rail ? "text-sm" : "text-base"} font-bold tracking-[-0.022em] text-white`}>
          {banner.title}
        </span>
        <span className={`${rail ? "mt-1 line-clamp-2 text-[11px] leading-4" : "mt-2 text-xs leading-5"} text-white/72`}>
          {banner.body}
        </span>
      </span>
    </span>
  );

  if ("external" in banner && banner.external) {
    return (
      <a href={banner.href} target="_blank" rel="noreferrer" className="block">
        {content}
      </a>
    );
  }

  if (banner.href.startsWith("/products?") && onInternalNavigate) {
    return (
      <button
        type="button"
        onClick={() => onInternalNavigate(banner.href)}
        className="block w-full text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={banner.href} prefetch={false} className="block">
      {content}
    </Link>
  );
}

function ProductQuickRail({ onInternalNavigate }: { onInternalNavigate: (href: string) => void }) {
  return (
    <aside
      data-testid="product-quick-rail"
      aria-label="상품/매입 빠른 링크"
      className="fixed right-0 top-[8.9rem] z-30 hidden w-[10.25rem] overflow-hidden border-y border-l border-black/20 bg-[#111] shadow-[-14px_18px_32px_rgba(0,0,0,0.16)] 2xl:block"
    >
      {promoBanners.map((banner) => (
        <ProductPromoCard
          key={banner.title}
          banner={banner}
          rail
          onInternalNavigate={onInternalNavigate}
        />
      ))}
      <a
        href="#top"
        className="flex h-12 items-center justify-center bg-[#e6e6e6] text-xs font-black tracking-[0.12em] text-[#555]"
      >
        TOP
      </a>
    </aside>
  );
}

function GoldbarDonGuide() {
  return (
    <section
      data-testid="goldbar-don-guide"
      aria-label="골드바 돈 단위 상담 가이드"
      className="mt-5 overflow-hidden border border-[#d8dfdd] bg-white sm:mt-7 lg:grid lg:grid-cols-[0.47fr_0.53fr]"
    >
      <div className="relative aspect-[16/9] min-h-[12rem] bg-[#eef4f2] lg:aspect-auto lg:min-h-[20rem]">
        <Image
          src="/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg"
          alt="KCG 실물 골드바 1돈 2돈 3돈 5돈 10돈 라인업 이미지"
          fill
          className="object-contain p-4 sm:p-5"
          sizes="(min-width: 1024px) 46vw, 100vw"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col justify-center px-4 py-5 sm:px-6 sm:py-6 lg:px-7">
        <p className="kcg-eyebrow text-[#9a8a00]">DON UNIT GUIDE</p>
        <h2 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.02em] text-[#15191b] sm:text-2xl">
          1·2·3·5·10돈 골드바를 상담 단위로 확인합니다.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#687171]">
          실제 판매 가능 중량, 공임, 패키지, 재고는 회사 고시 시세와 현장 확인 기준으로 안내합니다.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-[#dfe6e3] bg-[#dfe6e3] sm:grid-cols-5">
          {goldbarDonGuide.map((item, index) => (
            <div
              key={item.don}
              className={`bg-[#fbfdfc] px-2.5 py-2.5 sm:px-3 sm:py-3 ${
                index === goldbarDonGuide.length - 1 ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <div className="relative mx-auto mb-2 h-28 w-full max-w-[9rem] overflow-hidden bg-[#fffdf7] sm:aspect-[4/5] sm:h-auto sm:max-w-none">
                <Image
                  src={item.image}
                  alt={`KCG 실물 골드바 ${item.don} 이미지`}
                  fill
                  className="object-contain drop-shadow-[0_12px_14px_rgba(104,83,14,0.14)]"
                  sizes="(min-width: 640px) 12vw, 45vw"
                  loading="lazy"
                />
              </div>
              <p className="text-base font-black text-[#15191b]">{item.don}</p>
              <p className="mt-2 break-keep text-[11px] leading-4 text-[#687171]">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductPricePolicyNotice({ display }: { display: PriceAnnouncementDisplay }) {
  return (
    <div
      data-testid="product-price-confirmation-policy"
      className={[
        "mt-4 grid gap-3 border px-4 py-4 sm:mt-6 sm:grid-cols-[1fr_auto] sm:items-center sm:px-5",
        display.requiresTradeConfirmation
          ? "border-[#d9ad00]/45 bg-[#fff8dc] text-[#5f4300]"
          : "border-[#dfe6e4] bg-white text-[#5f6868]",
      ].join(" ")}
    >
      <div>
        <p className="kcg-fine-label text-[#9a8a00]">상품 참고가 적용 기준</p>
        <p className="mt-2 text-sm font-semibold leading-6">
          상품 카드의 참고가는 회사 고시 시세 기반이며 거래 확정가가 아닙니다. 주말·공휴일·회사 휴무일·영업시간 외에는
          실제 적용가를 전화 또는 현장 확인 후 안내합니다.
        </p>
      </div>
      <span className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#d9ad00]/45 bg-white px-3 text-xs font-black tracking-[0.08em] text-[#6f4b00]">
        {display.noticeBadgeLabel}
      </span>
    </div>
  );
}

export function ProductCatalog({ products, prices, priceAnnouncement }: ProductCatalogProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(() => normalizeCategory(searchParams.get("category")));
  const [selectedSort, setSelectedSort] = useState(() => normalizeSort(searchParams.get("sort")));
  const category = getCategoryFromSlug(selectedCategory);

  useEffect(() => {
    function syncFromLocation() {
      const params = new URLSearchParams(window.location.search);
      setSelectedCategory(normalizeCategory(params.get("category")));
      setSelectedSort(normalizeSort(params.get("sort")));
    }

    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, []);

  const publicProducts = useMemo(() => getPublicCatalogProducts(products), [products]);

  const visibleProducts = useMemo(() => {
    const filtered = category
      ? publicProducts.filter((product) => product.category === category)
      : publicProducts;
    return sortProductsForCatalog(filtered, prices, selectedSort);
  }, [category, prices, publicProducts, selectedSort]);
  const shouldShowGoldbarGuide = selectedCategory === "all" || selectedCategory === "gold-bar";

  function writeCatalogUrl(nextCategory: string, nextSort: ProductCatalogSort) {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (nextCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }

    if (nextSort === "recommended") {
      params.delete("sort");
    } else {
      params.set("sort", nextSort);
    }

    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  }

  function updateQuery(key: "category" | "sort", value: string) {
    const nextCategory = key === "category" ? normalizeCategory(value) : selectedCategory;
    const nextSort = key === "sort" ? normalizeSort(value) : selectedSort;

    setSelectedCategory(nextCategory);
    setSelectedSort(nextSort);
    writeCatalogUrl(nextCategory, nextSort);
  }

  function handleProductPromoNavigate(href: string) {
    if (typeof window === "undefined") return;
    const url = new URL(href, window.location.origin);
    const nextCategory = normalizeCategory(url.searchParams.get("category"));
    const nextSort = normalizeSort(url.searchParams.get("sort"));

    setSelectedCategory(nextCategory);
    setSelectedSort(nextSort);
    writeCatalogUrl(nextCategory, nextSort);
  }

  if (!publicProducts.length) {
    return (
      <section className="section-shell py-14">
        <div className="border border-[var(--color-line)] bg-white px-6 py-8">
          <p className="text-lg font-semibold text-[#15191b]">현재 공개된 상품/매입 항목이 없습니다.</p>
          <p className="mt-3 text-sm leading-7 text-[#687171]">
            골드바 수급과 고금 매입 상담은 본사 전화로 먼저 문의해 주세요.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-3 sm:py-10">
      <div className="grid grid-cols-2 overflow-hidden border border-[#d8dfdd] bg-white sm:grid-cols-3 xl:grid-cols-6">
        {publicProductCatalogTabs.map((tab) => {
          const isActive = tab.slug === selectedCategory;
          return (
            <button
              key={tab.slug}
              type="button"
              aria-pressed={isActive}
              data-testid={`product-tab-${tab.slug}`}
              onClick={() => updateQuery("category", tab.slug)}
              className={`min-h-11 border-b border-r border-[#d8dfdd] px-3 py-2.5 text-center text-[13px] font-semibold leading-tight transition sm:text-sm md:min-h-14 md:px-4 md:py-4 md:text-base ${
                isActive
                  ? "border-[#ff6a00] text-[#f05a00]"
                  : "text-[#7a8382] hover:bg-[#fff8df] hover:text-[#15191b]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <ProductQuickRail onInternalNavigate={handleProductPromoNavigate} />

      <div className="mt-4 sm:mt-6">
        <div>
          <div className="flex flex-col gap-2 border-y border-[#d8dfdd] py-2.5 md:flex-row md:items-center md:justify-between md:py-4">
            <p data-testid="product-count" className="text-sm font-semibold text-[#15191b]">
              상품 <span className="text-[#ff6a00]">{visibleProducts.length}</span>개
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-sm md:gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => updateQuery("sort", option.key)}
                  className={`px-2.5 py-1.5 font-semibold md:px-3 md:py-2 ${
                    selectedSort === option.key ? "text-[#ff6a00]" : "text-[#15191b] hover:text-[#8a7600]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <select
                aria-label="목록 개수"
                value="20"
                onChange={() => undefined}
                className="ml-0 h-9 border border-[#d8dfdd] bg-white px-3 text-sm text-[#687171] md:ml-4 md:h-10"
              >
                <option value="20">20개씩보기</option>
              </select>
            </div>
          </div>
          <ProductPricePolicyNotice display={priceAnnouncement} />
          {shouldShowGoldbarGuide ? <GoldbarDonGuide /> : null}

          <div className="mt-5 grid gap-y-8 gap-x-6 sm:mt-7 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product, index) => {
              const productImage = getPublicProductImage(product);
              const imageSrc = productImage.src;
              const price = getProductPriceDisplay(product, prices);
              const weight = formatProductWeight(product);
              const productHref = `/products/${product.slug}`;

              return (
                <article
                  key={product.id}
                  data-testid="product-card"
                  data-image-role={productImage.role}
                  className="group flex h-full flex-col overflow-hidden rounded-[0.5rem] border border-[#d8dfdd] bg-white shadow-[0_16px_36px_rgba(21,25,27,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-[#d6a800] hover:shadow-[0_22px_46px_rgba(21,25,27,0.12)]"
                >
                  <Link href={productHref} prefetch={false} className="flex flex-1 flex-col">
                    <div
                      data-testid="product-image-stage"
                      data-image-role={productImage.role}
                      className={`relative overflow-hidden ${getProductImageAspectClass()} ${getProductImageStageClass(
                        product,
                        productImage.role,
                      )} before:absolute before:inset-0 before:bg-[linear-gradient(128deg,rgba(255,255,255,0.76),rgba(255,255,255,0.12)_42%,rgba(0,0,0,0.08))]`}
                    >
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={productImage.alt}
                          fill
                          className={getProductImageClass(product, productImage.role)}
                          sizes="(min-width: 1280px) 280px, (min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
                          loading={index < 4 ? "eager" : "lazy"}
                        />
                      ) : (
                        <ProductTrustPlaceholder />
                      )}
                      <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1.5">
                        <span className="bg-[#15191b]/86 px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] text-white shadow-sm">
                          {getProductImageStatusBadge(productImage.role, product)}
                        </span>
                      </div>
                      <span className="absolute inset-x-8 bottom-4 h-px bg-black/10 shadow-[0_12px_18px_rgba(0,0,0,0.22)]" />
                    </div>
                    <div className="flex flex-1 flex-col px-4 pb-4 pt-5 sm:px-5 sm:pb-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="border border-[#dfe6e4] px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] text-[#8a7600]">
                          {getProductCategoryLabel(product.category)}
                        </span>
                        {product.subcategory ? (
                          <span className="bg-[#f7fbfa] px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] text-[#687171]">
                            {product.subcategory}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="kcg-card-title mt-4 text-[#15191b]">
                        {product.name}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {weight ? (
                          <span className="bg-[#15191b] px-2.5 py-1 text-[11px] font-bold tracking-[0.04em] text-white">
                            중량 {weight}
                          </span>
                        ) : null}
                        <span className="bg-[#fff4c2] px-2.5 py-1 text-[11px] font-bold tracking-[0.04em] text-[#6f5e00]">
                          {getProductMerchTag(product)}
                        </span>
                        {product.makingFee ? (
                          <span className="bg-[#f6faf8] px-2.5 py-1 text-[11px] font-bold tracking-[0.04em] text-[#53605d]">
                            공임 반영
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 line-clamp-2 min-h-[2.9rem] text-sm leading-[1.55] text-[#687171]">
                        {product.shortDescription}
                      </p>
                      <div className="mt-auto border-t border-[#e4ebe9] bg-[#fffaf0] px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="kcg-data-label text-[#9a8a00]">현재 고시가 기준 참고가</p>
                          <span className="shrink-0 text-[10px] font-black tracking-[0.12em] text-[#b38b00]">
                            {priceAnnouncement.requiresTradeConfirmation ? "확인 필요" : "KCG"}
                          </span>
                        </div>
                        <p className="kcg-price-primary mt-2 text-xl font-black text-[#15191b]">{price.main}</p>
                        <p className="mt-1 text-sm leading-6 text-[#687171]">{price.detail}</p>
                        <p className="mt-2 text-xs leading-5 text-[#7b8582]">
                          참고가입니다. 전화 또는 현장 확인 후 최종 안내합니다.
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-[#e4ebe9] px-4 py-4 sm:px-5">
                    <a
                      href={productContactHref}
                      className="kcg-action-token inline-flex h-11 items-center justify-center rounded-full bg-[#ffcc00] px-4 text-sm font-black text-[#15191b] transition hover:bg-[#f0bd00]"
                      aria-label={`${product.name} 전화 상담 ${productContactPhone}`}
                    >
                      본사 연결
                    </a>
                    <Link
                      href={productHref}
                      prefetch={false}
                      className="kcg-action-token inline-flex h-11 items-center justify-center rounded-full border border-[#d8dfdd] bg-white px-4 text-sm font-bold text-[#171717] transition hover:bg-[#fff8df]"
                    >
                      자세히
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:hidden">
            {promoBanners.slice(0, 2).map((banner) => (
              <ProductPromoCard
                key={banner.title}
                banner={banner}
                compact
                onInternalNavigate={handleProductPromoNavigate}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
