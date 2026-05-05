import Link from "next/link";
import { getRepository } from "@/lib/data";
import { formatDateTimeKorean } from "@/lib/format";
import { getLaunchReadiness } from "@/lib/launch-readiness";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function statusBadgeClass(tone: "ok" | "warn" | "neutral") {
  if (tone === "ok") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "warn") return "border-[#d9ad00]/35 bg-[#fff8dc] text-[#725100]";
  return "border-[var(--admin-line)] bg-[#fbfdfb] text-[var(--admin-muted)]";
}

export default async function AdminPage() {
  const repository = getRepository();
  const [prices, announcements, products, autoSettings, autoSuggestion] = await Promise.all([
    repository.getPrices(),
    repository.getAnnouncements({ includeDrafts: true }),
    repository.getProducts({ includeHidden: true }),
    repository.getPriceAutoSettings(),
    repository.getLatestPriceAutoSuggestion(),
  ]);
  const launchReadiness = getLaunchReadiness();
  const visibleProducts = products.filter((product) => product.status !== "hidden").length;
  const visibleAnnouncements = announcements.filter((announcement) => announcement.status === "published").length;
  const announcedAt = prices[0]?.announcedAt ? formatDateTimeKorean(prices[0].announcedAt) : "-";
  const storageMode = isSupabaseConfigured() ? "Supabase 저장" : "미리보기 저장";
  const autoOn = autoSettings.isEnabled && autoSettings.mode === "auto_publish";
  const hasReviewQueue = autoSuggestion?.status === "draft";

  const healthCards = [
    {
      label: "오늘 고시 시각",
      value: announcedAt,
      help: "고객 화면의 기준 시각입니다.",
      tone: "neutral" as const,
    },
    {
      label: "시세 운영",
      value: autoOn ? "자동시세 ON" : "직접 입력",
      help: autoOn ? `${autoSettings.checkIntervalMinutes}분 기준 확인` : "관리자가 직접 저장한 값만 노출",
      tone: autoOn ? ("ok" as const) : ("neutral" as const),
    },
    {
      label: "검토 대기",
      value: hasReviewQueue ? "확인 필요" : "없음",
      help: hasReviewQueue ? "자동 계산값 중 확인할 항목이 있습니다." : "보류된 자동 계산값이 없습니다.",
      tone: hasReviewQueue ? ("warn" as const) : ("ok" as const),
    },
    {
      label: "상품 공개",
      value: `${visibleProducts}/${products.length}건`,
      help: "고객 화면에 보이는 상품 수입니다.",
      tone: "neutral" as const,
    },
    {
      label: "공지",
      value: `${visibleAnnouncements}/${announcements.length}건`,
      help: "게시 중인 공지와 전체 공지 수입니다.",
      tone: "neutral" as const,
    },
    {
      label: "오픈 점검",
      value: `${launchReadiness.score}점`,
      help:
        launchReadiness.blockers.length > 0
          ? `차단 ${launchReadiness.blockers.length}개`
          : `확인 필요 ${launchReadiness.warnings.length}개`,
      tone: launchReadiness.blockers.length > 0 ? ("warn" as const) : ("ok" as const),
    },
  ];

  const todayTasks = [
    {
      href: "/admin/prices",
      title: "오늘 시세 확인",
      body: autoOn
        ? "자동시세 상태, 최근 반영 결과, 검토 대기 항목을 먼저 확인합니다."
        : "직접 입력 표에서 고객 화면에 보일 시세를 확인하고 저장합니다.",
      cta: "시세 관리 열기",
      tone: autoOn ? ("ok" as const) : ("neutral" as const),
    },
    {
      href: "/admin/products",
      title: "상품 노출 확인",
      body: "공개/숨김 상태, 이미지 유무, 가격 기준이 고객 화면과 맞는지 봅니다.",
      cta: "상품 관리",
      tone: "neutral" as const,
    },
    {
      href: "/admin/announcements",
      title: "공지 최신 상태",
      body: "영업 안내, 시세 운영, 상품 안내 중 고객에게 필요한 공지만 게시합니다.",
      cta: "공지 관리",
      tone: "neutral" as const,
    },
    {
      href: "/admin/launch",
      title: "오픈 차단 항목",
      body: "도메인, 검색 차단, 사업자 표시, 운영 비밀값 상태를 점검합니다.",
      cta: "오픈 점검",
      tone: launchReadiness.blockers.length > 0 ? ("warn" as const) : ("ok" as const),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="admin-panel p-6 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="admin-compact-label">운영 대시보드</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-[var(--admin-ink)]">
              오늘 먼저 확인할 것
            </h2>
            <p className="admin-help mt-3 max-w-3xl">
              고객에게 보이는 시세, 자동시세 상태, 상품 공개 수, 공지, 오픈 차단 항목을 한 화면에서 확인합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/prices" target="_blank" className="admin-secondary-button">
              공개 시세 보기
            </Link>
            <Link href="/admin/prices" className="admin-primary-button">
              시세 관리
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {healthCards.map((item) => (
          <article key={item.label} className="admin-panel p-4">
            <p className="text-sm font-bold text-[var(--admin-muted)]">{item.label}</p>
            <p className="mt-2 text-xl font-extrabold text-[var(--admin-ink)]">{item.value}</p>
            <p className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeClass(item.tone)}`}>
              {item.help}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="admin-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="admin-compact-label">오늘 작업</p>
              <h3 className="mt-1 text-2xl font-extrabold text-[var(--admin-ink)]">운영자가 바로 눌러야 할 메뉴</h3>
            </div>
            <p className="rounded-full border border-[var(--admin-line)] bg-[#fbf7e8] px-3 py-1.5 text-sm font-bold text-[var(--admin-ink)]">
              {storageMode}
            </p>
          </div>

          <div className="mt-5 divide-y divide-[var(--admin-line)] overflow-hidden rounded-[1rem] border border-[var(--admin-line)] bg-white">
            {todayTasks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="grid gap-3 px-4 py-4 transition hover:bg-[#fff9df] sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-extrabold text-[var(--admin-ink)]">{item.title}</h4>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadgeClass(item.tone)}`}>
                      {item.tone === "warn" ? "확인 필요" : item.tone === "ok" ? "정상" : "확인"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">{item.body}</p>
                </div>
                <span className="text-sm font-extrabold text-[#8a6900]">{item.cta}</span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="admin-panel p-5 sm:p-6">
          <p className="admin-compact-label">운영 원칙</p>
          <h3 className="mt-1 text-2xl font-extrabold text-[var(--admin-ink)]">헷갈리면 이것만 기준</h3>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--admin-muted)]">
            <li className="admin-subpanel px-4 py-3">
              <b className="text-[var(--admin-ink)]">고객 화면 시세</b>가 최우선입니다. 자동 참고값보다 회사 고시가가 먼저입니다.
            </li>
            <li className="admin-subpanel px-4 py-3">
              <b className="text-[var(--admin-ink)]">자동시세 ON</b>은 안전 기준을 통과한 계산값만 반영합니다. 보류 사유는 시세 관리에서 확인합니다.
            </li>
            <li className="admin-subpanel px-4 py-3">
              <b className="text-[var(--admin-ink)]">직접 입력</b>은 자동시세 OFF일 때만 사용합니다. 저장 후 공개 시세 페이지를 바로 확인합니다.
            </li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
