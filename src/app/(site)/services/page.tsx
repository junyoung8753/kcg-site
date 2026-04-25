import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { ConsultationPlanner } from "@/components/trade/consultation-planner";
import { getRepository } from "@/lib/data";
import { serviceCategories, serviceExamples, serviceGuides, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "상품·서비스",
  description:
    "골드바, 실버바, 주얼리, 귀금속 매입 상담 등 한국센터금거래소의 취급 범위와 상담 가능 품목을 안내합니다.",
};

export default async function ServicesPage() {
  const repository = getRepository();
  const products = await repository.getProducts();

  return (
    <>
      <PageIntro
        eyebrow="상품·서비스"
        title="취급 품목과 상담 범위 안내"
        description="골드바·실버바 문의, 귀금속 매입, 주얼리 정리 상담은 품목과 수량에 따라 안내 방식이 달라질 수 있어 방문 전 기준을 먼저 정리했습니다."
        asideLabel="상담 기준"
        asideTitle="품목·수량에 따라 상담 가능 여부 먼저 안내"
        asideBody={
          <>
            <p>재고, 중량, 수량, 제작 가능 여부는 시점에 따라 달라질 수 있습니다.</p>
            <p>방문 전 대표번호 문의를 권장드립니다.</p>
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

      <section className="section-shell pb-18">
        <div className="mb-10 grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] lg:grid-cols-3">
          {serviceGuides.map((item) => (
            <div key={item.title} className="bg-[#fbfdfc] px-6 py-6">
              <p className="text-sm font-semibold tracking-[-0.02em] text-[#15191b]">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--color-line)]">
          {serviceCategories.map((category, index) => {
            const matched = products.find((product) => product.category === category.key);
            const examples = serviceExamples[category.key];

            return (
              <section
                key={category.key}
                className="grid gap-5 border-b border-[var(--color-line)] py-7 lg:grid-cols-[5rem_0.72fr_1fr_14rem]"
              >
                <p className="text-xs font-semibold tracking-[0.24em] text-[#9a8a00]">0{index + 1}</p>
                <div>
                  <h2 className="text-[1.9rem] font-semibold tracking-[-0.06em] text-[#15191b]">
                    {category.title}
                  </h2>
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    {matched?.status === "active" ? "현재 상담 가능" : "상담 접수 가능"}
                  </p>
                </div>
                <div className="text-sm leading-8 text-[var(--color-muted)]">
                  <p>{matched?.shortDescription || category.description}</p>
                  <p className="mt-3">
                    {matched?.description ||
                      "품목, 중량, 수량, 납기 일정에 따라 상담 후 안내드립니다."}
                  </p>
                  <div className="mt-4">
                    <p className="text-xs font-semibold tracking-[0.18em] text-[#9a8a00]">예시 문의</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {examples.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-[#dde4e1] bg-[#fbfdfc] px-3 py-1.5 text-xs leading-5 text-[#586160]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-sm lg:text-right">
                  <p className="font-semibold text-[#15191b]">
                    {matched?.status === "active" ? "현재 상담 가능" : "상담 접수 가능"}
                  </p>
                  <p className="mt-2 leading-7 text-[var(--color-muted)]">
                    {matched?.priceVisible ? "가격 노출" : matched?.priceNote || "상담 후 안내"}
                  </p>
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <ConsultationPlanner className="pt-0" />

      <section className="bg-[#fffbe8] py-14 sm:py-18">
        <div className="section-shell grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">상담 범위</p>
            <h2 className="mt-4 text-[1.95rem] font-semibold leading-tight tracking-[-0.06em] text-[#15191b] sm:text-[2.2rem]">
              필요한 품목과 예상 수량을 알려주시면 상담 가능 여부를 먼저 안내해 드립니다.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#687171]">
              재고, 중량, 수량, 제작 가능 여부는 시점에 따라 달라질 수 있어 방문 전 대표번호 문의를 권장드립니다.
            </p>
          </div>
          <a
            href={`tel:${siteConfig.contact.phone}`}
            className="rounded-full bg-[#ffcc00] px-6 py-3 text-center text-sm font-semibold text-[#171717] shadow-[0_14px_34px_rgba(255,204,0,0.2)] transition hover:bg-[#f4bd00]"
          >
            전화 문의 {siteConfig.contact.phone}
          </a>
        </div>
      </section>

      <section className="section-shell py-14 sm:py-18">
        <div className="grid gap-8 border-y border-[var(--color-line)] py-8 lg:grid-cols-3">
          <p className="text-sm leading-8 text-[var(--color-muted)]">
            투자용 골드바와 실버바는 중량, 브랜드, 수량에 따라 안내 가능한 범위가 달라질 수 있습니다.
          </p>
          <p className="text-sm leading-8 text-[var(--color-muted)]">
            주얼리와 예물 정리 상담은 순도, 부속, 파손 상태 확인 후 상담 기준을 안내합니다.
          </p>
          <p className="text-sm leading-8 text-[var(--color-muted)]">
            매입 상담은 제품 상태, 순도, 중량 확인 후 최종 금액을 확정하는 현장 상담 흐름을 유지합니다.
          </p>
        </div>
      </section>
    </>
  );
}
