import Link from "next/link";
import { getRepository } from "@/lib/data";
import { getLaunchReadiness } from "@/lib/launch-readiness";
import { isSupabaseConfigured } from "@/lib/supabase/server";

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
  const announcedAt = prices[0]?.announcedAt
    ? new Date(prices[0].announcedAt).toLocaleString("ko-KR")
    : "-";

  const stats = [
    { label: "오늘 고시 시각", value: announcedAt },
    { label: "저장 방식", value: isSupabaseConfigured() ? "Supabase" : "Demo" },
    {
      label: "자동시세 상태",
      value:
        autoSettings.isEnabled && autoSettings.mode === "auto_publish"
          ? `${autoSettings.checkIntervalMinutes}분 확인`
          : "직접 입력",
    },
    { label: "검토 대기", value: autoSuggestion?.status === "draft" ? "있음" : "없음" },
    { label: "상품 공개 수", value: `${visibleProducts}/${products.length}건` },
    { label: "오픈 점수", value: `${launchReadiness.score}점` },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2.4rem] border border-white/10 bg-white/5 p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-soft)]">
          Admin Dashboard
        </p>
        <h2 className="mt-4 font-display text-3xl">오늘 운영 상태</h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-white/72">
          시세 자동운영, 상품 공개 상태, 공지 {announcements.length}건, 오픈 점검을 먼저 확인합니다.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6"
          >
            <p className="text-sm text-white/58">{item.label}</p>
            <p className="mt-3 text-xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {[
          {
            href: "/admin/prices",
            title: "시세 관리",
            body: "기준 시각, 항목별 시세, 표시 여부를 한 번에 조정합니다.",
          },
          {
            href: "/admin/announcements",
            title: "공지 관리",
            body: "공지 작성, pinned 지정, 게시 상태 변경을 지원합니다.",
          },
          {
            href: "/admin/products",
            title: "상품 관리",
            body: "상담형 상품 카탈로그의 사진, 가격 문구, 공개 상태를 관리합니다.",
          },
          {
            href: "/admin/launch",
            title: "오픈 점검",
            body: "도메인, 법적 표시, 관리자 인증, 검색 노출 차단 항목을 확인합니다.",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 transition hover:border-[var(--color-gold-soft)] hover:bg-white/8"
          >
            <h3 className="font-display text-xl text-white">{item.title}</h3>
            <p className="mt-4 text-sm leading-8 text-white/68">{item.body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
