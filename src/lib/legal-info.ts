import { siteConfig } from "@/lib/site-config";

export const TEMP_BUSINESS_REGISTRATION_NUMBER = "000-00-00000";

export function isTemporaryBusinessRegistrationNumber(value = siteConfig.company.businessRegistrationNumber) {
  const normalized = value.trim();
  return (
    normalized.length === 0 ||
    normalized === TEMP_BUSINESS_REGISTRATION_NUMBER ||
    normalized.includes("확인")
  );
}

export function hasLegalInfoPlaceholders() {
  return (
    !siteConfig.company.isLegalInfoConfirmed ||
    isTemporaryBusinessRegistrationNumber(siteConfig.company.businessRegistrationNumber)
  );
}

export function getLegalInfoHeading() {
  return siteConfig.company.isLegalInfoConfirmed ? "사업자 정보" : "사업자 정보";
}

export function getBusinessRegistrationDisplay() {
  if (siteConfig.company.isLegalInfoConfirmed) {
    return `사업자등록번호: ${siteConfig.company.businessRegistrationNumber}`;
  }

  return `사업자등록번호(임시): ${siteConfig.company.businessRegistrationNumber} · 오픈 전 교체 필요`;
}

export function getBusinessInfoLine() {
  if (siteConfig.company.isLegalInfoConfirmed) {
    return `대표이사 ${siteConfig.company.representative} · 사업자등록번호 ${siteConfig.company.businessRegistrationNumber}`;
  }

  return `대표이사 ${siteConfig.company.representative} · 사업자등록번호 임시 ${siteConfig.company.businessRegistrationNumber} · 오픈 전 교체`;
}

export function getLegalPlaceholderNotice() {
  if (!hasLegalInfoPlaceholders()) {
    return null;
  }

  return "현재 사업자등록번호는 자리 표시용 임시값입니다. 공개 오픈 전 실제 등록증 기준으로 교체해야 합니다.";
}
