import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/page-intro";
import { getRepository } from "@/lib/data";
import { formatDateKorean, formatPlainContent } from "@/lib/format";

interface AnnouncementDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AnnouncementDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const repository = getRepository();
  const announcement = await repository.getAnnouncementBySlug(slug);

  if (!announcement) {
    return {
      title: "공지사항",
    };
  }

  return {
    title: announcement.title,
    description: announcement.summary,
  };
}

export default async function AnnouncementDetailPage({
  params,
}: AnnouncementDetailPageProps) {
  const { slug } = await params;
  const repository = getRepository();
  const announcement = await repository.getAnnouncementBySlug(slug);

  if (!announcement) {
    notFound();
  }

  return (
    <>
      <PageIntro
        eyebrow="운영 공지"
        title={announcement.title}
        description={announcement.summary}
        asideLabel="공지 정보"
        asideTitle={announcement.isPinned ? "중요 공지" : "일반 공지"}
        asideBody={
          <>
            <p>게시일: {formatDateKorean(announcement.publishedAt)}</p>
            <p>방문 전 필요한 운영 공지는 공지사항 목록 상단에서 우선 확인하실 수 있습니다.</p>
          </>
        }
        asideAction={
          <Link
            href="/announcements"
            className="inline-flex rounded-full border border-[#d7e0dd] bg-white px-5 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#fffdf4]"
          >
            공지사항 목록
          </Link>
        }
      />

      <section className="section-shell py-14 sm:py-18">
        <article className="mx-auto max-w-4xl border-y border-[var(--color-line)] py-8">
          <div className="mb-8 grid gap-3 border-b border-[var(--color-line)] pb-5 text-sm text-[var(--color-muted)] sm:grid-cols-[auto_auto_1fr] sm:items-center">
            <p>게시일 {formatDateKorean(announcement.publishedAt)}</p>
            <p>{announcement.isPinned ? "중요 공지" : "일반 공지"}</p>
            <div className="sm:text-right">
              <Link href="/announcements" className="font-semibold text-[var(--color-ink)]">
                공지사항 목록으로
              </Link>
            </div>
          </div>
          <div className="space-y-6 text-base leading-9 text-[var(--color-muted)]">
            {formatPlainContent(announcement.content).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
