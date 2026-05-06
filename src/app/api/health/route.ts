import { NextResponse } from "next/server";
import { getAdminPasswordMode } from "@/lib/auth/password";
import { getInquiryAssistantStatus } from "@/lib/inquiry-assistant";
import { getLaunchReadiness } from "@/lib/launch-readiness";
import { getMarketDashboardData } from "@/lib/market-data";
import { getSearchExposureStatus } from "@/lib/public-launch";
import { getDeploymentStage } from "@/lib/runtime-env";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  const passwordMode = getAdminPasswordMode();
  const marketData = await getMarketDashboardData();
  const launchReadiness = getLaunchReadiness();
  const inquiryAssistant = getInquiryAssistantStatus();

  return NextResponse.json({
    ok: true,
    deployment: getDeploymentStage(),
    mode: isSupabaseConfigured() ? "supabase" : "mock",
    adminAuth:
      passwordMode === "demo"
        ? "demo-password"
        : passwordMode === "missing-env"
          ? "missing-env-password"
          : "env-password",
    indexing: getSearchExposureStatus(),
    launchReadiness: {
      status: launchReadiness.status,
      score: launchReadiness.score,
      blockers: launchReadiness.blockers,
      warnings: launchReadiness.warnings,
    },
    marketProvider: marketData.source,
    marketSourceName: marketData.sourceName,
    marketSourceUrl: marketData.sourceUrl,
    marketSourceTermsUrl: marketData.sourceTermsUrl ?? null,
    marketSourceTier: marketData.sourceTier,
    marketSourceAttribution: marketData.sourceAttribution,
    marketStatus: marketData.status,
    marketDisplayMode: marketData.displayModeLabel,
    marketUpgradeReadyProvider: marketData.upgradeReadyProvider ?? null,
    marketBlockedProvider: marketData.blockedProvider ?? null,
    marketBlockedProviderReason: marketData.blockedProviderReason ?? null,
    marketUpdatedAt: marketData.updatedAt,
    marketIsStale: marketData.isStale,
    marketStaleMinutes: marketData.staleMinutes,
    metalsDevConfigured: Boolean(process.env.METALS_DEV_API_KEY),
    krxProviderPrepared: false,
    krxProviderApprovalStatus: "blocked-pending-approval",
    inquiryAssistantMode: inquiryAssistant.mode,
    inquiryAssistantStoresMessages: inquiryAssistant.storesMessages,
    inquiryAssistantCollectsPersonalData: inquiryAssistant.collectsPersonalData,
    inquiryAssistantOpenAiConfigured: inquiryAssistant.openAiConfigured,
    inquiryAssistantHandoffChannels: inquiryAssistant.handoffChannels,
    fxPair: "USD/KRW",
    fxAsk: marketData.krwRate,
    fxUpdatedAt: marketData.updatedAt,
    headlineSource: marketData.headlineSource,
    headlineSourceName: marketData.headlineSourceName,
    headlineSourceUrl: marketData.headlineSourceUrl ?? null,
    headlineAttribution: marketData.headlineAttribution,
    headlineSourceTier: marketData.headlineSource === "google-news-rss" ? "free" : "fallback",
    headlineUpgradeReadyProvider: "news-api",
    timestamp: new Date().toISOString(),
  });
}
