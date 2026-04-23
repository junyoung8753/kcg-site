import { updatePricesAction } from "@/actions/price-actions";
import { getRepository } from "@/lib/data";
import { formatDateTimeKorean } from "@/lib/format";

interface AdminPricesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getStatusMessage(status?: string | string[]) {
  if (status === "saved") {
    return "시세가 저장되었습니다.";
  }

  if (status === "demo") {
    return "Supabase 미연결 상태에서는 저장이 비활성화됩니다.";
  }

  if (status === "error") {
    return "저장 중 오류가 발생했습니다.";
  }

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
  const [prices, params] = await Promise.all([repository.getPrices(), searchParams]);
  const message = getStatusMessage(params.status);
  const warnings = getWarnings(params.warning);
  const announcedAt = prices[0]?.announcedAt ?? new Date().toISOString();

  return (
    <div className="space-y-6">
      <section className="rounded-[2.2rem] border border-white/10 bg-white/5 p-8">
        <h2 className="font-display text-4xl">시세 직접 입력</h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-white/72">
          관리자 기준 시각과 항목별 가격을 직접 입력하는 구조입니다. Supabase가
          연결되면 저장 즉시 공개 페이지를 다시 검증할 수 있도록 revalidate가
          함께 동작합니다.
        </p>
        {message ? (
          <p className="mt-5 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/78">
            {message}
          </p>
        ) : null}
        {warnings.length ? (
          <div className="mt-5 rounded-[1.6rem] border border-[#f2c35a]/30 bg-[#2c2413] px-5 py-4 text-sm text-[#f8e2ab]">
            <p className="font-semibold text-[#ffd77a]">저장은 완료되었지만 아래 항목을 다시 확인해 주세요.</p>
            <div className="mt-3 space-y-2 leading-7">
              {warnings.map((warning) => (
                <p key={warning}>· {warning}</p>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <form
        action={updatePricesAction}
        className="rounded-[2.2rem] border border-white/10 bg-white/5 p-6 sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-white/74">
            기준 시각
            <input
              name="announcedAt"
              type="datetime-local"
              defaultValue={announcedAt.slice(0, 16)}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="text-sm text-white/74">
            변경자
            <input
              name="changedBy"
              defaultValue="관리자"
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
        </div>

        <div className="mt-8 space-y-5">
          {prices.map((price) => (
            <div
              key={price.id}
              className="rounded-[1.8rem] border border-white/10 bg-black/16 p-5"
            >
              <input type="hidden" name="priceIds" value={price.id} />
              <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                <div>
                  <p className="font-semibold text-white">{price.label}</p>
                  <p className="mt-2 text-sm text-white/58">
                    현재 기준 {formatDateTimeKorean(price.announcedAt)} / {price.unit}
                  </p>
                  <label className="mt-4 block text-sm text-white/74">
                    비고
                    <textarea
                      name={`note:${price.id}`}
                      defaultValue={price.note || ""}
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
                    />
                  </label>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm text-white/74">
                    가격
                    <input
                      name={`value:${price.id}`}
                      type="number"
                      defaultValue={price.value}
                      className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
                    />
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/74">
                    <input
                      name={`visible:${price.id}`}
                      type="checkbox"
                      defaultChecked={price.isVisible}
                    />
                    공개 페이지 노출
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-8 rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[var(--color-gold-soft)]">
          시세 저장
        </button>
      </form>
    </div>
  );
}
