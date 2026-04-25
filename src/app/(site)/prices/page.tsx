import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { MarketDashboard } from "@/components/market/market-dashboard";
import { PriceLineup } from "@/components/market/price-lineup";
import { PriceHistoryList } from "@/components/prices/price-history-list";
import { PriceTable } from "@/components/prices/price-table";
import { TradeStandardPanel } from "@/components/trade/trade-standard-panel";
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
        title="오늘의 고시 시세와 자동 참고 흐름"
        description="상단 시세표는 한국센터금거래소가 직접 고시하는 회사 시세입니다. 자동 참고 시세와 국내 환산 참고 시세는 함께 제공되며, 실제 거래 금액은 현장 확인 후 최종 안내합니다."
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
        announcedLabel={announcedAt ? formatDateTimeKorean(announcedAt) : "당일 고시 준비중"}
        announcedDateLabel={announcedAt ? formatDateDot(announcedAt) : "고시 준비중"}
        krwRate={marketData.krwRate}
      />

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

      <MarketDashboard data={marketData} />

      <TradeStandardPanel
        className="pt-0"
        heading="시세표를 보기 전에 구분해야 할 것"
        description="회사 고시 시세, 자동 참고 시세, KRX 금현물 시장, 현장 최종 금액은 서로 다른 기준입니다. 같은 금값처럼 보이더라도 거래 방식과 수수료, 세금, 실물 확인 범위가 다르므로 먼저 구분해 안내합니다."
      />

      <section className="section-shell pb-16">
        <PriceHistoryList history={history} />
      </section>
    </>
  );
}
