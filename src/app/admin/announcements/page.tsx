import {
  deleteAnnouncementAction,
  upsertAnnouncementAction,
} from "@/actions/announcement-actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { getRepository } from "@/lib/data";
import { formatDateTimeKorean } from "@/lib/format";

interface AdminAnnouncementsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getStatusMessage(status?: string | string[]) {
  if (status === "saved") {
    return "공지사항이 저장되었습니다.";
  }

  if (status === "deleted") {
    return "공지사항이 삭제되었습니다.";
  }

  if (status === "demo") {
    return "Supabase 미연결 상태에서는 저장이 비활성화됩니다.";
  }

  if (status === "error") {
    return "공지 처리 중 오류가 발생했습니다.";
  }

  return null;
}

export default async function AdminAnnouncementsPage({
  searchParams,
}: AdminAnnouncementsPageProps) {
  const repository = getRepository();
  const [announcements, params] = await Promise.all([
    repository.getAnnouncements({ includeDrafts: true }),
    searchParams,
  ]);
  const message = getStatusMessage(params.status);

  return (
    <div className="space-y-6">
      <section className="rounded-[2.2rem] border border-white/10 bg-white/5 p-8">
        <h2 className="font-display text-3xl">공지 관리</h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-white/72">
          새 공지를 작성하고, 기존 공지는 필요한 항목만 펼쳐 수정합니다.
        </p>
        {message ? (
          <p className="mt-5 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/78">
            {message}
          </p>
        ) : null}
      </section>

      <form
        action={upsertAnnouncementAction}
        className="rounded-[2.2rem] border border-white/10 bg-white/5 p-6 sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-white/74">
            제목
            <input
              name="title"
              required
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="text-sm text-white/74">
            슬러그
            <input
              name="slug"
              placeholder="비워두면 제목 기준 자동 생성"
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-white/74">
            요약
            <textarea
              name="summary"
              rows={3}
              required
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="text-sm text-white/74">
            발행 시각
            <input
              name="publishedAt"
              type="datetime-local"
              defaultValue={new Date().toISOString().slice(0, 16)}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
        </div>

        <label className="mt-5 block text-sm text-white/74">
          본문
          <textarea
            name="content"
            rows={8}
            required
            className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-4">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/74">
            <input name="isPinned" type="checkbox" />
            pinned 공지로 노출
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/74">
            상태
            <select
              name="status"
              defaultValue="published"
              className="rounded-xl border border-white/10 bg-black/18 px-3 py-2 text-white outline-none"
            >
              <option value="published">게시</option>
              <option value="draft">초안</option>
            </select>
          </label>
        </div>

        <AdminSubmitButton
          pendingLabel="공지 저장 중..."
          className="mt-8 rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[var(--color-gold-soft)]"
        >
          공지 저장
        </AdminSubmitButton>
      </form>

      <section className="space-y-4">
        {announcements.map((item) => (
          <details
            key={item.id}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 open:bg-white/7"
          >
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 text-sm text-white/68">
              <span>
                <span className="font-semibold text-white">{item.title}</span>
                <span className="ml-3 text-white/45">
                  {item.isPinned ? "Pinned / " : ""}
                  {item.status === "published" ? "게시중" : "초안"} /{" "}
                  {formatDateTimeKorean(item.publishedAt)}
                </span>
              </span>
              <span className="rounded-full border border-white/12 px-3 py-1 text-xs font-semibold text-white/68">
                편집 열기
              </span>
            </summary>
            <form action={upsertAnnouncementAction} className="mt-5 space-y-4 border-t border-white/10 pt-5">
              <input type="hidden" name="id" value={item.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-white/74">
                  제목
                  <input
                    name="title"
                    defaultValue={item.title}
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
                  />
                </label>
                <label className="text-sm text-white/74">
                  슬러그
                  <input
                    name="slug"
                    defaultValue={item.slug}
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-white/74">
                  요약
                  <textarea
                    name="summary"
                    rows={3}
                    defaultValue={item.summary}
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
                  />
                </label>
                <label className="text-sm text-white/74">
                  발행 시각
                  <input
                    name="publishedAt"
                    type="datetime-local"
                    defaultValue={item.publishedAt.slice(0, 16)}
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
                  />
                </label>
              </div>

              <label className="block text-sm text-white/74">
                본문
                <textarea
                  name="content"
                  rows={6}
                  defaultValue={item.content}
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
                />
              </label>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/74">
                  <input name="isPinned" type="checkbox" defaultChecked={item.isPinned} />
                  pinned 공지
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/74">
                  상태
                  <select
                    name="status"
                    defaultValue={item.status}
                    className="rounded-xl border border-white/10 bg-black/18 px-3 py-2 text-white outline-none"
                  >
                    <option value="published">게시</option>
                    <option value="draft">초안</option>
                  </select>
                </label>
                <AdminSubmitButton
                  pendingLabel="수정 저장 중..."
                  className="rounded-full bg-[var(--color-gold)] px-5 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[var(--color-gold-soft)]"
                >
                  수정 저장
                </AdminSubmitButton>
              </div>
            </form>

            <form action={deleteAnnouncementAction} className="mt-4">
              <input type="hidden" name="id" value={item.id} />
              <AdminSubmitButton
                pendingLabel="삭제 중..."
                className="rounded-full border border-red-300/20 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/10"
              >
                삭제
              </AdminSubmitButton>
            </form>
          </details>
        ))}
      </section>
    </div>
  );
}
