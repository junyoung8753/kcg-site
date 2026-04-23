import Image from "next/image";
import Link from "next/link";
import { siteConfig, siteNavigation } from "@/lib/site-config";

const utilityLinks = [
  { href: "/about", label: "회사소개" },
  { href: "/about", label: "거래안내" },
  { href: "/announcements", label: "공지사항" },
  { href: "/about", label: "오시는 길" },
];

const shortcutLinks = [
  { href: "/prices", label: "오늘 시세" },
  { href: "/services", label: "매입 상담" },
  { href: "/services", label: "골드바 문의" },
  { href: "/announcements", label: "운영 공지" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#dce6e3] bg-white/95 backdrop-blur">
      <div className="hidden border-b border-[#edf2f0] bg-[#f7fbfa] xl:block">
        <div className="section-shell flex h-10 items-center justify-between gap-6 text-sm font-medium text-[#4d5656]">
          <p className="truncate text-[#6f7777]">
            당일 고시 시세와 귀금속 상담 기준을 안내하는 종로 거래 안내 데스크
          </p>
          <div className="flex items-center gap-6">
            {utilityLinks.map((item) => (
              <Link key={item.label} href={item.href} className="transition hover:text-[#141718]">
                {item.label}
              </Link>
            ))}
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="font-semibold text-[#9c6d00] transition hover:text-[#6d4f00]"
            >
              전화상담 {siteConfig.contact.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="section-shell flex min-h-[5.85rem] items-center justify-between gap-6 py-4 xl:gap-8">
        <Link href="/" className="flex min-w-0 items-center gap-4 xl:max-w-[28rem]">
          <span className="relative h-[3.4rem] w-[3.4rem] shrink-0 sm:hidden">
            <Image
              src={siteConfig.brandAssets.symbolPath}
              alt={siteConfig.brandAssets.symbolAlt}
              fill
              className="object-contain"
              sizes="56px"
              priority
            />
          </span>
          <span className="relative hidden h-[3.9rem] w-[24rem] shrink-0 sm:block">
            <Image
              src={siteConfig.brandAssets.lockupPath}
              alt={siteConfig.brandAssets.lockupAlt}
              fill
              className="object-contain object-left"
              sizes="384px"
              priority
            />
          </span>
          <span className="min-w-0 sm:hidden">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#af8400]">
              {siteConfig.englishName}
            </span>
            <span className="block truncate text-[1.48rem] font-semibold tracking-[-0.055em] text-[#15191b]">
              {siteConfig.brandName}
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-6 text-[1rem] font-medium tracking-[-0.03em] text-[#121517] lg:flex xl:gap-8">
          {siteNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap transition hover:text-[#8c6700]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-5 xl:flex">
          <div className="text-right text-sm text-[#66706f]">
            <p className="text-lg font-bold text-[#15191b]">{siteConfig.contact.phone}</p>
            <p className="max-w-[22rem] truncate">{siteConfig.contact.address}</p>
          </div>
          <Link
            href="/about"
            className="inline-flex h-11 items-center rounded-full bg-[#ffcc00] px-5 text-sm font-semibold text-[#171717] transition hover:bg-[#f2bf00]"
          >
            방문 상담 안내
          </Link>
        </div>

        <details className="relative lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#d8e1df] px-4 py-2 text-sm font-semibold text-[#15191b]">
            메뉴
          </summary>
          <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-[#d8e1df] bg-white shadow-[0_22px_48px_rgba(18,24,24,0.14)]">
            <div className="border-b border-[#edf2f0] bg-[#f7fbfa] px-5 py-4">
              <div className="relative h-[3rem] w-[12.5rem]">
                <Image
                  src={siteConfig.brandAssets.lockupPath}
                  alt={siteConfig.brandAssets.lockupAlt}
                  fill
                  className="object-contain object-left"
                  sizes="200px"
                />
              </div>
              <p className="mt-2 text-sm text-[#687171]">{siteConfig.contact.phone}</p>
            </div>
            <div className="p-3">
              {siteNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#15191b] transition hover:bg-[#fff7d2]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-[#edf2f0] bg-[#fbfdfc] px-5 py-4 text-sm leading-6 text-[#687171]">
              <p>{siteConfig.contact.address}</p>
            </div>
          </div>
        </details>
      </div>

      <div className="hidden border-t border-[#edf2f0] bg-[#fbfdfc] lg:block">
        <div className="section-shell grid grid-cols-4 border-x border-[#edf2f0]">
          {shortcutLinks.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-12 items-center justify-center text-sm font-semibold text-[#424a4a] transition hover:bg-[#fff7d2] hover:text-[#111] ${
                index < shortcutLinks.length - 1 ? "border-r border-[#edf2f0]" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
