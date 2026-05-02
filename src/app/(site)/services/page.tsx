import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { serviceFaqs, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "서비스",
  description:
    "한국센터금거래소의 취급 품목, 당일 고시 기준, 실물 확인과 거래 전 준비 항목을 확인합니다.",
};

const flowSteps = [
  ["01", "취급 품목", "골드바·실버바·순금제품·고금·주얼리"],
  ["02", "당일 기준", "회사 고시 시세와 중량·수량 확인"],
  ["03", "실물 확인", "순도·상태·보증서 확인 후 금액 확정"],
] as const;

const serviceRows = [
  ["매입 가능 품목", "순금, 18K·14K, 백금, 은, 예물·주얼리, 고금"],
  ["판매·수급 품목", "골드바, 실버바, 순금제품, 기념품"],
  ["대량·법인", "법인 보유분, 기업 기념품, 상속·정리 목적 물량"],
  ["거래 전 준비", "신분증, 보증서·영수증, 예상 중량, 수량, 제품 상태"],
] as const;

export default function ServicesPage() {
  return (
    <>
      <section className="bg-[#f7faf8]">
        <div className="section-shell grid gap-6 py-6 sm:py-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-stretch">
          <div className="relative min-h-[13rem] overflow-hidden border border-[#dde5e2] bg-[#eef4f2] sm:min-h-[17rem] lg:min-h-[18rem]">
            <Image
              src="/campaign/kcg-advisor-counter-20260430.webp"
              alt="장갑을 착용한 금거래소 상담 데스크"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 42vw, 100vw"
              priority
            />
          </div>

          <div className="flex flex-col justify-center border-y border-[#dbe4e0] py-6 lg:py-7">
            <p className="kcg-eyebrow text-[#9a8a00]">SERVICE FLOW</p>
            <h1 className="kcg-page-title mt-3 text-[#15191b]">
              취급 품목, 당일 기준, 실물 확인 순서로 봅니다.
            </h1>
            <div className="mt-6 grid gap-px overflow-hidden border border-[#dfe6e3] bg-[#dfe6e3] sm:grid-cols-3">
              {flowSteps.map(([number, title, body]) => (
                <div key={title} className="bg-white px-4 py-4">
                  <p className="kcg-fine-label text-[#9a8a00]">{number}</p>
                  <p className="mt-2 text-base font-bold tracking-[-0.02em] text-[#15191b]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#687171]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.36fr_0.64fr]">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">거래 기준</p>
            <h2 className="kcg-section-title mt-3 text-[#15191b]">
              필요한 항목만 빠르게 확인합니다.
            </h2>
          </div>
          <div className="overflow-hidden border border-[#dfe6e4] bg-white">
            {serviceRows.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-3 border-b border-[#e4ebe9] px-5 py-4 text-sm last:border-b-0 sm:grid-cols-[11rem_1fr]"
              >
                <p className="font-bold tracking-[-0.03em] text-[#15191b]">{label}</p>
                <p className="leading-6 text-[#687171]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-12 sm:pb-14">
        <div className="grid gap-8 border-y border-[var(--color-line)] py-8 lg:grid-cols-[0.36fr_0.64fr]">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">FAQ</p>
            <h2 className="kcg-section-title mt-3 text-[#15191b]">
              자주 묻는 기준
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-line)]">
            {serviceFaqs.map((item) => (
              <details key={item.question} className="group py-5 first:pt-0 last:pb-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-semibold tracking-[-0.04em] text-[#15191b] marker:hidden">
                  <span>{item.question}</span>
                  <span className="shrink-0 text-xl font-light text-[#9a8a00] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fffbe8] py-10 sm:py-12">
        <div className="section-shell flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">NEXT</p>
            <h2 className="kcg-section-title mt-2 text-[#15191b]">
              품목별 상품과 매입 기준은 상품/매입에서 확인하세요.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#ffcc00] px-5 text-sm font-bold text-[#171717]"
            >
              상품/매입 보기
            </Link>
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#d8dfdc] bg-white px-5 text-sm font-semibold text-[#171717]"
            >
              {siteConfig.contact.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
