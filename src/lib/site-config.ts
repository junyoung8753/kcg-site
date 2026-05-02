import type { BrandAssets, CompanyProfile, ContactInfo, FamilyLink, LocationInfo } from "@/types/site";
import { getResolvedSiteUrl } from "@/lib/runtime-env";

const headOfficeAddress = "서울시 종로구 돈화문로6가길 12 골든타워 303호 (봉익동)";
const storeAddress = "서울시 종로구 봉익동 97-1 성창빌딩 1층 6호";
const legalRegisteredAddress = "서울특별시 종로구 서순라길 17, 1층 6호 (봉익동, 성창빌딩)";

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
    "종로 본사와 매장을 기준으로 (주)한국센터금거래소의 오늘 금 시세, 순금·고금 매입, 골드바·실버바 판매, B2C 전화 문의·B2B 대량 상담 정보를 제공합니다.",
  siteUrl: getResolvedSiteUrl(),
  contact: {
    phone: "02-747-1807",
    storePhone: "02-747-1806",
    email: "kcgoldx@gmail.com",
    kakaoChannel: "@koreacentergold",
    address: headOfficeAddress,
    businessHours: "평일 09:00 - 18:30",
    parkingNote:
      "거래 전 전화 주시면 상담 가능 시간과 본사·매장 동선을 함께 확인하실 수 있습니다.",
    naverMapUrl:
      "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%20%EC%A2%85%EB%A1%9C%EA%B5%AC%20%EB%8F%88%ED%99%94%EB%AC%B8%EB%A1%9C6%EA%B0%80%EA%B8%B8%2012%20%EA%B3%A8%EB%93%A0%ED%83%80%EC%9B%8C%20303%ED%98%B8",
    kakaoMapUrl:
      "https://map.kakao.com/?q=%EC%84%9C%EC%9A%B8%20%EC%A2%85%EB%A1%9C%EA%B5%AC%20%EB%8F%88%ED%99%94%EB%AC%B8%EB%A1%9C6%EA%B0%80%EA%B8%B8%2012%20%EA%B3%A8%EB%93%A0%ED%83%80%EC%9B%8C%20303%ED%98%B8",
  } satisfies ContactInfo,
  locations: {
    headOffice: {
      label: "본사",
      title: "본사",
      address: headOfficeAddress,
      phone: "02-747-1807",
      description: "법인·B2B 대량 상담, 상품/매입 기준 확인을 담당합니다.",
      naverMapUrl:
        "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%20%EC%A2%85%EB%A1%9C%EA%B5%AC%20%EB%8F%88%ED%99%94%EB%AC%B8%EB%A1%9C6%EA%B0%80%EA%B8%B8%2012%20%EA%B3%A8%EB%93%A0%ED%83%80%EC%9B%8C%20303%ED%98%B8",
      kakaoMapUrl:
        "https://map.kakao.com/?q=%EC%84%9C%EC%9A%B8%20%EC%A2%85%EB%A1%9C%EA%B5%AC%20%EB%8F%88%ED%99%94%EB%AC%B8%EB%A1%9C6%EA%B0%80%EA%B8%B8%2012%20%EA%B3%A8%EB%93%A0%ED%83%80%EC%9B%8C%20303%ED%98%B8",
    },
    store: {
      label: "매장",
      title: "매장",
      address: storeAddress,
      phone: "02-747-1806",
      description: "순금·고금 매입, 골드바·실버바 상담과 실물 확인 안내를 담당합니다.",
      naverMapUrl:
        "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%20%EC%A2%85%EB%A1%9C%EA%B5%AC%20%EB%B4%89%EC%9D%B5%EB%8F%99%2097-1%20%EC%84%B1%EC%B0%BD%EB%B9%8C%EB%94%A9%201%EC%B8%B5%206%ED%98%B8",
      kakaoMapUrl:
        "https://map.kakao.com/?q=%EC%84%9C%EC%9A%B8%20%EC%A2%85%EB%A1%9C%EA%B5%AC%20%EB%B4%89%EC%9D%B5%EB%8F%99%2097-1%20%EC%84%B1%EC%B0%BD%EB%B9%8C%EB%94%A9%201%EC%B8%B5%206%ED%98%B8",
    },
  } satisfies { headOffice: LocationInfo; store: LocationInfo },
  company: {
    isLegalInfoConfirmed: true,
    legalBusinessName: "주식회사 한국센터금거래소",
    representative: "홍연호",
    corporateRegistrationNumber: "110111-0950729",
    openedAt: "2026년 03월 05일",
    businessRegistrationNumber: "505-88-03567",
    registeredAddress: legalRegisteredAddress,
    businessType: "도매 및 소매업, 제조업, 무역, 전자상거래 소매업",
    businessItems: "순금·은 도소매업, 순금·주얼리제품 제조업, 순금·은 수출입, 전자상거래 소매업",
    privacyOfficer: "고객상담팀",
    locationGuide: "본사: 골든타워 303호 / 매장: 성창빌딩 1층 6호",
    transactionNotice:
      "실제 거래 금액은 당일 고시 시세, 순도, 중량, 부속 및 실물 상태 확인 결과를 반영해 현장에서 최종 안내합니다.",
    legalNotice:
      "검색 노출은 운영 비밀값, 도메인, 공개 승인 절차가 끝날 때까지 차단됩니다.",
  } satisfies CompanyProfile,
  familyLinks: [
    {
      label: "KC 랩그로운 다이아몬드",
      href: "https://www.kcdia.co.kr/",
      description: "관계 법인의 랩그로운 다이아몬드 상품 안내 사이트입니다.",
    },
    {
      label: "다비스 다이아몬드",
      href: "https://davisdia.com/",
      description: "KC주얼리 그룹 관계 법인의 다이아몬드 유통 사이트입니다.",
    },
    {
      label: "다이아민족",
      href: "https://diamin.co.kr/",
      description: "다이아몬드 정보와 상품을 확인할 수 있는 관계 사이트입니다.",
    },
    {
      label: "KCG 네이버 블로그",
      href: "https://m.blog.naver.com/kcgoldx?tab=1",
      description: "KCG 소식과 금값 정보 콘텐츠를 확인할 수 있는 외부 채널입니다.",
    },
    {
      label: "다비스 다이아몬드 블로그",
      href: "https://blog.naver.com/davis_diamond",
      description: "다비스다이아몬드 소식과 다이아몬드 정보를 확인할 수 있는 블로그입니다.",
    },
  ] satisfies FamilyLink[],
  adminDemoPassword: "0000",
};

