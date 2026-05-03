import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getRepository } from "@/lib/data";
import { runPriceAutoRefresh } from "@/lib/price-auto-runner";

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
  const result = await runPriceAutoRefresh(repository, { changedBy: "자동시세" });
  revalidatePriceSurfaces();

  if (result.status === "schema-not-ready") {
    return NextResponse.json(result, { status: 503 });
  }

  return NextResponse.json(result);
}

export async function GET(request: NextRequest) {
  return POST(request);
}
