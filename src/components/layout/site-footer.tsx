import Image from "next/image";
import Link from "next/link";
import {
  getBusinessRegistrationDisplay,
  getLegalInfoHeading,
  getLegalPlaceholderNotice,
} from "@/lib/legal-info";
import { siteConfig, siteNavigation } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#dfe7e5] bg-white">
      <div className="section-shell grid gap-8 py-10 lg:grid-cols-[1fr_0.7fr_1.25fr]">
        <div className="min-w-0">
          <div className="relative h-[4.2rem] w-full max-w-[26rem]">
            <Image
              src={siteConfig.brandAssets.lockupPath}
              alt={siteConfig.brandAssets.lockupAlt}
              fill
              className="object-contain object-left"
              sizes="416px"
            />
          </div>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#687171]">
            종로 본사와 성창빌딩 매장의 금 시세, 상품/매입, 거래 전 준비 정보를 제공합니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {siteConfig.familyLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full border border-[#d7e0dd] bg-[#fbfdfc] px-3 py-1.5 text-xs font-semibold text-[#171717]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-[0.18em] text-[#15191b]">사이트 메뉴</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-medium text-[#687171]">
            {siteNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-[#15191b]">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={siteConfig.contact.naverMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-[#d7e0dd] px-3 py-1.5 text-xs font-semibold text-[#171717]"
            >
              본사 지도
            </a>
            <a
              href={siteConfig.locations.store.naverMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-[#d7e0dd] px-3 py-1.5 text-xs font-semibold text-[#171717]"
            >
              매장 지도
            </a>
          </div>
        </div>

        <div className="min-w-0 space-y-2 text-sm leading-7 text-[#687171]">
          <h3 className="text-sm font-semibold tracking-[0.18em] text-[#15191b]">
            {getLegalInfoHeading()}
          </h3>
          {siteConfig.company.isLegalInfoConfirmed ? (
            <>
              <p>상호: {siteConfig.company.legalBusinessName || siteConfig.brandName}</p>
              <p>대표: {siteConfig.company.representative}</p>
              <p>{getBusinessRegistrationDisplay()}</p>
              <p>본사: {siteConfig.locations.headOffice.address} / {siteConfig.locations.headOffice.phone}</p>
              <p>매장: {siteConfig.locations.store.address} / {siteConfig.locations.store.phone}</p>
              <p>이메일: {siteConfig.contact.email} · {siteConfig.contact.businessHours}</p>
              <p>사업장 주소: {siteConfig.company.registeredAddress}</p>
            </>
          ) : (
            <>
              <p>브랜드명: {siteConfig.brandName}</p>
              <p>대표: {siteConfig.company.representative}</p>
              <p>{getBusinessRegistrationDisplay()}</p>
              <p>운영시간: {siteConfig.contact.businessHours}</p>
              <p>업태 / 종목: {siteConfig.company.businessType} / {siteConfig.company.businessItems}</p>
              <p>개인정보관리책임: {siteConfig.company.privacyOfficer}</p>
              <p className="pt-2 text-[#8a9292]">
                {getLegalPlaceholderNotice() || siteConfig.company.legalNotice}
              </p>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
