"use client";

import { useEffect, useRef } from "react";

const tradingViewConfig = {
  symbols: [
    ["Gold", "TVC:GOLD|1D"],
    ["Silver", "TVC:SILVER|1D"],
    ["Platinum", "TVC:PLATINUM|1D"],
  ],
  chartOnly: false,
  width: "100%",
  height: "100%",
  locale: "kr",
  colorTheme: "light",
  autosize: true,
  showVolume: false,
  showMA: false,
  hideDateRanges: false,
  hideMarketStatus: false,
  hideSymbolLogo: false,
  scalePosition: "right",
  scaleMode: "Normal",
  fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
  fontSize: "10",
  noTimeScale: false,
  valuesTracking: "1",
  changeMode: "price-and-percent",
  chartType: "area",
  maLineColor: "#2962FF",
  maLineWidth: 1,
  maLength: 9,
  headerFontSize: "medium",
  lineWidth: 2,
  lineType: 0,
  dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W"],
  lineColor: "#d5ab35",
  topColor: "rgba(213, 171, 53, 0.24)",
  bottomColor: "rgba(213, 171, 53, 0.03)",
} as const;

export function TradingViewMarketWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.innerHTML = JSON.stringify(tradingViewConfig);

    container.appendChild(widget);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <section className="border border-[#dfe6e4] bg-white p-5 shadow-[0_18px_50px_rgba(31,47,43,0.06)] sm:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kcg-eyebrow text-[#9a8a00]">TRADINGVIEW CHART</p>
          <h2 className="kcg-section-title mt-2 text-[#15191b]">국제 금속 시세 차트</h2>
        </div>
        <a
          href="https://www.tradingview.com/"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-[#697171] underline underline-offset-4"
        >
          TradingView 제공
        </a>
      </div>
      <div className="min-h-[26rem] overflow-hidden border border-[#e4ebe9] bg-[#fbfdfc]">
        <div ref={containerRef} data-testid="tradingview-market-widget" className="tradingview-widget-container h-[26rem] w-full">
          <div className="flex h-full items-center justify-center px-5 text-center text-sm leading-6 text-[#687171]">
            TradingView 공식 위젯을 불러오는 중입니다.
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs leading-6 text-[#7d8685]">
        차트는 TradingView 공식 위젯으로 표시합니다. KCG 회사 고시 시세나 상품 참고가는 이 위젯 데이터를 저장하거나
        재가공하지 않으며, 실제 거래 금액은 회사 고시 시세와 실물 확인 기준을 우선합니다.
      </p>
    </section>
  );
}
