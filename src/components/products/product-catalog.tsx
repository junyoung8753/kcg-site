"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getProductCategoryLabel,
  getProductImageSrc,
  getProductPriceDisplay,
  productCatalogTabs,
  publicProductCategories,
  sortProductsForCatalog,
  type ProductCatalogSort,
} from "@/lib/product-presenter";
import type { PriceRecord } from "@/types/price";
import type { Product, ProductCategory } from "@/types/product";

interface ProductCatalogProps {
  products: Product[];
  prices: PriceRecord[];
}

const sortOptions: Array<{ key: ProductCatalogSort; label: string }> = [
  { key: "recommended", label: "추천순" },
  { key: "price-asc", label: "낮은가격순" },
  { key: "price-desc", label: "높은가격순" },
  { key: "newest", label: "등록일순" },
];

const promoBanners = [
  {
    title: "오늘 고시 시세",
    body: "살 때·팔 때 기준을 먼저 확인하세요.",
    href: "/prices",
    image: "/campaign/kcg-home-product-keyvisual-20260503.webp",
  },
  {
    title: "고금·주얼리 매입",
    body: "순금, 18K, 14K 기준가를 확인합니다.",
    href: "/products?category=jewelry",
    image: "/products/kcg-product-jewelry-buying-20260503.webp",
  },
  {
    title: "기업체 기념품·대량 상담",
    body: "수량, 납기, 예산 기준으로 상담합니다.",
    href: "/products?category=b2b",
    image: "/products/kcg-product-b2b-consulting-20260503.webp",
  },
  {
    title: "KC 랩그로운 다이아몬드",
    body: "관계 법인 다이아몬드 상품 안내",
    href: "https://www.kcdia.co.kr/",
    image: "/products/kcg-product-jewelry-buying-20260503.webp",
    external: true,
  },
  {
    title: "다비스 다이아몬드",
    body: "KC주얼리 그룹 다이아몬드 유통",
    href: "https://davisdia.com/",
    image: "/company/kcg-company-heritage-20260430.webp",
    external: true,
  },
  {
    title: "KCG 네이버 블로그",
    body: "금값 정보와 KCG 소식",
    href: "https://m.blog.naver.com/kcgoldx?tab=1",
    image: "/campaign/kcg-visit-transaction-guide-20260503.webp",
    external: true,
  },
] as const;

function normalizeCategory(value: string | null) {
  const matched = productCatalogTabs.find((tab) => tab.slug === value);
  return matched?.slug ?? "all";
}

function normalizeSort(value: string | null): ProductCatalogSort {
  return sortOptions.some((option) => option.key === value) ? (value as ProductCatalogSort) : "recommended";
}

function getCategoryFromSlug(slug: string): ProductCategory | null {
  return productCatalogTabs.find((tab) => tab.slug === slug)?.category ?? null;
}

