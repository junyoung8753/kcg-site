import type { BrandAssets, CompanyProfile, ContactInfo } from "@/types/site";
import { getResolvedSiteUrl } from "@/lib/runtime-env";

export const siteConfig = {
  brandName: "(주)한국센터금거래소",
  shortBrandName: "한국센터금거래소",
  englishName: "KOREA CENTER GOLD EXCHANGE",
  brandAssets: {
    symbolPath: "/brand/kcg-logo.png",
    lockupPath: "/brand/kcg-lockup.png",
    symbolAlt: "한국센터금거래소 KCG 심볼",
    lockupAlt: "한국센터금거래소 로고와 상호",
  } satisfies BrandAssets,
  title: "(주)한국센터금거래소 | 종로 금 시세·귀금속 매입 상담",
  description:
    "서울 종로구 돈화문로6가길 12 골든타워 303호에 위치한 (주)한국센터금거래소의 오늘의 금 시세, 귀금속 매입 상담, 골드바·실버바 문의, 방문 거래 안내를 제공합니다.",
  siteUrl: getResolvedSiteUrl(),
  contact: {
    phone: "02-747-1802",
    kakaoChannel: "@koreacentergold",
    address: "서울 종로구 돈화문로6가길 12 골든타워 303호",
    businessHours: "평일 09:00 - 18:30",
    parkingNote:
      "방문 전 전화 주시면 당일 상담 가능 시간과 건물 진입, 주차 가능 여부를 함께 안내해 드립니다.",
    naverMapUrl:
      "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%20%EC%A2%85%EB%A1%9C%EA%B5%AC%20%EB%8F%88%ED%99%94%EB%AC%B8%EB%A1%9C6%EA%B0%80%EA%B8%B8%2012%20%EA%B3%A8%EB%93%A0%ED%83%80%EC%9B%8C%20303%ED%98%B8",
    kakaoMapUrl:
      "https://map.kakao.com/?q=%EC%84%9C%EC%9A%B8%20%EC%A2%85%EB%A1%9C%EA%B5%AC%20%EB%8F%88%ED%99%94%EB%AC%B8%EB%A1%9C6%EA%B0%80%EA%B8%B8%2012%20%EA%B3%A8%EB%93%A0%ED%83%80%EC%9B%8C%20303%ED%98%B8",
  } satisfies ContactInfo,
  company: {
    isLegalInfoConfirmed: false,
    legalBusinessName: "(주)한국센터금거래소",
    representative: "홍연호",
    businessRegistrationNumber: "확인 중",
    registeredAddress: "서울 종로구 돈화문로6가길 12 골든타워 303호",
    businessType: "귀금속 도소매",
    businessItems: "금제품, 귀금속, 골드바, 실버바, 주얼리 상담",
    privacyOfficer: "고객상담팀",
    locationGuide: "종로3가 인근 골든타워 303호 / 방문 전 대표번호 문의 권장",
    transactionNotice:
      "실제 거래 금액은 당일 고시 시세, 순도, 중량, 부속 및 실물 상태 확인 결과를 반영해 현장에서 최종 안내합니다.",
    legalNotice:
      "사업자등록번호는 정식 등록증 확인 후 반영 예정이며, 현재는 대표자명과 운영 정보 중심으로 안내합니다.",
  } satisfies CompanyProfile,
  adminDemoPassword: "gold-demo-2026",
  adminPreviewPassword: "0000",
};

export const homeHighlights = [
  {
    title: "고시 시세와 기준 시각 확인",
    description: "순금·18K·14K·백금·은 시세를 기준 시각과 함께 먼저 확인하실 수 있습니다.",
  },
  {
    title: "사전 문의 권장 항목 안내",
    description: "고중량 거래, 법인·상속 정리, 대량 매입은 방문 전 문의를 권장드립니다.",
  },
  {
    title: "현장 확인 후 최종 금액 안내",
    description: "순도, 중량, 부속 여부, 실물 상태를 확인한 뒤 거래 금액을 최종 안내합니다.",
  },
] as const;

