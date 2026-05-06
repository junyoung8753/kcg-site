import { getLaunchReadiness, type LaunchReadinessLevel } from "@/lib/launch-readiness";

export const dynamic = "force-dynamic";

const levelLabel: Record<LaunchReadinessLevel, string> = {
  pass: "통과",
  warning: "확인 필요",
  blocker: "오픈 차단",
};

const levelClassName: Record<LaunchReadinessLevel, string> = {
  pass: "border-[#b8dfca] bg-[#edf9f1] text-[#125b35]",
  warning: "border-[#d9ad00]/35 bg-[#fff8dc] text-[#725100]",
  blocker: "border-[#efc7bf] bg-[#fff0ed] text-[#8a2c20]",
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
  "KCG_PUBLIC_SEARCH_APPROVED=1 명시 승인 env 설정",
  "robots/noindex 해제와 검색 색인 승인",
];

export default function AdminLaunchPage() {
  const readiness = getLaunchReadiness();

  return (
    <div className="space-y-8">
      <section className="admin-panel p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-soft)]">
          Launch Readiness
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="font-display text-3xl">오픈 전 점검판</h2>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--admin-muted)]">
              도메인, 사업자 표시, 관리자 인증, 저장소, 검색 노출처럼 실제 공개 전에 놓치면 안 되는
              항목만 모았습니다. 임시값은 화면에 보이더라도 이 점검판에서 오픈 차단으로 표시됩니다.
            </p>
          </div>
          <div className="rounded-[1.35rem] border border-[var(--admin-line)] bg-[#fbf7e8] px-6 py-5 text-right">
            <p className="text-sm text-[var(--admin-muted)]">점검 점수</p>
            <p className="mt-2 text-5xl font-semibold text-[var(--admin-ink)]">{readiness.score}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
              {readiness.status}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="admin-panel p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-soft)]">
            Safe Pre-Launch
          </p>
          <h3 className="mt-3 font-display text-xl text-[var(--admin-ink)]">지금 미리 가능한 준비</h3>
          <ul className="mt-5 grid gap-3 text-sm leading-7 text-[var(--admin-ink)]">
            {preLaunchTasks.map((task) => (
              <li key={task} className="rounded-[1rem] border border-[var(--admin-line)] bg-[#fbf7e8] px-4 py-3">
                {task}
              </li>
            ))}
          </ul>
        </div>
        <div
          className="rounded-[1.35rem] border border-[#e5b8b4] bg-[#fff8f7] p-6"
          data-testid="admin-public-launch-approval"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a53b32]">
            Public Launch Approval
          </p>
          <h3 className="mt-3 font-display text-xl text-[#5f2721]">공개 직전 별도 승인 필요</h3>
          <ul className="mt-5 grid gap-3 text-sm leading-7 text-[#5f2721]">
            {publicLaunchTasks.map((task) => (
              <li key={task} className="rounded-[1rem] border border-[#e5b8b4] bg-white px-4 py-3">
                {task}
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-[1rem] border border-[#e5b8b4] bg-white px-4 py-3 text-sm leading-7 text-[#5f2721]">
            현재 공개 차단 조건은 유지됩니다. 사업자 임시값, 비최종 도메인, production 미승인, 강제 noindex,
            공개 승인 env 미설정 중 하나라도 남아 있으면 검색 노출은 열리지 않습니다.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="admin-panel p-6">
          <p className="text-sm text-[var(--admin-muted)]">오픈 차단</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--admin-ink)]">{readiness.blockers.length}개</p>
        </div>
        <div className="admin-panel p-6">
          <p className="text-sm text-[var(--admin-muted)]">확인 필요</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--admin-ink)]">{readiness.warnings.length}개</p>
        </div>
        <div className="admin-panel p-6">
          <p className="text-sm text-[var(--admin-muted)]">현재 상태</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--admin-ink)]">
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
          <article key={item.key} className="admin-panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl text-[var(--admin-ink)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--admin-muted)]">{item.summary}</p>
              </div>
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClassName[item.level]}`}
              >
                {levelLabel[item.level]}
              </span>
            </div>
            <p className="mt-5 rounded-[1rem] border border-[var(--admin-line)] bg-[#fbf7e8] px-4 py-3 text-sm leading-7 text-[var(--admin-muted)]">
              {item.action}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
