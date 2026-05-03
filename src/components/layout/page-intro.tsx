import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  asideLabel?: string;
  asideTitle?: string;
  asideBody?: ReactNode;
  asideAction?: ReactNode;
  highlights?: {
    label: string;
    title: string;
    body: string;
  }[];
};

export function PageIntro({
  eyebrow,
  title,
  description,
  asideLabel,
  asideTitle,
  asideBody,
  asideAction,
  highlights = [],
}: PageIntroProps) {
  return (
    <section className="border-b border-[#dfe7e5] bg-[#f3faf8]">
      <div className="section-shell grid gap-6 py-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
        <div className="max-w-3xl">
          <p className="kcg-eyebrow text-[#9a8a00]">{eyebrow}</p>
          <h1 className="kcg-page-title mt-3 text-[#15191b]">
            {title}
          </h1>
          <p className="kcg-body-copy mt-4 max-w-3xl text-[#687171]">{description}</p>

          {highlights.length ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="border border-[#e4ebe8] bg-white/72 px-4 py-4">
                  <p className="kcg-fine-label text-[#9a8a00]">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold tracking-[-0.02em] text-[#15191b]">{item.title}</p>
                  <p className="mt-2 text-xs leading-6 text-[#687171]">{item.body}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {asideTitle || asideBody || asideAction ? (
          <div className="border border-[#dfe7e5] bg-[#fffef9] px-5 py-5">
            {asideLabel ? (
              <p className="kcg-fine-label text-[#8e9696]">{asideLabel}</p>
            ) : null}
            {asideTitle ? (
              <p className="mt-2 text-lg font-semibold tracking-[-0.022em] text-[#15191b]">{asideTitle}</p>
            ) : null}
            {asideBody ? <div className="mt-3 text-sm leading-7 text-[#687171]">{asideBody}</div> : null}
            {asideAction ? <div className="mt-4">{asideAction}</div> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
