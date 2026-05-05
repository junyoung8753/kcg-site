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

const decisionPaths = [
  ["살 때", "골드바·실버바·순금제품", "중량, 수량, 수급 가능 여부를 확인합니다."],
  ["팔 때", "고금·주얼리 매입", "내가 팔 때 기준과 실물 확인 항목을 먼저 봅니다."],
  ["대량", "B2B·기업", "품목 목록, 예상 수량, 희망 일정을 정리합니다."],
] as const;

export default async function ProductsPage() {
  const repository = getRepository();
  const [products, prices] = await Promise.all([
    repository.getProducts(),
    repository.getPrices({ visibleOnly: true }),
  ]);

  return (
    <>
      <section id="top" className="bg-[#f7faf8]">
        <div className="section-shell grid gap-3 py-3 sm:gap-6 sm:py-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-stretch">
          <div className="relative min-h-[8.8rem] overflow-hidden border border-[#dde5e2] bg-[#eef4f2] sm:min-h-[17rem] lg:min-h-[18rem]">
            <Image
              src="/products/kcg-product-minimal-bars-20260506.webp"
              alt="한국센터금거래소 골드바와 실버바 상품 이미지"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 48vw, 100vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/62 via-black/18 to-transparent px-4 py-3 text-white sm:px-6 sm:py-5">
              <p className="kcg-eyebrow text-[#ffd95a]">PRODUCTS & BUYING</p>
              <h1 className="mt-1 text-[1.72rem] font-semibold leading-tight tracking-[-0.02em] sm:kcg-page-title sm:mt-2 sm:max-w-2xl">
                상품/매입
              </h1>
            </div>
          </div>

          <div className="flex flex-col justify-center border-y border-[#dbe4e0] py-3 sm:py-6 lg:py-7">
            <div>
              <p className="kcg-eyebrow text-[#9a8a00]">KCG CATEGORY</p>
              <h2 className="mt-2 max-w-3xl text-[1.45rem] font-semibold leading-tight tracking-[-0.02em] text-[#15191b] sm:kcg-section-title sm:mt-3">
                탭에서 품목을 고르고 기준가를 확인합니다.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687171] sm:kcg-body-copy sm:mt-4">
                골드바, 실버바, 순금제품, 고금 매입 항목을 바로 볼 수 있습니다.
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
        <ProductCatalog products={products} prices={prices} />
      </Suspense>
    </>
  );
}
