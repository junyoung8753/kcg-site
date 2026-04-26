import type { ReactNode } from "react";
import Link from "next/link";
import { logoutAction } from "@/actions/auth-actions";
import { getAdminPasswordMode } from "@/lib/auth/password";
import { isSupabaseConfigured } from "@/lib/supabase/server";

const navigation = [
  { href: "/admin", label: "개요" },
  { href: "/admin/prices", label: "시세 관리" },
  { href: "/admin/announcements", label: "공지 관리" },
  { href: "/admin/products", label: "상품 관리" },
  { href: "/admin/launch", label: "오픈 점검" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const passwordMode = getAdminPasswordMode();
  const configured = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-[#141518] text-white">
      <header className="border-b border-white/10">
        <div className="section-shell flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--color-gold-soft)]">
              Admin Console
            </p>
            <h1 className="font-display text-3xl">한국센터금거래소 관리자</h1>
          </div>
          <form action={logoutAction}>
            <button className="rounded-full border border-white/14 px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--color-gold-soft)] hover:bg-white/6">
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <div className="section-shell py-8">
        <div className="mb-6 grid gap-3 lg:grid-cols-2">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/72">
            저장 모드:{" "}
            <span className="font-semibold text-white">
              {configured ? "Supabase 연결" : "미리보기 저장 모드"}
            </span>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/72">
            인증 모드:{" "}
            <span className="font-semibold text-white">
              {passwordMode === "demo"
                ? "기본 관리자 비밀번호 사용 중"
                : passwordMode === "missing-env"
                  ? "배포 비밀번호 미설정"
                  : "환경변수 비밀번호 사용 중"}
            </span>
          </div>
        </div>

        <nav className="mb-8 flex flex-wrap gap-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white/74 transition hover:border-[var(--color-gold-soft)] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
