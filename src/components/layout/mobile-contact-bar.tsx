import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function MobileContactBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d8e1df] bg-white/96 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_34px_rgba(18,24,24,0.12)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        <a
          href={`tel:${siteConfig.contact.phone}`}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#ffcc00] px-3 text-sm font-bold text-[#171717] shadow-[0_10px_24px_rgba(255,204,0,0.22)]"
        >
          전화 상담
        </a>
        <Link
          href="/prices"
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#d7e0dd] bg-white px-3 text-sm font-semibold text-[#15191b]"
        >
          시세
        </Link>
        <Link
          href="/about"
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#d7e0dd] bg-white px-3 text-sm font-semibold text-[#15191b]"
        >
          위치
        </Link>
      </div>
    </div>
  );
}
