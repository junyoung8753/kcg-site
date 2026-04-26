import Link from "next/link";
import { formatDateTimeKorean, formatWon } from "@/lib/format";
import type {
  DomesticMarketPrice,
  MarketBriefItem,
  MarketDashboardData,
  MarketHeadlineItem,
  MarketSpot,
} from "@/types/market";

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

function formatSignedAmount(value: number) {
  const prefix = value > 0 ? "▲" : value < 0 ? "▼" : "■";
  return `${prefix} ${formatUsd(Math.abs(value))}`;
}

function getToneClass(value: number) {
  if (value < 0) return "text-[#1f78d1]";
  if (value > 0) return "text-[#ca463e]";
  return "text-[#6d7373]";
}

function formatSpotUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

function StatusBadge({ data }: { data: MarketDashboardData }) {
  const className =
    data.sourceTier === "free" && !data.isStale
      ? "border-[#d8e6da] bg-[#f5fbf6] text-[#295c34]"
      : data.sourceTier === "premium" && !data.isStale
        ? "border-[#dfe3f3] bg-[#f5f7ff] text-[#304a8d]"
        : "border-[#eadfb4] bg-[#fff9df] text-[#7b6300]";

  const label =
    data.status === "live"
      ? data.isStale
        ? "자동 참고 지연"
        : data.sourceTier === "premium"
          ? "프리미엄 참고"
          : "무료 실시간"
      : "운영형 fallback";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}

