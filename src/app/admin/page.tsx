import Link from "next/link";
import { getRepository } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default async function AdminPage() {
  const repository = getRepository();
  const [prices, announcements, products] = await Promise.all([
    repository.getPrices(),
    repository.getAnnouncements({ includeDrafts: true }),
    repository.getProducts({ includeHidden: true }),
  ]);

  const stats = [
    { label: "운영 시세 항목", value: `${prices.length}개` },
    { label: "공지 레코드", value: `${announcements.length}건` },
    { label: "상품 카탈로그", value: `${products.length}건` },
    { label: "저장 방식", value: isSupabaseConfigured() ? "Supabase" : "Demo" },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2.4rem] border border-white/10 bg-white/5 p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--color-gold-soft)]">
          Dashboard
        </p>
        <h2 className="mt-4 font-display text-4xl">운영 준비 상태를 한눈에 확인합니다.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-white/72">
          이 관리자 화면은 시세 입력, 공지 작성, 향후 상품 등록 확장을 같은
          구조 안에서 다루기 위한 출발점입니다. 저장이 비활성 상태여도 실제 운영
          UI 흐름은 먼저 확인할 수 있습니다.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6"
          >
            <p className="text-sm text-white/58">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
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
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 transition hover:border-[var(--color-gold-soft)] hover:bg-white/8"
          >
            <h3 className="font-display text-2xl text-white">{item.title}</h3>
            <p className="mt-4 text-sm leading-8 text-white/68">{item.body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