export const homeDeskNotes = [
  {
    label: "고시 기준",
    title: "당일 고시 시세 기준 상담",
    body: "상단 시세표는 당일 고시 시각 기준이며, 상담 시 같은 기준으로 안내합니다.",
  },
  {
    label: "전화 안내",
    title: "방문 전 문의 권장",
    body: "당일 상담 가능 시간, 품목별 준비 사항, 건물 방문 동선을 먼저 안내해 드립니다.",
  },
  {
    label: "현장 확인",
    title: "순도·중량·부속 확인",
    body: "실물 상태와 부속 여부를 확인한 뒤 최종 금액과 정산 방식을 안내합니다.",
  },
  {
    label: "상담 범위",
    title: "골드바·실버바·귀금속 매입",
    body: "투자용 바, 귀금속 정리, 주얼리, 기념품 문의까지 같은 상담 흐름으로 안내합니다.",
  },
] as const;

export const visitChecklist = [
  "실물 매입 상담 시에는 본인 확인을 위해 신분증을 지참해 주세요.",
  "보증서, 영수증, 감정서가 있는 경우 함께 가져오시면 상담이 수월합니다.",
  "골드바·실버바 수급 문의는 중량과 수량을 미리 알려주시면 빠르게 안내해 드립니다.",
] as const;

export const tradeStandardPrinciples = [
  {
    title: "살 때와 팔 때 기준 분리",
    description:
      "회사 고시 시세는 매입·판매 기준을 분리해 안내하고, 자동 참고 시세와 실제 거래 기준을 혼동하지 않도록 표시합니다.",
  },
  {
    title: "고시 시각과 데이터 성격 표시",
    description:
      "시세는 기준 시각과 함께 확인해야 의미가 있으므로 회사 고시 시각, 자동 참고 시세, 현장 확정 기준을 함께 안내합니다.",
  },
  {
    title: "현장 검수 후 최종 확정",
    description:
      "순도, 중량, 부속, 보증서, 파손 상태를 확인한 뒤 최종 금액을 안내하며 화면의 가격만으로 확정 거래를 약속하지 않습니다.",
  },
  {
    title: "방문 전 상담 동선 확보",
    description:
      "고중량, 법인 보유분, 상속 정리, 골드바·실버바 수급은 방문 전 대표번호로 품목과 수량을 먼저 확인하도록 유도합니다.",
  },
] as const;

export const krxSafetyNotes = [
  "KRX금시장은 증권사 금현물 계좌를 통한 장내 거래이며, 민간 금거래소의 현장 매입·판매 상담과 구분됩니다.",
  "한국센터금거래소 화면의 자동 참고 시세는 시장 흐름 확인용이며 회사 고시 시세나 현장 확정 금액을 대체하지 않습니다.",
  "선입금, 원격 고수익 약속, 리딩방 형태의 거래 안내는 본 사이트의 방문 상담 흐름과 무관합니다.",
] as const;

export const externalReferenceLinks = [
  {
    label: "KRX금시장 공식 안내",
    href: "https://open.krx.co.kr/contents/OPN/01/01050206/OPN01050206.jsp",
  },
  {
    label: "금현물계좌 개설방법",
    href: "https://open.krx.co.kr/contents/OPN/01/01050207/OPN01050207.jsp",
  },
] as const;

export const consultationScenarios = [
  {
    title: "팔 금·은 제품이 있을 때",
    description: "제품 종류, 예상 중량, 보증서·감정서 보유 여부를 알려주시면 매입 상담 준비가 빨라집니다.",
    checklist: ["신분증", "보증서·영수증", "분리 가능한 부속"],
  },
  {
    title: "골드바·실버바를 문의할 때",
    description: "희망 중량, 수량, 방문 가능 시간을 먼저 알려주시면 수급 가능 여부를 확인해 안내합니다.",
    checklist: ["희망 중량", "수량", "방문 예정일"],
  },
  {
    title: "법인·상속 정리 상담",
    description: "품목이 많거나 고중량이면 현장 대기 시간을 줄이기 위해 사전 문의 후 방문을 권장합니다.",
    checklist: ["품목 목록", "예상 수량", "상담 목적"],
  },
  {
    title: "시세만 먼저 확인할 때",
    description: "회사 고시 시세와 자동 참고 시세를 구분해서 보고, 실제 거래 전에는 기준 시각을 다시 확인합니다.",
    checklist: ["고시 시각", "살 때·팔 때 구분", "현장 확정 여부"],
  },
] as const;