export const companyStory = {
  missionTitle: "KC주얼리 그룹 사명",
  mission:
    "고객가치를 높이고 보다 많은 사람들이 귀금속과 다이아몬드를 즐기며 행복할수 있도록 돕는다.",
  introductionTitle: "한국센터금거래소(KCG) 회사소개",
  introductionParagraphs: [
    "KC주얼리 그룹은, 국내 다이아몬드 시장에서 정상적인 수입과 유통을 지향하며 음성시장 양성화에 앞장서왔던 국내 다이아몬드 수입 도매유통 1위 기업 (주)다비스다이아몬드와",
    "소비시장의 변화와 함께 성장하고 있는  국내최대 랩그로운 도매법인 (주)KC랩그로운 다이아몬드를 운영하고 있습니다. 또한 국내 금 시장의 무질서와 양성화에 대한 시대적인 리즈에 부흥하여  (주)한국센터금거래소를 통하여",
    "성공적인 금거래소를 확장하고 소비자들의 안전하고 믿을수 있는 금투자와 매매에 대한 책임을 다하기 위해 온 힘을 다하고 있습니다.",
    "30여년을 한결같은 마음과 정성으로 고객에게 다가가며, 소비자에게 정상적인 금 매입과 판매 그리고, 취급점 도매유통으로 투명한 금거래 시장을 확대하고 있습니다.",
  ],
  specialtyTitle: "전문 품목",
  specialties: [
    "온라인 소비자 고금 정상매입 및 골드바, 실버바 및 제품판매",
    "KCG골드바, KCG실버바, 지금, 지은 도매",
  ],
} as const;

