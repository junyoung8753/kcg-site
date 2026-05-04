import Image from "next/image";
import Link from "next/link";
import { siteConfig, siteNavigation } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header data-testid="site-header" className="sticky top-0 z-40 border-b border-[#dce6e3] bg-white/96 backdrop-blur">
      <div className="section-shell flex min-h-[4.65rem] items-center justify-between gap-4 py-3 xl:gap-7">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4 xl:max-w-[27rem]">
          <span className="relative h-[2.7rem] w-[2.7rem] shrink-0 sm:hidden">
            <Image
              src={siteConfig.brandAssets.symbolPath}
              alt={siteConfig.brandAssets.symbolAlt}
              fill
              className="object-contain"
              sizes="48px"
              priority
            />
          </span>
          <span className="relative hidden h-[3.35rem] w-[23rem] shrink-0 sm:block">
            <Image
              src={siteConfig.brandAssets.lockupPath}
              alt={siteConfig.brandAssets.lockupAlt}
              fill
              className="object-contain object-left"
              sizes="368px"
              priority
            />
          </span>
          <span className="min-w-0 sm:hidden">
            <span className="block max-w-[7.8rem] text-[10px] font-semibold uppercase leading-[1.25] tracking-[0.14em] text-[#af8400]">
              KOREA CENTER GOLD
            </span>
            <span className="block max-w-[8.8rem] text-[1.06rem] font-semibold leading-[1.14] tracking-[-0.02em] text-[#15191b]">
              <span className="block">(주)한국센터</span>
              <span className="block">금거래소</span>
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 text-[0.98rem] font-semibold tracking-[-0.018em] text-[#121517] lg:flex xl:gap-7">
          {siteNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="shrink-0 whitespace-nowrap transition hover:text-[#8c6700]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <div className="w-[8.5rem] text-right text-sm text-[#66706f]">
            <p className="text-lg font-bold text-[#15191b]">{siteConfig.contact.phone}</p>
            <p className="truncate">본사 전화</p>
          </div>
          <Link
            href="/about"
            className="inline-flex h-11 items-center rounded-full bg-[#ffcc00] px-5 text-sm font-semibold text-[#171717] transition hover:bg-[#f2bf00]"
          >
            매장안내
          </Link>
        </div>

        <a
          href={`tel:${siteConfig.contact.phone}`}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#ffcc00] px-4 text-sm font-bold text-[#171717] shadow-[0_8px_22px_rgba(255,204,0,0.22)] lg:hidden"
        >
          전화
        </a>

        <details className="relative shrink-0 lg:hidden">
          <summary
            className="flex h-11 cursor-pointer list-none items-center justify-center rounded-full border border-[#d8e1df] bg-white px-4 text-sm font-bold text-[#15191b] shadow-[0_8px_22px_rgba(18,24,24,0.08)]"
            aria-label="사이트 메뉴 열기"
          >
            <span aria-hidden="true">메뉴</span>
          </summary>
          <div className="absolute right-0 mt-3 w-[20rem] overflow-hidden border border-[#d8e1df] bg-white shadow-[0_22px_48px_rgba(18,24,24,0.14)]">
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
              <p className="mt-2 text-sm font-semibold text-[#15191b]">{siteConfig.contact.phone}</p>
              <p className="mt-1 text-xs leading-5 text-[#687171]">본사 문의 · 상품/매입 상담</p>
            </div>
            <div className="grid gap-1 p-3">
              {siteNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#15191b] transition hover:bg-[#fff7d2]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-[#edf2f0] bg-[#fbfdfc] px-5 py-4 text-sm leading-6 text-[#687171]">
              <p className="font-semibold text-[#15191b]">{siteConfig.locations.store.title}</p>
              <p>{siteConfig.locations.store.address}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {siteConfig.familyLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[#d8e1df] bg-white px-3 py-1.5 text-xs font-semibold text-[#15191b]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
