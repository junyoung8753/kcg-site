import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { defaultStoreGuideHeroImages, getOperationalSlotImages } from "@/lib/site-assets";
import { getOptionalContactLinks, siteConfig, visitChecklist } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "매장안내",
  description:
    "한국센터금거래소의 본사, 매장, 전화번호, 거래 전 준비 사항을 확인합니다.",
};

const quickChecks = [
  ["고시 시각", "당일 회사 시세표 기준 시간을 먼저 확인"],
  ["품목·수량", "순금, 18K·14K, 백금, 은, 골드바, 실버바"],
  ["준비 자료", "신분증, 보증서·영수증, 포장 상태, 법인·상속 관련 서류"],
] as const;

const visitPrepCards = [
  ["신분증", "실물 매입 상담 시 본인 확인을 위해 지참해 주세요."],
  ["매입 품목", "순금·18K·14K·백금·은·골드바 등 품목과 예상 중량을 확인해 주세요."],
  ["보유 자료", "보증서, 영수증, 케이스가 있으면 함께 가져오시면 상담이 수월합니다."],
  ["법인·대리", "법인 보유분, 상속 정리, 대리 방문은 전화로 필요 서류를 먼저 확인해 주세요."],
] as const;

export default async function AboutPage() {
  const { headOffice, store } = siteConfig.locations;
  const optionalContactLinks = getOptionalContactLinks();
  const storeGuideHeroImages = await getOperationalSlotImages("store_guide_hero", defaultStoreGuideHeroImages);
  const heroImage = storeGuideHeroImages[0] ?? defaultStoreGuideHeroImages[0];

  return (
    <>
      <section className="bg-[#f7faf8]">
        <div className="section-shell grid gap-4 py-4 sm:gap-6 sm:py-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-stretch">
          <div
            data-testid="route-hero-media"
            className="relative h-[12rem] min-h-[12rem] overflow-hidden border border-[#dde5e2] bg-[#f7faf8] sm:h-[17rem] sm:min-h-[17rem] lg:h-[18rem] lg:min-h-[18rem]"
          >
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              fill
              preload
              className={heroImage.fit === "contain" ? "object-contain p-4 sm:p-5" : "object-cover"}
              style={{ objectPosition: heroImage.objectPosition }}
              sizes="(min-width: 1024px) 44vw, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(18,22,23,0.48))]" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
              <p className="kcg-fine-label text-[#ffcc00]">VISIT CHECK</p>
              <p className="mt-3 max-w-sm text-xl font-black leading-tight tracking-normal">
                위치, 전화, 준비 항목을 먼저 확인합니다.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center border-y border-[#dbe4e0] py-4 sm:py-6 lg:py-7">
            <p className="kcg-eyebrow text-[#9a8a00]">STORE GUIDE</p>
            <h1 className="kcg-page-title mt-3 text-[#15191b]">
              본사·매장 위치와 거래 전 준비 항목
            </h1>
            <p className="kcg-body-copy mt-4 max-w-2xl text-[#687171]">
              위치, 전화, 준비 항목만 먼저 확인합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={headOffice.naverMapUrl}
                target="_blank"
                rel="noreferrer"
                className="kcg-action-token inline-flex h-10 items-center justify-center rounded-full bg-[#ffcc00] px-4 text-sm font-bold text-[#171717]"
              >
                네이버 지도
              </a>
              <a
                href={headOffice.kakaoMapUrl}
                target="_blank"
                rel="noreferrer"
                className="kcg-action-token inline-flex h-10 items-center justify-center rounded-full border border-[#d7e0dd] bg-white px-4 text-sm font-semibold text-[#171717]"
              >
                카카오맵
              </a>
              <a
                href={`tel:${headOffice.phone}`}
                className="kcg-action-token inline-flex h-10 items-center justify-center rounded-full border border-[#d7e0dd] bg-white px-4 text-sm font-semibold text-[#171717]"
              >
                본사 전화
              </a>
            </div>
            <div className="mt-4 grid gap-px overflow-hidden border border-[#dfe6e3] bg-[#dfe6e3] sm:mt-6 sm:grid-cols-3">
              {quickChecks.map(([label, body]) => (
                <div key={label} className="bg-white px-3 py-3 sm:px-4 sm:py-4">
                  <p className="kcg-fine-label text-[#9a8a00]">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-[#687171]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-5 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.36fr_0.64fr]">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">LOCATION</p>
            <h2 className="kcg-section-title mt-3 text-[#15191b]">
              본사·매장
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-[#dfe6e4] bg-[#dfe6e4] sm:grid-cols-2">
            {[headOffice, store].map((location) => (
              <article key={location.label} className="bg-white px-5 py-5">
                <p className="kcg-fine-label text-[#9a8a00]">{location.label}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.022em] text-[#15191b]">{location.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#687171]">{location.address}</p>
                <p className="kcg-number-token mt-2 text-sm font-semibold text-[#15191b]">{location.phone}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={location.naverMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="kcg-action-token rounded-full border border-[#d7e0dd] bg-white px-4 py-2.5 text-sm font-semibold text-[#171717]"
                  >
                    네이버 지도
                  </a>
                  <a
                    href={location.kakaoMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="kcg-action-token rounded-full border border-[#d7e0dd] bg-white px-4 py-2.5 text-sm font-semibold text-[#171717]"
                  >
                    카카오맵
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-12 sm:pb-14">
        <div className="grid gap-8 border-y border-[var(--color-line)] py-8 lg:grid-cols-[0.36fr_0.64fr]">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">TRADE READY</p>
            <h2 className="kcg-section-title mt-3 text-[#15191b]">
              거래 전 준비 항목
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#687171]">
              전화 전 이 항목만 확인하면 주소, 준비물, 서류 질문을 줄일 수 있습니다.
            </p>
          </div>
          <div className="grid gap-5">
            <div className="grid gap-px overflow-hidden border border-[#dfe6e4] bg-[#dfe6e4] sm:grid-cols-2">
              {visitPrepCards.map(([title, body]) => (
                <div key={title} className="bg-white px-5 py-5">
                  <p className="kcg-fine-label text-[#9a8a00]">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-[#687171]">{body}</p>
                </div>
              ))}
            </div>
            <div className="overflow-hidden border border-[#dfe6e4] bg-white">
              {visitChecklist.map((item) => (
                <p key={item} className="border-b border-[#e4ebe9] px-5 py-4 text-sm leading-7 text-[#687171] last:border-b-0">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fffbe8] py-10 sm:py-12">
        <div className="section-shell grid gap-6 lg:grid-cols-[0.55fr_0.45fr] lg:items-center">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">CONTACT</p>
            <h2 className="kcg-section-title mt-2 text-[#15191b]">
              본사 전화 <span className="kcg-number-token inline-block">{siteConfig.contact.phone}</span>
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#687171]">
              품목, 예상 중량, 수량을 먼저 확인합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="kcg-action-token inline-flex h-11 items-center justify-center rounded-full bg-[#ffcc00] px-5 text-sm font-bold text-[#171717]"
            >
              전화
            </a>
            <Link
              href="/company"
              className="kcg-action-token inline-flex h-11 items-center justify-center rounded-full border border-[#d8dfdc] bg-white px-5 text-sm font-semibold text-[#171717]"
            >
              회사 정보
            </Link>
            {optionalContactLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="kcg-action-token inline-flex h-11 items-center justify-center rounded-full border border-[#d8dfdc] bg-white px-5 text-sm font-semibold text-[#171717]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
