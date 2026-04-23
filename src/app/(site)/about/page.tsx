import Image from "next/image";
import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { siteConfig, tradeNotes, tradeProcess, visitChecklist } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "거래 안내",
  description:
    "한국센터금거래소의 방문 위치, 매입 상담 절차, 당일 시세 확인 기준, 준비 사항을 안내합니다.",
};

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="거래 안내"
        title="방문 상담과 매입 절차 안내"
        description="한국센터금거래소는 당일 시세 확인, 현장 감정, 매입 상담, 상품 문의가 같은 흐름으로 이어지도록 운영 정보를 정리해 안내합니다."
        asideLabel="방문 정보"
        asideTitle={siteConfig.contact.address}
        asideBody={
          <>
            <p>{siteConfig.contact.businessHours}</p>
            <p>{siteConfig.contact.parkingNote}</p>
          </>
        }
        asideAction={
          <div className="grid gap-2 sm:grid-cols-3">
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="inline-flex justify-center rounded-full bg-[#ffcc00] px-5 py-3 text-sm font-semibold text-[#171717]"
            >
              전화 연결
            </a>
            <a
              href={siteConfig.contact.naverMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex justify-center rounded-full border border-[#d7e0dd] bg-white px-5 py-3 text-sm font-semibold text-[#171717]"
            >
              네이버 지도
            </a>
            <a
              href={siteConfig.contact.kakaoMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex justify-center rounded-full border border-[#d7e0dd] bg-white px-5 py-3 text-sm font-semibold text-[#171717]"
            >
              카카오맵
            </a>
          </div>
        }
      />

      <section className="section-shell py-14 sm:py-18">
        <div className="grid gap-10 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="overflow-hidden border border-[var(--color-line)] bg-white/78">
            <div className="bg-[#151518] px-5 py-7 sm:px-8">
              <div className="relative aspect-[21/5]">
                <Image
                  src="/brand/signboard-clean.jpg"
                  alt="한국센터금거래소 간판"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1280px) 100vw, 48vw"
                />
              </div>
            </div>
            <div className="border-t border-[var(--color-line)] px-6 py-5 text-sm leading-7 text-[var(--color-muted)]">
              종로 골든타워 303호에서 확인할 수 있는 실제 간판과 상호 기준을 화면에서도 동일하게 안내합니다.
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">거래 기준</p>
            <h2 className="mt-4 text-[1.95rem] font-semibold leading-tight tracking-[-0.06em] text-[#15191b] sm:text-[2.2rem]">
              거래 기준과 현장 확인 항목
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#687171]">
              시세 확인, 순도·중량 검수, 정산 안내를 같은 기준으로 진행할 수 있도록
              방문 상담 흐름을 정리했습니다.
            </p>
            <div className="mt-8 border-y border-[var(--color-line)]">
              {tradeNotes.map((item) => (
                <p
                  key={item}
                  className="border-b border-[var(--color-line)] py-5 text-base leading-8 text-[var(--color-muted)] last:border-b-0"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-0 border-y border-[var(--color-line)] lg:grid-cols-3">
          {tradeProcess.map((step, index) => (
            <div
              key={step.title}
              className="border-b border-[var(--color-line)] py-7 lg:border-b-0 lg:border-r lg:px-7 lg:last:border-r-0"
            >
              <p className="text-xs font-semibold tracking-[0.24em] text-[#9a8a00]">절차 0{index + 1}</p>
              <h3 className="mt-4 text-[1.65rem] font-semibold tracking-[-0.06em] text-[#15191b]">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-8 text-[var(--color-muted)]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell pb-24">
        <div className="grid gap-8 border-t border-[var(--color-line)] pt-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[var(--color-gold)]">방문 전 준비</p>
            <div className="mt-5 space-y-3 text-base leading-8 text-[var(--color-muted)]">
              {visitChecklist.map((item) => (
                <p key={item}>· {item}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[var(--color-gold)]">
              {siteConfig.company.isLegalInfoConfirmed ? "사업자 정보" : "브랜드 및 운영 정보"}
            </p>
            <div className="mt-5 space-y-3 text-base leading-8 text-[var(--color-muted)]">
              {siteConfig.company.isLegalInfoConfirmed ? (
                <>
                  <p>상호: {siteConfig.company.legalBusinessName || siteConfig.brandName}</p>
                  <p>대표: {siteConfig.company.representative}</p>
                  <p>사업자등록번호: {siteConfig.company.businessRegistrationNumber}</p>
                  <p>사업장 주소: {siteConfig.company.registeredAddress}</p>
                  <p>업태 / 종목: {siteConfig.company.businessType} / {siteConfig.company.businessItems}</p>
                  <p>개인정보관리책임: {siteConfig.company.privacyOfficer}</p>
                </>
              ) : (
                <>
                  <p>브랜드명: {siteConfig.brandName}</p>
                  <p>대표: {siteConfig.company.representative}</p>
                  <p>사업자등록번호: {siteConfig.company.businessRegistrationNumber}</p>
                  <p>방문 상담 위치: {siteConfig.contact.address}</p>
                  <p>운영시간: {siteConfig.contact.businessHours}</p>
                  <p>업태 / 종목: {siteConfig.company.businessType} / {siteConfig.company.businessItems}</p>
                  <p>개인정보관리책임: {siteConfig.company.privacyOfficer}</p>
                  <p className="pt-2 text-sm leading-7">{siteConfig.company.legalNotice}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
