"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatNumber, formatWon } from "@/lib/format";
import { getPriceTradeGuide } from "@/lib/price-presenter";
import { homeDeskNotes, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { PriceCategory, PriceHistoryEntry, PriceRecord } from "@/types/price";

export type PriceLineupVisualMode = "campaign" | "signboard";

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
    subtitle: "24K · 3.75g 기준",
    sellCategory: "gold_24k_sell",
    buyCategory: "gold_24k_buy",
  },
  {
    title: "18K 금시세",
    subtitle: "18K · 3.75g 기준",
    sellText: "제품시세적용",
    buyCategory: "gold_18k_buy",
  },
  {
    title: "14K 금시세",
    subtitle: "14K · 3.75g 기준",
    sellText: "제품시세적용",
    buyCategory: "gold_14k_buy",
  },
  {
    title: "백금시세",
    subtitle: "백금 · 3.75g 기준",
    sellCategory: "platinum_sell",
    buyCategory: "platinum_buy",
    buyNote: "(자사백금바기준)",
  },
  {
    title: "은시세",
    subtitle: "은 · 3.75g 기준",
    sellCategory: "silver_sell",
    buyCategory: "silver_buy",
    buyNote: "(자사실버바기준)",
  },
];

const campaignSlides = [
  {
    image: "/campaign/kcg-hero-gold-bars.jpg",
    alt: "골드바와 순금 거래 상담 배너",
    kicker: "KCG PRICE DESK",
    title: "오늘 고시 시세와 방문 상담 기준을 한 화면에서 확인합니다.",
    body: "순금·18K·14K 기준가를 먼저 확인하고, 실제 거래 금액은 현장 확인 후 최종 안내합니다.",
    href: "/prices",
    action: "오늘 시세 보기",
    note: "회사 고시 시세 · 현장 확인 · 대표번호 상담",
    objectPosition: "68% center",
  },
  {
    image: "/campaign/kcg-hero-metal-bars.jpg",
    alt: "백금 실버바 골드바 상담 배너",
    kicker: "BAR CONSULTATION",
    title: "골드바·실버바 상담은 중량과 수량부터 정확히 확인합니다.",
    body: "브랜드, 포장, 보증서, 수량 정보를 알려주시면 방문 전 상담 가능 범위를 먼저 정리해 드립니다.",
    href: "/services",
    action: "취급 품목 보기",
    note: "Gold bar · Silver bar · Platinum",
    objectPosition: "66% center",
  },
  {
    image: "/campaign/kcg-hero-consulting.jpg",
    alt: "종로 방문 상담 안내 배너",
    kicker: "VISIT GUIDE",
    title: "전화 문의 후 방문하면 확인과 정산 안내가 더 빨라집니다.",
    body: "당일 상담 가능 시간, 건물 진입 동선, 신분증과 보증서 등 준비 사항을 먼저 안내해 드립니다.",
    href: "/about",
    action: "거래 절차 보기",
    note: "순도 확인 · 중량 확인 · 정산 안내",
    objectPosition: "56% center",
  },
] as const;

const lineupStyle = {
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
  row: "grid grid-cols-2 items-start gap-x-4 gap-y-3 border-b border-white/10 py-[1.08rem] last:border-b-0 sm:grid-cols-[0.98fr_0.94fr_0.94fr] sm:gap-4 sm:border-b-0 sm:py-[1.08rem]",
  rowTitle: "text-white",
  rowSubtitle: "text-white/52",
  priceText: "text-white",
  metaText: "text-white/52",
  noteText: "text-white/72",
  emptyText: "text-white/55",
} satisfies LineupVisualStyle;

function getLatestChange(category: PriceCategory | undefined, history: PriceHistoryEntry[]) {
  if (!category) return null;
  return history.find((entry) => entry.category === category) || null;
}

