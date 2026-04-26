import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { ProductCatalog } from "@/components/products/product-catalog";
import { getRepository } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "상품 문의",
  description:
    "한국센터금거래소의 골드바, 실버바, 고금·주얼리, 매입 안내, 기념품·특수 제작 상담 카탈로그입니다.",
};

export default async function ProductsPage() {
  const repository = getRepository();
  const products = await repository.getProducts();

  return (
    <>
      <PageIntro
        eyebrow="상품 문의"
        title="골드바·실버바와 귀금속 상담 카탈로그"
        description="상품 가격을 확정 결제하는 쇼핑몰이 아니라, 고시 시세와 수급 상황을 확인한 뒤 전화와 방문 상담으로 이어지는 상품 문의 화면입니다."
        asideLabel="운영 방식"
        asideTitle="사진과 가격 문구는 관리자에서 교체 가능"
        asideBody={
          <>
            <p>상품별 이미지는 직접 촬영본 또는 승인된 이미지를 등록해 운영합니다.</p>
            <p>재고, 중량, 브랜드, 수량은 방문 전 대표번호로 먼저 확인합니다.</p>
          </>
        }
        asideAction={
          <a
            href={`tel:${siteConfig.contact.phone}`}
            className="inline-flex rounded-full bg-[#ffcc00] px-5 py-3 text-sm font-semibold text-[#171717]"
          >
            전화 문의 {siteConfig.contact.phone}
          </a>
        }
      />

      <ProductCatalog products={products} />
    </>
  );
}
