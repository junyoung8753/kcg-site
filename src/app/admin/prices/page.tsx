import { getRepository } from "@/lib/data";
import { AdminPricesWorkspace } from "./price-mode-workspace";

interface AdminPricesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getStatusMessage(status?: string | string[]) {
  if (status === "saved") return "시세가 저장되었습니다.";
  if (status === "demo") return "Supabase 미연결 상태에서는 저장이 비활성화됩니다.";
  if (status === "error") return "저장 중 오류가 발생했습니다.";
  if (status === "auto-settings-saved") return "자동입력 설정이 저장되었습니다.";
  if (status === "auto-schema") return "자동입력 테이블이 아직 Supabase에 적용되지 않았습니다.";
  if (status === "auto-draft") return "자동입력 초안이 생성되었습니다.";
  if (status === "auto-applied") return "자동입력 초안이 공개 시세에 적용되었습니다.";
  if (status === "auto-rejected") return "자동입력 초안을 폐기했습니다.";
  if (status === "auto-error") return "자동입력 처리 중 오류가 발생했습니다.";
  return null;
}

function getWarnings(warning?: string | string[]) {
  if (!warning) return [];
  return Array.isArray(warning) ? warning : [warning];
}

export default async function AdminPricesPage({
  searchParams,
}: AdminPricesPageProps) {
  const repository = getRepository();
  const [prices, settings, suggestion, params] = await Promise.all([
    repository.getPrices(),
    repository.getPriceAutoSettings(),
    repository.getLatestPriceAutoSuggestion(),
    searchParams,
  ]);
  const message = getStatusMessage(params.status);
  const warnings = getWarnings(params.warning);
  const hasMetalsKey = Boolean(process.env.METALS_DEV_API_KEY);

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold-soft)]">
            Price Desk
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">오늘 시세 관리</h2>
          <p className="mt-2 text-sm leading-7 text-white/62">
            자동 초안 또는 직접 입력 중 한 가지 방식으로 회사 고시가를 관리합니다.
          </p>
        </div>
        <a
          href="/prices"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/14 px-5 py-3 text-sm font-semibold text-white/76 transition hover:border-[var(--color-gold-soft)] hover:text-white"
        >
          공개 페이지 보기
        </a>
      </section>

      {message ? (
        <p className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/78">
          {message}
        </p>
      ) : null}
      {warnings.length ? (
        <div className="rounded-[1.6rem] border border-[#f2c35a]/30 bg-[#2c2413] px-5 py-4 text-sm text-[#f8e2ab]">
          <p className="font-semibold text-[#ffd77a]">저장은 완료되었지만 아래 항목을 다시 확인해 주세요.</p>
          <div className="mt-3 space-y-2 leading-7">
            {warnings.map((warning) => (
              <p key={warning}>· {warning}</p>
            ))}
          </div>
        </div>
      ) : null}

      <AdminPricesWorkspace
        prices={prices}
        settings={settings}
        suggestion={suggestion}
        hasMetalsKey={hasMetalsKey}
      />
    </div>
  );
}
