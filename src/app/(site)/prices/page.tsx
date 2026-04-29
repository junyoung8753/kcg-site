import type { Metadata } from "next";
import Link from "next/link";
import { PurchaseGuide } from "@/components/home/purchase-guide";
import { MarketDashboard } from "@/components/market/market-dashboard";
import { PriceLineup } from "@/components/market/price-lineup";
import { PriceContextGuide } from "@/components/prices/price-context-guide";
import { PriceHistoryList } from "@/components/prices/price-history-list";
import { PriceTable } from "@/components/prices/price-table";
import { getRepository } from "@/lib/data";
import { formatDateDot, formatDateTimeKorean } from "@/lib/format";
import { getMarketDashboardData } from "@/lib/market-data";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "오늘의 시세",
  description:
    "한국센터금거래소의 오늘 고시 시세, 실시간 참고 시세, 국내 환산 참고 시세, 시장 뉴스를 확인합니다.",
};

export default async function PricesPage() {
  const repository = getRepository();
  const [prices, history, marketData] = await Promise.all([
    repository.getPrices({ visibleOnly: true }),
    repository.getPriceHistory(10),
    getMarketDashboardData(),
  ]);

  const announcedAt = prices[0]?.announcedAt;

  return (
    <>
      <PriceLineup
        prices={prices}
        history={history}
        lineupTitle="한국센터금거래소 시세표"
        visualMode="signboard"
        showSummaryCards={false}
        announcedLabel={announcedAt ? formatDateTimeKorean(announcedAt) : "당일 고시 준비중"}
        announcedDateLabel={announcedAt ? formatDateDot(announcedAt) : "고시 준비중"}
      />

      <section className="border-y border-[#dfe7e5] bg-[#fbfdfc]">
        <div className="section-shell grid gap-6 py-9 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">시세 이용 기준</p>
            <div className="mt-5 grid gap-px overflow-hidden border border-[#dfe6e4] bg-[#dfe6e4] md:grid-cols-3">
              {[
                ["회사 고시 시세", "실제 상담 기준", "살 때·팔 때 기준과 고시 시각을 먼저 확인합니다."],
                ["자동 참고 시세", "시장 흐름 보조", "국제 현재가와 원화 환산값은 확정 거래가가 아닙니다."],
                ["문의 전 확인", "품목·수량 기준", "고중량·법인·수급 문의는 대표번호로 먼저 확인합니다."],
              ].map(([label, title, body]) => (
                <div key={label} className="bg-white px-5 py-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[#9a8a00]">{label}</p>
                  <p className="mt-3 text-base font-bold tracking-[-0.03em] text-[#15191b]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#687171]">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[#dfe6e4] bg-white px-5 py-5 lg:w-80">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#8b9292]">고시 시각</p>
            <p className="mt-2 text-lg font-bold tracking-[-0.04em] text-[#15191b]">
              {announcedAt ? formatDateTimeKorean(announcedAt) : "당일 고시 준비중"}
            </p>
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="mt-5 inline-flex rounded-full bg-[#ffcc00] px-5 py-3 text-sm font-semibold text-[#171717]"
            >
              전화 문의 {siteConfig.contact.phone}
            </a>
          </div>
        </div>
      </section>

      <PurchaseGuide />

      <section className="section-shell py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">고시 시세 상세</p>
            <h2 className="mt-3 text-[1.95rem] font-semibold tracking-[-0.06em] text-[#15191b]">
              품목별 회사 고시 시세 상세
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <p className="border border-[#dfe6e4] bg-white px-4 py-3 font-medium text-[#596261]">
              <span className="mr-2 font-semibold text-[#15191b]">기준 고시 시각</span>
              {announcedAt ? formatDateTimeKorean(announcedAt) : "당일 고시 준비중"}
            </p>
            <Link href="/about" className="font-semibold text-[#687171]">
              매장 안내
            </Link>
          </div>
        </div>
        <PriceTable prices={prices} />
      </section>

      <PriceContextGuide />

      <MarketDashboard data={marketData} />

      <section className="section-shell pb-16">
        <PriceHistoryList history={history} />
      </section>
    </>
  );
}
