import { hasLegalInfoPlaceholders } from "@/lib/legal-info";
import {
  isConfirmPreviewMode,
  isProductionDeployment,
  isPublicSearchApproved,
} from "@/lib/runtime-env";
import { siteConfig } from "@/lib/site-config";

const approvedLaunchHostnames = new Set(["kcgold.co.kr", "www.kcgold.co.kr"]);

export type SearchExposureStatus =
  | "enabled"
  | "disabled-non-production"
  | "disabled-forced-noindex"
  | "disabled-pending-approval"
  | "blocked-by-launch-check";

export function isApprovedLaunchHostname(siteUrl = siteConfig.siteUrl) {
  try {
    const hostname = new URL(siteUrl).hostname.toLowerCase();
    return approvedLaunchHostnames.has(hostname);
  } catch {
    return false;
  }
}

export function getPublicLaunchContentBlockers() {
  const blockers: string[] = [];

  if (hasLegalInfoPlaceholders()) {
    blockers.push("사업자등록번호와 법적 표시가 임시값입니다.");
  }

  if (!isApprovedLaunchHostname()) {
    blockers.push("공개 대표 도메인이 kcgold.co.kr로 확정되지 않았습니다.");
  }

  return blockers;
}

export function canExposeToSearch() {
  return (
    isProductionDeployment() &&
    !isConfirmPreviewMode() &&
    isPublicSearchApproved() &&
    getPublicLaunchContentBlockers().length === 0
  );
}

export function getSearchExposureStatus(): SearchExposureStatus {
  if (canExposeToSearch()) {
    return "enabled";
  }

  if (!isProductionDeployment()) {
    return "disabled-non-production";
  }

  if (isConfirmPreviewMode()) {
    return "disabled-forced-noindex";
  }

  if (!isPublicSearchApproved()) {
    return "disabled-pending-approval";
  }

  return "blocked-by-launch-check";
}

export function isSearchApprovalMissing() {
  return !isPublicSearchApproved();
}