export const serviceGuides = [
  {
    title: "매입 가능 품목",
    description: "순금, 18K, 14K, 백금, 은 제품과 고금·예물·주얼리 정리 상담을 진행합니다.",
  },
  {
    title: "상담 가능 항목",
    description: "골드바·실버바 수급, 투자용 문의, 상속 정리, 법인 보유 귀금속 상담이 가능합니다.",
  },
  {
    title: "사전 문의 품목",
    description: "기업 선물, 기념품, 특수 중량 상품은 수급과 제작 일정 확인 후 상담 범위를 안내합니다.",
  },
] as const;

export const serviceExamples = {
  gold_bar: ["1돈·5돈·10돈 단위 문의", "보유 골드바 매입 상담", "대량·법인 보유분 상담"],
  silver_bar: ["실버바 중량별 문의", "기업 증정용 실버 제품", "기념 실버·은메달 상담"],
  jewelry: ["고금·예물 정리 상담", "파손 제품 및 부속 확인", "18K·14K 매입 기준 문의"],
  purchase_guide: ["신분증 지참", "보증서·영수증 지참 시 상담 원활", "현장 계근·순도 확인 후 정산"],
  custom_order: ["기업 기념품 제작 문의", "순금 메달·배지 상담", "단체 증정용 품목 협의"],
} as const;

export const serviceFaqs = [
  {
    question: "고금매입은 시세표의 어느 금액을 보면 되나요?",
    answer:
      "고객이 팔 때 기준을 먼저 참고하시면 됩니다. 실제 상담 금액은 순도, 중량, 부속, 제품 상태를 현장에서 확인한 뒤 최종 안내합니다.",
  },
  {
    question: "18K·14K 반지나 목걸이도 매입 상담이 가능한가요?",
    answer:
      "상담 가능합니다. 18K·14K 제품은 큐빅, 스톤, 잠금 장식, 파손 및 납땜 상태에 따라 현장 확인 항목이 달라질 수 있습니다.",
  },
  {
    question: "방문 전에 꼭 준비해야 할 것이 있나요?",
    answer:
      "실물 매입 상담 시 신분증을 지참해 주세요. 보증서, 영수증, 감정서가 있으면 함께 가져오시는 것을 권장드립니다.",
  },
  {
    question: "전화로 금액을 확정받을 수 있나요?",
    answer:
      "전화로는 상담 가능 여부, 준비 사항, 방문 동선을 먼저 안내합니다. 최종 금액은 실물의 순도와 중량을 현장에서 확인한 뒤 안내합니다.",
  },
] as const;

export const tradeProcess = [
  {
    title: "전화 문의",
    body: "거래 품목, 예상 중량, 방문 목적을 알려주시면 당일 상담 가능 여부와 준비 사항을 먼저 안내해 드립니다.",
  },
  {
    title: "현장 확인",
    body: "순도, 부속, 중량, 제품 상태를 확인한 뒤 당일 고시 시세를 기준으로 상담을 진행합니다.",
  },
  {
    title: "금액 안내",
    body: "검수 결과와 시세 기준을 함께 확인하고 최종 거래 금액과 정산 방식을 안내합니다.",
  },
] as const;

export const tradeNotes = [
  "당일 시세와 기준 시각을 먼저 확인해 상담 기준을 맞춥니다.",
  "실물 상태, 순도, 중량 확인 후 최종 금액을 안내합니다.",
  "18K·14K 매입은 부속 분리와 합금 상태를 함께 확인합니다.",
  "골드바·실버바 수급 문의는 중량과 수량을 먼저 알려주시면 빠르게 안내해 드립니다.",
] as const;

export const siteNavigation = [
  { href: "/", label: "홈" },
  { href: "/prices", label: "시세" },
  { href: "/products", label: "상품 문의" },
  { href: "/announcements", label: "공지사항" },
  { href: "/services", label: "상담 안내" },
  { href: "/about", label: "거래 안내" },
];

export const serviceCategories = [
  {
    key: "gold_bar",
    title: "골드바",
    description: "중량별 투자용 골드바 상담 및 수급 안내",
  },
  {
    key: "silver_bar",
    title: "실버바",
    description: "실버바, 기념 실버, 기업용 선물 상담",
  },
  {
    key: "jewelry",
    title: "고금·주얼리",
    description: "예물, 고금, 파손 제품, 18K·14K 귀금속 상담",
  },
  {
    key: "purchase_guide",
    title: "매입 안내",
    description: "현장 감정, 계근, 정산 절차를 단계별로 설명",
  },
  {
    key: "custom_order",
    title: "추가 품목 상담",
    description: "기념품, 기업 선물, 특수 중량 상품 상담",
  },
] as const;
