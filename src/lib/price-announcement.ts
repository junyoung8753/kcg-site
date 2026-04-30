import { formatDateDot, formatDateTimeKorean } from "@/lib/format";

function getKoreanDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(date);
}

export function getPriceAnnouncementDisplay(value: string | null | undefined, now = new Date()) {
  if (!value) {
    return {
      valueLabel: "당일 고시 준비중",
      dateLabel: "고시 준비중",
      homeLabel: "오늘 고시 시각",
      detailLabel: "고시 시각",
      tableLabel: "기준 시각",
      isScheduled: false,
    };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return {
      valueLabel: "당일 고시 준비중",
      dateLabel: "고시 준비중",
      homeLabel: "오늘 고시 시각",
      detailLabel: "고시 시각",
      tableLabel: "기준 시각",
      isScheduled: false,
    };
  }

  const isScheduled = date.getTime() > now.getTime();
  const sameKoreanDay = getKoreanDateKey(date) === getKoreanDateKey(now);

  if (isScheduled) {
    return {
      valueLabel: formatDateTimeKorean(date),
      dateLabel: formatDateDot(date),
      homeLabel: sameKoreanDay ? "오늘 고시 예정 시각" : "고시 예정 시각",
      detailLabel: "고시 예정",
      tableLabel: "예정 시각",
      isScheduled,
    };
  }

  return {
    valueLabel: formatDateTimeKorean(date),
    dateLabel: formatDateDot(date),
    homeLabel: sameKoreanDay ? "오늘 고시 시각" : "고시 시각",
    detailLabel: "고시 시각",
    tableLabel: "기준 시각",
    isScheduled,
  };
}
