import Link from "next/link";
import {
  externalReferenceLinks,
  krxSafetyNotes,
  siteConfig,
  tradeStandardPrinciples,
} from "@/lib/site-config";
import { cn } from "@/lib/utils";

type TradeStandardPanelProps = {
  className?: string;
  heading?: string;
  description?: string;
  showExternalLinks?: boolean;
};

export function TradeStandardPanel({
  className,
  heading = "거래 전 확인해야 할 기준",
  description = "공식 금시장 자료와 공개 금시세 안내에서 공통적으로 중요한 것은 가격의 기준, 거래 방식, 현장 확인 범위를 명확히 구분하는 것입니다.",
  showExternalLinks = true,
}: TradeStandardPanelProps) {
  return (
    <section className={cn("section-shell py-14 sm:py-16", className)}>
      <div className="grid gap-8 border-y border-[var(--color-line)] py-8 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="xl:pr-8">
          <p className="kcg-eyebrow text-[#9a8a00]">거래 기준</p>
          <h2 className="kcg-section-title mt-4 text-[#15191b]">
            {heading}
          </h2>
          <p className="kcg-body-copy mt-5 max-w-2xl text-[#687171]">{description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#ffcc00] px-5 text-sm font-semibold text-[#171717] transition hover:bg-[#f2bf00]"
            >
              전화 문의 {siteConfig.contact.phone}
            </a>
            <Link
              href="/about"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#d7e0dd] bg-white px-5 text-sm font-semibold text-[#171717] transition hover:bg-[#fbfdfc]"
            >
              거래 절차 보기
            </Link>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-2">
          {tradeStandardPrinciples.map((item, index) => (
            <article key={item.title} className="bg-white px-6 py-6">
              <p className="kcg-fine-label text-[#9a8a00]">
                기준 0{index + 1}
              </p>
              <h3 className="kcg-card-title mt-4 text-[#15191b]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#687171]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-6 border-b border-[var(--color-line)] py-8 xl:grid-cols-[1fr_0.72fr]">
        <div>
          <p className="kcg-eyebrow text-[#9a8a00]">안전 안내</p>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-[#687171]">
            {krxSafetyNotes.map((note) => (
              <p key={note}>· {note}</p>
            ))}
          </div>
        </div>
        {showExternalLinks ? (
          <div className="border border-[#dfe6e4] bg-[#fbfdfc] px-5 py-5">
            <p className="text-sm font-semibold text-[#15191b]">공식 금시장 참고</p>
            <p className="mt-2 text-sm leading-7 text-[#687171]">
              KRX 금현물 거래는 증권사 계좌를 통한 장내 거래입니다. 민간 금거래소 현장 상담과 다른 방식이므로
              목적에 맞게 구분해 확인하세요.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {externalReferenceLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-[#d7e0dd] bg-white px-3 py-1.5 text-xs font-semibold text-[#171717] transition hover:bg-[#fff7d2]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
