import type { SiteRepository } from "@/lib/data/repository";
import {
  buildPriceAutoSuggestionInput,
  buildPriceUpdatesFromSuggestion,
} from "@/lib/price-auto";
import type { PriceAutoSettings, PriceAutoSuggestionInput } from "@/types/price";

type PriceAutoRunStatus =
  | "auto-fill-disabled"
  | "not-due"
  | "outside-business-hours"
  | "schema-not-ready"
  | "draft-created"
  | "small-change"
  | "needs-review"
  | "data-not-safe"
  | "applied";

export interface PriceAutoRunResult {
  ok: boolean;
  status: PriceAutoRunStatus;
  message: string;
  suggestionId?: string;
  applied?: number;
  warnings: string[];
  nextCheckAt: string | null;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function toSafeDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getKstClockParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return {
    weekday: parts.find((part) => part.type === "weekday")?.value ?? "Sun",
    hour: Number(parts.find((part) => part.type === "hour")?.value ?? 0),
    minute: Number(parts.find((part) => part.type === "minute")?.value ?? 0),
  };
}

export function isKoreaBusinessTime(date = new Date()) {
  const { weekday, hour, minute } = getKstClockParts(date);
  if (weekday === "Sat" || weekday === "Sun") return false;

  const minutes = hour * 60 + minute;
  return minutes >= 9 * 60 && minutes <= 18 * 60 + 30;
}

export function getNextAutoCheckAt(settings: PriceAutoSettings, now = new Date()) {
  const lastCheckedAt = toSafeDate(settings.lastCheckedAt);
  if (!lastCheckedAt) return now.toISOString();
  return addMinutes(lastCheckedAt, settings.checkIntervalMinutes).toISOString();
}

function isDue(settings: PriceAutoSettings, now: Date) {
  const lastCheckedAt = toSafeDate(settings.lastCheckedAt);
  if (!lastCheckedAt) return true;
  return now.getTime() - lastCheckedAt.getTime() >= settings.checkIntervalMinutes * 60 * 1000;
}

function maxAbsoluteDifference(input: PriceAutoSuggestionInput) {
  return input.items.reduce((max, item) => Math.max(max, Math.abs(item.difference)), 0);
}

function hasUnsafeMarketData(input: PriceAutoSuggestionInput) {
  return (
    input.source === "mock" ||
    input.warnings.some((warning) =>
      /fallback|실패|stale|전 값|요청 대신|연결/i.test(warning),
    )
  );
}

function buildHeldInput(
  input: PriceAutoSuggestionInput,
  warnings: string[],
): PriceAutoSuggestionInput {
  return {
    ...input,
    warnings: [...input.warnings, ...warnings],
  };
}

export async function runPriceAutoRefresh(
  repository: SiteRepository,
  options: { force?: boolean; changedBy?: string } = {},
): Promise<PriceAutoRunResult> {
  const now = new Date();
  const nowIso = now.toISOString();
  const changedBy = options.changedBy ?? "자동시세";
  const [prices, settings] = await Promise.all([
    repository.getPrices(),
    repository.getPriceAutoSettings(),
  ]);

  if (!settings.isEnabled) {
    return {
      ok: true,
      status: "auto-fill-disabled",
      message: "자동시세가 꺼져 있어 공개 시세를 바꾸지 않았습니다.",
      warnings: [],
      nextCheckAt: null,
    };
  }

  if (settings.businessHoursOnly && !isKoreaBusinessTime(now)) {
    await repository.updatePriceAutoRunState({ lastCheckedAt: nowIso });
    return {
      ok: true,
      status: "outside-business-hours",
      message: "영업시간 밖이라 자동 반영하지 않았습니다.",
      warnings: ["영업시간만 반영 설정이 켜져 있습니다."],
      nextCheckAt: getNextAutoCheckAt({ ...settings, lastCheckedAt: nowIso }, now),
    };
  }

  if (!options.force && !isDue(settings, now)) {
    return {
      ok: true,
      status: "not-due",
      message: "아직 다음 확인 시각이 되지 않았습니다.",
      warnings: [],
      nextCheckAt: getNextAutoCheckAt(settings, now),
    };
  }

  const input = await buildPriceAutoSuggestionInput(prices, settings);
  const holdWarnings: string[] = [];
  const maxDifference = maxAbsoluteDifference(input);

  if (hasUnsafeMarketData(input)) {
    holdWarnings.push("참고 데이터가 불안정해 자동 게시하지 않고 검토 대기로 남겼습니다.");
  }

  if (maxDifference < settings.minApplyChangeWon) {
    holdWarnings.push(
      `현재 공개가와 계산값 차이가 ${settings.minApplyChangeWon.toLocaleString("ko-KR")}원 미만이라 자동 반영하지 않았습니다.`,
    );
  }

  if (input.items.some((item) => item.needsReview)) {
    holdWarnings.push("자동 게시 허용 변동폭을 넘은 항목이 있어 검토 대기로 남겼습니다.");
  }

  if (settings.mode !== "auto_publish") {
    holdWarnings.push("자동 게시가 아니라 검토 모드로 저장되어 공개 시세를 바꾸지 않았습니다.");
  }

  const suggestion = await repository.createPriceAutoSuggestion(
    holdWarnings.length ? buildHeldInput(input, holdWarnings) : input,
  );
  await repository.updatePriceAutoRunState({ lastCheckedAt: nowIso });

  if (suggestion.id === "schema-not-ready") {
    return {
      ok: false,
      status: "schema-not-ready",
      message: "자동시세 테이블이 아직 적용되지 않았습니다.",
      suggestionId: suggestion.id,
      warnings: suggestion.warnings,
      nextCheckAt: getNextAutoCheckAt({ ...settings, lastCheckedAt: nowIso }, now),
    };
  }

  if (holdWarnings.length) {
    const status: PriceAutoRunStatus = hasUnsafeMarketData(input)
      ? "data-not-safe"
      : input.items.some((item) => item.needsReview)
        ? "needs-review"
        : maxDifference < settings.minApplyChangeWon
          ? "small-change"
          : "draft-created";

    return {
      ok: true,
      status,
      message: "자동 계산 결과를 검토 대기로 남겼습니다.",
      suggestionId: suggestion.id,
      warnings: suggestion.warnings,
      nextCheckAt: getNextAutoCheckAt({ ...settings, lastCheckedAt: nowIso }, now),
    };
  }

  const updates = buildPriceUpdatesFromSuggestion(
    prices,
    suggestion,
    `${changedBy}: ${suggestion.providerLabel}`,
  );
  await repository.updatePrices(updates);
  await repository.updatePriceAutoSuggestionStatus(
    suggestion.id,
    "applied",
    `${changedBy}: ${suggestion.providerLabel}`,
  );
  await repository.updatePriceAutoRunState({
    lastCheckedAt: nowIso,
    lastAutoAppliedAt: nowIso,
  });

  return {
    ok: true,
    status: "applied",
    message: "자동 계산 결과를 공개 시세에 반영했습니다.",
    suggestionId: suggestion.id,
    applied: updates.length,
    warnings: suggestion.warnings,
    nextCheckAt: getNextAutoCheckAt({ ...settings, lastCheckedAt: nowIso }, now),
  };
}
