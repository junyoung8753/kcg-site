import type { Metadata } from "next";
import { AnnouncementList } from "@/components/announcements/announcement-list";
import { PageIntro } from "@/components/layout/page-intro";
import { getRepository } from "@/lib/data";

export const metadata: Metadata = {
  title: "공지사항",
  description: "시세 운영, 방문 상담, 품목별 상담 안내 등 주요 운영 공지사항을 확인합니다.",
};

export default async function AnnouncementsPage() {
  const repository = getRepository();
  const announcements = await repository.getAnnouncements();

  return (
    <>
      <PageIntro
        eyebrow="운영 공지"
        title="시세 운영 및 방문 안내 공지"
        description="당일 시세 기준, 매입 상담 준비 사항, 품목별 안내를 확인하실 수 있습니다. 중요한 공지는 목록 상단에 먼저 표시됩니다."
        asideLabel="안내"
        asideTitle="방문 전 운영 공지 확인 권장"
        asideBody={
          <>
            <p>시세 운영 시간, 매입 상담 준비 사항, 품목별 변동 안내를 먼저 확인해 주세요.</p>
            <p>중요 공지는 목록 상단에 우선 노출됩니다.</p>
          </>
        }
      />

      <section className="section-shell py-14 sm:py-18">
        <AnnouncementList announcements={announcements} />
      </section>
    </>
  );
}
