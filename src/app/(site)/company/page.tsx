import type { Metadata } from "next";
import Image from "next/image";
import { companyStory, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "회사소개",
  description:
    "주식회사 한국센터금거래소의 법인 정보, 본사·매장 구분, 패밀리 사이트를 확인할 수 있습니다.",
};

export default function CompanyPage() {
  const { headOffice, store } = siteConfig.locations;

  return (
    <>
      <section className="bg-[#f7faf8]">
        <div className="section-shell grid gap-6 py-6 sm:py-8 lg:grid-cols-[0.58fr_0.42fr] lg:items-stretch">
          <div className="flex flex-col justify-center border-y border-[#dbe4e0] py-6 lg:py-7">
            <div>
              <p className="kcg-eyebrow text-[#9a8a00]">COMPANY</p>
              <h1 className="kcg-page-title mt-3 max-w-3xl text-[#15191b]">
                {siteConfig.company.legalBusinessName}
              </h1>
              <div className="mt-5 grid gap-px overflow-hidden border border-[#dbe4e0] bg-[#dbe4e0] sm:grid-cols-2">
                {[
                  ["대표이사", siteConfig.company.representative],
                  ["사업자등록번호", siteConfig.company.businessRegistrationNumber],
                  ["본사", siteConfig.locations.headOffice.address],
                  ["매장", siteConfig.locations.store.address],
                  ["본사 전화", siteConfig.contact.phone],
                  ["이메일", siteConfig.contact.email],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white px-5 py-4">
                    <p className="kcg-fine-label text-[#8b9292]">{label}</p>
                    <p className="mt-2 break-keep text-sm font-semibold leading-6 text-[#15191b]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-h-[13rem] overflow-hidden border border-[#dde5e2] bg-[#151518] sm:min-h-[20rem]">
            <Image
              src="/campaign/kcg-visit-transaction-guide-20260503.webp"
              alt="한국센터금거래소 회사소개 상담 데스크 이미지"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 42vw, 100vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/82 via-black/24 to-transparent p-5">
              <div className="inline-flex items-center gap-3 bg-black/62 px-4 py-3 text-white backdrop-blur">
                <Image
                  src={siteConfig.brandAssets.symbolPath}
                  alt=""
                  width={42}
                  height={28}
                  className="h-auto w-10"
                />
                <span className="kcg-fine-label text-white/78">
                  KOREA CENTER GOLD EXCHANGE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-10 sm:py-12">
        <div className="grid gap-8 border-y border-[#dfe6e4] py-8 lg:grid-cols-[0.36fr_0.64fr]">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">KCG STORY</p>
            <h2 className="kcg-section-title mt-3 text-[#15191b]">
              {companyStory.missionTitle}
            </h2>
          </div>
          <div className="space-y-6">
            <p className="border-l-4 border-[#ffcc00] bg-[#fffdf4] px-5 py-4 text-base font-semibold leading-7 tracking-[-0.018em] text-[#15191b]">
              {companyStory.mission}
            </p>
            <div className="space-y-4 text-sm leading-7 text-[#5f6867]">
              <p className="kcg-eyebrow text-[#9a8a00]">
                {companyStory.introductionTitle}
              </p>
              {companyStory.introductionParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.36fr_0.64fr]">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">BUSINESS INFO</p>
            <h2 className="kcg-section-title mt-3 text-[#15191b]">
              사업자 정보
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-2">
            {[
              ["법인명", siteConfig.company.legalBusinessName || siteConfig.brandName],
              ["대표이사", siteConfig.company.representative],
              ["사업자등록번호", siteConfig.company.businessRegistrationNumber],
              ["법인등록번호", siteConfig.company.corporateRegistrationNumber || "-"],
              ["개업일", siteConfig.company.openedAt || "-"],
              ["본점 소재지", siteConfig.company.registeredAddress],
              ["업태", siteConfig.company.businessType],
              ["종목", siteConfig.company.businessItems],
            ].map(([label, value]) => (
              <div key={label} className="bg-white px-5 py-5">
                <p className="kcg-fine-label text-[#8b9292]">{label}</p>
                <p className="mt-2 break-keep text-sm font-semibold leading-7 text-[#15191b]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#151518] py-10 text-white sm:py-12">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.36fr_0.64fr]">
          <div>
            <p className="kcg-eyebrow text-[#ffcc00]">HEAD OFFICE & STORE</p>
            <h2 className="kcg-section-title mt-3">
              본사·매장
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-white/14 bg-white/14 sm:grid-cols-2">
            {[headOffice, store].map((location) => (
              <article key={location.label} className="bg-[#202024] px-6 py-6">
                <p className="kcg-fine-label text-[#ffcc00]">{location.label}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.022em]">{location.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/72">{location.address}</p>
                <p className="mt-3 text-sm font-semibold text-white">{location.label} 전화 {location.phone}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-10 sm:py-12">
        <div className="grid gap-8 border-y border-[var(--color-line)] py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">FAMILY & NEWS</p>
            <h2 className="kcg-section-title mt-4 text-[#15191b]">
              패밀리 사이트와 KCG 소식
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {siteConfig.familyLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="border border-[#dfe6e3] bg-white px-5 py-5 transition hover:bg-[#fffdf4]"
              >
                <p className="text-base font-semibold tracking-[-0.022em] text-[#15191b]">{link.label}</p>
                <p className="mt-2 text-sm leading-6 text-[#687171]">{link.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
