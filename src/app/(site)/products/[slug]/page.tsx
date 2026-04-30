import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductCategoryLabel,
  getProductImageSrc,
  getProductPriceDisplay,
  getProductStatusLabel,
} from "@/lib/product-presenter";
import { getRepository } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const repository = getRepository();
  const product = (await repository.getProducts()).find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "상품/매입",
    };
  }

  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const repository = getRepository();
  const [products, prices] = await Promise.all([
    repository.getProducts(),
    repository.getPrices({ visibleOnly: true }),
  ]);
  const product = products.find((item) => item.slug === slug);

  if (!product) notFound();

  const imageSrc = getProductImageSrc(product);
  const price = getProductPriceDisplay(product, prices);

  return (
    <>
      <section className="border-b border-[#dfe7e5] bg-[#fbfdfc]">
        <div className="section-shell grid gap-8 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
          <div className="relative min-h-[24rem] overflow-hidden border border-[#dfe6e4] bg-[#eef4f2]">
            <Image
              src={imageSrc}
              alt={`${product.name} 이미지`}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 48vw, 100vw"
              priority
            />
          </div>
          <div className="flex flex-col justify-center border-y border-[#dfe6e4] py-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#dfe6e4] bg-white px-3 py-1.5 text-xs font-bold tracking-[0.14em] text-[#8a7600]">
                {getProductCategoryLabel(product.category)}
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold tracking-[0.14em] text-[#687171]">
                {getProductStatusLabel(product.status)}
              </span>
            </div>
            <h1 className="kcg-page-title mt-5 text-[#15191b]">
              {product.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#687171]">{product.description}</p>

            <div className="mt-7 grid gap-px overflow-hidden border border-[#dfe6e4] bg-[#dfe6e4] sm:grid-cols-2">
              <div className="bg-white px-5 py-5">
                <p className="text-xs font-bold tracking-[0.18em] text-[#9a8a00]">가격 안내</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#15191b]">
                  {price.main}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#687171]">
                  {price.detail}
                </p>
                <p className="mt-2 text-xs leading-5 text-[#8a9291]">{price.footnote}</p>
              </div>
              <div className="bg-white px-5 py-5">
                <p className="text-xs font-bold tracking-[0.18em] text-[#9a8a00]">상담 기준</p>
                <p className="mt-2 text-sm leading-7 text-[#687171]">
                  {product.publicNote || "중량, 수량, 재고와 고시 시세를 확인한 뒤 상담 기준을 안내합니다."}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#ffcc00] px-6 text-sm font-bold text-[#171717]"
              >
                전화 문의 {siteConfig.contact.phone}
              </a>
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#d7e0dd] bg-white px-6 text-sm font-semibold text-[#171717]"
              >
                상품 목록
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-12">
        <div className="grid gap-8 border-y border-[var(--color-line)] py-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">확인 항목</p>
            <h2 className="kcg-section-title mt-3 text-[#15191b]">
              문의 전 확인하면 상담이 빨라집니다
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-2">
            {(product.specs.length ? product.specs : ["중량", "수량", "상담 가능 시간"]).map((item) => (
              <p key={item} className="bg-white px-5 py-4 text-sm font-semibold text-[#15191b]">
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
