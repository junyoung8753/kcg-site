import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCatalog } from "@/components/products/product-catalog";
import { getRepository } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "상품/매입",
  description:
    "한국센터금거래소의 골드바, 순금 제품, 실버바, 고금·주얼리 매입, B2B 대량 상담 카테고리입니다.",
};

const categoryHighlights = [
  ["골드바", "투자용 골드바와 중량별 수급 상담"],
  ["순금 제품", "선물용·소량 순금 제품 판매 문의"],
  ["고금·주얼리", "예물·파손 제품·18K·14K 매입 기준 안내"],
  ["실버바", "실버바와 기념 제품 수급 상담"],
  ["B2B", "법인 보유분, 대량 수량, 기업 기념품 상담"],
];

export default async function ProductsPage() {
  const repository = getRepository();
  const [products, prices] = await Promise.all([
    repository.getProducts(),
    repository.getPrices({ visibleOnly: true }),
  ]);

  return (
    <>
      <section id="top" className="bg-[#f7faf8]">
        <div className="section-shell grid gap-8 py-10 sm:py-14 lg:grid-cols-[0.98fr_1.02fr] lg:items-stretch">
          <div className="relative min-h-[19rem] overflow-hidden border border-[#dde5e2] bg-[#eef4f2] sm:min-h-[28rem]">
            <Image
              src="/products/kcg-gold-bar-catalog-20260427-v2.jpg"
              alt="한국센터금거래소 골드바와 실버바 상품 안내"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 48vw, 100vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/56 via-black/16 to-transparent px-5 py-6 text-white sm:px-7">
              <p className="text-xs font-semibold tracking-[0.28em] text-[#ffd95a]">PRODUCTS & BUYING</p>
              <h1 className="mt-3 max-w-2xl text-[2.25rem] font-semibold leading-none tracking-[-0.07em] sm:text-[3rem]">
                상품/매입
              </h1>
            </div>
          </div>

          <div className="flex flex-col justify-between border-y border-[#dbe4e0] py-7 lg:py-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">KCG CATEGORY</p>
              <h2 className="mt-4 max-w-3xl text-[2rem] font-semibold leading-tight tracking-[-0.06em] text-[#15191b] sm:text-[2.6rem]">
                골드바·순금 제품과 고금 매입 범위를 먼저 확인합니다.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#687171]">
                중량별 골드바, 실버바, 순금제품, 고금·주얼리 매입 기준을 카테고리별로 확인합니다.
                표시 가격은 현재 고시가 기준 참고가이며 실제 금액은 문의 후 확정됩니다.
              </p>
            </div>

            <div className="mt-8 grid gap-px overflow-hidden border border-[#dfe6e3] bg-[#dfe6e3] sm:grid-cols-2">
              {categoryHighlights.map(([title, body]) => (
                <div key={title} className="bg-white px-5 py-4">
                  <p className="text-sm font-semibold tracking-[-0.02em] text-[#15191b]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#687171]">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="inline-flex rounded-full bg-[#ffcc00] px-5 py-3 text-sm font-semibold text-[#171717] shadow-[0_14px_30px_rgba(255,204,0,0.2)]"
              >
                전화 문의 {siteConfig.contact.phone}
              </a>
              <Link
                href="/prices"
                className="inline-flex rounded-full border border-[#d7e0dd] bg-white px-5 py-3 text-sm font-semibold text-[#171717]"
              >
                오늘 시세 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <section className="section-shell py-12">
            <div className="border border-[#d8dfdd] bg-white px-6 py-8 text-sm text-[#687171]">
              상품/매입 카탈로그를 불러오는 중입니다.
            </div>
          </section>
        }
      >
        <ProductCatalog products={products} prices={prices} contactPhone={siteConfig.contact.phone} />
      </Suspense>
    </>
  );
}
