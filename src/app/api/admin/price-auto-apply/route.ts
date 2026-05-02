import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data";
import { buildPriceUpdatesFromSuggestion } from "@/lib/price-auto";

export const dynamic = "force-dynamic";

function revalidatePriceSurfaces() {
  revalidatePath("/");
  revalidatePath("/prices");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/prices");
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || !(await verifyAdminSession(token))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    suggestionId?: string;
    changedBy?: string;
  };
  const repository = getRepository();
  const [prices, suggestion] = await Promise.all([
    repository.getPrices(),
    repository.getLatestPriceAutoSuggestion(),
  ]);

  if (!suggestion || suggestion.id !== body.suggestionId || suggestion.status !== "draft") {
    return NextResponse.json({ ok: false, error: "draft-not-found" }, { status: 404 });
  }

  const changedBy = body.changedBy || "자동입력 초안 적용";
  const updates = buildPriceUpdatesFromSuggestion(prices, suggestion, changedBy);
  await repository.updatePrices(updates);
  await repository.updatePriceAutoSuggestionStatus(suggestion.id, "applied", changedBy);
  revalidatePriceSurfaces();

  return NextResponse.json({
    ok: true,
    applied: updates.length,
    suggestionId: suggestion.id,
  });
}
