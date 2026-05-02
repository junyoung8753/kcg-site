"use client";

import { useState } from "react";
import { TradingViewMarketWidget } from "@/components/market/trading-view-widget";

export function TradingViewDisclosure() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className="mt-8 border border-[#dfe6e4] bg-white"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-[#15191b]">
        국제 금속 차트 열기
      </summary>
      {isOpen ? (
        <div className="border-t border-[#e4ebe9]">
          <TradingViewMarketWidget />
        </div>
      ) : null}
    </details>
  );
}
