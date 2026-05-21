import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductCategoryLabel,
  getProductPriceDisplay,
  getProductStatusLabel,
  getPublicProductImage,
  findPublicCatalogProductBySlug,
  getProductWeightDisplayLabel,
} from "@/lib/product-presenter";
import { getRepository } from "@/lib/data";
import { getPriceAnnouncementDisplay } from "@/lib/price-announcement";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/types/product";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
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
  if (product.category === "custom_order") return "대량 상담";
  return getProductCategoryLabel(product.category);
}

function getDetailImageClass(product: Product, imageRole: ReturnType<typeof getPublicProductImage>["role"]) {
  if (isPackshotProduct(product) && imageRole === "verified_product") {
    return "object-contain p-4 sm:p-6";
  }

  if (product.category === "gold_bar" || imageRole === "representative_lineup") {
    return "object-contain p-0";
  }

  return "object-cover";
}

function getDetailImageStatusBadge(product: Product, imageRole: ReturnType<typeof getPublicProductImage>["role"]) {
  if (imageRole === "verified_product") return getProductStatusLabel(product.status);
  if (imageRole === "representative_lineup" || imageRole === "representative_category") return "상담 확인";
  if (imageRole === "image_pending") return "이미지 준비중";
  return "전화 확인";
}

function ProductDetailTrustPlaceholder() {
  return (
    <div
      data-testid="product-detail-trust-placeholder"
      className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(145deg,#ffffff_0%,#fbfdfc_55%,#fff8dc_100%)] p-6 text-center sm:p-8"
    >
      <div className="max-w-sm">
        <p className="kcg-fine-label text-[#9a8a00]">이미지 준비중</p>
        <p className="mt-4 text-base font-semibold leading-7 text-[#687171]">
          승인된 상품 사진이 준비되면 같은 위치에 표시합니다.
        </p>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const repository = getRepository();
  const product = findPublicCatalogProductBySlug(await repository.getProducts(), slug);

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
  const product = findPublicCatalogProductBySlug(products, slug);

  if (!product) notFound();

  const productImage = getPublicProductImage(product);
  const imageSrc = productImage.src;
  const price = getProductPriceDisplay(product, prices);
  const priceAnnouncement = getPriceAnnouncementDisplay(prices[0]?.announcedAt);
  const weight = formatProductWeight(product);

  return (
    <>
      <section className="border-b border-[#dfe7e5] bg-[#fbfdfc]">
        <div className="section-shell grid gap-8 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
          <div
            data-testid="product-detail-image-stage"
            className="relative min-h-[24rem] overflow-hidden rounded-[0.5rem] border border-[#d6dedb] bg-[#fffefd] shadow-[0_22px_46px_rgba(21,25,27,0.1)]"
          >
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={productImage.alt}
                fill
                className={getDetailImageClass(product, productImage.role)}
                sizes="(min-width: 1024px) 48vw, 100vw"
                data-image-role={productImage.role}
                priority
              />
            ) : (
              <ProductDetailTrustPlaceholder />
            )}
            <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
              <span className="rounded-full bg-[#15191b]/86 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                {getDetailImageStatusBadge(product, productImage.role)}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center border-y border-[#dfe6e4] py-8">
            <p className="kcg-eyebrow text-[#9a8a00]">PRODUCT INFO</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#dfe6e4] bg-white px-3 py-1.5 text-xs font-bold tracking-[0.11em] text-[#8a7600]">
                {getProductCategoryLabel(product.category)}
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold tracking-[0.11em] text-[#687171]">
                {getProductStatusLabel(product.status)}
              </span>
            </div>
            <h1 className="kcg-page-title mt-5 text-[#15191b]">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {weight ? (
                <span className="bg-[#15191b] px-3 py-1.5 text-xs font-bold tracking-[0.04em] text-white">
                  중량 {weight}
                </span>
              ) : null}
              <span className="bg-[#fff4c2] px-3 py-1.5 text-xs font-bold tracking-[0.04em] text-[#6f5e00]">
                {getProductMerchTag(product)}
              </span>
              {product.makingFee ? (
                <span className="bg-[#f6faf8] px-3 py-1.5 text-xs font-bold tracking-[0.04em] text-[#53605d]">
                  공임 반영
                </span>
              ) : null}
            </div>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#687171]">{product.description}</p>

            <div className="mt-7 grid gap-px overflow-hidden border border-[#dfe6e4] bg-[#dfe6e4] sm:grid-cols-[1.1fr_0.9fr]">
              <div className="bg-[#fffaf0] px-5 py-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="kcg-data-label text-[#9a8a00]">가격 안내</p>
                  <span className="rounded-full border border-[#d9ad00]/45 bg-white px-2.5 py-1 text-[10px] font-black tracking-[0.1em] text-[#6f4b00]">
                    {priceAnnouncement.noticeBadgeLabel}
                  </span>
                </div>
                <p className="kcg-price-primary mt-2 text-2xl font-black text-[#15191b]">
                  {price.main}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#687171]">
                  {price.detail}
                </p>
                <p className="mt-2 text-xs leading-5 text-[#8a9291]">{price.footnote}</p>
                <p
                  data-testid="product-detail-price-confirmation-policy"
                  className="mt-2 text-xs font-semibold leading-5 text-[#725100]"
                >
                  상품 참고가는 거래 확정가가 아니며, 주말·공휴일·회사 휴무일·영업시간 외에는 전화 또는 현장 확인 후
                  실제 적용가를 안내합니다.
                </p>
              </div>
              <div className="bg-white px-5 py-5">
                <p className="kcg-data-label text-[#9a8a00]">상담 기준</p>
                <p className="mt-2 text-sm leading-7 text-[#687171]">
                  {product.publicNote || "중량, 수량, 재고와 고시 시세를 확인한 뒤 상담 기준을 안내합니다."}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="kcg-action-token inline-flex h-12 items-center justify-center rounded-full bg-[#ffcc00] px-6 text-sm font-bold text-[#171717]"
              >
                전화 상담 {siteConfig.contact.phone}
              </a>
              <Link
                href="/products"
                className="kcg-action-token inline-flex h-12 items-center justify-center rounded-full border border-[#d7e0dd] bg-white px-6 text-sm font-semibold text-[#171717]"
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
