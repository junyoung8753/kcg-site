"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrencyKRW } from "@/lib/format";
import { getPriceTradeGuide } from "@/lib/price-presenter";
import { homeDeskNotes, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { PriceCategory, PriceHistoryEntry, PriceRecord } from "@/types/price";

export type PriceLineupVariant = "version1" | "version2";

type LineupRow = {
  title: string;
  subtitle: string;
  sellCategory?: PriceCategory;
  buyCategory?: PriceCategory;
  sellText?: string;
  buyNote?: string;
};

type LineupVisualStyle = {
  openButton: string;
  panelShell: string;
  panelWidthClass: string;
  contentShiftClass: string;
  panelBase: string;
  panelHeaderBar: string;
  panelTexture: string;
  panelFrame: string;
  titleText: string;
  dateText: string;
  closeButton: string;
  columnHeader: string;
  rowsWrap: string;
  row: string;
  rowTitle: string;
  rowSubtitle: string;
  priceText: string;
  metaText: string;
  noteText: string;
  emptyText: string;
};

const rows: LineupRow[] = [
  {
    title: "순금시세",
    subtitle: "Gold24k-3.75g",
    sellCategory: "gold_24k_sell",
    buyCategory: "gold_24k_buy",
  },
  {
    title: "18K 금시세",
    subtitle: "Gold18k-3.75g",
    sellText: "제품시세적용",
    buyCategory: "gold_18k_buy",
  },
  {
    title: "14K 금시세",
    subtitle: "Gold14k-3.75g",
    sellText: "제품시세적용",
    buyCategory: "gold_14k_buy",
  },
  {
    title: "백금시세",
    subtitle: "Platinum-3.75g",
    sellCategory: "platinum_sell",
    buyCategory: "platinum_buy",
    buyNote: "(자사백금바기준)",
  },
  {
    title: "은시세",
    subtitle: "Silver-3.75g",
    sellCategory: "silver_sell",
    buyCategory: "silver_buy",
    buyNote: "(자사실버바기준)",
  },
];

const lineupStyles = {
  version1: {
    openButton:
      "border-[#d6e2de] bg-white/88 text-[#171717] shadow-[0_10px_24px_rgba(30,44,41,0.08)] backdrop-blur",
    panelShell: "text-white backdrop-blur-[6px] lg:shadow-[0_24px_70px_rgba(0,0,0,0.24)]",
    panelWidthClass: "lg:w-[36rem]",
    contentShiftClass: "lg:ml-[36rem]",
    panelBase: "absolute inset-0 bg-[rgba(53,49,49,0.86)]",
    panelHeaderBar: "absolute inset-x-0 top-0 h-[5.4rem] bg-[rgba(14,14,14,0.92)]",
    panelTexture:
      "absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_22%),radial-gradient(circle_at_0%_88%,rgba(255,165,77,0.08),transparent_20%)]",
    panelFrame: "lg:h-full",
    titleText: "text-white",
    dateText: "text-white/58",
    closeButton: "border-white/10 bg-white/6 text-white/72 hover:bg-white/12 hover:text-white",
    columnHeader: "text-white",
    rowsWrap: "",
    row: "grid grid-cols-[0.98fr_0.94fr_0.94fr] items-start gap-4 py-[1.08rem] last:border-b-0",
    rowTitle: "text-white",
    rowSubtitle: "text-white/52",
    priceText: "text-white",
    metaText: "text-white/52",
    noteText: "text-white/72",
    emptyText: "text-white/55",
  },
  version2: {
    openButton:
      "border-[#d1a200] bg-[#f7c500] text-[#241a00] shadow-[0_12px_24px_rgba(182,132,0,0.16)] hover:bg-[#f0be00]",
    panelShell: "text-[#2b2100] lg:shadow-[0_22px_62px_rgba(160,115,0,0.22)]",
    panelWidthClass: "lg:w-[36.5rem]",
    contentShiftClass: "lg:ml-[36.5rem]",
    panelBase: "absolute inset-0 bg-[#f7c500]",
    panelHeaderBar: "absolute inset-x-0 top-0 h-[5.4rem] border-b border-[#d1a200] bg-[#f7c500]",
    panelTexture: "hidden",
    panelFrame: "lg:h-full border-r border-[#d0a200]",
    titleText: "text-[#2b2100]",
    dateText: "text-[#5e4700]",
    closeButton:
      "border-[#d1a200] bg-[#f7cf32] text-[#241a00] hover:bg-[#efc213] hover:text-[#241a00]",
    columnHeader: "border-y border-[#d1a300] bg-[#f7c500] text-[#332600]",
    rowsWrap: "space-y-3",
    row: "grid grid-cols-[0.98fr_0.94fr_0.94fr] items-start gap-4 rounded-[1.1rem] border border-[#d7a900] bg-[#f7c500] px-5 py-[1.02rem] shadow-[0_8px_18px_rgba(176,124,0,0.1)]",
    rowTitle: "text-[#241a00]",
    rowSubtitle: "text-[#694f00]",
    priceText: "text-[#241a00]",
    metaText: "text-[#6f5400]",
    noteText: "text-[#5f4700]",
    emptyText: "text-[#7a5f00]",
  },
} satisfies Record<PriceLineupVariant, LineupVisualStyle>;

function getLatestChange(category: PriceCategory | undefined, history: PriceHistoryEntry[]) {
  if (!category) return null;
  return history.find((entry) => entry.category === category) || null;
}

function getChangeTone(diff: number, variant: PriceLineupVariant) {
  if (diff < 0) return variant === "version2" ? "text-[#1f78d1]" : "text-[#79c8ff]";
  if (diff > 0) return variant === "version2" ? "text-[#bd3928]" : "text-[#ff8c8c]";
  return variant === "version2" ? "text-[#7d6417]" : "text-white/45";
}

function formatChangeLine(history: PriceHistoryEntry | null, variant: PriceLineupVariant) {
  if (!history) return null;
  const diff = history.newValue - history.previousValue;
  const percent = history.previousValue ? (diff / history.previousValue) * 100 : 0;
  const symbol = diff < 0 ? "▼" : diff > 0 ? "▲" : "-";
  const signedAmount = `${diff < 0 ? "-" : diff > 0 ? "+" : ""}${formatCurrencyKRW(Math.abs(diff)).replace("₩", "")}`;

  return {
    percent: `${percent.toFixed(2)}%`,
    amount: `${symbol} ${signedAmount}`,
    tone: getChangeTone(diff, variant),
  };
}

function PriceCell({
  price,
  history,
  text,
  note,
  variant,
  style,
}: {
  price?: PriceRecord;
  history?: PriceHistoryEntry | null;
  text?: string;
  note?: string;
  variant: PriceLineupVariant;
  style: LineupVisualStyle;
}) {
  if (text) {
    return (
      <div className="pt-1.5">
        <p className={cn("text-[1.55rem] font-semibold tracking-[-0.04em]", style.priceText)}>{text}</p>
      </div>
    );
  }

  if (!price) {
    return <p className={cn("text-xl font-semibold", style.emptyText)}>문의</p>;
  }

  const change = formatChangeLine(history ?? null, variant);

  return (
    <div>
      <p className={cn("text-[1.72rem] font-semibold tracking-[-0.05em]", style.priceText)}>
        {formatCurrencyKRW(price.value).replace("₩", "")}원
      </p>
      <p className={cn("mt-1 text-[0.9rem]", style.metaText)}>
        {change ? (
          <>
            {change.percent} <span className={change.tone}>{change.amount}</span>
          </>
        ) : (
          getPriceTradeGuide(price.category)
        )}
      </p>
      {note ? <p className={cn("mt-1 text-[0.9rem]", style.noteText)}>{note}</p> : null}
    </div>
  );
}

export function PriceLineup({
  prices,
  history,
  lineupVariant = "version1",
  lineupTitle = "한국센터금거래소 시세표",
  announcedLabel = "당일 고시 준비중",
  announcedDateLabel = "고시 준비중",
}: {
  prices: PriceRecord[];
  history: PriceHistoryEntry[];
  lineupVariant?: PriceLineupVariant;
  lineupTitle?: string;
  announcedLabel?: string;
  announcedDateLabel?: string;
}) {
  const [isLineupOpen, setIsLineupOpen] = useState(true);
  const priceByCategory = new Map(prices.map((price) => [price.category, price]));
  const style = lineupStyles[lineupVariant];
  const wrapperHeightClass = lineupVariant === "version2" ? "min-h-[44rem]" : "min-h-[42.5rem]";
  const contentHeightClass = lineupVariant === "version2" ? "min-h-[44rem]" : "min-h-[42.5rem]";

  return (
    <section className="border-b border-[#dde7e4] bg-[#f1faf8]">
      <div className="relative overflow-hidden border-y border-[#e3ece9] bg-[#eef8f6]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(255,204,0,0.22),transparent_16%),radial-gradient(circle_at_100%_88%,rgba(255,204,0,0.18),transparent_18%),linear-gradient(180deg,#f8fcfb_0%,#eef8f6_42%,#f8f3db_100%)]" />
        <div className="absolute inset-y-0 right-0 hidden w-[58%] bg-[linear-gradient(135deg,rgba(255,255,255,0.7),rgba(228,245,241,0.35)_42%,rgba(255,255,255,0.92))] lg:block" />
        <div className="absolute right-[-6rem] top-[-5rem] h-56 w-56 rounded-full bg-[#ffdb57]/60 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[14rem] h-44 w-44 rounded-full bg-[#e6f5ef] blur-3xl" />

        <div className="mx-auto max-w-[1500px]">
          <div className={cn("relative", wrapperHeightClass)}>
            {!isLineupOpen ? (
              <button
                type="button"
                onClick={() => setIsLineupOpen(true)}
                className={cn(
                  "absolute left-6 top-6 z-20 inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition md:left-8 md:top-8",
                  style.openButton,
                )}
              >
                <span className="text-base leading-none">+</span>
                시세표 다시 보기
              </button>
            ) : null}

            <div
              className={cn(
                "relative z-10 overflow-x-auto transition-[opacity,transform] duration-300 lg:absolute lg:bottom-0 lg:left-0 lg:top-0",
                style.panelShell,
                isLineupOpen
                  ? `opacity-100 ${style.panelWidthClass} lg:translate-x-0`
                  : "pointer-events-none opacity-0 lg:w-0 lg:-translate-x-8",
              )}
            >
              <div className={style.panelBase} />
              <div className={style.panelHeaderBar} />
              <div className={style.panelTexture} />

              <div
                className={cn(
                  "relative",
                  style.panelFrame,
                  isLineupOpen ? "min-w-[36.4rem]" : "min-w-0 overflow-hidden",
                )}
              >
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-6 pb-5 pt-6 sm:px-8">
                  <h1
                    className={cn(
                      "text-[1.82rem] font-semibold tracking-[-0.06em] sm:text-[1.96rem]",
                      style.titleText,
                    )}
                  >
                    {lineupTitle}
                  </h1>
                  <p className={cn("text-right text-[0.95rem]", style.dateText)}>
                    {announcedDateLabel}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsLineupOpen(false)}
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full border text-base font-light transition",
                      style.closeButton,
                    )}
                    aria-label="시세 라인업 닫기"
                  >
                    ×
                  </button>
                </div>

                <div
                  className={cn(
                    "grid grid-cols-[0.98fr_0.94fr_0.94fr] px-6 py-3 text-center text-[0.98rem] font-semibold sm:px-8",
                    style.columnHeader,
                  )}
                >
                  <div />
                  <p>내가 살 때 (VAT포함)</p>
                  <p>내가 팔 때 (현장기준)</p>
                </div>

                <div className={cn("px-6 pb-7 pt-1.5 sm:px-8", style.rowsWrap)}>
                  {rows.map((row) => {
                    const sell = row.sellCategory ? priceByCategory.get(row.sellCategory) : undefined;
                    const buy = row.buyCategory ? priceByCategory.get(row.buyCategory) : undefined;

                    return (
                      <div key={row.title} className={style.row}>
                        <div>
                          <p className={cn("text-[1.66rem] font-semibold tracking-[-0.04em]", style.rowTitle)}>
                            {row.title}
                          </p>
                          <p className={cn("mt-0.5 text-[0.92rem] font-medium", style.rowSubtitle)}>
                            {row.subtitle}
                          </p>
                        </div>
                        <PriceCell
                          price={sell}
                          text={row.sellText}
                          history={getLatestChange(row.sellCategory, history)}
                          variant={lineupVariant}
                          style={style}
                        />
                        <PriceCell
                          price={buy}
                          history={getLatestChange(row.buyCategory, history)}
                          note={row.buyNote}
                          variant={lineupVariant}
                          style={style}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className={`relative z-0 flex flex-col justify-between px-6 py-8 transition-[margin] duration-300 sm:px-10 sm:py-10 lg:px-14 lg:py-12 ${
                isLineupOpen ? style.contentShiftClass : "lg:ml-0"
              } ${contentHeightClass}`}
            >
              <div className="max-w-[44rem]">
                <div className="relative h-10 w-[14rem] max-w-full sm:h-12 sm:w-[18rem]">
                  <Image
                    src={siteConfig.brandAssets.lockupPath}
                    alt={siteConfig.brandAssets.lockupAlt}
                    fill
                    className="object-contain object-left"
                    sizes="(max-width: 640px) 224px, 288px"
                    priority
                  />
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#9b7700]">
                  종로 귀금속 시세 · 매입 안내
                </p>
                <h2 className="mt-4 text-[1.9rem] font-semibold leading-[1.22] tracking-[-0.055em] text-[#1a1e20] sm:text-[2.2rem]">
                  오늘 고시 시세와 방문 상담 기준 안내
                </h2>
                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#5f6868]">
                  순금, 18K, 14K, 백금, 은 시세는 당일 고시 시각 기준으로 안내되며,
                  실제 거래 금액은 현장 확인 후 최종 안내합니다. 대표번호로 문의하시면
                  상담 가능 시간과 준비 사항을 먼저 확인하실 수 있습니다.
                </p>
              </div>

              <div className="mt-7 grid gap-px overflow-hidden border border-[#dbe4e1] bg-[#dbe4e1] sm:grid-cols-2">
                {homeDeskNotes.map((item) => (
                  <div key={item.title} className="bg-white/86 px-5 py-5">
                    <p className="text-[11px] font-semibold tracking-[0.22em] text-[#9b7700]">{item.label}</p>
                    <p className="mt-2 text-base font-semibold tracking-[-0.03em] text-[#15191b]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#66706f]">{item.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-auto grid gap-4 pt-6 xl:grid-cols-[1.02fr_0.98fr] xl:items-end">
                <div className="border border-black/10 bg-white/88 p-5 shadow-[0_18px_44px_rgba(31,47,43,0.1)]">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.22em] text-[#9b7700]">매장 확인</p>
                      <p className="mt-1 text-base font-semibold text-[#15191b]">실매장 및 간판 기준</p>
                    </div>
                    <p className="text-right text-xs leading-5 text-[#6d7575]">종로 골든타워 303호</p>
                  </div>
                  <div className="relative aspect-[21/6] overflow-hidden border border-[#e2e7e5] bg-white">
                    <Image
                      src="/brand/signboard-clean.jpg"
                      alt="한국센터금거래소 간판"
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 32vw"
                    />
                  </div>
                </div>

                <div className="border border-[#d9e4e1] bg-white/88 p-5 shadow-[0_18px_44px_rgba(31,47,43,0.1)]">
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-[#9b7700]">방문 상담 안내</p>
                  <div className="mt-3 grid gap-4 border-y border-[#e2e7e5] py-4 text-sm leading-7 text-[#5f6868]">
                    <div>
                      <p className="font-semibold text-[#15191b]">당일 고시 시각</p>
                      <p>{announcedLabel}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#15191b]">상담 가능 시간</p>
                      <p>{siteConfig.contact.businessHours}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#15191b]">방문 위치</p>
                      <p>{siteConfig.contact.address}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#15191b]">거래 기준 안내</p>
                      <p>{siteConfig.company.transactionNotice}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Link
                      href="/prices"
                      className="inline-flex h-12 items-center justify-center rounded-full bg-[#ffcc00] px-6 text-sm font-semibold text-[#171717] transition hover:bg-[#f2bf00]"
                    >
                      전체 시세 보기
                    </Link>
                    <a
                      href={`tel:${siteConfig.contact.phone}`}
                      className="inline-flex h-12 items-center justify-center rounded-full border border-[#d7e0dd] bg-white/84 px-6 text-sm font-semibold text-[#171717] transition hover:bg-white"
                    >
                      전화 문의 {siteConfig.contact.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
