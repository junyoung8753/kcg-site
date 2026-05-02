import Link from "next/link";
import Image from "next/image";
import { PurchaseGuide } from "@/components/home/purchase-guide";
import { MarketDashboard } from "@/components/market/market-dashboard";
import { PriceLineup } from "@/components/market/price-lineup";
import { getRepository } from "@/lib/data";
import { getBusinessInfoLine } from "@/lib/legal-info";
import { getMarketDashboardData } from "@/lib/market-data";
import { getPriceAnnouncementDisplay } from "@/lib/price-announcement";
import { getProductImageSrc, getProductStatusLabel, productCatalogTabs } from "@/lib/product-presenter";
import {
  homeHighlights,
  siteConfig,
  visitChecklist,
} from "@/lib/site-config";

const quickLinks = [
  { href: "/prices", label: "시세조회", caption: "회사 고시 시세와 국제 참고 시세" },
  { href: "/products", label: "상품/매입", caption: "골드바·실버바·고금 매입 안내" },
  { href: "/services", label: "서비스", caption: "매입 가능 품목과 상담 범위" },
  { href: "/about", label: "매장안내", caption: "본사와 매장 위치" },
  { href: "/company", label: "회사소개", caption: "법인 정보와 패밀리 사이트" },
  { href: "/announcements", label: "공지", caption: "시세 운영과 거래 준비 안내" },
];

