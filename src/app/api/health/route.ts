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
    marketSourceTier: marketData.sourceTier,
    marketStatus: marketData.status,
    marketDisplayMode: marketData.displayModeLabel,
    marketUpgradeReadyProvider: marketData.upgradeReadyProvider ?? null,
    marketUpdatedAt: marketData.updatedAt,
    marketIsStale: marketData.isStale,
    marketStaleMinutes: marketData.staleMinutes,
    headlineSource: marketData.headlineSource,
    timestamp: new Date().toISOString(),
  });
}
