import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { ProductCatalog } from "@/components/products/product-catalog";
import { getRepository } from "@/lib/data";
import { getPriceAnnouncementDisplay } from "@/lib/price-announcement";
import { getPublicCatalogProducts } from "@/lib/product-presenter";
import { defaultProductsHeroImages, getOperationalSlotImages } from "@/lib/site-assets";

export const metadata: Metadata = {
  title: "상품/매입",
  description:
    "한국센터금거래소의 1·2·3·5·10돈 골드바, 고금 주얼리 매입, B2B 대량 상담 카테고리입니다.",
};

const decisionPaths = [
  ["내가 살 때", "돈 단위 골드바", "1·2·3·5·10돈 수급 가능 여부를 확인합니다."],
  ["내가 팔 때", "고금 주얼리 매입", "내가 팔 때 기준과 실물 확인 항목을 먼저 봅니다."],
  ["대량", "B2B·기업", "품목 목록, 예상 수량, 희망 일정을 정리합니다."],
] as const;

export default async function ProductsPage() {
  const repository = getRepository();
  const [products, prices, productHeroImages] = await Promise.all([
    repository.getProducts(),
    repository.getPrices({ visibleOnly: true }),
    getOperationalSlotImages("products_hero", defaultProductsHeroImages),
  ]);
  const priceAnnouncement = getPriceAnnouncementDisplay(prices[0]?.announcedAt);
  const heroImage = productHeroImages[0] ?? defaultProductsHeroImages[0];
  const publicProducts = getPublicCatalogProducts(products);

  return (
    <>
      <section id="top" className="bg-[#f7faf8]">
        <div className="section-shell grid gap-4 py-4 sm:gap-6 sm:py-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-stretch">
          <div
            data-testid="route-hero-media"
            className="relative h-[12rem] min-h-[12rem] overflow-hidden border border-[#dde5e2] bg-[#eef4f2] sm:h-[17rem] sm:min-h-[17rem] lg:h-[18rem] lg:min-h-[18rem]"
          >
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              fill
              priority
              className={heroImage.fit === "contain" ? "object-contain p-4 sm:p-5" : "object-cover"}
              style={{ objectPosition: heroImage.objectPosition }}
              sizes="(min-width: 1024px) 48vw, 100vw"
            />
          </div>

          <div className="flex flex-col justify-center border-y border-[#dbe4e0] py-3 sm:py-6 lg:py-7">
            <div>
              <p className="kcg-eyebrow text-[#9a8a00]">KCG CATEGORY</p>
              <h1 className="mt-2 max-w-3xl break-keep text-[1.72rem] font-semibold leading-tight tracking-[-0.02em] text-[#15191b] sm:kcg-page-title sm:mt-3">
                상품/매입
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687171] sm:kcg-body-copy sm:mt-4">
                1·2·3·5·10돈 골드바와 고금 주얼리 매입 기준을 바로 확인합니다.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden border border-[#dfe6e3] bg-[#dfe6e3] sm:mt-5">
                {decisionPaths.map(([label, title, body]) => (
                  <div key={label} className="bg-white px-2.5 py-2.5 sm:px-4 sm:py-3">
                    <p className="kcg-fine-label text-[#9a8a00]">{label}</p>
                    <p className="mt-1.5 text-[11px] font-bold leading-4 tracking-[-0.02em] text-[#15191b] sm:text-sm sm:leading-5">
                      {title}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-[#687171] sm:text-xs sm:leading-5">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <section className="section-shell py-12">
            <div className="border border-[#d8dfdd] bg-white px-6 py-8 text-sm text-[#687171]">
              상품 목록을 불러오는 중입니다.
            </div>
          </section>
        }
      >
        <ProductCatalog products={publicProducts} prices={prices} priceAnnouncement={priceAnnouncement} />
      </Suspense>
    </>
  );
}
