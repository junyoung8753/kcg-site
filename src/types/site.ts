export interface ContactInfo {
  phone: string;
  storePhone?: string;
  email?: string;
  kakaoChannel: string;
  kakaoChannelUrl?: string | null;
  kakaoChatUrl?: string | null;
  naverTalkTalkUrl?: string | null;
  address: string;
  businessHours: string;
  parkingNote: string;
  naverMapUrl: string;
  kakaoMapUrl: string;
}

export interface BrandAssets {
  symbolPath: string;
  lockupPath: string;
  symbolAlt: string;
  lockupAlt: string;
}

export interface CompanyProfile {
  isLegalInfoConfirmed: boolean;
  legalBusinessName?: string;
  representative: string;
  corporateRegistrationNumber?: string;
  openedAt?: string;
  businessRegistrationNumber: string;
  registeredAddress?: string;
  businessType: string;
  businessItems: string;
  privacyOfficer: string;
  locationGuide: string;
  transactionNotice: string;
  legalNotice?: string;
}

export interface LocationInfo {
  label: string;
  title: string;
  address: string;
  phone: string;
  description: string;
  naverMapUrl: string;
  kakaoMapUrl: string;
}

export interface FamilyLink {
  label: string;
  href: string;
  description: string;
}