function getChangeTone(diff: number) {
  if (diff < 0) return "text-[#79c8ff]";
  if (diff > 0) return "text-[#ff8c8c]";
  return "text-white/45";
}

function formatChangeLine(history: PriceHistoryEntry | null, zeroSymbol: string) {
  if (!history) return null;
  const diff = history.newValue - history.previousValue;
  const percent = history.previousValue ? (diff / history.previousValue) * 100 : 0;
  const symbol = diff < 0 ? "▼" : diff > 0 ? "▲" : zeroSymbol;
  const signedAmount = `${diff < 0 ? "-" : diff > 0 ? "+" : ""}${formatNumber(Math.abs(diff))}`;

  return {
    percent: `${percent.toFixed(2)}%`,
    amount: `${symbol} ${signedAmount}`,
    tone: getChangeTone(diff),
  };
}

function PriceCell({
  price,
  history,
  text,
  note,
  style,
  zeroSymbol,
}: {
  price?: PriceRecord;
  history?: PriceHistoryEntry | null;
  text?: string;
  note?: string;
  style: LineupVisualStyle;
  zeroSymbol: string;
}) {
  if (text) {
    return (
      <div className="pt-1.5">
        <p className={cn("text-[1.02rem] font-semibold tracking-[-0.04em] sm:text-[1.55rem]", style.priceText)}>{text}</p>
      </div>
    );
  }

  if (!price) {
    return <p className={cn("text-base font-semibold sm:text-xl", style.emptyText)}>문의</p>;
  }

  const change = formatChangeLine(history ?? null, zeroSymbol);

  return (
    <div>
      <p className={cn("text-[1.08rem] font-semibold tracking-[-0.05em] sm:text-[1.72rem]", style.priceText)}>
        {formatWon(price.value)}
      </p>
      <p className={cn("mt-1 text-[0.68rem] leading-4 sm:text-[0.9rem]", style.metaText)}>
        {change ? (
          <>
            {change.percent} <span className={change.tone}>{change.amount}</span>
          </>
        ) : (
          getPriceTradeGuide(price.category)
        )}
      </p>
      {note ? <p className={cn("mt-1 text-[0.68rem] leading-4 sm:text-[0.9rem]", style.noteText)}>{note}</p> : null}
    </div>
  );
}

