"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrencyKRW } from "@/lib/format";
import { getPriceTradeGuide } from "@/lib/price-presenter";
import { siteConfig } from "@/lib/site-config";
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

const campaignSlides = [
  {
    image: "/campaign/kcg-hero-gold-bars.jpg",
    alt: "골드바와 순금 거래 상담 배너",
    kicker: "당일 고시 시세",
    title: "순금·18K·14K 매입 기준을 방문 전 확인하실 수 있습니다.",
    body: "고시 시각 이후에도 시세는 변동될 수 있습니다. 방문 전 전화로 상담 가능 시간과 준비 사항을 확인해 주세요.",
    href: "/prices",
    action: "전체 시세 보기",
    note: "종로 골든타워 303호 · 방문 상담 안내",
  },
  {
    image: "/campaign/kcg-hero-metal-bars.jpg",
    alt: "백금 실버바 골드바 상담 배너",
    kicker: "골드바·실버바 상담",
    title: "보유하신 골드바와 실버바의 중량·수량 기준으로 안내합니다.",
    body: "개인 보유분, 법인 보유분, 선물용 제품 문의까지 품목 정보를 알려주시면 상담 기준을 먼저 정리해 드립니다.",
    href: "/services",
    action: "취급 품목 보기",
    note: "Gold bar · Silver bar · Platinum",
  },
  {
    image: "/campaign/kcg-hero-consulting.jpg",
    alt: "종로 방문 상담 안내 배너",
    kicker: "종로 방문 상담",
    title: "시세 확인부터 현장 확인, 정산 안내까지 한 흐름으로 진행합니다.",
    body: "전화 문의 시 당일 상담 가능 시간, 건물 진입 동선, 준비 서류를 먼저 안내해 드립니다.",
    href: "/about",
    action: "거래 절차 보기",
    note: "순도 확인 · 중량 확인 · 정산 안내",
  },
] as const;

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
    row: "grid grid-cols-2 items-start gap-x-4 gap-y-3 border-b border-white/10 py-[1.08rem] last:border-b-0 sm:grid-cols-[0.98fr_0.94fr_0.94fr] sm:gap-4 sm:border-b-0 sm:py-[1.08rem]",
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
    row: "grid grid-cols-2 items-start gap-x-4 gap-y-3 rounded-[1.1rem] border border-[#d7a900] bg-[#f7c500] px-3 py-[1rem] shadow-[0_8px_18px_rgba(176,124,0,0.1)] sm:grid-cols-[0.98fr_0.94fr_0.94fr] sm:gap-4 sm:px-5 sm:py-[1.02rem]",
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
        <p className={cn("text-[1.02rem] font-semibold tracking-[-0.04em] sm:text-[1.55rem]", style.priceText)}>{text}</p>
      </div>
    );
  }

  if (!price) {
    return <p className={cn("text-base font-semibold sm:text-xl", style.emptyText)}>문의</p>;
  }

  const change = formatChangeLine(history ?? null, variant);

  return (
    <div>
      <p className={cn("text-[1.08rem] font-semibold tracking-[-0.05em] sm:text-[1.72rem]", style.priceText)}>
        {formatCurrencyKRW(price.value).replace("₩", "")}원
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
  lineupVariant = "version1",
  lineupTitle = "한국센터금거래소 시세표",
  announcedLabel = "당일 고시 준비중",
  announcedDateLabel = "고시 준비중",
  krwRate,
}: {
  prices: PriceRecord[];
  history: PriceHistoryEntry[];
  lineupVariant?: PriceLineupVariant;
  lineupTitle?: string;
  announcedLabel?: string;
  announcedDateLabel?: string;
  krwRate?: number;
}) {
  const [isLineupOpen, setIsLineupOpen] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const priceByCategory = new Map(prices.map((price) => [price.category, price]));
  const style = lineupStyles[lineupVariant];
  const wrapperHeightClass = lineupVariant === "version2" ? "min-h-[44rem]" : "min-h-[42.5rem]";
  const contentHeightClass = lineupVariant === "version2" ? "min-h-[44rem]" : "min-h-[42.5rem]";
  const activeSlide = campaignSlides[activeSlideIndex];
  const krwRateLabel = krwRate
    ? `${new Intl.NumberFormat("ko-KR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(krwRate)}원`
    : "자동 참고";

  useEffect(() => {
    if (isSlidePaused) return;
    const timer = window.setInterval(() => {
      setActiveSlideIndex((index) => (index + 1) % campaignSlides.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [isSlidePaused]);

  const moveSlide = (offset: number) => {
    setActiveSlideIndex((index) => (index + offset + campaignSlides.length) % campaignSlides.length);
  };

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
                "relative z-10 overflow-hidden transition-[opacity,transform] duration-300 lg:absolute lg:bottom-0 lg:left-0 lg:top-0",
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
                        lineupVariant === "version2" ? "text-[#7a5d00]" : "text-white/42",
                      )}
                    >
                      {siteConfig.englishName}
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

                <div
                  className={cn(
                    "grid grid-cols-2 px-4 py-2 text-center text-[0.78rem] font-semibold leading-4 sm:grid-cols-[0.98fr_0.94fr_0.94fr] sm:px-8 sm:py-3 sm:text-[0.98rem]",
                    style.columnHeader,
                  )}
                >
                  <div className="hidden sm:block" />
                  <p>내가 살 때 (VAT포함)</p>
                  <p>내가 팔 때 (현장기준)</p>
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
                <p
                  className={cn(
                    "border-t px-4 pb-5 pt-4 text-xs leading-6 sm:hidden",
                    lineupVariant === "version2"
                      ? "border-[#d1a300] text-[#5f4700]"
                      : "border-white/10 text-white/62",
                  )}
                >
                  시세는 고시 시각 기준이며 실제 거래 금액은 순도, 중량, 제품 상태 확인 후 현장에서 최종
                  안내됩니다.
                </p>
              </div>
            </div>

            <div
              className={`relative z-0 overflow-hidden transition-[margin] duration-300 ${
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
                    sizes="(max-width: 1024px) 100vw, 64vw"
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.9),rgba(255,255,255,0.52)_36%,rgba(255,255,255,0.1)_100%),linear-gradient(180deg,rgba(255,255,255,0.16),rgba(245,228,154,0.38))]" />

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

              <div className="relative z-10 flex min-h-[inherit] flex-col justify-end px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
                <div className="max-w-[38rem] lg:ml-auto">
                  <p className="text-xs font-semibold tracking-[0.28em] text-[#9b7700]">{activeSlide.kicker}</p>
                  <h2 className="mt-5 text-[2.05rem] font-semibold leading-[1.08] tracking-[-0.07em] text-[#101315] sm:text-[3.15rem]">
                    {activeSlide.title}
                  </h2>
                  <p className="mt-5 text-base leading-8 text-[#4f5656] sm:text-lg">{activeSlide.body}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href={activeSlide.href}
                      className="inline-flex h-12 items-center justify-center rounded-lg bg-[#ffcc00] px-7 text-sm font-bold text-[#171717] shadow-[0_14px_30px_rgba(255,204,0,0.25)] transition hover:bg-[#f2bf00]"
                    >
                      {activeSlide.action}
                    </Link>
                    <a
                      href={`tel:${siteConfig.contact.phone}`}
                      className="inline-flex h-12 items-center justify-center rounded-lg bg-white/82 px-7 text-sm font-bold text-[#171717] shadow-[0_10px_26px_rgba(0,0,0,0.08)] backdrop-blur transition hover:bg-white"
                    >
                      전화 문의 {siteConfig.contact.phone}
                    </a>
                  </div>
                  <p className="mt-6 text-sm font-medium tracking-[0.28em] text-[#716547]">{activeSlide.note}</p>
                </div>

                <div className="mt-9 flex flex-wrap items-center gap-4 lg:justify-end">
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
          </div>
        </div>
      </div>

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
    </section>
  );
}
