import Link from "next/link";
import { formatDateKorean } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Announcement } from "@/types/announcement";

interface AnnouncementListProps {
  announcements: Announcement[];
  compact?: boolean;
}

export function AnnouncementList({
  announcements,
  compact = false,
}: AnnouncementListProps) {
  return (
    <div className={cn("border-t border-[var(--color-line)]", compact && "xl:grid xl:grid-cols-2 xl:border-t-0")}>
      {announcements.map((item) => (
        <Link
          key={item.id}
          href={`/announcements/${item.slug}`}
          className={cn(
            "grid h-full gap-4 border-b border-[var(--color-line)] py-6 transition hover:bg-white/56 sm:grid-cols-[11rem_1fr]",
            item.isPinned && "bg-[#fffdf4]",
            compact && "xl:border-t xl:px-5",
          )}
        >
          <div className="flex flex-wrap items-start gap-3 sm:block">
            {item.isPinned ? (
              <span className="inline-flex rounded-full border border-[rgba(178,149,94,0.28)] bg-[#fff7d6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gold)]">
                중요
              </span>
            ) : null}
            <span className="block text-sm text-[var(--color-muted)] sm:mt-4">
              {formatDateKorean(item.publishedAt)}
            </span>
          </div>
          <div>
            <h3 className="kcg-card-title text-[var(--color-ink)]">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              {item.summary}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
