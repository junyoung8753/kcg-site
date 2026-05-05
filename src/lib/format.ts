export function formatCurrencyKRW(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatWon(value: number) {
  return `${new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(value)}원`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function formatDateTimeKorean(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Seoul",
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${getPart("year")}년 ${Number(getPart("month"))}월 ${Number(getPart("day"))}일 ${getPart("dayPeriod")} ${Number(getPart("hour"))}:${getPart("minute")}`;
}

export function formatDateTimeLocalKorean(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Seoul",
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${getPart("year")}-${getPart("month")}-${getPart("day")}T${getPart("hour")}:${getPart("minute")}`;
}

export function dateTimeLocalKoreaToIso(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return new Date().toISOString();
  if (/(?:Z|[+-]\d{2}:\d{2})$/i.test(trimmed)) {
    const dateWithZone = new Date(trimmed);
    return Number.isNaN(dateWithZone.getTime()) ? new Date().toISOString() : dateWithZone.toISOString();
  }

  const normalized = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed) ? `${trimmed}:00` : trimmed;
  const koreaDate = new Date(`${normalized}+09:00`);
  return Number.isNaN(koreaDate.getTime()) ? new Date().toISOString() : koreaDate.toISOString();
}

export function formatDateKorean(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeZone: "Asia/Seoul",
  }).format(date);
}

export function formatDateDot(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return `${year}.${month}.${day}`;
}

export function formatPlainContent(content: string) {
  return content.split(/\n{2,}/).filter(Boolean);
}