function getProductImagePositionClass(product: Product) {
  if (product.slug === "kcg-gold-bar-37-5g") return "object-[52%_50%]";
  if (product.slug === "kcg-gold-bar-100g") return "object-[58%_50%]";
  if (product.slug === "kcg-silver-bar-1kg") return "object-[52%_50%]";
  if (product.slug === "pure-gold-card-1g") return "object-[48%_52%]";
  if (product.slug === "platinum-silver-buying") return "object-[48%_58%]";
  if (product.category === "pure_gold") return "object-[76%_50%]";
  if (product.category === "custom_order") return "object-[42%_58%]";
  return "object-center";
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
      className={`group relative block overflow-hidden bg-[#111] ${
        compact ? "min-h-28 border border-[#252525]" : rail ? "min-h-[7.15rem] border-b border-white/10" : "min-h-36"
      }`}
    >
      <Image
        src={banner.image}
        alt={`${banner.title} 배너 이미지`}
        fill
        className={`object-cover transition duration-500 group-hover:scale-[1.03] ${rail ? "opacity-[0.46]" : "opacity-50"}`}
        sizes={compact ? "50vw" : rail ? "160px" : "180px"}
        loading="lazy"
      />
      <span className="absolute inset-0 bg-gradient-to-br from-black/82 via-black/48 to-black/16" />
      <span className={`relative z-10 flex h-full min-h-[inherit] flex-col justify-end ${rail ? "p-3" : "p-4"}`}>
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

export function ProductCatalog({ products, prices }: ProductCatalogProps) {
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

  const publicProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.status !== "hidden" &&
          product.category !== "purchase_guide" &&
          publicProductCategories.includes(product.category),
      ),
    [products],
  );

  const visibleProducts = useMemo(() => {
    const filtered = category
      ? publicProducts.filter((product) => product.category === category)
      : publicProducts;
    return sortProductsForCatalog(filtered, prices, selectedSort);
  }, [category, prices, publicProducts, selectedSort]);

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
            골드바·실버바 수급과 고금 매입 상담은 본사 전화로 먼저 문의해 주세요.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-8 sm:py-10">
      <div className="grid grid-cols-2 overflow-hidden border border-[#d8dfdd] bg-white sm:grid-cols-3 xl:grid-cols-6">
        {productCatalogTabs.map((tab) => {
          const isActive = tab.slug === selectedCategory;
          return (
            <button
              key={tab.slug}
              type="button"
              aria-pressed={isActive}
              data-testid={`product-tab-${tab.slug}`}
              onClick={() => updateQuery("category", tab.slug)}
              className={`min-h-12 border-b border-r border-[#d8dfdd] px-3 py-3 text-center text-[13px] font-semibold leading-tight transition sm:text-sm md:min-h-14 md:px-4 md:py-4 md:text-base ${
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

      <div className="mt-6">
        <div>
          <div className="flex flex-col gap-4 border-y border-[#d8dfdd] py-4 md:flex-row md:items-center md:justify-between">
            <p data-testid="product-count" className="text-sm font-semibold text-[#15191b]">
              상품 <span className="text-[#ff6a00]">{visibleProducts.length}</span>개
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => updateQuery("sort", option.key)}
                  className={`px-3 py-2 font-semibold ${
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
                className="ml-0 h-10 border border-[#d8dfdd] bg-white px-3 text-sm text-[#687171] md:ml-4"
              >
                <option value="20">20개씩보기</option>
              </select>
            </div>
          </div>

          <div className="mt-7 grid gap-y-9 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product, index) => {
              const imageSrc = getProductImageSrc(product);
              const price = getProductPriceDisplay(product, prices);

              return (
                <article key={product.id} className="group bg-white">
                  <Link href={`/products/${product.slug}`} prefetch={false} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#eef4f2] before:absolute before:inset-0 before:bg-[linear-gradient(120deg,rgba(255,255,255,0.52),rgba(218,226,223,0.28),rgba(255,255,255,0.45))]">
                      <Image
                        src={imageSrc}
                        alt={`${product.name} 이미지`}
                        fill
                        className={`object-cover transition duration-500 group-hover:scale-[1.035] ${getProductImagePositionClass(product)}`}
                        sizes="(min-width: 1280px) 280px, (min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
                        loading={index < 4 ? "eager" : "lazy"}
                      />
                    </div>
                    <div className="pt-5">
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
                      <p className="mt-3 line-clamp-2 min-h-[2.9rem] text-sm leading-[1.55] text-[#687171]">
                        {product.shortDescription}
                      </p>
                      <div className="mt-4 border-t border-[#e4ebe9] pt-4">
                        <p className="kcg-data-label text-[#9a8a00]">현재 고시가 기준</p>
                        <p className="kcg-price-primary mt-2 text-lg font-bold text-[#15191b]">{price.main}</p>
                        <p className="mt-1 text-sm leading-6 text-[#687171]">{price.detail}</p>
                      </div>
                    </div>
                  </Link>
                  <div className="mt-5">
                    <Link
                      href={`/products/${product.slug}`}
                      prefetch={false}
                      className="inline-flex h-10 w-full items-center justify-center rounded-full border border-[#d8dfdd] px-4 text-sm font-semibold text-[#171717] transition hover:bg-[#fff8df]"
                    >
                      상세보기
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
