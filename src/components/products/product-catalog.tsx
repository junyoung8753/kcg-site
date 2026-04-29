"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
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
  contactPhone: string;
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
    image: "/campaign/kcg-brand-gold-bars-20260427-v4.png",
  },
  {
    title: "고금·주얼리 매입",
    body: "순금, 18K, 14K 기준가를 확인합니다.",
    href: "/products?category=jewelry",
    image: "/products/kcg-old-gold-jewelry-20260427-v2.jpg",
  },
  {
    title: "기업체 기념품·대량 상담",
    body: "수량, 납기, 예산 기준으로 상담합니다.",
    href: "/products?category=b2b",
    image: "/products/kcg-b2b-bulk-consulting-20260427-v2.jpg",
  },
  {
    title: "KC 랩그로운 다이아몬드",
    body: "관계 법인 다이아몬드 상품 안내",
    href: "https://www.kcdia.co.kr/",
    image: "/campaign/kcg-main-desk-photo-20260427-v3.png",
    external: true,
  },
  {
    title: "KCG 네이버 블로그",
    body: "금값 정보와 KCG 소식",
    href: "https://m.blog.naver.com/kcgoldx?tab=1",
    image: "/services/kcg-service-counter-20260427.jpg",
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
  if (product.category === "pure_gold") return "object-[76%_50%]";
  if (product.category === "custom_order") return "object-[42%_58%]";
  return "object-center";
}

function ProductPromoCard({ banner, compact = false }: { banner: (typeof promoBanners)[number]; compact?: boolean }) {
  const content = (
    <span className={`group relative block overflow-hidden border border-[#252525] bg-[#111] ${compact ? "min-h-28" : "min-h-36"}`}>
      <Image
        src={banner.image}
        alt={`${banner.title} 배너 이미지`}
        fill
        className="object-cover opacity-50 transition duration-500 group-hover:scale-[1.03]"
        sizes={compact ? "50vw" : "180px"}
        unoptimized
      />
      <span className="absolute inset-0 bg-gradient-to-br from-black/78 via-black/40 to-black/18" />
      <span className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end p-4">
        <span className="text-base font-bold tracking-[-0.04em] text-white">{banner.title}</span>
        <span className="mt-2 text-xs leading-5 text-white/72">{banner.body}</span>
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

  return (
    <Link href={banner.href} className="block">
      {content}
    </Link>
  );
}

export function ProductCatalog({ products, prices, contactPhone }: ProductCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCategory = normalizeCategory(searchParams.get("category"));
  const selectedSort = normalizeSort(searchParams.get("sort"));
  const category = getCategoryFromSlug(selectedCategory);

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

  function updateQuery(key: "category" | "sort", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if ((key === "category" && value === "all") || (key === "sort" && value === "recommended")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  if (!publicProducts.length) {
    return (
      <section className="section-shell py-14">
        <div className="border border-[var(--color-line)] bg-white px-6 py-8">
          <p className="text-lg font-semibold text-[#15191b]">현재 공개된 상품/매입 항목이 없습니다.</p>
          <p className="mt-3 text-sm leading-7 text-[#687171]">
            골드바·실버바 수급과 고금 매입 상담은 대표번호로 먼저 문의해 주세요.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-8 sm:py-10">
      <div className="grid overflow-hidden border border-[#d8dfdd] bg-white md:grid-cols-3 xl:grid-cols-6">
        {productCatalogTabs.map((tab) => {
          const isActive = tab.slug === selectedCategory;
          return (
            <button
              key={tab.slug}
              type="button"
              onClick={() => updateQuery("category", tab.slug)}
              className={`min-h-14 border-b border-r border-[#d8dfdd] px-4 py-4 text-center text-sm font-semibold transition md:text-base ${
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

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:hidden">
        {promoBanners.slice(0, 2).map((banner) => (
          <ProductPromoCard key={banner.title} banner={banner} compact />
        ))}
      </div>

      <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1fr)_12.5rem]">
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
            {visibleProducts.map((product) => {
              const imageSrc = getProductImageSrc(product);
              const price = getProductPriceDisplay(product, prices);

              return (
                <article key={product.id} className="group bg-white">
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f6f5]">
                      <Image
                        src={imageSrc}
                        alt={`${product.name} 이미지`}
                        fill
                        className={`object-cover transition duration-500 group-hover:scale-[1.035] ${getProductImagePositionClass(product)}`}
                        sizes="(min-width: 1280px) 300px, (min-width: 768px) 50vw, 100vw"
                        loading="eager"
                        unoptimized
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
                      <h3 className="mt-4 text-xl font-semibold tracking-[-0.05em] text-[#15191b]">
                        {product.name}
                      </h3>
                      <p className="mt-3 line-clamp-2 min-h-[3rem] text-sm leading-6 text-[#687171]">
                        {product.shortDescription}
                      </p>
                      <div className="mt-4 border-t border-[#e4ebe9] pt-4">
                        <p className="text-xs font-bold tracking-[0.18em] text-[#9a8a00]">현재 고시가 기준</p>
                        <p className="mt-2 text-xl font-bold tracking-[-0.04em] text-[#15191b]">{price.main}</p>
                        <p className="mt-1 text-sm leading-6 text-[#687171]">{price.detail}</p>
                      </div>
                    </div>
                  </Link>
                  <div className="mt-5">
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex h-10 w-full items-center justify-center rounded-full border border-[#d8dfdd] px-4 text-sm font-semibold text-[#171717] transition hover:bg-[#fff8df]"
                    >
                      상세보기
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-28 space-y-3">
            <div className="border border-[#e2e6e4] bg-[#f6f8f7] px-4 py-5 text-center">
              <p className="text-sm font-black tracking-[0.05em] text-[#15191b]">KCG</p>
              <p className="mt-1 text-sm font-black tracking-[0.05em] text-[#15191b]">LINKS</p>
            </div>
            {promoBanners.map((banner) => (
              <ProductPromoCard key={banner.title} banner={banner} />
            ))}
            <a
              href="#top"
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#d7d7d7] text-xs font-bold text-white"
            >
              TOP
            </a>
            <a href={`tel:${contactPhone}`} className="block rounded-full bg-[#ffcc00] px-4 py-3 text-center text-sm font-bold text-[#171717]">
              {contactPhone}
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
