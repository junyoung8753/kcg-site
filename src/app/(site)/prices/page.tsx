import type { Metadata } from "next";
import Link from "next/link";
import { MarketDashboard } from "@/components/market/market-dashboard";
import { PriceLineup } from "@/components/market/price-lineup";
import { PriceContextGuide } from "@/components/prices/price-context-guide";
import { PriceHistoryList } from "@/components/prices/price-history-list";
import { PriceTable } from "@/components/prices/price-table";
import { getRepository } from "@/lib/data";
import { getMarketDashboardData } from "@/lib/market-data";
import { getPriceAnnouncementDisplay } from "@/lib/price-announcement";

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
  const announcementDisplay = getPriceAnnouncementDisplay(announcedAt);

  return (
    <>
      <PriceLineup
        prices={prices}
        history={history}
        lineupTitle="한국센터금거래소 시세표"
        visualMode="signboard"
        showSummaryCards={false}
        announcedLabel={announcementDisplay.valueLabel}
        announcedDateLabel={announcementDisplay.dateLabel}
        announcedHeading={announcementDisplay.detailLabel}
      />

      <section className="border-y border-[#dfe7e5] bg-[#fbfdfc]">
        <div className="section-shell grid gap-6 py-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">시세 이용 기준</p>
            <div className="mt-4 grid gap-px overflow-hidden border border-[#dfe6e4] bg-[#dfe6e4] md:grid-cols-3">
              {[
                ["회사 고시 시세", "살 때·팔 때 기준과 고시 시각"],
                ["국제 현재가", "시장 흐름 확인용 보조 데이터"],
                ["품목 확인", "중량·수량·실물 상태에 따라 최종 확정"],
              ].map(([label, title, body]) => (
                <div key={label} className="bg-white px-5 py-4">
                  <p className="kcg-fine-label text-[#9a8a00]">{label}</p>
                  <p className="mt-2 text-sm font-bold leading-6 tracking-[-0.022em] text-[#15191b]">{title || body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[#dfe6e4] bg-white px-5 py-4 lg:w-72">
            <p className="kcg-data-label text-[#8b9292]">고시 시각</p>
            <p className="mt-2 text-base font-bold tracking-[-0.018em] text-[#15191b]">
              {announcementDisplay.valueLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">고시 시세 상세</p>
            <h2 className="kcg-section-title mt-3 text-[#15191b]">
              품목별 회사 고시 시세 상세
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <p className="border border-[#dfe6e4] bg-white px-4 py-3 font-medium text-[#596261]">
              <span className="mr-2 font-semibold text-[#15191b]">
                {announcementDisplay.isScheduled ? "기준 고시 예정" : "기준 고시 시각"}
              </span>
              {announcementDisplay.valueLabel}
            </p>
            <Link href="/about" className="font-semibold text-[#687171]">
              매장 안내
            </Link>
          </div>
        </div>
        <PriceTable prices={prices} />
      </section>

      <PriceContextGuide />

      <MarketDashboard data={marketData} variant="detailed" />

      <section className="section-shell pb-16">
        <PriceHistoryList history={history} />
      </section>
    </>
  );
}
