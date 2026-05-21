"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatNumber, formatWon } from "@/lib/format";
import { priceLineupRows } from "@/lib/price-presenter";
import { homeDeskNotes, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { PriceCategory, PriceHistoryEntry, PriceRecord } from "@/types/price";

export type PriceLineupVisualMode = "campaign" | "signboard";
export type CampaignSlide = {
  image: string;
  alt: string;
  objectPosition?: string;
};

type LineupVisualStyle = {
  openButton: string;
  panelShell: string;
  contentShiftClass: string;
  panelBase: string;
  panelHeaderBar: string;
  panelTexture: string;
  panelFrame: string;
  titleText: string;
  dateText: string;
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

const defaultCampaignSlides: CampaignSlide[] = [
  {
    image: "/campaign/kcg-approved-goldbar-lineup-reflection-20260517.jpg",
    alt: "KCG 골드바 1돈 2돈 3돈 5돈 10돈 라인업 배너",
    objectPosition: "50% center",
  },
  {
    image: "/campaign/kcg-home-human-consultation-20260506.webp",
    alt: "KCG 상담과 방문 준비 이미지",
    objectPosition: "58% center",
  },
  {
    image: "/campaign/kcg-home-seoul-retail-20260506.webp",
    alt: "KCG 종로 매장 방문 안내 이미지",
    objectPosition: "50% center",
  },
];

const lineupBasisLabel = "3.75g 기준";

const lineupStyle = {
  openButton:
    "border-[#d6e2de] bg-white/88 text-[#171717] shadow-[0_10px_24px_rgba(30,44,41,0.08)] backdrop-blur",
  panelShell: "text-white lg:shadow-[0_24px_70px_rgba(0,0,0,0.24)]",
  contentShiftClass: "lg:ml-[36rem]",
  panelBase: "absolute inset-0 bg-[rgba(38,39,39,0.96)]",
  panelHeaderBar: "absolute inset-x-0 top-0 h-[4.35rem] bg-[rgba(13,13,13,0.98)]",
  panelTexture:
    "absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03),transparent_18%),radial-gradient(circle_at_0%_90%,rgba(255,188,89,0.045),transparent_18%)]",
  panelFrame: "lg:h-full",
  titleText: "text-white",
  dateText: "text-white/58",
  columnHeader: "border-y border-white/8 bg-[rgba(11,11,11,0.18)] text-white",
  rowsWrap: "",
  row: "grid grid-cols-2 items-start gap-x-4 gap-y-2 border-b border-white/10 py-[0.72rem] last:border-b-0 sm:grid-cols-[0.98fr_0.94fr_0.94fr] sm:gap-4 sm:border-b-0 sm:py-[0.58rem]",
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

function formatChangeLine(history: PriceHistoryEntry | null) {
  if (!history) return null;
  const diff = history.newValue - history.previousValue;
  if (diff === 0) return null;
  const percent = history.previousValue ? (diff / history.previousValue) * 100 : 0;
  const symbol = diff < 0 ? "▼" : "▲";
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
}: {
  price?: PriceRecord;
  history?: PriceHistoryEntry | null;
  text?: string;
  note?: string;
  style: LineupVisualStyle;
}) {
  if (text) {
    return (
      <div className="pt-1.5">
        <p className={cn("text-[1.02rem] font-semibold tracking-[-0.022em] sm:text-[1.34rem]", style.priceText)}>{text}</p>
      </div>
    );
  }

  if (!price) {
    return <p className={cn("text-base font-semibold sm:text-xl", style.emptyText)}>문의</p>;
  }

  const change = formatChangeLine(history ?? null);

  return (
    <div>
      <p className={cn("kcg-price-primary text-[1.08rem] font-semibold sm:text-[1.48rem]", style.priceText)}>
        {formatWon(price.value)}
      </p>
      {change ? (
        <p className={cn("mt-0.5 text-[0.68rem] leading-5 sm:text-[0.82rem]", style.metaText)}>
          {change.percent} <span className={change.tone}>{change.amount}</span>
        </p>
      ) : null}
      {note ? <p className={cn("mt-0.5 text-[0.68rem] leading-5 sm:text-[0.82rem]", style.noteText)}>{note}</p> : null}
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
  announcedHeading = "당일 고시 시각",
  announcementStatusLabel = "회사 고시",
  announcementNoticeBadgeLabel,
  announcementNoticeTitle,
  announcementNoticeBody,
  announcementIsStale = false,
  krwRate,
  campaignSlides = defaultCampaignSlides,
}: {
  prices: PriceRecord[];
  history: PriceHistoryEntry[];
  lineupTitle?: string;
  visualMode?: PriceLineupVisualMode;
  showSummaryCards?: boolean;
  announcedLabel?: string;
  announcedDateLabel?: string;
  announcedHeading?: string;
  announcementStatusLabel?: string;
  announcementNoticeBadgeLabel?: string;
  announcementNoticeTitle?: string;
  announcementNoticeBody?: string;
  announcementIsStale?: boolean;
  krwRate?: number;
  campaignSlides?: CampaignSlide[];
}) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const hasMultipleCampaignSlides = campaignSlides.length > 1;
  const activeCampaignSlideIndex =
    campaignSlides.length > 0 ? activeSlideIndex % campaignSlides.length : 0;
  const priceByCategory = new Map(prices.map((price) => [price.category, price]));
  const style = lineupStyle;
  const wrapperHeightClass = "lg:min-h-[38.5rem]";
  const contentHeightClass = "aspect-[16/9] min-h-0 sm:min-h-[23rem] lg:aspect-auto lg:min-h-[38.5rem]";
  const visualShellClass = visualMode === "campaign" ? "w-full kcg-full-bleed-campaign" : "mx-auto max-w-[1500px]";
  const wrapperLayoutClass = "relative flex flex-col lg:block";
  const panelPositionClass =
    visualMode === "campaign"
      ? "order-2 relative z-20 overflow-hidden lg:absolute lg:bottom-0 lg:left-[clamp(7rem,12vw,17rem)] lg:top-0 lg:order-none"
      : "order-1 relative z-10 overflow-hidden lg:absolute lg:bottom-0 lg:left-0 lg:top-0 lg:order-none";
  const panelOpenClass =
    visualMode === "campaign"
      ? "w-full opacity-100 lg:w-[37vw] 2xl:w-[42rem] lg:translate-x-0"
      : "opacity-100 lg:w-[34rem] lg:translate-x-0";
  const panelFrameWidthClass =
    visualMode === "campaign"
      ? "min-w-0"
      : "min-w-0 sm:min-w-[34rem] lg:min-w-full";
  const shiftedContentClass = visualMode === "campaign" ? "lg:ml-0" : style.contentShiftClass;
  const krwRateLabel = krwRate
    ? `${new Intl.NumberFormat("ko-KR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(krwRate)}원`
    : "자동 참고";

  useEffect(() => {
    if (visualMode !== "campaign") return;
    if (!hasMultipleCampaignSlides) return;
    if (isSlidePaused) return;
    const timer = window.setInterval(() => {
      setActiveSlideIndex((index) => (index + 1) % campaignSlides.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [campaignSlides.length, hasMultipleCampaignSlides, isSlidePaused, visualMode]);

  const moveSlide = (offset: number) => {
    if (campaignSlides.length === 0) return;
    setActiveSlideIndex((index) => (index + offset + campaignSlides.length) % campaignSlides.length);
  };

  return (
    <section className="border-b border-[#dde7e4] bg-[#f1faf8]">
      <div className="relative overflow-hidden border-y border-[#e3ece9] bg-[#eef8f6]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fcfb_0%,#edf7f4_48%,#fbf1cf_100%)]" />
        <div className="absolute inset-y-0 right-0 hidden w-[58%] bg-[linear-gradient(135deg,rgba(255,255,255,0.46),rgba(232,245,241,0.18)_42%,rgba(255,245,202,0.38))] lg:block" />

        <div className={visualShellClass}>
          <div className={cn(wrapperLayoutClass, wrapperHeightClass)}>
            <div
              data-testid="home-price-lineup-panel"
              className={cn(
                "transition-[opacity,transform] duration-300",
                panelPositionClass,
                style.panelShell,
                panelOpenClass,
              )}
            >
              <div className={style.panelBase} />
              <div className={style.panelHeaderBar} />
              <div className={style.panelTexture} />

              <div
                className={cn(
                  "relative",
                  style.panelFrame,
                  panelFrameWidthClass,
                )}
              >
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-4 pb-3 pt-5 sm:gap-3 sm:px-8 sm:pb-3 sm:pt-4">
                  <div className="min-w-0">
                    <h1
                      className={cn(
                        "text-[1.32rem] font-semibold leading-tight tracking-[-0.022em] sm:text-[1.72rem]",
                        style.titleText,
                      )}
                    >
                      {lineupTitle}
                    </h1>
                    <p className={cn("mt-1.5 text-[0.72rem] font-semibold leading-5 sm:text-[0.82rem]", style.dateText)}>
                      {lineupBasisLabel}
                    </p>
                    <p
                      className={cn(
                        "mt-3 text-[0.7rem] font-semibold uppercase leading-4 tracking-[0.12em] sm:hidden",
                        "text-white/42",
                      )}
                    >
                      {visualMode === "campaign" ? siteConfig.englishName : null}
                    </p>
                  </div>
                  <p className={cn("text-right text-[0.72rem] sm:text-[0.86rem]", style.dateText)}>
                    {announcedDateLabel}
                  </p>
                </div>

                {announcementNoticeBody ? (
                  <div
                    data-testid="price-announcement-notice"
                    className={cn(
                      "mx-4 mb-3 border px-4 py-3 text-xs leading-5 sm:mx-8",
                      visualMode === "campaign"
                        ? announcementIsStale
                          ? "border-[#ffcc00]/35 bg-[#332c14]/92 text-[#ffe9a3]"
                          : "border-white/10 bg-white/7 text-white/72"
                        : announcementIsStale
                          ? "border-[#e4ca72] bg-[#fff8d7] text-[#6f5400]"
                          : "border-[#dfe6e4] bg-white/76 text-[#5f6868]",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex px-2 py-1 text-[10px] font-black tracking-[0.12em]",
                          visualMode === "campaign"
                            ? "bg-[#ffcc00] text-[#15191b]"
                            : "bg-[#15191b] text-white",
                        )}
                      >
                        {announcementNoticeBadgeLabel || announcementStatusLabel}
                      </span>
                      <p className="font-bold">{announcementNoticeTitle || announcedHeading}</p>
                    </div>
                    <p className={cn("mt-2", visualMode === "campaign" ? "text-white/76" : "text-[#687171]")}>
                      {announcementNoticeBody}
                    </p>
                  </div>
                ) : null}

                {visualMode === "signboard" ? (
                  <div className="grid grid-cols-2 gap-2 border-t border-white/10 px-4 pb-3 pt-3 sm:px-8">
                    <a
                      href={`tel:${siteConfig.contact.phone}`}
                      className="kcg-action-token inline-flex h-10 items-center justify-center rounded-full bg-[#ffcc00] px-4 text-sm font-semibold text-[#171717]"
                    >
                      전화
                    </a>
                    <Link
                      href="/about"
                      className="kcg-action-token inline-flex h-10 items-center justify-center rounded-full border border-white/14 bg-white/8 px-4 text-sm font-semibold text-white"
                    >
                      오시는 길
                    </Link>
                  </div>
                ) : null}

                <div
                  className={cn(
                    "grid grid-cols-2 px-4 py-2 text-center text-[0.78rem] font-semibold leading-6 sm:grid-cols-[0.98fr_0.94fr_0.94fr] sm:px-8 sm:py-2.5 sm:text-[0.92rem]",
                    style.columnHeader,
                  )}
                >
                  <div className="hidden sm:block" />
                  <p>내가 살 때 (VAT포함)</p>
                  <p>{visualMode === "signboard" ? "내가 팔 때 (현장기준)" : "내가 팔 때 (현장 기준)"}</p>
                </div>

                <div className={cn("px-4 pb-4 pt-1 sm:px-8 sm:pb-4", style.rowsWrap)}>
                  {priceLineupRows.map((row) => {
                    const sell = row.sellCategory ? priceByCategory.get(row.sellCategory) : undefined;
                    const buy = row.buyCategory ? priceByCategory.get(row.buyCategory) : undefined;

                    return (
                      <div key={row.title} className={style.row}>
                        <div className="col-span-2 sm:col-span-1">
                          <p className={cn("text-[1.02rem] font-semibold tracking-[-0.022em] sm:text-[1.38rem]", style.rowTitle)}>
                            {row.title}
                          </p>
                          <p className={cn("mt-0.5 text-[0.7rem] font-medium leading-5 sm:text-[0.82rem]", style.rowSubtitle)}>
                            {row.subtitle}
                          </p>
                        </div>
                        <PriceCell
                          price={sell}
                          text={row.sellText}
                          history={getLatestChange(row.sellCategory, history)}
                          style={style}
                        />
                        <PriceCell
                          price={buy}
                          history={getLatestChange(row.buyCategory, history)}
                          note={row.buyNote}
                          style={style}
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
                data-testid="home-campaign-visual"
                className={`order-1 relative z-0 overflow-hidden transition-[margin] duration-300 lg:order-none ${shiftedContentClass} ${contentHeightClass}`}
                onMouseEnter={() => setIsSlidePaused(true)}
                onMouseLeave={() => setIsSlidePaused(false)}
                onFocus={() => setIsSlidePaused(true)}
                onBlur={() => setIsSlidePaused(false)}
              >
                {campaignSlides.map((slide, index) => (
                  <div
                    key={slide.image}
                    data-testid="home-campaign-slide"
                    data-active={index === activeCampaignSlideIndex ? "true" : "false"}
                    data-slide-image={slide.image}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      index === activeCampaignSlideIndex ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden={index !== activeCampaignSlideIndex}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      priority={index === 0}
                      className="object-cover"
                      style={{ objectPosition: slide.objectPosition }}
                      sizes="100vw"
                    />
                  </div>
                ))}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03),transparent_34%,rgba(0,0,0,0.02)_100%)]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.16))]" />

                {hasMultipleCampaignSlides ? (
                  <>
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

                    <div className="absolute inset-x-0 bottom-0 z-10 flex justify-end px-5 py-5 sm:px-8 lg:px-10">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          {campaignSlides.map((slide, index) => (
                            <button
                              key={slide.image}
                              type="button"
                              onClick={() => setActiveSlideIndex(index)}
                              className={`h-2 rounded-full transition-all ${
                                index === activeCampaignSlideIndex ? "w-11 bg-[#ffcc00]" : "w-3 bg-white/80 hover:bg-white"
                              }`}
                              aria-label={`${index + 1}번째 슬라이드 보기`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <div
                className={`relative z-0 order-2 flex flex-col justify-between px-6 py-8 transition-[margin] duration-300 sm:px-10 sm:py-10 lg:order-none lg:px-14 lg:py-12 ${
                  shiftedContentClass
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
                  <p className="kcg-eyebrow mt-4 text-[#9b7700]">
                    종로 귀금속 시세 · 매입 안내
                  </p>
                  <h2 className="kcg-section-title mt-4 text-[#1a1e20]">
                    오늘 고시 시세와 거래 상담 기준 안내
                  </h2>
                  <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#5f6868]">
                    순금, 18K, 14K, 백금, 은 시세는 당일 고시 시각 기준으로 안내되며,
                    실제 거래 금액은 현장 확인 후 최종 안내합니다. 본사 전화로 문의하시면
                    상담 가능 시간과 준비 사항을 먼저 확인하실 수 있습니다.
                  </p>
                </div>

                <div className="mt-7 grid gap-px overflow-hidden border border-[#dbe4e1] bg-[#dbe4e1] sm:grid-cols-2">
                  {homeDeskNotes.map((item) => (
                    <div key={item.title} className="bg-white/86 px-5 py-5">
                      <p className="kcg-fine-label text-[#9b7700]">{item.label}</p>
                      <p className="mt-2 text-base font-semibold tracking-[-0.022em] text-[#15191b]">
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
                        <p className="kcg-fine-label text-[#9b7700]">매장 확인</p>
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
                    <p className="kcg-fine-label text-[#9b7700]">거래 기준 안내</p>
                    <div className="mt-3 grid gap-4 border-y border-[#e2e7e5] py-4 text-sm leading-7 text-[#5f6868]">
                      <div>
                        <p className="font-semibold text-[#15191b]">{announcedHeading}</p>
                        <p>{announcedLabel}</p>
                        {announcementIsStale && announcementNoticeBody ? (
                          <p className="mt-2 text-xs leading-5 text-[#8a6b00]">{announcementNoticeBody}</p>
                        ) : null}
                      </div>
                      <div>
                        <p className="font-semibold text-[#15191b]">상담 가능 시간</p>
                        <p>{siteConfig.contact.businessHours}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[#15191b]">오시는 길</p>
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
                        className="kcg-action-token inline-flex h-12 items-center justify-center rounded-full bg-[#ffcc00] px-6 text-sm font-semibold text-[#171717] transition hover:bg-[#f2bf00]"
                      >
                        전체 시세 보기
                      </Link>
                      <a
                        href={`tel:${siteConfig.contact.phone}`}
                        className="kcg-action-token inline-flex h-12 items-center justify-center rounded-full border border-[#d7e0dd] bg-white/84 px-6 text-sm font-semibold text-[#171717] transition hover:bg-white"
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
            <p className="kcg-data-label text-[#9a8a00]">고시 시각</p>
            <p className="mt-3 text-base font-bold tracking-[-0.018em] text-[#15191b]">{announcedLabel}</p>
            <p className="mt-2 kcg-caption text-[#687171]">
              {announcementIsStale ? "거래 전 확인 필요" : announcementStatusLabel} · 회사 고시가 우선 기준
            </p>
          </div>
          <div className="border-b border-r border-[#dfe7e5] px-6 py-6 xl:border-b-0">
            <p className="kcg-data-label text-[#9a8a00]">국제 참고</p>
            <p className="mt-3 text-base font-bold tracking-[-0.018em] text-[#15191b]">현재가 흐름</p>
            <p className="mt-2 kcg-caption text-[#687171]">출처: Gold API · 참고용</p>
          </div>
          <div className="border-b border-r border-[#dfe7e5] px-6 py-6 sm:border-b-0">
            <p className="kcg-data-label text-[#9a8a00]">USD/KRW</p>
            <p className="mt-3 text-base font-bold tracking-[-0.018em] text-[#15191b]">{krwRateLabel}</p>
            <p className="mt-2 kcg-caption text-[#687171]">시장 참고 환율</p>
          </div>
          <div className="px-6 py-6">
            <p className="kcg-data-label text-[#9a8a00]">상품/매입</p>
            <p className="kcg-number-token mt-3 text-base font-bold tracking-[-0.018em] text-[#15191b]">{siteConfig.contact.phone}</p>
            <p className="mt-2 kcg-caption text-[#687171]">품목·수량 확인</p>
          </div>
        </div>
      ) : null}

    </section>
  );
}
