import type { Announcement } from "@/types/announcement";

export const mockAnnouncements: Announcement[] = [
  {
    id: "announcement-1",
    title: "당일 시세 고시 및 거래 상담 운영 안내",
    slug: "daily-price-notice-and-trade-guidance",
    summary:
      "평일 오전 9시부터 오후 6시 30분까지 운영하며, 당일 고시 시세 기준으로 거래 상담을 안내드립니다.",
    content: [
      "한국센터금거래소는 평일 오전 9시부터 오후 6시 30분까지 거래 상담을 운영합니다.",
      "당일 시세는 고시 시각 기준으로 안내되며, 시세 변동이 큰 날에는 전화 문의 후 내방하시면 보다 정확한 안내가 가능합니다.",
      "대량 매입, 상속 금 정리, 법인 보유 귀금속 상담은 현장 대기 시간을 줄이기 위해 사전 문의를 권장드립니다.",
    ].join("\n\n"),
    isPinned: true,
    status: "published",
    publishedAt: "2026-04-23T08:50:00+09:00",
    createdAt: "2026-04-23T08:30:00+09:00",
    updatedAt: "2026-04-23T08:50:00+09:00",
  },
  {
    id: "announcement-2",
    title: "평일 운영시간 및 전화 상담 접수 안내",
    slug: "weekday-hours-and-phone-consulting-notice",
    summary:
      "거래 전 대표번호로 문의하시면 당일 상담 가능 시간과 준비 사항을 먼저 안내해 드립니다.",
    content: [
      "평일 운영시간은 오전 9시부터 오후 6시 30분까지입니다.",
      "상담 품목, 예상 중량, 상담 목적을 먼저 알려주시면 시세 기준과 준비 사항을 보다 빠르게 안내받으실 수 있습니다.",
      "건물 진입 동선과 주차 가능 여부는 시점에 따라 달라질 수 있어 내방 전 대표번호 문의를 권장드립니다.",
    ].join("\n\n"),
    isPinned: false,
    status: "published",
    publishedAt: "2026-04-22T17:10:00+09:00",
    createdAt: "2026-04-22T16:50:00+09:00",
    updatedAt: "2026-04-22T17:10:00+09:00",
  },
  {
    id: "announcement-3",
    title: "귀금속 매입 시 신분증 지참 안내",
    slug: "identity-card-required-for-purchase",
    summary:
      "실물 매입 거래 시 관련 절차에 따라 본인 확인이 필요합니다. 거래 전 신분증을 준비해 주세요.",
    content: [
      "귀금속 및 금제품 매입 상담 시에는 본인 명의 신분증 확인 절차가 진행됩니다.",
      "대리 거래, 법인 거래, 고중량 거래의 경우 추가 확인 서류가 필요할 수 있으니 거래 전 문의를 권장드립니다.",
      "보증서나 감정서가 있는 경우 함께 지참하시면 현장 상담이 보다 원활합니다.",
    ].join("\n\n"),
    isPinned: false,
    status: "published",
    publishedAt: "2026-04-21T10:00:00+09:00",
    createdAt: "2026-04-21T09:30:00+09:00",
    updatedAt: "2026-04-21T10:00:00+09:00",
  },
  {
    id: "announcement-4",
    title: "골드바·실버바 문의 시 중량·수량 사전 안내 요청",
    slug: "gold-bar-silver-bar-pre-inquiry",
    summary:
      "골드바, 실버바, 기념 실버 제품 문의는 중량과 수량을 먼저 알려주시면 수급 여부를 빠르게 안내해 드립니다.",
    content: [
      "골드바와 실버바는 중량, 브랜드, 수량에 따라 당일 안내 가능한 범위가 달라질 수 있습니다.",
      "1돈, 5돈, 10돈 단위 문의와 대량 수급 문의는 중량과 수량을 미리 알려주시면 보다 빠르게 상담 가능합니다.",
      "기업 증정용, 기념 실버, 판촉용 제작 문의도 예산과 납기 기준을 함께 안내해 주시면 상담이 수월합니다.",
    ].join("\n\n"),
    isPinned: false,
    status: "published",
    publishedAt: "2026-04-20T14:00:00+09:00",
    createdAt: "2026-04-20T13:30:00+09:00",
    updatedAt: "2026-04-20T14:00:00+09:00",
  },
  {
    id: "announcement-5",
    title: "법인·상속·고중량 거래 사전 예약 안내",
    slug: "corporate-inheritance-large-volume-reservation",
    summary:
      "법인 보유 귀금속, 상속 정리, 고중량 매입 상담은 현장 대기 시간을 줄이기 위해 사전 문의를 권장드립니다.",
    content: [
      "법인 보유 귀금속 정리, 상속 물품 상담, 고중량 거래는 일반 매입 상담보다 확인 항목이 많아 사전 문의를 권장드립니다.",
      "상담 전 품목 종류, 대략적인 중량, 보증서 또는 감정서 보유 여부를 알려주시면 준비 사항을 먼저 안내해 드립니다.",
      "현장 거래 금액은 당일 고시 시세와 검수 결과를 함께 확인한 뒤 최종 확정됩니다.",
    ].join("\n\n"),
    isPinned: false,
    status: "published",
    publishedAt: "2026-04-19T11:30:00+09:00",
    createdAt: "2026-04-19T11:00:00+09:00",
    updatedAt: "2026-04-19T11:30:00+09:00",
  },
];
