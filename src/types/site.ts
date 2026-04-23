export interface ContactInfo {
  phone: string;
  kakaoChannel: string;
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
  businessRegistrationNumber: string;
  registeredAddress?: string;
  businessType: string;
  businessItems: string;
  privacyOfficer: string;
  locationGuide: string;
  transactionNotice: string;
  legalNotice?: string;
}
