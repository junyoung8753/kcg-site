import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { ProductCatalog } from "@/components/products/product-catalog";
import { getRepository } from "@/lib/data";

export const metadata: Metadata = {
  title: "상품/매입",
  description:
    "한국센터금거래소의 골드바, 순금 제품, 실버바, 고금·주얼리 매입, B2B 대량 상담 카테고리입니다.",
};

export default async function ProductsPage() {
  const repository = getRepository();
  const [products, prices] = await Promise.all([
    repository.getProducts(),
    repository.getPrices({ visibleOnly: true }),
  ]);

  return (
    <>
      <section id="top" className="bg-[#f7faf8]">
        <div className="section-shell grid gap-6 py-6 sm:py-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-stretch">
          <div className="relative min-h-[13rem] overflow-hidden border border-[#dde5e2] bg-[#eef4f2] sm:min-h-[17rem] lg:min-h-[18rem]">
            <Image
              src="/products/kcg-gold-bar-catalog-20260427-v2.jpg"
              alt="한국센터금거래소 골드바와 실버바 상품 안내"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 48vw, 100vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/62 via-black/18 to-transparent px-5 py-5 text-white sm:px-6">
              <p className="text-xs font-semibold tracking-[0.28em] text-[#ffd95a]">PRODUCTS & BUYING</p>
              <h1 className="mt-2 max-w-2xl text-[2rem] font-semibold leading-none tracking-[-0.07em] sm:text-[2.55rem]">
                상품/매입
              </h1>
            </div>
          </div>

          <div className="flex flex-col justify-center border-y border-[#dbe4e0] py-6 lg:py-7">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">KCG CATEGORY</p>
              <h2 className="mt-3 max-w-3xl text-[1.8rem] font-semibold leading-tight tracking-[-0.06em] text-[#15191b] sm:text-[2.25rem]">
                골드바, 실버바, 순금제품, 고금 매입을 바로 고릅니다.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#687171]">
                탭에서 품목을 고르면 현재 고시가 기준 참고가와 상품 정보를 바로 확인할 수 있습니다.
              </p>
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
        <ProductCatalog products={products} prices={prices} />
      </Suspense>
    </>
  );
}
