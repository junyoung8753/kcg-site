import Image from "next/image";
import Link from "next/link";
import { siteConfig, siteNavigation } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#dfe7e5] bg-white">
      <div className="section-shell grid gap-10 py-12 lg:grid-cols-[1.05fr_0.55fr_0.8fr_0.9fr]">
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
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#687171]">
            종로 금 시세, 귀금속 매입 상담, 골드바·실버바 문의를 실제 거래 흐름에 맞춰
            안내하는 한국센터금거래소 운영 안내 사이트입니다.
          </p>
          <p className="mt-5 text-sm leading-7 text-[#8a9292]">{siteConfig.company.transactionNotice}</p>
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-[0.18em] text-[#15191b]">사이트 메뉴</h3>
          <div className="mt-4 grid gap-3 text-sm font-medium text-[#687171]">
            {siteNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-[#15191b]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-3 text-sm leading-7 text-[#687171]">
          <h3 className="text-sm font-semibold tracking-[0.18em] text-[#15191b]">상담 안내</h3>
          <p className="text-xl font-bold text-[#15191b]">{siteConfig.contact.phone}</p>
          <p>{siteConfig.contact.address}</p>
          <p>{siteConfig.contact.businessHours}</p>
          <p>{siteConfig.company.locationGuide}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href={siteConfig.contact.naverMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-[#d7e0dd] px-3 py-1.5 text-xs font-semibold text-[#171717]"
            >
              네이버 지도
            </a>
            <a
              href={siteConfig.contact.kakaoMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-[#d7e0dd] px-3 py-1.5 text-xs font-semibold text-[#171717]"
            >
              카카오맵
            </a>
          </div>
        </div>

        <div className="min-w-0 space-y-2 text-sm leading-7 text-[#687171]">
          <h3 className="text-sm font-semibold tracking-[0.18em] text-[#15191b]">
            {siteConfig.company.isLegalInfoConfirmed ? "사업자 정보" : "브랜드 및 운영 정보"}
          </h3>
          {siteConfig.company.isLegalInfoConfirmed ? (
            <>
              <p>상호: {siteConfig.company.legalBusinessName || siteConfig.brandName}</p>
              <p>대표: {siteConfig.company.representative}</p>
              <p>사업자등록번호: {siteConfig.company.businessRegistrationNumber}</p>
              <p>사업장 주소: {siteConfig.company.registeredAddress}</p>
              <p>업태: {siteConfig.company.businessType}</p>
              <p>종목: {siteConfig.company.businessItems}</p>
              <p>개인정보관리책임: {siteConfig.company.privacyOfficer}</p>
            </>
          ) : (
            <>
              <p>브랜드명: {siteConfig.brandName}</p>
              <p>대표: {siteConfig.company.representative}</p>
              <p>사업자 등록정보: 정식 등록증 확인 후 반영 예정</p>
              <p>운영시간: {siteConfig.contact.businessHours}</p>
              <p>업태 / 종목: {siteConfig.company.businessType} / {siteConfig.company.businessItems}</p>
              <p>개인정보관리책임: {siteConfig.company.privacyOfficer}</p>
              <p className="pt-2 text-[#8a9292]">{siteConfig.company.legalNotice}</p>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
