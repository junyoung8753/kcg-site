"use client";

import { useMemo, useState } from "react";
import {
  deleteAnnouncementAction,
  upsertAnnouncementAction,
} from "@/actions/announcement-actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { formatDateTimeKorean } from "@/lib/format";
import type { Announcement } from "@/types/announcement";

function blankAnnouncement(): Announcement {
  const now = new Date().toISOString();
  return {
    id: "",
    title: "",
    slug: "",
    summary: "",
    content: "",
    isPinned: false,
    status: "draft",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

function toDateTimeLocal(value: string) {
  return value.slice(0, 16);
}

function statusToneClass(status: Announcement["status"]) {
  if (status === "published") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-[#d9ad00]/35 bg-[#fff8dc] text-[#725100]";
}

function AnnouncementEditor({ announcement }: { announcement: Announcement }) {
  const isNew = !announcement.id;

  return (
    <div className="admin-panel p-5 lg:sticky lg:top-5">
      <form
        action={upsertAnnouncementAction}
        data-testid="admin-announcement-editor"
        data-admin-save-guard="true"
        data-admin-pending-message="공지 저장 중입니다. 저장 완료 메시지를 확인한 뒤 이동하세요."
      >
        <input type="hidden" name="id" value={announcement.id} />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="admin-compact-label">{isNew ? "새 공지" : "공지 편집"}</p>
            <h3 className="mt-1 text-2xl font-extrabold text-[var(--admin-ink)]">
              {isNew ? "새 공지 작성" : announcement.title}
            </h3>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusToneClass(announcement.status)}`}>
            {announcement.status === "published" ? "게시중" : "초안"}
          </span>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[var(--admin-muted)]">
            제목
            <input name="title" required defaultValue={announcement.title} className="admin-input mt-2" />
          </label>
          <label className="text-sm font-semibold text-[var(--admin-muted)]">
            슬러그
            <input name="slug" defaultValue={announcement.slug} placeholder="비워두면 제목 기준 자동 생성" className="admin-input mt-2" />
          </label>
        </div>
        <label className="mt-4 block text-sm font-semibold text-[var(--admin-muted)]">
          요약
          <textarea name="summary" rows={3} required defaultValue={announcement.summary} className="admin-input mt-2" />
        </label>
        <label className="mt-4 block text-sm font-semibold text-[var(--admin-muted)]">
          본문
          <textarea name="content" rows={7} required defaultValue={announcement.content} className="admin-input mt-2" />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[var(--admin-muted)]">
            발행 시각
            <input name="publishedAt" type="datetime-local" defaultValue={toDateTimeLocal(announcement.publishedAt)} className="admin-input mt-2" />
          </label>
          <label className="text-sm font-semibold text-[var(--admin-muted)]">
            상태
            <select name="status" defaultValue={announcement.status} className="admin-input mt-2">
              <option value="published">게시</option>
              <option value="draft">초안</option>
            </select>
          </label>
        </div>
        <label className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--admin-line)] bg-white px-4 py-3 text-sm font-bold text-[var(--admin-ink)]">
          <input name="isPinned" type="checkbox" defaultChecked={announcement.isPinned} />
          pinned 공지로 노출
        </label>
        <AdminSubmitButton pendingLabel="공지 저장 중..." className="admin-primary-button mt-5 w-full">
          {isNew ? "새 공지 저장" : "수정 저장"}
        </AdminSubmitButton>
      </form>

      {!isNew ? (
        <form
          action={deleteAnnouncementAction}
          data-admin-save-guard="true"
          data-admin-pending-message="공지 삭제 중입니다."
          className="mt-4 rounded-xl border border-[#efc7bf] bg-[#fff8f7] p-4"
        >
          <input type="hidden" name="id" value={announcement.id} />
          <label className="flex items-center gap-3 text-sm font-bold text-[#8a2c20]">
            <input name="confirmDelete" type="checkbox" />
            삭제 확인
          </label>
          <AdminSubmitButton pendingLabel="삭제 중..." className="mt-3 rounded-full border border-[#efc7bf] bg-white px-4 py-2 text-sm font-bold text-[#8a2c20]">
            공지 삭제
          </AdminSubmitButton>
        </form>
      ) : null}
    </div>
  );
}

export function AdminAnnouncementsWorkspace({
  announcements,
  message,
}: {
  announcements: Announcement[];
  message: string | null;
}) {
  const sortedAnnouncements = useMemo(
    () =>
      [...announcements].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return Number(b.isPinned) - Number(a.isPinned);
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }),
    [announcements],
  );
  const draftCount = announcements.filter((item) => item.status === "draft").length;
  const publishedCount = announcements.filter((item) => item.status === "published").length;
  const pinnedCount = announcements.filter((item) => item.isPinned).length;
  const [selectedId, setSelectedId] = useState(sortedAnnouncements[0]?.id ?? "new");
  const selectedAnnouncement = selectedId === "new"
    ? blankAnnouncement()
    : sortedAnnouncements.find((item) => item.id === selectedId) ?? sortedAnnouncements[0] ?? blankAnnouncement();

  return (
    <div className="space-y-6">
      <section className="admin-panel p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="admin-compact-label">공지 운영</p>
            <h2 className="mt-1 text-3xl font-extrabold text-[var(--admin-ink)]">공지 관리</h2>
            <p className="admin-help mt-3 max-w-3xl">
              작성 form보다 게시 상태 목록을 먼저 보고, 선택한 공지만 편집합니다.
            </p>
          </div>
          <button type="button" onClick={() => setSelectedId("new")} className="admin-primary-button">
            새 공지 작성
          </button>
        </div>
        {message ? (
          <p className="admin-status-success mt-5 rounded-xl border px-4 py-3 text-sm font-bold" aria-live="polite">
            {message}
          </p>
        ) : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="admin-panel p-4">
          <p className="text-sm font-bold text-[var(--admin-muted)]">게시중</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--admin-ink)]">{publishedCount}</p>
        </div>
        <div className="admin-panel p-4">
          <p className="text-sm font-bold text-[var(--admin-muted)]">초안</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--admin-ink)]">{draftCount}</p>
        </div>
        <div className="admin-panel p-4">
          <p className="text-sm font-bold text-[var(--admin-muted)]">Pinned</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--admin-ink)]">{pinnedCount}</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
        <div data-testid="admin-announcement-table" className="admin-panel overflow-hidden">
          <div className="divide-y divide-[var(--admin-line)] md:hidden">
            {sortedAnnouncements.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="block w-full px-4 py-4 text-left transition hover:bg-[#fff9df]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusToneClass(item.status)}`}>
                    {item.status === "published" ? "게시" : "초안"}
                  </span>
                  {item.isPinned ? (
                    <span className="rounded-full border border-[#d9ad00]/35 bg-[#fff8dc] px-2.5 py-1 text-xs font-bold text-[#725100]">
                      Pinned
                    </span>
                  ) : null}
                </div>
                <h4 className="mt-2 text-sm font-extrabold leading-6 text-[var(--admin-ink)]">{item.title}</h4>
                <p className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">
                  {formatDateTimeKorean(item.publishedAt)}
                </p>
              </button>
            ))}
          </div>
          <div className="hidden grid-cols-[90px_minmax(220px,1fr)_110px_160px_80px] border-b border-[var(--admin-line)] bg-[#fbfdfb] px-4 py-3 text-xs font-bold text-[var(--admin-muted)] md:grid">
            <span>상태</span>
            <span>제목</span>
            <span>고정</span>
            <span>발행</span>
            <span>편집</span>
          </div>
          <div className="hidden divide-y divide-[var(--admin-line)] md:block">
            {sortedAnnouncements.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="grid w-full grid-cols-[90px_minmax(220px,1fr)_110px_160px_80px] items-center gap-0 px-4 py-4 text-left text-sm transition hover:bg-[#fff9df]"
              >
                <span className={`w-fit rounded-full border px-2.5 py-1 text-xs font-bold ${statusToneClass(item.status)}`}>
                  {item.status === "published" ? "게시" : "초안"}
                </span>
                <span className="font-extrabold text-[var(--admin-ink)]">{item.title}</span>
                <span className="text-[var(--admin-muted)]">{item.isPinned ? "Pinned" : "-"}</span>
                <span className="text-[var(--admin-muted)]">{formatDateTimeKorean(item.publishedAt)}</span>
                <span className="text-xs font-extrabold text-[#8a6900]">편집</span>
              </button>
            ))}
          </div>
        </div>
        <AnnouncementEditor announcement={selectedAnnouncement} />
      </section>
    </div>
  );
}
