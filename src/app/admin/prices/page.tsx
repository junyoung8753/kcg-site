import { getRepository } from "@/lib/data";
import { AdminPricesWorkspace } from "./price-mode-workspace";

interface AdminPricesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getStatusMessage(status?: string | string[]) {
  if (status === "saved") return "시세가 저장되었습니다.";
  if (status === "demo") return "Supabase 미연결 상태에서는 저장이 비활성화됩니다.";
  if (status === "error") return "저장 중 오류가 발생했습니다.";
  if (status === "auto-settings-saved") return "자동시세 설정이 저장되었습니다.";
  if (status === "auto-on-saved") return "자동시세 ON으로 저장되었습니다. 조건을 통과한 계산값은 자동으로 공개 시세에 반영됩니다.";
  if (status === "auto-off-saved") return "자동시세 OFF로 저장되었습니다. 이제 직접 입력표에서 시세를 저장합니다.";
  if (status === "auto-schema") return "자동시세 테이블이 아직 Supabase에 적용되지 않았습니다.";
  if (status === "auto-held") return "자동 계산 결과를 검토 대기로 남겼습니다.";
  if (status === "auto-disabled") return "자동시세가 꺼져 있어 공개 시세를 바꾸지 않았습니다.";
  if (status === "auto-outside-hours") return "영업시간 밖이라 자동으로 바꾸지 않았습니다. 설정에서 영업시간 제한을 끄면 수동 실행도 반영할 수 있습니다.";
  if (status === "auto-not-due") return "아직 다음 확인 시각이 되지 않아 공개 시세를 그대로 뒀습니다.";
  if (status === "auto-small-change") return "계산값 차이가 최소 반영 금액보다 작아 공개 시세를 그대로 뒀습니다.";
  if (status === "auto-needs-review") return "자동 게시 허용 변동폭을 넘은 항목이 있어 검토 대기로 남겼습니다.";
  if (status === "auto-data-not-safe") return "참고 데이터가 불안정해 공개 시세를 바꾸지 않고 검토 대기로 남겼습니다.";
  if (status === "auto-applied") return "자동 계산 결과가 공개 시세에 반영되었습니다.";
  if (status === "auto-rejected") return "검토 대기 항목을 폐기했습니다.";
  if (status === "auto-error") return "자동시세 처리 중 오류가 발생했습니다.";
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-soft)]">
            Price Desk
          </p>
          <h2 className="mt-2 font-display text-3xl">오늘 시세 관리</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--admin-muted)]">
            자동시세 ON이면 산식과 안전 기준을 통과한 계산값이 공개 시세에 반영됩니다.
          </p>
        </div>
        <a
          href="/prices"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-[var(--admin-line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--admin-ink)] transition hover:border-[var(--color-gold-soft)] hover:bg-[#fff9df]"
        >
          공개 페이지 보기
        </a>
      </section>

      {message ? (
        <p className="rounded-2xl border border-[var(--admin-line)] bg-white px-4 py-3 text-sm font-medium text-[var(--admin-ink)]">
          {message}
        </p>
      ) : null}
      {warnings.length ? (
        <div className="rounded-[1.2rem] border border-[#d9ad00]/35 bg-[#fff8dc] px-5 py-4 text-sm text-[#725100]">
          <p className="font-extrabold text-[#725100]">저장은 완료되었지만 아래 항목을 다시 확인해 주세요.</p>
          <div className="mt-3 space-y-2 leading-7">
            {warnings.map((warning) => (
              <p key={warning}>· {warning}</p>
            ))}
          </div>
        </div>
      ) : null}

      <AdminPricesWorkspace
        key={`${settings.isEnabled}-${settings.mode}-${settings.updatedAt}`}
        prices={prices}
        settings={settings}
        suggestion={suggestion}
        hasMetalsKey={hasMetalsKey}
        statusCode={typeof params.status === "string" ? params.status : undefined}
        statusMessage={message}
        warnings={warnings}
      />
    </div>
  );
}