function ProviderMeta({ data }: { data: MarketDashboardData }) {
  const sourceIsExternal = /^https?:\/\//.test(data.sourceUrl);

  return (
    <div className="grid gap-4 rounded-[1.5rem] border border-[#e5ebe8] bg-[#fbfdfc] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[#9a8a00]">데이터 상태</p>
          <a
            href={data.sourceUrl}
            target={sourceIsExternal ? "_blank" : undefined}
            rel={sourceIsExternal ? "noreferrer" : undefined}
            className="mt-2 inline-flex text-lg font-semibold tracking-[-0.03em] text-[#15191b] underline decoration-[#c9b241] decoration-2 underline-offset-4"
          >
            {data.sourceName}
          </a>
        </div>
        <StatusBadge data={data} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.25rem] border border-[#e3e9e6] bg-white px-4 py-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#7a8382]">마지막 업데이트</p>
          <p className="mt-2 text-sm leading-6 text-[#1c2022]">{formatDateTimeKorean(data.updatedAt)}</p>
        </div>
        <div className="rounded-[1.25rem] border border-[#e3e9e6] bg-white px-4 py-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#7a8382]">데이터 성격</p>
          <p className="mt-2 text-sm leading-6 text-[#1c2022]">
            {data.sourceTier === "free"
              ? "무료 자동 참고"
              : data.sourceTier === "premium"
                ? "프리미엄 자동 참고"
                : "fallback 참고"}
          </p>
        </div>
      </div>
      <div className="rounded-[1.25rem] border border-[#e3e9e6] bg-white px-4 py-4">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#7a8382]">출처 및 이용 안내</p>
        <p className="mt-2 text-sm leading-6 text-[#1c2022]">{data.sourceAttribution}</p>
        {data.sourceTermsUrl ? (
          <a
            href={data.sourceTermsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex text-xs font-semibold text-[#6f6200] underline underline-offset-4"
          >
            공급자 약관 확인
          </a>
        ) : null}
      </div>
      <p className="text-sm leading-7 text-[#687171]">{data.referenceNote}</p>
      {data.upgradeReadyProvider ? (
        <p className="text-xs leading-6 text-[#8a9292]">
          현재 구조는 {data.upgradeReadyProvider} 전환 준비 상태입니다. UI 변경 없이 공급자만 교체할 수 있습니다.
        </p>
      ) : null}
      {data.isStale ? (
        <p className="rounded-[1rem] border border-[#eadfb4] bg-[#fff9df] px-4 py-3 text-sm leading-6 text-[#7b6300]">
          마지막 업데이트 후 {data.staleMinutes}분 경과했습니다. 현재 화면은 최근 성공 기준값으로 표시됩니다.
        </p>
      ) : null}
    </div>
  );
}

function SpotTable({
  spots,
  showBidAsk,
  showChange,
}: {
  spots: MarketSpot[];
  showBidAsk: boolean;
  showChange: boolean;
}) {
  if (!showBidAsk && !showChange) {
    return (
      <div>
        <div className="md:hidden">
          {spots.map((spot) => (
            <article key={spot.metal} className="border-t border-[#e4ebe9] px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-base font-bold tracking-[-0.04em] text-[#15191b]">{spot.label}</p>
                  <p className="mt-1 text-xs font-medium text-[#7d8585]">{spot.symbol} · USD/T.oz 기준</p>
                </div>
                <p className="shrink-0 text-right text-xl font-bold tabular-nums text-[#15191b]">{formatUsd(spot.price)}</p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-[1rem] border border-[#e3e9e7] bg-[#fbfdfc] px-4 py-3 text-xs font-medium text-[#687171]">
                <span>업데이트</span>
                <span>{formatSpotUpdatedAt(spot.updatedAt)}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="hidden grid-cols-[1.12fr_0.88fr_0.92fr] bg-[#f7fbfa] px-6 py-3 text-xs font-bold tracking-[0.16em] text-[#697171] md:grid">
          <p>종목</p>
          <p className="text-right">실시간가</p>
          <p className="text-right">업데이트</p>
        </div>
        {spots.map((spot) => (
          <div
            key={spot.metal}
            className="hidden grid-cols-[1.12fr_0.88fr_0.92fr] items-center border-t border-[#e4ebe9] px-6 py-5 md:grid"
          >
            <div>
              <p className="text-lg font-bold tracking-[-0.04em] text-[#15191b]">{spot.label}</p>
              <p className="mt-1 text-sm font-medium text-[#7d8585]">{spot.symbol} · USD/T.oz 기준</p>
            </div>
            <p className="text-right text-lg font-bold text-[#15191b]">{formatUsd(spot.price)}</p>
            <p className="text-right text-sm leading-6 text-[#687171]">
              {formatSpotUpdatedAt(spot.updatedAt)}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="md:hidden">
        {spots.map((spot) => (
          <article key={spot.metal} className="border-t border-[#e4ebe9] px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-base font-bold tracking-[-0.04em] text-[#15191b]">{spot.label}</p>
                <p className="mt-1 text-xs font-medium text-[#7d8585]">{spot.symbol} · USD/T.oz 기준</p>
              </div>
              <p className="shrink-0 text-right text-xl font-bold tabular-nums text-[#15191b]">{formatUsd(spot.price)}</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-[1rem] border border-[#e3e9e7] bg-[#e3e9e7] text-xs">
              <div className="bg-[#fbfdfc] px-3 py-3">
                <p className="font-semibold text-[#7a8382]">Bid</p>
                <p className="mt-1 font-bold text-[#15191b]">{formatUsd(spot.bid)}</p>
              </div>
              <div className="bg-[#fbfdfc] px-3 py-3">
                <p className="font-semibold text-[#7a8382]">Ask</p>
                <p className="mt-1 font-bold text-[#15191b]">{formatUsd(spot.ask)}</p>
              </div>
              <div className="bg-[#fbfdfc] px-3 py-3">
                <p className="font-semibold text-[#7a8382]">전일</p>
                <p className={`mt-1 font-bold ${getToneClass(spot.changePercent)}`}>{formatSignedPercent(spot.changePercent)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="hidden grid-cols-[1.08fr_0.8fr_0.8fr_0.72fr] bg-[#f7fbfa] px-6 py-3 text-xs font-bold tracking-[0.16em] text-[#697171] md:grid">
        <p>종목</p>
        <p className="text-right">Bid</p>
        <p className="text-right">Ask</p>
        <p className="text-right">전일대비</p>
      </div>
      {spots.map((spot) => (
        <div
          key={spot.metal}
          className="hidden grid-cols-[1.08fr_0.8fr_0.8fr_0.72fr] items-center border-t border-[#e4ebe9] px-6 py-5 md:grid"
        >
          <div>
            <p className="text-lg font-bold tracking-[-0.04em] text-[#15191b]">{spot.label}</p>
            <p className="mt-1 text-sm font-medium text-[#7d8585]">{spot.symbol} · USD/T.oz 기준</p>
          </div>
          <p className="text-right text-lg font-bold text-[#15191b]">{formatUsd(spot.bid)}</p>
          <p className="text-right text-lg font-bold text-[#15191b]">{formatUsd(spot.ask)}</p>
          <div className="text-right text-sm">
            <p className={`font-semibold ${getToneClass(spot.changePercent)}`}>{formatSignedPercent(spot.changePercent)}</p>
            {showChange ? (
              <p className={`mt-1 ${getToneClass(spot.changePercent)}`}>{formatSignedAmount(spot.change)}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryBlock({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border border-[#e1e8e5] bg-[#fbfdfc] px-5 py-5">
      <p className="text-sm font-semibold text-[#727a7a]">{label}</p>
      <p className="mt-3 break-keep text-[1.55rem] font-semibold tracking-[-0.05em] text-[#15191b] sm:text-[1.8rem]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#6b7373]">{detail}</p>
    </div>
  );
}

function BriefToneBadge({ item }: { item: MarketBriefItem }) {
  const toneClass =
    item.tone === "watch"
      ? "border-[#f0d26a] bg-[#fff8d4] text-[#7d5c00]"
      : item.tone === "steady"
        ? "border-[#d7e5f3] bg-[#f4f9ff] text-[#1d5f98]"
        : "border-[#dde8e4] bg-[#f7fbfa] text-[#4c5f5e]";

  const label = item.tone === "watch" ? "시장 체크" : item.tone === "steady" ? "흐름 참고" : "거래 안내";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>{label}</span>;
}

function BriefingColumn({ items }: { items: MarketBriefItem[] }) {
  return (
    <div className="border border-[#dfe6e4] bg-white">
      <div className="border-b border-[#e4ebe9] px-6 py-4">
        <p className="text-sm font-semibold text-[#9a8a00]">시장 브리핑</p>
        <h3 className="mt-1 text-[1.5rem] font-semibold tracking-[-0.05em] text-[#15191b]">오늘의 시세 참고 메모</h3>
      </div>
      <div className="px-6">
        {items.map((item) => (
          <article key={item.id} className="border-b border-[#e4ebe9] py-5 last:border-b-0">
            <BriefToneBadge item={item} />
            <h4 className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[#15191b]">{item.title}</h4>
            <p className="mt-3 text-sm leading-7 text-[#6b7373]">{item.summary}</p>
            <p className="mt-3 text-xs font-medium text-[#8b9392]">{new Date(item.publishedAt).toLocaleDateString("ko-KR")}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function HeadlineColumn({
  title,
  items,
  sourceLabel,
  sourceUrl,
  sourceDetail,
}: {
  title: string;
  items: MarketHeadlineItem[];
  sourceLabel: string;
  sourceUrl?: string;
  sourceDetail: string;
}) {
  const sourceIsExternal = sourceUrl ? /^https?:\/\//.test(sourceUrl) : false;

  return (
    <div className="border border-[#dfe6e4] bg-white">
      <div className="flex items-center justify-between border-b border-[#e4ebe9] px-6 py-4">
        <div>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target={sourceIsExternal ? "_blank" : undefined}
              rel={sourceIsExternal ? "noreferrer" : undefined}
              className="text-sm font-semibold text-[#9a8a00] underline underline-offset-4"
            >
              {sourceLabel}
            </a>
          ) : (
            <p className="text-sm font-semibold text-[#9a8a00]">{sourceLabel}</p>
          )}
          <h3 className="mt-1 text-[1.5rem] font-semibold tracking-[-0.05em] text-[#15191b]">{title}</h3>
        </div>
        <span className="text-xs font-medium text-[#7d8685]">외부 기사 링크</span>
      </div>
      <div className="px-6">
        {items.map((item) => {
          const isExternal = /^https?:\/\//.test(item.url);
          return (
            <a
              key={item.id}
              href={item.url}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              className="block border-b border-[#e4ebe9] py-5 last:border-b-0 hover:bg-[#fffdf4]"
            >
              <p className="text-base font-semibold tracking-[-0.03em] text-[#15191b]">{item.title}</p>
              {item.summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6b7373]">{item.summary}</p> : null}
              <div className="mt-3 flex items-center justify-between gap-3 text-xs font-medium text-[#8b9392]">
                <span>{item.source}</span>
                <span>{new Date(item.publishedAt).toLocaleDateString("ko-KR")}</span>
              </div>
            </a>
          );
        })}
      </div>
      <p className="border-t border-[#e4ebe9] px-6 py-4 text-xs leading-6 text-[#7d8685]">{sourceDetail}</p>
    </div>
  );
}

function ReferenceRuleList({ data }: { data: MarketDashboardData }) {
  const items = [
    data.capabilities.directKrw
      ? "국내 환산 참고 시세는 실시간 원화 현재가 기준 참고값입니다."
      : "국내 환산 참고 시세는 국제 시세와 USD/KRW 환율을 조합해 자동 산출합니다.",
    data.capabilities.bidAsk
      ? "실시간 참고 시세는 Bid/Ask와 전일 대비를 함께 제공합니다."
      : "무료 실시간 모드에서는 Bid/Ask와 전일 대비가 제공되지 않습니다.",
    "회사 고시 시세와 실제 매입·판매 금액은 상단 회사 시세표 및 현장 확인 결과를 우선합니다.",
  ];

  return (
    <div className="rounded-[1.5rem] border border-[#e3e9e7] bg-[#fffdf4] px-5 py-5">
      <p className="text-sm font-semibold text-[#15191b]">참고 시세 이용 안내</p>
      <div className="mt-3 space-y-3 text-sm leading-6 text-[#67706f]">
        {items.map((item) => (
          <p key={item}>· {item}</p>
        ))}
      </div>
    </div>
  );
}

function DomesticSection({
  data,
  goldDomestic,
  silverDomestic,
  platinumDomestic,
}: {
  data: MarketDashboardData;
  goldDomestic?: DomesticMarketPrice;
  silverDomestic?: DomesticMarketPrice;
  platinumDomestic?: DomesticMarketPrice;
}) {
  const changeDetail = (price?: DomesticMarketPrice) => {
    if (!price) return "데이터 준비 중";
    if (!data.capabilities.change) {
      return `1g ${formatWon(price.krwPerGram)} · 실시간 현재가 기준`;
    }
    return `1g ${formatWon(price.krwPerGram)} · ${formatSignedPercent(price.changePercent)}`;
  };

  return (
    <div className="border border-[#dfe6e4] bg-white p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[2rem] font-semibold tracking-[-0.06em] text-[#15191b]">
            3.75g 기준 자동 환산가
            <span className="ml-2 text-sm font-medium tracking-normal text-[#6d7373]">(KRW 기준)</span>
          </h2>
        </div>
        <Link href="/prices" className="text-sm font-semibold text-[#697171]">
          국내 시세 전체 보기
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <SummaryBlock label="순금 3.75g 환산 참고가" value={formatWon(goldDomestic?.krwPerDon ?? 0)} detail={changeDetail(goldDomestic)} />
        <SummaryBlock label="은 3.75g 환산 참고가" value={formatWon(silverDomestic?.krwPerDon ?? 0)} detail={changeDetail(silverDomestic)} />
        <SummaryBlock
          label="백금 3.75g 환산 참고가"
          value={formatWon(platinumDomestic?.krwPerDon ?? 0)}
          detail={changeDetail(platinumDomestic)}
        />
      </div>
      <div className="mt-5">
        <ReferenceRuleList data={data} />
      </div>
    </div>
  );
}

function InternationalSection({
  data,
  goldSpot,
  silverSpot,
  platinumSpot,
  palladiumSpot,
}: {
  data: MarketDashboardData;
  goldSpot?: MarketSpot;
  silverSpot?: MarketSpot;
  platinumSpot?: MarketSpot;
  palladiumSpot?: MarketSpot;
}) {
  const detail = (spot?: MarketSpot) => {
    if (!spot) return "데이터 준비 중";
    if (!data.capabilities.bidAsk) {
      return "무료 실시간 현재가 기준";
    }
    return `Bid ${formatUsd(spot.bid)} · ${formatSignedPercent(spot.changePercent)}`;
  };

  return (
    <div className="border border-[#dfe6e4] bg-white p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[2rem] font-semibold tracking-[-0.06em] text-[#15191b]">
            실시간 국제 참고 시세
            <span className="ml-2 text-sm font-medium tracking-normal text-[#6d7373]">(USD/T.oz 기준)</span>
          </h2>
        </div>
        <Link href="/prices" className="text-sm font-semibold text-[#697171]">
          국제 시세 전체 보기
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryBlock label="국제 금시세" value={formatUsd(goldSpot?.price ?? 0)} detail={detail(goldSpot)} />
        <SummaryBlock label="국제 은시세" value={formatUsd(silverSpot?.price ?? 0)} detail={detail(silverSpot)} />
        <SummaryBlock label="국제 백금시세" value={formatUsd(platinumSpot?.price ?? 0)} detail={detail(platinumSpot)} />
        <SummaryBlock label="국제 팔라듐시세" value={formatUsd(palladiumSpot?.price ?? 0)} detail={detail(palladiumSpot)} />
      </div>
      <div className="mt-5 grid gap-4 rounded-[1.5rem] border border-[#e3e9e7] bg-[#fbfdfc] p-5 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#7a8382]">현재 제공 데이터</p>
          <p className="mt-2 text-sm leading-6 text-[#1c2022]">
            {data.capabilities.bidAsk ? "현재가 + Bid/Ask + 전일 대비" : "실시간 현재가"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#7a8382]">업데이트 기준</p>
          <p className="mt-2 text-sm leading-6 text-[#1c2022]">{formatDateTimeKorean(data.updatedAt)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#7a8382]">차트 확장성</p>
          <p className="mt-2 text-sm leading-6 text-[#1c2022]">
            {data.capabilities.history ? "프리미엄 공급자 연결 시 시계열 확장 가능" : "무료 모드에서는 현재가 중심으로만 제공"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ConversionReference({ data }: { data: MarketDashboardData }) {
  const rows = data.spots.map((spot) => ({
    spot,
    domestic: data.domesticPrices.find((item) => item.metal === spot.metal),
  }));

  return (
    <div className="grid gap-5">
      <div className="rounded-[1.5rem] border border-[#e3e9e7] bg-[#fbfdfc] px-5 py-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#7a8382]">환율 참고</p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#15191b]">USD/KRW 환율</h3>
        <p className="mt-3 text-[2rem] font-bold tracking-[-0.05em] text-[#15191b]">
          {formatExchangeRate(data.krwRate)}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#687171]">
          국내 환산 참고 시세는 국제 금속 현재가와 원달러 환율을 함께 반영합니다.
        </p>
        <p className="mt-2 text-xs leading-6 text-[#8b9292]">{formatDateTimeKorean(data.updatedAt)} 기준</p>
      </div>

      <div className="overflow-hidden border border-[#dfe6e4] bg-white">
        <div className="border-b border-[#e4ebe9] px-5 py-4">
          <p className="text-sm font-semibold text-[#9a8a00]">자동 환산표</p>
          <h3 className="mt-1 text-[1.5rem] font-semibold tracking-[-0.05em] text-[#15191b]">
            국제 현재가와 국내 환산 참고값
          </h3>
          <p className="mt-1 text-xs font-medium text-[#7d8585]">USD/T.oz 기준 현재가를 원화와 3.75g 기준으로 환산</p>
        </div>
        <div className="md:hidden">
          {rows.map(({ spot, domestic }) => (
            <article key={spot.metal} className="border-t border-[#e4ebe9] px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold tracking-[-0.03em] text-[#15191b]">{spot.label.replace("국제 ", "")}</p>
                  <p className="mt-1 text-xs font-medium text-[#7d8585]">{spot.symbol} · USD/T.oz 기준</p>
                </div>
                <p className="shrink-0 text-right text-base font-semibold tabular-nums text-[#15191b]">{formatUsd(spot.price)}</p>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[1rem] border border-[#e3e9e7] bg-[#e3e9e7] text-sm">
                <div className="bg-[#fbfdfc] px-4 py-3">
                  <dt className="text-xs font-semibold text-[#7d8585]">1g 환산</dt>
                  <dd className="mt-1 font-bold text-[#15191b]">{domestic ? formatWon(domestic.krwPerGram) : "-"}</dd>
                </div>
                <div className="bg-[#fbfdfc] px-4 py-3">
                  <dt className="text-xs font-semibold text-[#7d8585]">3.75g 환산</dt>
                  <dd className="mt-1 font-bold text-[#15191b]">{domestic ? formatWon(domestic.krwPerDon) : "-"}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-5 text-[#7d8585]">환율 {formatExchangeRate(data.krwRate)} 기준 자동 참고값</p>
            </article>
          ))}
        </div>
        <div className="hidden md:block">
          <div className="grid grid-cols-[1fr_0.82fr_0.82fr_0.82fr_0.82fr] bg-[#f7fbfa] px-5 py-3 text-xs font-bold tracking-[0.14em] text-[#697171]">
            <p>금속</p>
            <p className="text-right">국제 현재가</p>
            <p className="text-right">환율</p>
            <p className="text-right">원/g</p>
            <p className="text-right">원/3.75g</p>
          </div>
          {rows.map(({ spot, domestic }) => (
            <div
              key={spot.metal}
              className="grid grid-cols-[1fr_0.82fr_0.82fr_0.82fr_0.82fr] items-center border-t border-[#e4ebe9] px-5 py-4 text-sm"
            >
              <div>
                <p className="font-bold tracking-[-0.03em] text-[#15191b]">{spot.label.replace("국제 ", "")}</p>
                <p className="mt-1 text-xs font-medium text-[#7d8585]">{spot.symbol}</p>
              </div>
              <p className="text-right font-semibold text-[#15191b]">{formatUsd(spot.price)}</p>
              <p className="text-right text-[#687171]">{formatExchangeRate(data.krwRate)}</p>
              <p className="text-right font-semibold text-[#15191b]">
                {domestic ? formatWon(domestic.krwPerGram) : "-"}
              </p>
              <p className="text-right font-semibold text-[#15191b]">
                {domestic ? formatWon(domestic.krwPerDon) : "-"}
              </p>
            </div>
          ))}
        </div>
        <p className="border-t border-[#e4ebe9] px-5 py-4 text-xs leading-6 text-[#8b9292]">
          이 표는 자동 참고값입니다. 회사 고시 시세와 실제 거래 금액은 품목 상태, 순도, 중량 확인 후 별도로 확정됩니다.
        </p>
      </div>
    </div>
  );
}

export function MarketDashboard({ data }: { data: MarketDashboardData }) {
  const goldDomestic = data.domesticPrices.find((item) => item.metal === "gold");
  const silverDomestic = data.domesticPrices.find((item) => item.metal === "silver");
  const platinumDomestic = data.domesticPrices.find((item) => item.metal === "platinum");
  const goldSpot = data.spots.find((item) => item.metal === "gold");
  const silverSpot = data.spots.find((item) => item.metal === "silver");
  const platinumSpot = data.spots.find((item) => item.metal === "platinum");
  const palladiumSpot = data.spots.find((item) => item.metal === "palladium");
  const domesticHeadlines = data.externalHeadlines.filter((item) => item.category === "domestic");
  const globalHeadlines = data.externalHeadlines.filter((item) => item.category === "global");

  return (
    <div className="section-shell py-14 sm:py-16">
      <section className="grid items-start gap-8 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="overflow-hidden border border-[#dfe6e4] bg-white shadow-[0_18px_50px_rgba(31,47,43,0.06)]">
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#e4ebe9] px-6 py-6">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#9a8a00]">국제 현재가</p>
              <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.06em] text-[#15191b]">실시간 국제 참고 시세</h2>
            </div>
            <div className="text-right text-sm leading-6 text-[#687171]">
              <p>{formatDateTimeKorean(data.updatedAt)} 기준</p>
              <p>USD/T.oz 기준 · {data.displayModeLabel}</p>
            </div>
          </div>
          <SpotTable spots={data.spots} showBidAsk={data.capabilities.bidAsk} showChange={data.capabilities.change} />
        </div>

        <div className="grid gap-5">
          <div className="border border-[#dfe6e4] bg-[#fffbe8] p-7">
            <p className="text-sm font-semibold tracking-[0.18em] text-[#9a8a00]">자동 환산 안내</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <h2 className="text-[2rem] font-semibold tracking-[-0.06em] text-[#15191b]">자동 환산 참고가</h2>
              <p className="text-sm font-medium text-[#726c53]">고시 시각: {formatDateTimeKorean(data.updatedAt)}</p>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#6f6a54]">
              자동 환산 참고가는 시장 흐름 확인용입니다. 실제 거래 금액은 상단 회사 시세표와 현장 확인 결과를 기준으로 최종 안내합니다.
            </p>
            <div className="mt-6 space-y-5">
              {data.benchmarks.map((item, index) => (
                <div key={item.label} className={index > 0 ? "border-t border-[#e2d8a7] pt-5" : ""}>
                  <p className="text-sm font-semibold text-[#6c5d00]">{item.label}</p>
                  <p className="mt-2 text-[1.85rem] font-bold tracking-[-0.06em] text-[#15191b] sm:text-[2rem]">{formatWon(item.value)}</p>
                  <p className="mt-1 text-sm leading-6 text-[#6f6a54]">
                    {item.unit} 기준 · {item.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ProviderMeta data={data} />
          <ConversionReference data={data} />
        </div>
      </section>

      <section className="mt-10 grid gap-8 xl:grid-cols-2">
        <DomesticSection
          data={data}
          goldDomestic={goldDomestic}
          silverDomestic={silverDomestic}
          platinumDomestic={platinumDomestic}
        />
        <InternationalSection
          data={data}
          goldSpot={goldSpot}
          silverSpot={silverSpot}
          platinumSpot={platinumSpot}
          palladiumSpot={palladiumSpot}
        />
      </section>

      <section className="mt-10 grid gap-8 xl:grid-cols-3">
        <BriefingColumn items={data.marketBriefs} />
        <HeadlineColumn
          title="국내 헤드라인"
          items={domesticHeadlines}
          sourceLabel={data.headlineSourceName}
          sourceUrl={data.headlineSourceUrl}
          sourceDetail={data.headlineAttribution}
        />
        <HeadlineColumn
          title="국제 헤드라인"
          items={globalHeadlines}
          sourceLabel={data.headlineSourceName}
          sourceUrl={data.headlineSourceUrl}
          sourceDetail={data.headlineAttribution}
        />
      </section>
    </div>
  );
}
