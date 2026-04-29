import type { Metadata } from "next";
import { AnnouncementList } from "@/components/announcements/announcement-list";
import { PageIntro } from "@/components/layout/page-intro";
import { getRepository } from "@/lib/data";

export const metadata: Metadata = {
  title: "공지",
  description: "시세 운영, 거래 상담, 품목별 안내 등 주요 공지사항을 확인합니다.",
};

export default async function AnnouncementsPage() {
  const repository = getRepository();
  const announcements = await repository.getAnnouncements();

  return (
    <>
      <PageIntro
        eyebrow="공지"
        title="시세 운영 및 거래 준비 공지"
        description="당일 시세 기준, 매입 상담 준비 사항, 품목별 안내를 확인하실 수 있습니다. 중요한 공지는 목록 상단에 먼저 표시됩니다."
        highlights={[
          {
            label: "시세 운영",
            title: "고시 기준 확인",
            body: "시세 고시 시각, 변동 안내, 참고 시세 운영 기준을 우선 확인합니다.",
          },
          {
            label: "상품·상담 공지",
            title: "품목별 안내",
            body: "골드바·실버바 수급, 고금 매입, 대량 문의 변동 사항을 모읍니다.",
          },
          {
            label: "중요 공지 우선",
            title: "상단 고정",
            body: "오픈 전후 꼭 확인해야 할 공지는 목록 상단에 먼저 노출됩니다.",
          },
        ]}
        asideLabel="안내"
        asideTitle="거래 전 공지 확인 권장"
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
