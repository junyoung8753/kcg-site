import Image from "next/image";
import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import {
  getBusinessRegistrationDisplay,
  getLegalInfoHeading,
  getLegalPlaceholderNotice,
} from "@/lib/legal-info";
import { siteConfig, tradeNotes, tradeProcess, visitChecklist } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "매장안내",
  description:
    "한국센터금거래소의 성창빌딩 매장, 골든타워 본사, 대표번호, 당일 시세 확인 기준과 거래 전 준비 사항을 안내합니다.",
};

export default function AboutPage() {
  const { headOffice, store } = siteConfig.locations;

  return (
    <>
      <PageIntro
        eyebrow="매장안내"
        title="본사와 매장을 구분해 안내합니다"
        description="대표 문의는 본사 대표번호로, 실물 확인과 거래 동선은 성창빌딩 매장 기준으로 안내합니다. 전화 문의 시 품목과 수량을 먼저 알려주시면 확인이 빠릅니다."
        highlights={[
          {
            label: "매장",
            title: store.title,
            body: "순금·고금 매입과 실물 확인 동선은 성창빌딩 매장 기준으로 안내합니다.",
          },
          {
            label: "본사",
            title: headOffice.title,
            body: "대표 문의, B2B 대량 상담, 운영 확인은 골든타워 본사 기준으로 정리합니다.",
          },
          {
            label: "대표 문의",
            title: siteConfig.contact.phone,
            body: "영업시간, 준비 항목, 상담 가능 범위는 전화로 먼저 확인할 수 있습니다.",
          },
        ]}
        asideLabel="위치 정보"
        asideTitle={`${headOffice.title} · ${store.title}`}
        asideBody={
          <>
            <p>{siteConfig.contact.businessHours}</p>
            <p>본사: {headOffice.address}</p>
            <p>매장: {store.address}</p>
          </>
        }
        asideAction={
          <div className="grid gap-2 sm:grid-cols-3">
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="inline-flex justify-center rounded-full bg-[#ffcc00] px-5 py-3 text-sm font-semibold text-[#171717]"
            >
              본사 전화
            </a>
            <a
              href={store.naverMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex justify-center rounded-full border border-[#d7e0dd] bg-white px-5 py-3 text-sm font-semibold text-[#171717]"
            >
              매장 지도
            </a>
            <a
              href={headOffice.naverMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex justify-center rounded-full border border-[#d7e0dd] bg-white px-5 py-3 text-sm font-semibold text-[#171717]"
            >
              본사 지도
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
              KCG 실제 브랜드 자산과 사업자등록증 기준 정보를 화면에서도 같은 기준으로 안내합니다.
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">LOCATION & TRADE</p>
            <h2 className="mt-4 text-[1.95rem] font-semibold leading-tight tracking-[-0.06em] text-[#15191b] sm:text-[2.2rem]">
              본사·매장 안내와 거래 전 확인 항목
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#687171]">
              대표번호 문의, 매장 동선, 순도·중량 확인, 정산 안내를 같은 기준으로 볼 수 있도록
              위치와 거래 준비 정보를 한 화면에 정리했습니다.
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

        <div className="mt-12 grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] lg:grid-cols-2">
          {[headOffice, store].map((location) => (
            <article key={location.label} className="bg-white px-6 py-7 sm:px-7">
              <p className="text-xs font-semibold tracking-[0.24em] text-[#9a8a00]">{location.label}</p>
              <h2 className="mt-3 text-[1.75rem] font-semibold tracking-[-0.06em] text-[#15191b]">
                {location.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-[#687171]">{location.address}</p>
              <p className="mt-2 text-sm font-semibold text-[#15191b]">대표전화 {location.phone}</p>
              <p className="mt-4 text-sm leading-7 text-[#687171]">{location.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={`tel:${location.phone}`}
                  className="rounded-full bg-[#ffcc00] px-4 py-2.5 text-sm font-semibold text-[#171717]"
                >
                  전화 연결
                </a>
                <a
                  href={location.naverMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[#d7e0dd] bg-white px-4 py-2.5 text-sm font-semibold text-[#171717]"
                >
                  네이버 지도
                </a>
                <a
                  href={location.kakaoMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[#d7e0dd] bg-white px-4 py-2.5 text-sm font-semibold text-[#171717]"
                >
                  카카오맵
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-8 border-y border-[var(--color-line)] py-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div className="relative min-h-[18rem] overflow-hidden bg-[#eef4f2] sm:min-h-[23rem]">
            <Image
              src="/campaign/kcg-visit-desk-20260427.jpg"
              alt="거래 전 확인 데스크"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">TRADE READY</p>
            <h2 className="mt-4 text-[1.95rem] font-semibold leading-tight tracking-[-0.06em] text-[#15191b] sm:text-[2.2rem]">
              거래 전 준비 항목을 확인하면 현장 안내가 빨라집니다.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#687171]">
              고금 매입, 골드바·실버바 상담, B2B 대량 문의는 모두 실제 품목 확인이 필요합니다.
              전화 문의 시 품목과 수량을 먼저 알려주시면 상담 가능 범위를 정리해 드립니다.
            </p>
            <div className="mt-7 grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["품목", "순금, 18K·14K, 백금, 은, 골드바, 실버바 등 상담 품목"],
                ["자료", "보증서, 영수증, 포장 상태, 법인·상속 관련 확인 서류"],
                ["위치", "당일 고시 시각, 상담 가능 시간, 성창빌딩 매장과 골든타워 본사 위치"],
              ].map(([title, body]) => (
                <div key={title} className="bg-white px-5 py-5">
                  <p className="text-sm font-semibold tracking-[-0.02em] text-[#15191b]">{title}</p>
                  <p className="mt-2 text-sm leading-7 text-[#687171]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-24">
        <div className="grid gap-8 border-t border-[var(--color-line)] pt-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[var(--color-gold)]">거래 전 준비</p>
            <div className="mt-5 space-y-3 text-base leading-8 text-[var(--color-muted)]">
              {visitChecklist.map((item) => (
                <p key={item}>· {item}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[var(--color-gold)]">
              {getLegalInfoHeading()}
            </p>
            <div className="mt-5 space-y-3 text-base leading-8 text-[var(--color-muted)]">
              {siteConfig.company.isLegalInfoConfirmed ? (
                <>
                  <p>상호: {siteConfig.company.legalBusinessName || siteConfig.brandName}</p>
                  <p>대표: {siteConfig.company.representative}</p>
                  <p>{getBusinessRegistrationDisplay()}</p>
                  <p>법인등록번호: {siteConfig.company.corporateRegistrationNumber}</p>
                  <p>개업일: {siteConfig.company.openedAt}</p>
                  <p>본점 소재지: {siteConfig.company.registeredAddress}</p>
                  <p>업태 / 종목: {siteConfig.company.businessType} / {siteConfig.company.businessItems}</p>
                  <p>개인정보관리책임: {siteConfig.company.privacyOfficer}</p>
                </>
              ) : (
                <>
                  <p>브랜드명: {siteConfig.brandName}</p>
                  <p>대표: {siteConfig.company.representative}</p>
                  <p>{getBusinessRegistrationDisplay()}</p>
                  <p>상담 위치: {siteConfig.contact.address}</p>
                  <p>운영시간: {siteConfig.contact.businessHours}</p>
                  <p>업태 / 종목: {siteConfig.company.businessType} / {siteConfig.company.businessItems}</p>
                  <p>개인정보관리책임: {siteConfig.company.privacyOfficer}</p>
                  <p className="pt-2 text-sm leading-7">
                    {getLegalPlaceholderNotice() || siteConfig.company.legalNotice}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
