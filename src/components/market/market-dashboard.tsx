import Link from "next/link";
import { TradingViewDisclosure } from "@/components/market/trading-view-disclosure";
import { TradingViewMarketWidget } from "@/components/market/trading-view-widget";
import { formatDateTimeKorean } from "@/lib/format";
import type {
  MarketDashboardData,
  MarketHeadlineItem,
  MarketSpot,
} from "@/types/market";

type MarketDashboardVariant = "compact" | "detailed";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value >= 100 ? 2 : 1,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatExchangeRate(value: number) {
  if (!value) return "-";
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSignedPercent(value: number) {
  const prefix = value > 0 ? "▲" : value < 0 ? "▼" : "■";
  return `${prefix} ${Math.abs(value).toFixed(2)}%`;
}

function getToneClass(value: number) {
  if (value < 0) return "text-[#1f78d1]";
  if (value > 0) return "text-[#ca463e]";
  return "text-[#6d7373]";
}

function SourceLine({ data }: { data: MarketDashboardData }) {
  const sourceIsExternal = /^https?:\/\//.test(data.sourceUrl);
  const staleLabel =
    data.status === "fallback"
      ? "fallback 기준으로 표시 중"
      : data.isStale
        ? `데이터 지연 가능 · ${data.staleMinutes}분 경과`
        : null;

  return (
    <div data-testid="market-source-line" className="text-xs leading-6 text-[#7d8585]">
      <p>
        출처:{" "}
        <a
          href={data.sourceUrl}
          target={sourceIsExternal ? "_blank" : undefined}
          rel={sourceIsExternal ? "noreferrer" : undefined}
          className="font-semibold underline underline-offset-4"
        >
          {data.sourceName}
        </a>{" "}
        · 참고용 · {formatDateTimeKorean(data.updatedAt)} 기준 · USD/KRW {formatExchangeRate(data.krwRate)}
      </p>
      {staleLabel ? (
        <p className="font-semibold text-[#9a6b00]">{staleLabel}</p>
      ) : null}
    </div>
  );
}

function SpotTable({ data }: { data: MarketDashboardData }) {
  const hasChangeData = data.capabilities.change;

  return (
    <div className="overflow-hidden border border-[#dfe6e4] bg-white">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] bg-[#f7fbfa] px-5 py-3 text-[0.84rem] font-bold tracking-[0.1em] text-[#697171]">
        <p>국제 현재가</p>
        <p className="text-right">가격</p>
        <p className="text-right">{hasChangeData ? "전일" : "상태"}</p>
      </div>
      {data.spots.map((spot) => (
        <div
          key={spot.metal}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] items-center border-t border-[#e4ebe9] px-5 py-4 text-base sm:text-[1.05rem]"
        >
          <div>
            <p className="font-bold tracking-[-0.022em] text-[#15191b]">{spot.label.replace("국제 ", "")}</p>
            <p className="mt-1 text-[0.86rem] font-medium text-[#7d8585]">USD/T.oz</p>
          </div>
          <p className="text-right text-xl font-bold tabular-nums text-[#15191b]">{formatUsd(spot.price)}</p>
          {hasChangeData ? (
            <p className={`text-right text-base font-semibold ${getToneClass(spot.changePercent)}`}>
              {formatSignedPercent(spot.changePercent)}
            </p>
          ) : (
            <p className="text-right text-base font-semibold text-[#8a9292]">현재가</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ReferenceGuidePanel({
  data,
  goldSpot,
}: {
  data: MarketDashboardData;
  goldSpot?: MarketSpot;
}) {
  const rows = [
    ["표시 범위", "국제 현재가·환율", "USD/T.oz 현재가와 USD/KRW 기준환율 흐름만 참고합니다."],
    ["가격 기준", "KCG 회사 고시 시세", "내가 살 때·내가 팔 때 금액은 상단 고시 시세표와 상담 안내가 우선입니다."],
    ["확정 절차", "전화·방문 상담", "중량·수량·실물 상태 확인 후 최종 금액을 안내합니다."],
  ] as const;

  return (
    <div className="overflow-hidden border border-[#dfe6e4] bg-white">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] bg-[#f7fbfa] px-5 py-3 text-[0.84rem] font-bold tracking-[0.1em] text-[#697171]">
        <p>참고 데이터 기준</p>
        <p className="text-right">고시 시세 우선</p>
      </div>
      <div className="px-5 py-5">
        <p className="text-sm font-medium leading-6 tracking-[-0.018em] text-[#596261]">
          국제 현재가는 시장 흐름을 보기 위한 참고 정보입니다. 원화 거래 금액은 KCG 고시 시세표를
          기준으로 확인합니다.
        </p>
        <div className="mt-5 grid gap-3">
          {rows.map(([label, title, body]) => (
            <div key={label} className="border border-[#e4ebe9] bg-[#fbfdfc] px-4 py-3">
              <p className="kcg-fine-label text-[#9a8a00]">{label}</p>
              <p className="mt-2 text-sm font-bold leading-6 tracking-[-0.018em] text-[#15191b]">{title}</p>
              <p className="mt-1 text-xs leading-5 text-[#687171]">{body}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-[#e4ebe9] bg-[#fffbe8] px-5 py-4">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#9a8a00]">시장 기준</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <p className="text-sm text-[#6f6a54]">
            국제 금 <span className="font-bold text-[#15191b]">{formatUsd(goldSpot?.price ?? 0)}</span> USD/T.oz
          </p>
          <p className="text-sm text-[#6f6a54]">
            기준환율 <span className="font-bold text-[#15191b]">{formatExchangeRate(data.krwRate)}</span> KRW/USD
          </p>
        </div>
      </div>
    </div>
  );
}

function HeadlineList({
  title,
  items,
  sourceLabel,
  sourceUrl,
}: {
  title: string;
  items: MarketHeadlineItem[];
  sourceLabel: string;
  sourceUrl?: string;
}) {
  const sourceIsExternal = sourceUrl ? /^https?:\/\//.test(sourceUrl) : false;

  return (
    <div className="border border-[#dfe6e4] bg-white">
      <div className="flex items-center justify-between border-b border-[#e4ebe9] px-5 py-4">
        <h3 className="kcg-card-title text-[#15191b]">{title}</h3>
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target={sourceIsExternal ? "_blank" : undefined}
            rel={sourceIsExternal ? "noreferrer" : undefined}
            className="text-xs font-semibold text-[#9a8a00] underline underline-offset-4"
          >
            {sourceLabel}
          </a>
        ) : null}
      </div>
      <div className="px-5">
        {items.slice(0, 3).map((item) => {
          const isExternal = /^https?:\/\//.test(item.url);
          return (
            <a
              key={item.id}
              href={item.url}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              className="block border-b border-[#e4ebe9] py-4 last:border-b-0 hover:bg-[#fffdf4]"
            >
              <p className="line-clamp-2 text-sm font-semibold leading-6 tracking-[-0.02em] text-[#15191b]">{item.title}</p>
              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[#8b9392]">
                <span>{item.source}</span>
                <span>{new Date(item.publishedAt).toLocaleDateString("ko-KR")}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function MarketDashboard({
  data,
  variant = "compact",
}: {
  data: MarketDashboardData;
  variant?: MarketDashboardVariant;
}) {
  const goldSpot = data.spots.find((item) => item.metal === "gold");
  const domesticHeadlines = data.externalHeadlines.filter((item) => item.category === "domestic");
  const globalHeadlines = data.externalHeadlines.filter((item) => item.category === "global");
  const isDetailed = variant === "detailed";

  return (
    <section data-testid="market-dashboard" className="section-shell py-10 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kcg-eyebrow text-[#9a8a00]">MARKET</p>
          <h2 className="kcg-section-title mt-2 text-[#15191b]">
            국제 현재가
          </h2>
        </div>
        <SourceLine data={data} />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_0.82fr]">
        <SpotTable data={data} />
        <ReferenceGuidePanel data={data} goldSpot={goldSpot} />
      </div>

      {isDetailed ? (
        <section className="mt-8">
          <TradingViewMarketWidget />
        </section>
      ) : (
        <TradingViewDisclosure />
      )}

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <HeadlineList
          title="국내 뉴스"
          items={domesticHeadlines}
          sourceLabel={data.headlineSourceName}
          sourceUrl={data.headlineSourceUrl}
        />
        <HeadlineList
          title="국제 뉴스"
          items={globalHeadlines}
          sourceLabel={data.headlineSourceName}
          sourceUrl={data.headlineSourceUrl}
        />
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#dfe6e4] pt-5">
        <p className="text-xs leading-6 text-[#8b9292]">
          자동 참고 시세와 외부 뉴스는 회사 고시 시세를 대체하지 않습니다.
        </p>
        {isDetailed ? null : (
          <Link href="/prices" className="text-sm font-semibold text-[#697171]">
            시세 상세 보기
          </Link>
        )}
      </div>
    </section>
  );
}
