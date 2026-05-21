"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { siteConfig } from "@/lib/site-config";

export function MobileContactBar() {
  function openInquiryAssistant(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent("kcg:open-inquiry-assistant"));
  }

  return (
    <div
      data-testid="mobile-contact-bar"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d8e1df] bg-white/96 px-3 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_26px_rgba(18,24,24,0.12)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1.5">
        <a
          href={`tel:${siteConfig.contact.phone}`}
          className="kcg-action-token inline-flex h-10 items-center justify-center rounded-full bg-[#ffcc00] px-3 text-sm font-bold text-[#171717] shadow-[0_10px_24px_rgba(255,204,0,0.22)]"
        >
          전화
        </a>
        <Link
          href="/prices"
          className="kcg-action-token inline-flex h-10 items-center justify-center rounded-full border border-[#d7e0dd] bg-white px-3 text-sm font-semibold text-[#15191b]"
        >
          시세
        </Link>
        <Link
          href="/about"
          className="kcg-action-token inline-flex h-10 items-center justify-center rounded-full border border-[#d7e0dd] bg-white px-3 text-sm font-semibold text-[#15191b]"
        >
          위치
        </Link>
        <a
          href="#inquiry-assistant"
          data-kcg-open-inquiry-assistant="true"
          onClick={openInquiryAssistant}
          className="kcg-action-token inline-flex h-10 items-center justify-center rounded-full bg-[#15191b] px-3 text-sm font-bold text-white"
          style={{ color: "#ffffff" }}
        >
          상담
        </a>
      </div>
    </div>
  );
}
