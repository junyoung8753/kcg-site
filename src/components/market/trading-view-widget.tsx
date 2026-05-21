"use client";

import { useEffect, useRef, useState } from "react";

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
  const [widgetState, setWidgetState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setWidgetState("loading");
    container.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = "100%";
    widget.style.width = "100%";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.innerHTML = JSON.stringify(tradingViewConfig);

    container.appendChild(widget);
    container.appendChild(script);

    let hasSettled = false;
    const markReady = () => {
      hasSettled = true;
      setWidgetState("ready");
    };
    const markFailed = () => {
      if (hasSettled) return;
      setWidgetState("failed");
    };

    let readyTimer: number | null = null;
    const observer = new MutationObserver(() => {
      const iframe = container.querySelector("iframe");
      if (!iframe) return;
      iframe.addEventListener("load", markReady, { once: true });
      if (!readyTimer) {
        readyTimer = window.setTimeout(markReady, 600);
      }
    });
    observer.observe(container, { childList: true, subtree: true });
    const timeout = window.setTimeout(markFailed, 15_000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
      if (readyTimer) window.clearTimeout(readyTimer);
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
      <div className="relative h-[26rem] min-h-[26rem] overflow-hidden border border-[#e4ebe9] bg-[#fbfdfc]">
        <div
          ref={containerRef}
          data-testid="tradingview-market-widget"
          data-kcg-widget-state={widgetState}
          className="tradingview-widget-container h-full w-full"
        >
          <div className="flex h-full items-center justify-center px-5 text-center text-sm leading-6 text-[#687171]">
            TradingView 공식 위젯을 불러오는 중입니다.
          </div>
        </div>
        {widgetState !== "ready" ? (
          <div
            data-testid="tradingview-loading-state"
            className="absolute inset-0 flex items-center justify-center bg-[#fbfdfc]/95 px-6 text-center text-sm leading-6 text-[#687171]"
          >
            {widgetState === "failed" ? (
              <span>
                TradingView 차트를 불러오지 못했습니다.{" "}
                <a
                  href="https://www.tradingview.com/symbols/TVC-GOLD/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#15191b] underline underline-offset-4"
                >
                  TradingView에서 보기
                </a>
              </span>
            ) : (
              <span>TradingView 공식 차트를 불러오는 중입니다.</span>
            )}
          </div>
        ) : null}
      </div>
      <p className="mt-4 text-xs leading-6 text-[#7d8685]">
        차트는 TradingView 공식 위젯으로 표시합니다. KCG 회사 고시 시세나 상품 참고가는 이 위젯 데이터를 저장하거나
        재가공하지 않으며, 실제 거래 금액은 회사 고시 시세와 실물 확인 기준을 우선합니다.
      </p>
    </section>
  );
}
