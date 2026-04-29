import { getLaunchReadiness, type LaunchReadinessLevel } from "@/lib/launch-readiness";

const levelLabel: Record<LaunchReadinessLevel, string> = {
  pass: "통과",
  warning: "확인 필요",
  blocker: "오픈 차단",
};

const levelClassName: Record<LaunchReadinessLevel, string> = {
  pass: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  warning: "border-[#ffcc00]/30 bg-[#ffcc00]/10 text-[#ffe996]",
  blocker: "border-red-300/35 bg-red-300/10 text-red-100",
};

const preLaunchTasks = [
  "프리뷰 배포와 화면 검증",
  "상품·시세·공지 Supabase 운영 데이터 준비",
  "Cafe24 도메인 연결 절차와 Vercel DNS 레코드 확인",
  "Gold API 기본 참고 시세와 Metals.Dev 선택 전환 확인",
  "KRX 데이터는 승인·계약 범위 확인 전 production 미사용",
  "사업자·법적 표시 확정값 준비",
];

const publicLaunchTasks = [
  "Production 배포 승인",
  "Stable alias 변경 승인",
  "kcgold.co.kr Cafe24 DNS 전환 승인",
  "robots/noindex 해제와 검색 색인 승인",
];

export default function AdminLaunchPage() {
  const readiness = getLaunchReadiness();

  return (
    <div className="space-y-8">
      <section className="rounded-[2.4rem] border border-white/10 bg-white/5 p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--color-gold-soft)]">
          Launch Readiness
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="font-display text-4xl">오픈 전 점검판</h2>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/72">
              도메인, 사업자 표시, 관리자 인증, 저장소, 검색 노출처럼 실제 공개 전에 놓치면 안 되는
              항목만 모았습니다. 임시값은 화면에 보이더라도 이 점검판에서 오픈 차단으로 표시됩니다.
            </p>
          </div>
          <div className="rounded-[1.8rem] border border-white/10 bg-black/18 px-6 py-5 text-right">
            <p className="text-sm text-white/58">점검 점수</p>
            <p className="mt-2 text-5xl font-semibold text-white">{readiness.score}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/58">
              {readiness.status}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-gold-soft)]">
            Safe Pre-Launch
          </p>
          <h3 className="mt-3 font-display text-2xl text-white">지금 미리 가능한 준비</h3>
          <ul className="mt-5 grid gap-3 text-sm leading-7 text-white/70">
            {preLaunchTasks.map((task) => (
              <li key={task} className="rounded-[1rem] border border-white/8 bg-black/12 px-4 py-3">
                {task}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[1.8rem] border border-red-300/20 bg-red-300/8 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-100/80">
            Public Launch Approval
          </p>
          <h3 className="mt-3 font-display text-2xl text-white">공개 직전 별도 승인 필요</h3>
          <ul className="mt-5 grid gap-3 text-sm leading-7 text-red-50/76">
            {publicLaunchTasks.map((task) => (
              <li key={task} className="rounded-[1rem] border border-red-200/12 bg-black/12 px-4 py-3">
                {task}
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-[1.2rem] border border-red-200/12 bg-black/14 px-4 py-3 text-sm leading-7 text-red-50/72">
            현재 공개 차단 조건은 유지됩니다. 사업자 임시값, 비최종 도메인, production 미승인, 강제 noindex가 남아 있으면 검색 노출은 열리지 않습니다.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/58">오픈 차단</p>
          <p className="mt-3 text-3xl font-semibold text-white">{readiness.blockers.length}개</p>
        </div>
        <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/58">확인 필요</p>
          <p className="mt-3 text-3xl font-semibold text-white">{readiness.warnings.length}개</p>
        </div>
        <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/58">현재 상태</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {readiness.status === "blocked"
              ? "차단"
              : readiness.status === "review-needed"
                ? "검토"
                : "준비"}
          </p>
        </div>
      </section>

      <section className="grid gap-4">
        {readiness.items.map((item) => (
          <article key={item.key} className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">{item.summary}</p>
              </div>
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClassName[item.level]}`}
              >
                {levelLabel[item.level]}
              </span>
            </div>
            <p className="mt-5 rounded-[1.2rem] border border-white/8 bg-black/14 px-4 py-3 text-sm leading-7 text-white/68">
              {item.action}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
