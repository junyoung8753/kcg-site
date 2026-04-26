import { NextResponse } from "next/server";
import { getAdminPasswordMode } from "@/lib/auth/password";
import { getMarketDashboardData } from "@/lib/market-data";
import { getDeploymentStage, isSearchIndexingEnabled } from "@/lib/runtime-env";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  const passwordMode = getAdminPasswordMode();
  const marketData = await getMarketDashboardData();

  return NextResponse.json({
    ok: true,
    deployment: getDeploymentStage(),
    mode: isSupabaseConfigured() ? "supabase" : "mock",
    adminAuth: passwordMode === "demo" ? "demo-password" : "env-password",
    indexing: isSearchIndexingEnabled() ? "enabled" : "disabled",
    marketProvider: marketData.source,
    marketSourceName: marketData.sourceName,
    marketSourceUrl: marketData.sourceUrl,
    marketSourceTermsUrl: marketData.sourceTermsUrl ?? null,
    marketSourceTier: marketData.sourceTier,
    marketSourceAttribution: marketData.sourceAttribution,
    marketStatus: marketData.status,
    marketDisplayMode: marketData.displayModeLabel,
    marketUpgradeReadyProvider: marketData.upgradeReadyProvider ?? null,
    marketUpdatedAt: marketData.updatedAt,
    marketIsStale: marketData.isStale,
    marketStaleMinutes: marketData.staleMinutes,
    metalsDevConfigured: Boolean(process.env.METALS_DEV_API_KEY),
    krxProviderPrepared: false,
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
