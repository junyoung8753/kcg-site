import { hasLegalInfoPlaceholders } from "@/lib/legal-info";
import { isConfirmPreviewMode, isProductionDeployment } from "@/lib/runtime-env";
import { siteConfig } from "@/lib/site-config";

export function getPublicLaunchContentBlockers() {
  const blockers: string[] = [];

  if (hasLegalInfoPlaceholders()) {
    blockers.push("사업자등록번호와 법적 표시가 임시값입니다.");
  }

  if (!siteConfig.siteUrl.includes("kcgold.co.kr")) {
    blockers.push("공개 대표 도메인이 kcgold.co.kr로 확정되지 않았습니다.");
  }

  return blockers;
}

export function canExposeToSearch() {
  return (
    isProductionDeployment() &&
    !isConfirmPreviewMode() &&
    getPublicLaunchContentBlockers().length === 0
  );
}

export function getSearchExposureStatus() {
  if (canExposeToSearch()) {
    return "enabled";
  }

  if (!isProductionDeployment() || isConfirmPreviewMode()) {
    return "disabled";
  }

  return "blocked-by-launch-check";
}
