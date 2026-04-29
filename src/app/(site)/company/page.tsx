import type { Metadata } from "next";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

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
              <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">COMPANY</p>
              <h1 className="mt-3 max-w-3xl text-[2rem] font-semibold leading-tight tracking-[-0.07em] text-[#15191b] sm:text-[2.7rem]">
                {siteConfig.company.legalBusinessName}
              </h1>
              <div className="mt-5 grid gap-px overflow-hidden border border-[#dbe4e0] bg-[#dbe4e0] sm:grid-cols-2">
                {[
                  ["대표", siteConfig.company.representative],
                  ["사업자등록번호", siteConfig.company.businessRegistrationNumber],
                  ["본사", siteConfig.locations.headOffice.address],
                  ["매장", siteConfig.locations.store.address],
                  ["대표번호", siteConfig.contact.phone],
                  ["이메일", siteConfig.contact.email],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white px-5 py-4">
                    <p className="text-xs font-semibold tracking-[0.2em] text-[#8b9292]">{label}</p>
                    <p className="mt-2 break-keep text-sm font-semibold leading-6 text-[#15191b]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-h-[13rem] overflow-hidden border border-[#dde5e2] bg-[#151518] sm:min-h-[20rem]">
            <Image
              src="/brand/signboard-clean.jpg"
              alt="한국센터금거래소 브랜드 간판"
              fill
              priority
              className="object-contain p-6"
              sizes="(min-width: 1024px) 42vw, 100vw"
            />
          </div>
        </div>
      </section>

      <section className="section-shell py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.36fr_0.64fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">BUSINESS INFO</p>
            <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.06em] text-[#15191b]">
              사업자 정보
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-2">
            {[
              ["법인명", siteConfig.company.legalBusinessName || siteConfig.brandName],
              ["대표자", siteConfig.company.representative],
              ["사업자등록번호", siteConfig.company.businessRegistrationNumber],
              ["법인등록번호", siteConfig.company.corporateRegistrationNumber || "-"],
              ["개업일", siteConfig.company.openedAt || "-"],
              ["본점 소재지", siteConfig.company.registeredAddress],
              ["업태", siteConfig.company.businessType],
              ["종목", siteConfig.company.businessItems],
            ].map(([label, value]) => (
              <div key={label} className="bg-white px-5 py-5">
                <p className="text-xs font-semibold tracking-[0.2em] text-[#8b9292]">{label}</p>
                <p className="mt-2 break-keep text-sm font-semibold leading-7 text-[#15191b]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#151518] py-10 text-white sm:py-12">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.36fr_0.64fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[#ffcc00]">HEAD OFFICE & STORE</p>
            <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.06em]">
              본사·매장
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-white/14 bg-white/14 sm:grid-cols-2">
            {[headOffice, store].map((location) => (
              <article key={location.label} className="bg-[#202024] px-6 py-6">
                <p className="text-xs font-semibold tracking-[0.22em] text-[#ffcc00]">{location.label}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em]">{location.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/72">{location.address}</p>
                <p className="mt-3 text-sm font-semibold text-white">대표전화 {location.phone}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-10 sm:py-12">
        <div className="grid gap-8 border-y border-[var(--color-line)] py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">FAMILY & NEWS</p>
            <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.06em] text-[#15191b]">
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
                <p className="text-base font-semibold tracking-[-0.03em] text-[#15191b]">{link.label}</p>
                <p className="mt-2 text-sm leading-6 text-[#687171]">{link.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
