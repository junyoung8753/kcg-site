import Image from "next/image";
import Link from "next/link";
import {
  getProductCategoryLabel,
  getProductImageSrc,
  getProductPriceLabel,
  getProductStatusLabel,
  sortProductsForPublic,
} from "@/lib/product-presenter";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/types/product";

export function ProductCatalog({ products }: { products: Product[] }) {
  const visibleProducts = sortProductsForPublic(products.filter((product) => product.status !== "hidden"));

  if (!visibleProducts.length) {
    return (
      <section className="section-shell py-14">
        <div className="border border-[var(--color-line)] bg-white px-6 py-8">
          <p className="text-lg font-semibold text-[#15191b]">현재 공개된 상품 문의 항목이 없습니다.</p>
          <p className="mt-3 text-sm leading-7 text-[#687171]">
            골드바·실버바 수급과 고금 매입 상담은 대표번호로 먼저 문의해 주세요.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">상담형 상품 카탈로그</p>
          <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.06em] text-[#15191b]">
            사진과 가격 문구를 등록해 운영할 상품 문의란
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#687171]">
            온라인 결제나 장바구니가 아닌 전화 상담형 카탈로그입니다. 중량, 수량, 브랜드, 재고와 고시 시세를 확인한
            뒤 상담 기준을 안내합니다.
          </p>
        </div>
        <a href={`tel:${siteConfig.contact.phone}`} className="text-sm font-semibold text-[#707878]">
          전화 문의 {siteConfig.contact.phone}
        </a>
      </div>

      <div className="grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-2 xl:grid-cols-3">
        {visibleProducts.map((product) => {
          const imageSrc = getProductImageSrc(product);
          return (
            <article key={product.id} className="bg-white">
              <Link href={`/products/${product.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#eef4f2]">
                  <Image
                    src={imageSrc}
                    alt={`${product.name} 이미지`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1280px) 410px, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className="px-5 py-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#dfe6e4] px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-[#8a7600]">
                      {getProductCategoryLabel(product.category)}
                    </span>
                    <span className="rounded-full bg-[#f7fbfa] px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-[#687171]">
                      {getProductStatusLabel(product.status)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-[-0.05em] text-[#15191b]">{product.name}</h3>
                  <p className="mt-3 min-h-[3.25rem] text-sm leading-7 text-[#687171]">{product.shortDescription}</p>
                  <div className="mt-5 border-t border-[#e4ebe9] pt-4">
                    <p className="text-xs font-bold tracking-[0.18em] text-[#9a8a00]">가격 안내</p>
                    <p className="mt-2 text-lg font-semibold text-[#15191b]">{getProductPriceLabel(product)}</p>
                    <p className="mt-2 text-sm leading-6 text-[#687171]">
                      {product.priceNote || "최종 안내는 대표번호 상담 후 진행합니다."}
                    </p>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
