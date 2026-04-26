import type { Metadata } from "next";
import Link from "next/link";
import { PurchaseGuide } from "@/components/home/purchase-guide";
import { PageIntro } from "@/components/layout/page-intro";
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
      <PageIntro
        eyebrow="시세 안내"
        title="오늘의 시세"
        description="상단 시세표는 한국센터금거래소가 직접 고시하는 회사 시세입니다. 국제 현재가와 국내 환산 참고값은 시장 흐름 확인용으로 함께 제공합니다."
        asideLabel="고시 시각"
        asideTitle={announcedAt ? formatDateTimeKorean(announcedAt) : "당일 고시 준비중"}
        asideBody={
          <>
            <p>순금, 18K, 14K, 백금, 은 시세는 기준 시각과 함께 표시됩니다.</p>
            <p>전화 문의 시 당일 상담 가능 여부를 먼저 안내해 드립니다.</p>
          </>
        }
        asideAction={
          <a
            href={`tel:${siteConfig.contact.phone}`}
            className="inline-flex rounded-full bg-[#ffcc00] px-5 py-3 text-sm font-semibold text-[#171717]"
          >
            전화 문의 {siteConfig.contact.phone}
          </a>
        }
      />

      <PriceLineup
        prices={prices}
        history={history}
        lineupTitle="한국센터금거래소 시세표"
        visualMode="signboard"
        showSummaryCards={false}
        announcedLabel={announcedAt ? formatDateTimeKorean(announcedAt) : "당일 고시 준비중"}
        announcedDateLabel={announcedAt ? formatDateDot(announcedAt) : "고시 준비중"}
      />

      <PurchaseGuide />

      <section className="section-shell py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">고시 시세 상세</p>
            <h2 className="mt-3 text-[1.95rem] font-semibold tracking-[-0.06em] text-[#15191b]">
              품목별 회사 고시 시세 상세
            </h2>
          </div>
          <Link href="/about" className="text-sm font-semibold text-[#687171]">
            거래 기준 안내
          </Link>
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
