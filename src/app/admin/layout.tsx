import type { ReactNode } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { logoutAction } from "@/actions/auth-actions";
import { AdminFormGuard } from "@/components/admin/admin-form-guard";
import { getAdminPasswordMode } from "@/lib/auth/password";
import { getAdminSessionSecretMode } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/server";

const navigation = [
  { href: "/admin", label: "개요" },
  { href: "/admin/prices", label: "시세" },
  { href: "/admin/products", label: "상품" },
  { href: "/admin/media", label: "미디어" },
  { href: "/admin/announcements", label: "공지" },
  { href: "/admin/launch", label: "오픈 점검" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-kcg-path") || "";
  if (pathname === "/admin/login") {
    return children;
  }

  const passwordMode = getAdminPasswordMode();
  const sessionSecretMode = getAdminSessionSecretMode();
  const configured = isSupabaseConfigured();

  return (
    <div className="admin-light min-h-screen">
      <AdminFormGuard />
      <header className="border-b border-[var(--admin-line)] bg-white/88 shadow-sm shadow-black/[0.03] backdrop-blur">
        <div className="section-shell flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-soft)]">
              Operations Console
            </p>
            <h1 className="font-display text-2xl">한국센터금거래소 운영 콘솔</h1>
          </div>
          <form action={logoutAction}>
            <button className="rounded-full border border-[var(--admin-line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--admin-ink)] transition hover:border-[var(--color-gold-soft)] hover:bg-[#fff9df]">
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <div className="section-shell py-8">
        <div className="mb-6 grid gap-3 lg:grid-cols-3">
          <div className="rounded-[1.6rem] border border-[var(--admin-line)] bg-white px-5 py-4 text-sm text-[var(--admin-muted)]">
            저장 모드:{" "}
            <span className="font-semibold text-[var(--admin-ink)]">
              {configured ? "Supabase 연결" : "미리보기 저장 모드"}
            </span>
          </div>
          <div className="rounded-[1.6rem] border border-[var(--admin-line)] bg-white px-5 py-4 text-sm text-[var(--admin-muted)]">
            인증 모드:{" "}
            <span className="font-semibold text-[var(--admin-ink)]">
              {passwordMode === "demo"
                ? "기본 관리자 비밀번호 사용 중"
                : passwordMode === "missing-env"
                  ? "배포 비밀번호 미설정"
                  : "환경변수 비밀번호 사용 중"}
            </span>
          </div>
          <div className="rounded-[1.6rem] border border-[var(--admin-line)] bg-white px-5 py-4 text-sm text-[var(--admin-muted)]">
            세션 서명:{" "}
            <span className="font-semibold text-[var(--admin-ink)]">
              {sessionSecretMode === "env"
                ? "환경변수 사용"
                : sessionSecretMode === "missing-required"
                  ? "배포 필수값 누락"
                  : "로컬 fallback"}
            </span>
          </div>
        </div>

        <nav className="mb-8 flex flex-wrap gap-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={[
                "rounded-full border px-5 py-2.5 text-sm font-semibold transition",
                pathname === item.href
                  ? "border-[#d9ad00] bg-[#fff3bd] text-[var(--admin-ink)]"
                  : "border-[var(--admin-line)] bg-white text-[var(--admin-muted)] hover:border-[var(--color-gold-soft)] hover:text-[var(--admin-ink)]",
              ].join(" ")}
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
