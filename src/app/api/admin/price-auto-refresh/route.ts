import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getRepository } from "@/lib/data";
import {
  buildPriceAutoSuggestionInput,
  buildPriceUpdatesFromSuggestion,
} from "@/lib/price-auto";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}

function revalidatePriceSurfaces() {
  revalidatePath("/");
  revalidatePath("/prices");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/prices");
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const repository = getRepository();
  const [prices, settings] = await Promise.all([
    repository.getPrices(),
    repository.getPriceAutoSettings(),
  ]);

  if (!settings.isEnabled) {
    return NextResponse.json({ ok: true, skipped: "auto-fill-disabled" });
  }

  const input = await buildPriceAutoSuggestionInput(prices, settings);
  const suggestion = await repository.createPriceAutoSuggestion(input);

  if (suggestion.id === "schema-not-ready") {
    return NextResponse.json(
      {
        ok: false,
        error: "schema-not-ready",
        warnings: suggestion.warnings,
      },
      { status: 503 },
    );
  }

  const canEmergencyPublish =
    settings.mode === "emergency_publish" &&
    process.env.PRICE_AUTOFILL_ALLOW_EMERGENCY_PUBLISH === "1" &&
    suggestion.items.every((item) => !item.needsReview) &&
    suggestion.warnings.length === 0;

  if (canEmergencyPublish) {
    const updates = buildPriceUpdatesFromSuggestion(
      prices,
      suggestion,
      "자동입력 비상 게시",
    );
    await repository.updatePrices(updates);
    await repository.updatePriceAutoSuggestionStatus(
      suggestion.id,
      "applied",
      "자동입력 비상 게시",
    );
    revalidatePriceSurfaces();
    return NextResponse.json({
      ok: true,
      mode: "emergency_publish",
      applied: updates.length,
      suggestionId: suggestion.id,
    });
  }

  revalidatePriceSurfaces();
  return NextResponse.json({
    ok: true,
    mode: "draft",
    items: suggestion.items.length,
    warnings: suggestion.warnings,
    suggestionId: suggestion.id,
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