export const homeHighlights = [
  {
    title: "고시 시세와 기준 시각 확인",
    description: "순금·18K·14K·백금·은 시세를 기준 시각과 함께 먼저 확인하실 수 있습니다.",
  },
  {
    title: "사전 문의 권장 항목 안내",
    description: "고중량 거래, 법인·상속 정리, 대량 매입은 본사 전화 문의를 권장드립니다.",
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
    title: "거래 전 문의 권장",
    body: "당일 상담 가능 시간, 품목별 준비 사항, 내방 동선을 먼저 안내해 드립니다.",
  },
  {
    label: "현장 확인",
    title: "순도·중량·부속 확인",
    body: "실물 상태와 부속 여부를 확인한 뒤 최종 금액과 정산 방식을 안내합니다.",
  },
  {
    label: "상담 범위",
    title: "순금·고금·골드바 B2C/B2B 상담",
    body: "투자용 골드바, 순금 제품 판매, 고금 매입, 실버바, 기업 대량 문의까지 같은 상담 흐름으로 안내합니다.",
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
    title: "거래 전 상담 기준 확보",
    description:
      "고중량, 법인 보유분, 상속 정리, 골드바·실버바 수급은 본사 전화로 품목과 수량을 먼저 확인하도록 유도합니다.",
  },
] as const;

export const krxSafetyNotes = [
  "KRX금시장은 증권사 금현물 계좌를 통한 장내 거래이며, 민간 금거래소의 현장 매입·판매 상담과 구분됩니다.",
  "한국센터금거래소 화면의 자동 참고 시세는 시장 흐름 확인용이며 회사 고시 시세나 현장 확정 금액을 대체하지 않습니다.",
  "선입금, 원격 고수익 약속, 리딩방 형태의 거래 안내는 본 사이트의 거래 상담 흐름과 무관합니다.",
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
    description: "희망 중량, 수량, 상담 희망 시점을 먼저 알려주시면 수급 가능 여부를 확인해 안내합니다.",
    checklist: ["희망 중량", "수량", "상담 희망 시점"],
  },
  {
    title: "법인·상속 정리 상담",
    description: "품목이 많거나 고중량이면 대기 시간을 줄이기 위해 사전 문의를 권장합니다.",
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
    title: "판매·수급 상담",
    description: "순금 제품 판매, 골드바·실버바 수급, 투자용 문의, 상속 정리, 법인 보유 귀금속 상담이 가능합니다.",
  },
  {
    title: "B2B 사전 문의 품목",
    description: "기업 선물, 대량 수량, 기념품, 특수 중량 상품은 수급과 제작 일정 확인 후 상담 범위를 안내합니다.",
  },
] as const;

export const serviceExamples = {
  gold_bar: ["1돈·5돈·10돈 단위 문의", "보유 골드바 매입 상담", "대량·법인 보유분 상담"],
  silver_bar: ["실버바 중량별 문의", "기업 증정용 실버 제품", "기념 실버·은메달 상담"],
  pure_gold: ["순금 돌반지·카드 상담", "순금 선물 제품 문의", "공임·포장 조건 확인"],
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
    question: "거래 전에 꼭 준비해야 할 것이 있나요?",
    answer:
      "실물 매입 상담 시 신분증을 지참해 주세요. 보증서, 영수증, 감정서가 있으면 함께 가져오시는 것을 권장드립니다.",
  },
  {
    question: "전화로 금액을 확정받을 수 있나요?",
    answer:
      "전화로는 상담 가능 여부와 준비 사항을 먼저 안내합니다. 최종 금액은 실물의 순도와 중량을 현장에서 확인한 뒤 안내합니다.",
  },
] as const;

export const tradeProcess = [
  {
    title: "전화 문의",
    body: "거래 품목, 예상 중량, 상담 목적을 알려주시면 당일 상담 가능 여부와 준비 사항을 먼저 안내해 드립니다.",
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
  { href: "/prices", label: "시세" },
  { href: "/products", label: "상품/매입" },
  { href: "/services", label: "서비스" },
  { href: "/company", label: "회사소개" },
  { href: "/about", label: "매장안내" },
  { href: "/announcements", label: "공지" },
];

export const serviceCategories = [
  {
    key: "gold_bar",
    title: "골드바",
    description: "투자용 골드바와 순금 제품 판매 상담",
  },
  {
    key: "silver_bar",
    title: "실버바",
    description: "실버바, 기념 실버, 기업용 선물 상담",
  },
  {
    key: "pure_gold",
    title: "순금제품",
    description: "순금 돌반지, 순금 카드, 기념 메달 상담",
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
    title: "B2B 대량 상담",
    description: "법인 보유분, 기념품, 기업 선물, 특수 중량 상품 상담",
  },
] as const;
