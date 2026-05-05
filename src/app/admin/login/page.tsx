import { loginAction } from "@/actions/auth-actions";
import { getAdminPasswordMode } from "@/lib/auth/password";
import { siteConfig } from "@/lib/site-config";

interface AdminLoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;
  const passwordMode = getAdminPasswordMode();
  const nextPath =
    typeof params.next === "string" && params.next.length > 0 ? params.next : "/admin";

  return (
    <div className="admin-light flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-xl rounded-[2.4rem] border border-[var(--admin-line)] bg-white p-8 shadow-2xl shadow-black/[0.06] sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-soft)]">
          Admin Login
        </p>
        <h1 className="mt-4 font-display text-3xl">관리자 로그인</h1>
        <p className="mt-4 text-sm leading-8 text-[var(--admin-muted)]">
          시세 수정, 공지 작성, 추후 상품 등록 확장을 위한 관리자 진입 페이지입니다.
        </p>

        {params.error === "invalid" ? (
          <p className="mt-6 rounded-2xl border border-red-300/40 bg-red-50 px-4 py-3 text-sm text-red-700">
            비밀번호가 올바르지 않습니다.
          </p>
        ) : null}

        {params.logged_out === "1" ? (
          <p className="mt-6 rounded-2xl border border-[var(--admin-line)] bg-[#f7fbf8] px-4 py-3 text-sm text-[var(--admin-muted)]">
            로그아웃되었습니다.
          </p>
        ) : null}

        <form action={loginAction} className="mt-8 space-y-5">
          <input type="hidden" name="next" value={nextPath} />
          <div>
            <label htmlFor="password" className="text-sm font-medium text-[var(--admin-muted)]">
              관리자 비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-2xl border border-[var(--admin-line)] bg-[#fffdf5] px-4 py-3 text-[var(--admin-ink)] outline-none transition focus:border-[var(--color-gold-soft)]"
            />
          </div>
          <button className="w-full rounded-full bg-[var(--color-gold)] px-5 py-3 text-sm font-semibold text-[#181818] transition hover:bg-[var(--color-gold-soft)]">
            관리자 페이지로 이동
          </button>
        </form>

        <div className="mt-6 rounded-[1.8rem] border border-[var(--admin-line)] bg-[#fbf7e8] px-5 py-4 text-sm leading-7 text-[var(--admin-muted)]">
          <p>브랜드: {siteConfig.brandName}</p>
          {passwordMode === "demo" ? (
            <p>기본 관리자 비밀번호: {siteConfig.adminDemoPassword}</p>
          ) : passwordMode === "missing-env" ? (
            <p>배포 환경의 `ADMIN_PASSWORD`가 없어 로그인할 수 없습니다.</p>
          ) : (
            <p>환경변수 `ADMIN_PASSWORD` 로 보호 중입니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