export function PriceLineup({
  prices,
  history,
  lineupTitle = "한국센터금거래소 시세표",
  visualMode = "campaign",
  showSummaryCards = true,
  announcedLabel = "당일 고시 준비중",
  announcedDateLabel = "고시 준비중",
  krwRate,
}: {
  prices: PriceRecord[];
  history: PriceHistoryEntry[];
  lineupTitle?: string;
  visualMode?: PriceLineupVisualMode;
  showSummaryCards?: boolean;
  announcedLabel?: string;
  announcedDateLabel?: string;
  krwRate?: number;
}) {
  const [isLineupOpen, setIsLineupOpen] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const priceByCategory = new Map(prices.map((price) => [price.category, price]));
  const style = lineupStyle;
  const wrapperHeightClass = "lg:min-h-[42.5rem]";
  const contentHeightClass = "min-h-[23rem] sm:min-h-[26rem] lg:min-h-[42.5rem]";
  const activeSlide = campaignSlides[activeSlideIndex];
  const zeroChangeSymbol = visualMode === "signboard" ? "-" : "━";
  const krwRateLabel = krwRate
    ? `${new Intl.NumberFormat("ko-KR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(krwRate)}원`
    : "자동 참고";

  useEffect(() => {
    if (visualMode !== "campaign") return;
    if (isSlidePaused) return;
    const timer = window.setInterval(() => {
      setActiveSlideIndex((index) => (index + 1) % campaignSlides.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [isSlidePaused, visualMode]);

  const moveSlide = (offset: number) => {
    setActiveSlideIndex((index) => (index + offset + campaignSlides.length) % campaignSlides.length);
  };

  return (
    <section className="border-b border-[#dde7e4] bg-[#f1faf8]">
      <div className="relative overflow-hidden border-y border-[#e3ece9] bg-[#eef8f6]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fcfb_0%,#edf7f4_48%,#fbf1cf_100%)]" />
        <div className="absolute inset-y-0 right-0 hidden w-[58%] bg-[linear-gradient(135deg,rgba(255,255,255,0.46),rgba(232,245,241,0.18)_42%,rgba(255,245,202,0.38))] lg:block" />

        <div className="mx-auto max-w-[1500px]">
          <div className={cn("relative flex flex-col lg:block", wrapperHeightClass)}>
            {!isLineupOpen ? (
              <button
                type="button"
                onClick={() => setIsLineupOpen(true)}
                className={cn(
                  "absolute left-5 top-5 z-20 inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition md:left-8 md:top-8 md:h-11",
                  style.openButton,
                )}
              >
                <span className="text-base leading-none">+</span>
                시세표 다시 보기
              </button>
            ) : null}

            <div
              className={cn(
                "order-2 relative z-10 overflow-hidden transition-[opacity,transform] duration-300 lg:absolute lg:bottom-0 lg:left-0 lg:top-0 lg:order-none",
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
                  isLineupOpen ? "min-w-0 sm:min-w-[36.4rem] lg:min-w-full" : "min-w-0 overflow-hidden",
                )}
              >
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-4 pb-4 pt-5 sm:gap-3 sm:px-8 sm:pb-5 sm:pt-6">
                  <div className="min-w-0">
                    <h1
                      className={cn(
                        "text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] sm:text-[1.96rem] sm:tracking-[-0.06em]",
                        style.titleText,
                      )}
                    >
                      {lineupTitle}
                    </h1>
                    <p
                      className={cn(
                        "mt-3 text-[0.62rem] font-semibold uppercase leading-4 tracking-[0.24em] sm:hidden",
                        "text-white/42",
                      )}
                    >
                      {visualMode === "campaign" ? siteConfig.englishName : null}
                    </p>
                  </div>
                  <p className={cn("text-right text-[0.72rem] sm:text-[0.95rem]", style.dateText)}>
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

                {visualMode === "signboard" ? (
                  <div className="grid grid-cols-2 gap-2 border-t border-white/10 px-4 pb-3 pt-3 sm:px-8">
                    <a
                      href={`tel:${siteConfig.contact.phone}`}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-[#ffcc00] px-4 text-sm font-semibold text-[#171717]"
                    >
                      전화 상담
                    </a>
                    <Link
                      href="/about"
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/14 bg-white/8 px-4 text-sm font-semibold text-white"
                    >
                      방문 안내
                    </Link>
                  </div>
                ) : null}

                <div
                  className={cn(
                    "grid grid-cols-2 px-4 py-2 text-center text-[0.78rem] font-semibold leading-4 sm:grid-cols-[0.98fr_0.94fr_0.94fr] sm:px-8 sm:py-3 sm:text-[0.98rem]",
                    style.columnHeader,
                  )}
                >
                  <div className="hidden sm:block" />
                  <p>내가 살 때 (VAT포함)</p>
                  <p>{visualMode === "signboard" ? "내가 팔 때 (현장기준)" : "내가 팔 때 (현장 기준)"}</p>
                </div>

                <div className={cn("px-4 pb-5 pt-1.5 sm:px-8 sm:pb-7", style.rowsWrap)}>
                  {rows.map((row) => {
                    const sell = row.sellCategory ? priceByCategory.get(row.sellCategory) : undefined;
                    const buy = row.buyCategory ? priceByCategory.get(row.buyCategory) : undefined;

                    return (
                      <div key={row.title} className={style.row}>
                        <div className="col-span-2 sm:col-span-1">
                          <p className={cn("text-[1.02rem] font-semibold tracking-[-0.04em] sm:text-[1.66rem]", style.rowTitle)}>
                            {row.title}
                          </p>
                          <p className={cn("mt-0.5 text-[0.64rem] font-medium leading-4 sm:text-[0.92rem]", style.rowSubtitle)}>
                            {row.subtitle}
                          </p>
                        </div>
                        <PriceCell
                          price={sell}
                          text={row.sellText}
                          history={getLatestChange(row.sellCategory, history)}
                          style={style}
                          zeroSymbol={zeroChangeSymbol}
                        />
                        <PriceCell
                          price={buy}
                          history={getLatestChange(row.buyCategory, history)}
                          note={row.buyNote}
                          style={style}
                          zeroSymbol={zeroChangeSymbol}
                        />
                      </div>
                    );
                  })}
                </div>
                {visualMode === "campaign" ? (
                  <p
                    className={cn(
                      "border-t px-4 pb-5 pt-4 text-xs leading-6 sm:hidden",
                      "border-white/10 text-white/62",
                    )}
                  >
                    시세는 고시 시각 기준이며 실제 거래 금액은 순도, 중량, 제품 상태 확인 후 현장에서 최종
                    안내됩니다.
                  </p>
                ) : null}
              </div>
            </div>

            {visualMode === "campaign" ? (
              <div
                className={`order-1 relative z-0 overflow-hidden transition-[margin] duration-300 lg:order-none ${
                  isLineupOpen ? style.contentShiftClass : "lg:ml-0"
                } ${contentHeightClass}`}
              >
                {campaignSlides.map((slide, index) => (
                  <div
                    key={slide.image}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      index === activeSlideIndex ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden={index !== activeSlideIndex}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      priority={index === 0}
                      className="object-cover"
                      style={{ objectPosition: slide.objectPosition }}
                      sizes="(max-width: 1024px) 100vw, 64vw"
                    />
                  </div>
                ))}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96),rgba(255,255,255,0.76)_34%,rgba(255,255,255,0.22)_72%,rgba(18,20,20,0.05)_100%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,232,142,0.34))]" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.42))]" />

                <button
                  type="button"
                  onClick={() => moveSlide(-1)}
                  className="absolute left-5 top-1/2 z-20 hidden h-16 w-12 -translate-y-1/2 items-center justify-center rounded-md bg-white/72 text-3xl font-light text-[#171717] shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur transition hover:bg-white lg:inline-flex"
                  aria-label="이전 슬라이드"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(1)}
                  className="absolute right-5 top-1/2 z-20 hidden h-16 w-12 -translate-y-1/2 items-center justify-center rounded-md bg-white/72 text-3xl font-light text-[#171717] shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur transition hover:bg-white lg:inline-flex"
                  aria-label="다음 슬라이드"
                >
                  ›
                </button>

                <div className="relative z-10 flex min-h-[inherit] flex-col justify-end px-5 py-6 sm:px-9 sm:py-8 lg:px-14 lg:py-12">
                  <div key={activeSlide.image} className="kcg-hero-copy max-w-[34rem] lg:ml-8 xl:ml-12">
                    <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-[#9b7700] sm:text-xs">
                      {activeSlide.kicker}
                    </p>
                    <h2 className="kcg-hero-heading mt-3 text-[1.55rem] font-semibold leading-[1.12] tracking-normal text-[#101315] sm:mt-4 sm:text-[2.18rem] lg:mt-5 lg:text-[2.74rem]">
                      {activeSlide.title}
                    </h2>
                    <p className="mt-3 max-w-[31rem] text-sm leading-6 text-[#4f5656] sm:mt-4 sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
                      {activeSlide.body}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
                      <Link
                        href={activeSlide.href}
                        className="inline-flex h-11 items-center justify-center rounded-lg bg-[#ffcc00] px-5 text-sm font-bold text-[#171717] shadow-[0_14px_30px_rgba(255,204,0,0.25)] transition hover:bg-[#f2bf00] sm:h-12 sm:px-7"
                      >
                        {activeSlide.action}
                      </Link>
                      <a
                        href={`tel:${siteConfig.contact.phone}`}
                        className="inline-flex h-11 items-center justify-center rounded-lg bg-white/86 px-5 text-sm font-bold text-[#171717] shadow-[0_10px_26px_rgba(0,0,0,0.08)] backdrop-blur transition hover:bg-white sm:h-12 sm:px-7"
                      >
                        전화 문의 {siteConfig.contact.phone}
                      </a>
                    </div>
                    <p className="mt-4 max-w-[31rem] text-[0.68rem] font-semibold leading-5 tracking-[0.14em] text-[#716547] sm:mt-6 sm:text-sm sm:tracking-[0.2em]">
                      {activeSlide.note}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-8 lg:justify-end">
                    <div className="flex items-center gap-2">
                      {campaignSlides.map((slide, index) => (
                        <button
                          key={slide.image}
                          type="button"
                          onClick={() => setActiveSlideIndex(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === activeSlideIndex ? "w-11 bg-[#ffcc00]" : "w-3 bg-white/80 hover:bg-white"
                          }`}
                          aria-label={`${index + 1}번째 슬라이드 보기`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSlidePaused((value) => !value)}
                      className="inline-flex h-9 items-center justify-center rounded-sm bg-white/72 px-4 text-xs font-semibold text-[#171717] shadow-[0_10px_24px_rgba(0,0,0,0.08)] backdrop-blur transition hover:bg-white"
                    >
                      {isSlidePaused ? "재생" : "정지"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      {showSummaryCards ? (
        <div className="mx-auto grid max-w-[1500px] border-x border-[#dfe7e5] bg-white sm:grid-cols-2 xl:grid-cols-4">
          <div className="border-b border-r border-[#dfe7e5] px-6 py-6 xl:border-b-0">
            <p className="text-xs font-semibold tracking-[0.24em] text-[#9a8a00]">회사 고시 기준</p>
            <p className="mt-3 text-base font-bold tracking-[-0.03em] text-[#15191b]">{announcedLabel}</p>
            <p className="mt-3 text-sm leading-6 text-[#687171]">
              실제 거래 상담은 회사 고시 시세를 우선 기준으로 안내합니다.
            </p>
          </div>
          <div className="border-b border-r border-[#dfe7e5] px-6 py-6 xl:border-b-0">
            <p className="text-xs font-semibold tracking-[0.24em] text-[#9a8a00]">자동 참고 시세</p>
            <p className="mt-3 text-base font-bold tracking-[-0.03em] text-[#15191b]">무료 실시간 참고</p>
            <p className="mt-3 text-sm leading-6 text-[#687171]">
              Gold API 기준으로 시장 흐름을 보조 표시합니다.
            </p>
          </div>
          <div className="border-b border-r border-[#dfe7e5] px-6 py-6 sm:border-b-0">
            <p className="text-xs font-semibold tracking-[0.24em] text-[#9a8a00]">USD/KRW 환율</p>
            <p className="mt-3 text-base font-bold tracking-[-0.03em] text-[#15191b]">{krwRateLabel}</p>
            <p className="mt-3 text-sm leading-6 text-[#687171]">
              국내 환산 참고 시세 계산에 함께 사용합니다.
            </p>
          </div>
          <div className="px-6 py-6">
            <p className="text-xs font-semibold tracking-[0.24em] text-[#9a8a00]">방문 상담</p>
            <p className="mt-3 text-base font-bold tracking-[-0.03em] text-[#15191b]">{siteConfig.contact.phone}</p>
            <p className="mt-3 text-sm leading-6 text-[#687171]">
              종로 골든타워 303호 방문 전 전화 문의를 권장드립니다.
            </p>
          </div>
        </div>
      ) : null}

    </section>
  );
}