export async function FinalHome() {
  const repository = getRepository();
  const [prices, history, announcements, products, marketData] = await Promise.all([
    repository.getPrices({ visibleOnly: true }),
    repository.getPriceHistory(10),
    repository.getAnnouncements({ limit: 4 }),
    repository.getProducts(),
    getMarketDashboardData(),
  ]);

  const announcedAt = prices[0]?.announcedAt;
  const announcementDisplay = getPriceAnnouncementDisplay(announcedAt);
  const businessInfoLine = getBusinessInfoLine();

  return (
    <>
      <PriceLineup
        prices={prices}
        history={history}
        announcedLabel={announcementDisplay.valueLabel}
        announcedDateLabel={announcementDisplay.dateLabel}
        announcedHeading={announcementDisplay.detailLabel}
        krwRate={marketData.krwRate}
      />

      <MarketDashboard data={marketData} />

      <section className="border-y border-[#dfe7e5] bg-white">
        <div className="section-shell grid gap-0 py-0 xl:grid-cols-[0.94fr_0.62fr_0.62fr]">
          <div className="border-x border-[#e4ebe9]">
            <div className="border-b border-[#e4ebe9] bg-[#f7fbfa] px-6 py-4 sm:px-8">
              <p className="kcg-eyebrow text-[#9a7800]">KCG 바로가기</p>
            </div>
            <div className="grid gap-px bg-[#e4ebe9] sm:grid-cols-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="min-h-28 bg-white px-6 py-5 transition hover:bg-[#fff9df] sm:px-8"
                >
                  <p className="kcg-card-title text-[#15191b]">{item.label}</p>
                  <p className="mt-3 text-sm leading-6 text-[#67706f]">{item.caption}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-r border-[#e4ebe9] bg-[#fbfdfc] px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="kcg-eyebrow text-[#9a7800]">공지사항</p>
                <h2 className="kcg-section-title mt-2 text-[#15191b]">
                  시세 운영과 거래 준비 안내
                </h2>
              </div>
              <Link href="/announcements" className="text-sm font-semibold text-[#697170]">
                전체보기
              </Link>
            </div>
            <div className="mt-5 border-t border-[#e4ebe9]">
              {announcements.length ? (
                announcements.map((item) => (
                  <Link
                    key={item.id}
                    href={`/announcements/${item.slug}`}
                    className="grid gap-3 border-b border-[#e4ebe9] py-4 sm:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="font-semibold text-[#171717]">
                        {item.isPinned ? "[중요] " : ""}
                        {item.title}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#707878]">{item.summary}</p>
                    </div>
                    <p className="text-sm text-[#7b8383]">
                      {new Date(item.publishedAt).toLocaleDateString("ko-KR", {
                        timeZone: "Asia/Seoul",
                      })}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="border-b border-[#e4ebe9] py-4">
                  <p className="font-semibold text-[#171717]">현재 등록된 공지가 없습니다.</p>
                  <p className="mt-2 text-sm leading-6 text-[#707878]">
                    당일 시세와 상담 가능 시간은 본사 전화로 먼저 확인해 주세요.
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-[#e3e9e7] bg-white px-5 py-5 text-sm leading-7 text-[#66706f]">
              <p className="font-semibold text-[#15191b]">
                {announcementDisplay.homeLabel}: {announcementDisplay.valueLabel}
              </p>
              <p className="mt-2">{siteConfig.company.transactionNotice}</p>
              <p className="mt-3 text-xs leading-6 text-[#8b9292]">
                {businessInfoLine} · {siteConfig.contact.businessHours}
              </p>
            </div>
          </div>

          <div className="border-r border-[#e4ebe9] px-6 py-6 sm:px-8">
            <p className="kcg-eyebrow text-[#9a7800]">거래 준비</p>
            <h2 className="kcg-section-title mt-2 text-[#15191b]">
              거래 전 확인 사항
            </h2>
            <div className="mt-5 space-y-4">
              {homeHighlights.map((item, index) => (
                <div key={item.title} className={index > 0 ? "border-t border-[#e4ebe9] pt-4" : ""}>
                  <p className="text-base font-bold tracking-[-0.03em] text-[#15191b]">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#67706f]">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-[#e3e9e7] bg-[#fffdf4] px-5 py-5">
              <p className="text-sm font-semibold text-[#15191b]">준비 서류 및 확인 사항</p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-[#67706f]">
                {visitChecklist.map((item) => (
                  <p key={item}>· {item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-18">
        <div className="section-shell">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="kcg-eyebrow text-[#9a8a00]">상품안내</p>
              <h2 className="kcg-section-title mt-3 text-[#15191b]">
                상품/매입 카테고리
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#687171]">
                상품 수보다 먼저 확인해야 하는 것은 매입 가능 품목, 수급 가능 여부,
                상담 범위와 고시 시세 기준입니다.
              </p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#707878]">
              전체보기
            </Link>
          </div>
          <div className="grid gap-px overflow-hidden border border-[#dfe5e3] bg-[#dfe5e3] md:grid-cols-2 xl:grid-cols-5">
            {productCatalogTabs.filter((tab) => tab.category).map((category, index) => {
              const matched = products.find((product) => product.category === category.category);
              return (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  prefetch={false}
                  className="group bg-white transition hover:bg-[#fff7d2]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#eef4f2]">
                    <Image
                      src={matched ? getProductImageSrc(matched) : "/products/kcg-product-gold-silver-catalog-20260503.webp"}
                      alt={`${category.label} 이미지`}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(min-width: 1280px) 20vw, (min-width: 768px) 50vw, 100vw"
                      loading={index < 2 ? "eager" : "lazy"}
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold text-[#9a8a00]">0{index + 1}</p>
                    <h3 className="kcg-card-title mt-3 text-[#15191b]">
                      {category.label}
                    </h3>
                    <p className="mt-3 min-h-[3rem] text-sm leading-6 text-[#687171]">
                      {matched?.shortDescription || `${category.label} 기준을 확인합니다.`}
                    </p>
                    <p className="mt-5 text-xs font-semibold text-[#8d9494]">
                      {matched ? getProductStatusLabel(matched.status) : "사전 문의 필요"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <PurchaseGuide />

      <section className="section-shell pb-18">
        <div className="grid gap-6 border border-[#dfe5e3] bg-[#fffbe8] p-7 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">거래 상담</p>
            <h2 className="kcg-section-title mt-3 text-[#15191b]">
              본사 전화 문의 시 상담 가능 범위와 준비 사항을 먼저 안내해 드립니다
            </h2>
            <p className="mt-3 text-base leading-7 text-[#687171]">{siteConfig.contact.address}</p>
            <p className="mt-1 text-base leading-7 text-[#687171]">{siteConfig.contact.businessHours}</p>
            <p className="mt-3 text-sm leading-7 text-[#687171]">{siteConfig.contact.parkingNote}</p>
            <p className="mt-4 text-xs leading-6 text-[#8b9292]">
              {businessInfoLine}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="inline-flex justify-center rounded-full bg-[#ffcc00] px-7 py-4 text-sm font-semibold text-[#171717] shadow-[0_14px_32px_rgba(255,204,0,0.25)]"
            >
              전화 문의 {siteConfig.contact.phone}
            </a>
            <Link
              href="/about"
              className="inline-flex justify-center rounded-full border border-[#d8dfdc] bg-white px-7 py-4 text-sm font-semibold text-[#171717]"
            >
              오시는 길 보기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
