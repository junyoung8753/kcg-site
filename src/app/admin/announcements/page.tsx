import { AdminAnnouncementsWorkspace } from "@/app/admin/announcements/admin-announcements-workspace";
import { getRepository } from "@/lib/data";

interface AdminAnnouncementsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getStatusMessage(status?: string | string[]) {
  if (status === "saved") return "저장됨 · 공지사항이 반영되었습니다.";
  if (status === "deleted") return "공지사항이 삭제되었습니다.";
  if (status === "confirm-delete") return "삭제 확인 체크가 필요합니다.";
  if (status === "demo") return "Supabase 미연결 상태에서는 저장이 비활성화됩니다.";
  if (status === "error") return "공지 처리 중 오류가 발생했습니다.";
  return null;
}

export default async function AdminAnnouncementsPage({ searchParams }: AdminAnnouncementsPageProps) {
  const repository = getRepository();
  const [announcements, params] = await Promise.all([
    repository.getAnnouncements({ includeDrafts: true }),
    searchParams,
  ]);

  return (
    <AdminAnnouncementsWorkspace
      announcements={announcements}
      message={getStatusMessage(params.status)}
    />
  );
}
