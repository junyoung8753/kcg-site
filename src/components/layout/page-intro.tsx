import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  asideLabel?: string;
  asideTitle?: string;
  asideBody?: ReactNode;
  asideAction?: ReactNode;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  asideLabel,
  asideTitle,
  asideBody,
  asideAction,
}: PageIntroProps) {
  return (
    <section className="border-b border-[#dfe7e5] bg-[#f3faf8]">
      <div className="section-shell grid gap-6 py-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-[#9a8a00]">{eyebrow}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold leading-[1.22] tracking-[-0.055em] text-[#15191b] sm:text-[2.15rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#687171]">{description}</p>
        </div>

        {asideTitle || asideBody || asideAction ? (
          <div className="border border-[#dfe7e5] bg-[#fffef9] px-5 py-5">
            {asideLabel ? (
              <p className="text-[11px] font-semibold tracking-[0.28em] text-[#8e9696]">{asideLabel}</p>
            ) : null}
            {asideTitle ? (
              <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#15191b]">{asideTitle}</p>
            ) : null}
            {asideBody ? <div className="mt-3 text-sm leading-7 text-[#687171]">{asideBody}</div> : null}
            {asideAction ? <div className="mt-4">{asideAction}</div> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
