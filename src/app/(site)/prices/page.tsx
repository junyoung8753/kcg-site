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
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "오늘의 시세",
  description:
    "한국센터금거래소의 오늘 고시 시세, 국제 현재가 참고 정보, 시장 뉴스를 확인합니다.",
};

const priceUseCards = [
  ["회사 고시 시세", "KCG 기준", "내가 살 때·내가 팔 때 기준과 고시 시각이 우선입니다."],
  ["자동 참고 시세", "흐름 확인", "국제 현재가와 환율은 시장 방향 확인용이며 거래가는 아닙니다."],
  ["현장 확인", "최종 안내", "중량·수량·실물 상태에 따라 실제 금액이 달라질 수 있습니다."],
] as const;

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
        announcementStatusLabel={announcementDisplay.statusLabel}
        announcementNoticeBadgeLabel={announcementDisplay.noticeBadgeLabel}
        announcementNoticeTitle={announcementDisplay.noticeTitle}
        announcementNoticeBody={announcementDisplay.noticeBody}
        announcementIsStale={announcementDisplay.isStale}
      />

      <section className="border-y border-[#dfe7e5] bg-[#fbfdfc]">
        <div className="section-shell grid gap-6 py-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">시세 이용 기준</p>
            <div className="mt-4 grid gap-px overflow-hidden border border-[#dfe6e4] bg-[#dfe6e4] md:grid-cols-3">
              {priceUseCards.map(([label, title, body]) => (
                <div key={label} className="bg-white px-5 py-4">
                  <p className="kcg-fine-label text-[#9a8a00]">{label}</p>
                  <p className="mt-2 text-sm font-bold leading-6 tracking-[-0.022em] text-[#15191b]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#687171]">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[#dfe6e4] bg-white px-5 py-4 lg:w-72">
            <p className="kcg-data-label text-[#8b9292]">고시 시각</p>
            <p className="mt-2 text-base font-bold tracking-[-0.018em] text-[#15191b]">
              {announcementDisplay.valueLabel}
            </p>
            <p className="mt-2 text-xs font-semibold leading-5 text-[#8a6b00]">
              {announcementDisplay.noticeBody}
            </p>
          </div>
        </div>
        <div
          data-testid="closed-day-price-policy"
          className="section-shell pb-7 pt-0"
        >
          <div
            className={[
              "grid gap-4 border px-5 py-5 md:grid-cols-[1fr_auto] md:items-center",
              announcementDisplay.requiresTradeConfirmation
                ? "border-[#d9ad00]/45 bg-[#fff8dc] text-[#5f4300]"
                : "border-[#dfe6e4] bg-white text-[#5f6868]",
            ].join(" ")}
          >
            <div>
              <p className="kcg-fine-label text-[#9a8a00]">
                휴무일·영업시간 외 적용 기준
              </p>
              <h2 className="mt-2 text-lg font-extrabold tracking-[-0.022em] text-[#15191b]">
                화면 금액은 거래 확정가가 아닙니다.
              </h2>
              <p className="mt-2 text-sm font-semibold leading-7">
                주말·공휴일·회사 휴무일·영업시간 외에는 새 기준 고시가 확정되지 않을 수 있습니다.
                이때 시세표는 최근 회사 고시 기준을 보여주며, 실제 적용가는 영업일 전화 또는 현장 확인 후 안내합니다.
              </p>
            </div>
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="kcg-action-token inline-flex h-12 items-center justify-center rounded-full bg-[#15191b] px-5 text-sm font-extrabold text-white transition hover:bg-[#2a2d2f]"
            >
              본사 전화 확인 {siteConfig.contact.phone}
            </a>
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
