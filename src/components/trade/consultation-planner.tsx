import { consultationScenarios, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type ConsultationPlannerProps = {
  className?: string;
};

export function ConsultationPlanner({ className }: ConsultationPlannerProps) {
  return (
    <section className={cn("section-shell py-14 sm:py-16", className)}>
      <div className="mb-8 max-w-3xl">
        <p className="kcg-eyebrow text-[#9a8a00]">거래 전 60초 체크</p>
        <h2 className="kcg-section-title mt-4 text-[#15191b]">
          문의 목적에 맞춰 준비하면 상담이 빨라집니다
        </h2>
        <p className="kcg-body-copy mt-4 text-[#687171]">
          시세 확인만큼 중요한 것은 거래 목적과 준비물을 분명히 하는 것입니다. 상담 전 아래 항목만 정리해도
          현장 대기와 재확인을 줄일 수 있습니다.
        </p>
      </div>

      <div className="grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-2 xl:grid-cols-4">
        {consultationScenarios.map((item) => (
          <article key={item.title} className="bg-white px-6 py-6">
            <h3 className="kcg-card-title text-[#15191b]">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#687171]">{item.description}</p>
            <div className="mt-5 space-y-2 border-t border-[#e4ebe9] pt-4 text-sm leading-6 text-[#5f6868]">
              {item.checklist.map((check) => (
                <p key={check}>· {check}</p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-5 border-b border-[var(--color-line)] bg-[#fffbe8] px-6 py-6 md:grid-cols-[1fr_auto] md:items-center">
        <p className="text-sm leading-7 text-[#6f6a54]">
          정확한 안내가 필요한 경우 품목, 중량, 수량, 상담 희망 시점을 본사 전화로 먼저 알려주세요.
        </p>
        <a
          href={`tel:${siteConfig.contact.phone}`}
          className="kcg-action-token inline-flex h-11 items-center justify-center rounded-full bg-[#ffcc00] px-5 text-sm font-semibold text-[#171717] transition hover:bg-[#f2bf00]"
        >
          전화 문의 {siteConfig.contact.phone}
        </a>
      </div>
    </section>
  );
}
