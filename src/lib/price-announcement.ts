import { formatDateDot, formatDateTimeKorean } from "@/lib/format";

export type PriceAnnouncementStatus =
  | "missing"
  | "scheduled"
  | "current"
  | "recent"
  | "closed-day"
  | "outside-hours";

export interface PriceAnnouncementDisplay {
  valueLabel: string;
  dateLabel: string;
  homeLabel: string;
  detailLabel: string;
  tableLabel: string;
  statusLabel: string;
  noticeBadgeLabel: string;
  noticeTitle: string;
  noticeBody: string;
  operatorActionLabel: string;
  isScheduled: boolean;
  isStale: boolean;
  requiresTradeConfirmation: boolean;
  status: PriceAnnouncementStatus;
}

function getKoreanDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(date);
}

function getKoreanWeekday(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Asia/Seoul",
  }).format(date);
}

function isKoreanWeekend(date: Date) {
  const weekday = getKoreanWeekday(date);
  return weekday === "Sat" || weekday === "Sun";
}

function getKoreanHourMinute(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return { hour, minute };
}

function isKoreaBusinessHours(date: Date) {
  if (isKoreanWeekend(date)) return false;
  const { hour, minute } = getKoreanHourMinute(date);
  const minutes = hour * 60 + minute;
  return minutes >= 9 * 60 && minutes <= 18 * 60 + 30;
}

const missingDisplay: PriceAnnouncementDisplay = {
  valueLabel: "고시 준비중",
  dateLabel: "고시 준비중",
  homeLabel: "고시 준비중",
  detailLabel: "고시 준비중",
  tableLabel: "기준 시각",
  statusLabel: "고시 준비중",
  noticeBadgeLabel: "거래 전 확인",
  noticeTitle: "거래 전 전화 확인",
  noticeBody: "회사 고시가 등록 전에는 화면 금액이 확정 기준이 아닙니다. 방문 전 본사 전화로 상담 가능 기준을 확인해 주세요.",
  operatorActionLabel: "공개 고시 등록 필요",
  isScheduled: false,
  isStale: true,
  requiresTradeConfirmation: true,
  status: "missing" satisfies PriceAnnouncementStatus,
};

export function getPriceAnnouncementDisplay(value: string | null | undefined, now = new Date()): PriceAnnouncementDisplay {
  if (!value) {
    return missingDisplay;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return missingDisplay;
  }

  const isScheduled = date.getTime() > now.getTime();
  const sameKoreanDay = getKoreanDateKey(date) === getKoreanDateKey(now);
  const isClosedDay = isKoreanWeekend(now);
  const isOutsideBusinessHours = !isKoreaBusinessHours(now);

  if (isScheduled) {
    return {
      valueLabel: formatDateTimeKorean(date),
      dateLabel: formatDateDot(date),
      homeLabel: sameKoreanDay ? "오늘 고시 예정 시각" : "고시 예정 시각",
      detailLabel: "고시 예정",
      tableLabel: "예정 시각",
      statusLabel: "고시 예정",
      noticeBadgeLabel: "거래 전 확인",
      noticeTitle: "예정 고시 확인",
      noticeBody: "표시된 시각 전에는 최종 적용 기준이 바뀔 수 있습니다. 상담 전 회사 고시 시세를 다시 확인해 주세요.",
      operatorActionLabel: "예정 고시 확인",
      isScheduled,
      isStale: false,
      requiresTradeConfirmation: true,
      status: "scheduled" satisfies PriceAnnouncementStatus,
    };
  }

  if (isClosedDay) {
    return {
      valueLabel: formatDateTimeKorean(date),
      dateLabel: sameKoreanDay ? formatDateDot(date) : `최근 고시 ${formatDateDot(date)}`,
      homeLabel: sameKoreanDay ? "휴무일 고시" : "휴무일 최근 고시",
      detailLabel: sameKoreanDay ? "휴무일 고시" : "최근 고시",
      tableLabel: sameKoreanDay ? "휴무일 기준" : "최근 고시",
      statusLabel: sameKoreanDay ? "휴무일 고시" : "휴무일 최근 고시",
      noticeBadgeLabel: "거래 전 확인",
      noticeTitle: "주말·휴무일 거래 전 전화 확인",
      noticeBody:
        "주말·공휴일·회사 휴무일에는 기준 고시가 평일처럼 새로 확정되지 않을 수 있습니다. 화면 금액은 최근 회사 고시 기준이며, 실제 적용가는 영업일 전화 또는 현장 확인 후 다시 안내합니다.",
      operatorActionLabel: "휴무일 문의는 영업일 확인 안내",
      isScheduled,
      isStale: true,
      requiresTradeConfirmation: true,
      status: "closed-day" satisfies PriceAnnouncementStatus,
    };
  }

  if (isOutsideBusinessHours) {
    return {
      valueLabel: formatDateTimeKorean(date),
      dateLabel: sameKoreanDay ? formatDateDot(date) : `최근 고시 ${formatDateDot(date)}`,
      homeLabel: sameKoreanDay ? "영업시간 외 고시" : "영업시간 외 최근 고시",
      detailLabel: sameKoreanDay ? "영업시간 외 고시" : "최근 고시",
      tableLabel: sameKoreanDay ? "영업시간 외 기준" : "최근 고시",
      statusLabel: sameKoreanDay ? "영업시간 외 고시" : "영업시간 외 최근 고시",
      noticeBadgeLabel: "거래 전 확인",
      noticeTitle: "영업시간 외 거래 전 전화 확인",
      noticeBody:
        "영업시간 외에는 고시 기준이 새로 확정되지 않을 수 있습니다. 화면 금액은 최근 회사 고시 기준이며, 실제 적용가는 영업시간 중 전화 또는 현장 확인 후 안내합니다.",
      operatorActionLabel: "영업시간 중 적용 기준 재확인",
      isScheduled,
      isStale: true,
      requiresTradeConfirmation: true,
      status: "outside-hours" satisfies PriceAnnouncementStatus,
    };
  }

  if (!sameKoreanDay) {
    return {
      valueLabel: formatDateTimeKorean(date),
      dateLabel: `최근 고시 ${formatDateDot(date)}`,
      homeLabel: "최근 고시 시각",
      detailLabel: "최근 고시",
      tableLabel: "최근 고시",
      statusLabel: "최근 고시",
      noticeBadgeLabel: "거래 전 확인",
      noticeTitle: "최종 거래 전 전화 확인",
      noticeBody:
        "화면 금액은 오늘 새 고시 전 최근 회사 고시 시세입니다. 실제 거래 금액은 상담 시점의 회사 고시와 실물 확인 기준으로 다시 안내합니다.",
      operatorActionLabel: "당일 고시 등록 또는 상담 전 확인",
      isScheduled,
      isStale: true,
      requiresTradeConfirmation: true,
      status: "recent" satisfies PriceAnnouncementStatus,
    };
  }

  return {
    valueLabel: formatDateTimeKorean(date),
    dateLabel: formatDateDot(date),
    homeLabel: sameKoreanDay ? "오늘 고시 시각" : "고시 시각",
    detailLabel: "고시 시각",
    tableLabel: "기준 시각",
    statusLabel: "오늘 고시",
    noticeBadgeLabel: "회사 고시",
    noticeTitle: "회사 고시 시세 우선",
    noticeBody: "실제 거래 금액은 순도, 중량, 제품 상태 확인 후 현장에서 최종 안내합니다.",
    operatorActionLabel: "정상 고시 노출",
    isScheduled,
    isStale: false,
    requiresTradeConfirmation: false,
    status: "current" satisfies PriceAnnouncementStatus,
  };
}
