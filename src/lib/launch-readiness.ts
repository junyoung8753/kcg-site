import { getAdminPasswordMode } from "@/lib/auth/password";
import { getLegalPlaceholderNotice, hasLegalInfoPlaceholders } from "@/lib/legal-info";
import { getPublicLaunchContentBlockers, getSearchExposureStatus } from "@/lib/public-launch";
import { getDeploymentStage, isConfirmPreviewMode } from "@/lib/runtime-env";
import { siteConfig } from "@/lib/site-config";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export type LaunchReadinessLevel = "pass" | "warning" | "blocker";

export interface LaunchReadinessItem {
  key: string;
  title: string;
  level: LaunchReadinessLevel;
  summary: string;
  action: string;
}

function scoreItem(level: LaunchReadinessLevel) {
  if (level === "pass") return 100;
  if (level === "warning") return 70;
  return 0;
}

export function getLaunchReadiness() {
  const passwordMode = getAdminPasswordMode();
  const supabaseConfigured = isSupabaseConfigured();
  const publicLaunchBlockers = getPublicLaunchContentBlockers();
  const legalNotice = getLegalPlaceholderNotice();
  const deployment = getDeploymentStage();

  const items: LaunchReadinessItem[] = [
    {
      key: "legal-info",
      title: "사업자·법적 표시",
      level: hasLegalInfoPlaceholders() ? "blocker" : "pass",
      summary: legalNotice || "사업자등록번호와 법적 표시가 확정 정보로 설정되어 있습니다.",
      action: hasLegalInfoPlaceholders()
        ? "정식 등록증 기준 사업자등록번호로 교체하고 isLegalInfoConfirmed를 true로 전환합니다."
        : "변경 없음",
    },
    {
      key: "domain",
      title: "대표 도메인",
      level: siteConfig.siteUrl.includes("kcgold.co.kr") ? "pass" : "warning",
      summary: siteConfig.siteUrl.includes("kcgold.co.kr")
        ? "대표 도메인이 kcgold.co.kr 계열로 설정되어 있습니다."
        : `현재 사이트 URL은 ${siteConfig.siteUrl}입니다.`,
      action: siteConfig.siteUrl.includes("kcgold.co.kr")
        ? "DNS 정상 연결과 www 리다이렉트만 최종 확인합니다."
        : "Vercel에 kcgold.co.kr와 www.kcgold.co.kr를 추가하고 Cafe24 DNS를 연결합니다. 기존 MX/TXT/SPF/DKIM 레코드는 보존합니다.",
    },
    {
      key: "search-indexing",
      title: "검색 노출",
      level: getSearchExposureStatus() === "enabled" ? "pass" : "warning",
      summary:
        getSearchExposureStatus() === "enabled"
          ? "검색 색인이 허용될 수 있는 상태입니다."
          : `검색 노출 상태: ${getSearchExposureStatus()}`,
      action:
        publicLaunchBlockers.length > 0
          ? `공개 전 차단 항목: ${publicLaunchBlockers.join(" / ")}`
          : "공개 승인 전까지 KCG_FORCE_NOINDEX=1을 유지합니다.",
    },
    {
      key: "admin-auth",
      title: "관리자 인증",
      level: passwordMode === "env" ? "pass" : "blocker",
      summary:
        passwordMode === "env"
          ? "ADMIN_PASSWORD 환경변수 기반 인증을 사용합니다."
          : `현재 인증 모드는 ${passwordMode}입니다.`,
      action:
        passwordMode === "env"
          ? "정기 교체와 비밀값 보관 방식만 운영 절차로 유지합니다."
          : "Vercel Preview/Production 환경변수에 ADMIN_PASSWORD와 ADMIN_SESSION_SECRET을 실제 비밀값으로 설정합니다.",
    },
    {
      key: "storage",
      title: "운영 데이터 저장소",
      level: supabaseConfigured ? "pass" : "warning",
      summary: supabaseConfigured
        ? "Supabase 환경변수가 설정되어 실제 저장소를 사용할 수 있습니다."
        : "현재는 체크인된 seed/mock 데이터 기준으로 표시됩니다.",
      action: supabaseConfigured
        ? "상품 사진, 가격 문구, 공지, 시세를 운영 데이터로 입력합니다."
        : "실제 관리자 저장이 필요하면 Supabase 프로젝트와 환경변수를 연결합니다.",
    },
    {
      key: "launch-approval",
      title: "공개 승인",
      level: deployment === "production" && !isConfirmPreviewMode() ? "warning" : "pass",
      summary:
        deployment === "production" && !isConfirmPreviewMode()
          ? "Production에서 noindex가 해제된 상태일 수 있습니다."
          : "프리뷰/비공개 검토 모드가 유지됩니다.",
      action:
        deployment === "production" && !isConfirmPreviewMode()
          ? "실제 공개 승인, 도메인, 법적 표시, 관리자 비밀값을 재확인합니다."
          : "공개 전까지 preview/noindex 흐름을 유지합니다.",
    },
  ];

  const blockers = items.filter((item) => item.level === "blocker");
  const warnings = items.filter((item) => item.level === "warning");
  const score = Math.round(items.reduce((sum, item) => sum + scoreItem(item.level), 0) / items.length);

  return {
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "review-needed" : "ready",
    score,
    blockers: blockers.map((item) => item.title),
    warnings: warnings.map((item) => item.title),
    items,
  };
}
