import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = process.env.SITE_AUDIT_URL || "";
const failures = [];
const passes = [];
const skips = [];

function readText(relativePath) {
  return readFileSync(resolve(rootDir, relativePath), "utf8");
}

function record(list, label, detail) {
  list.push({ label, detail });
}

function expectFile(relativePath, { minBytes }) {
  const absolutePath = resolve(rootDir, relativePath);
  if (!existsSync(absolutePath)) {
    record(failures, "missing file", relativePath);
    return;
  }

  const size = statSync(absolutePath).size;
  if (size < minBytes) {
    record(failures, "small asset", `${relativePath} is ${size} bytes, expected at least ${minBytes}`);
    return;
  }

  record(passes, "asset", `${relativePath} (${size} bytes)`);
}

function expectText(relativePath, patterns) {
  const text = readText(relativePath);
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      record(failures, "missing text", `${relativePath} -> ${pattern}`);
    } else {
      record(passes, "text", `${relativePath} -> ${pattern}`);
    }
  }
}

async function expectUrl(pathname, patterns = []) {
  const url = new URL(pathname, siteUrl);
  const response = await fetch(url);

  if (!response.ok) {
    record(failures, "route", `${url.href} returned ${response.status}`);
    return;
  }

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("text") || contentType.includes("json") ? await response.text() : "";
  record(passes, "route", `${url.href} returned ${response.status}`);

  for (const pattern of patterns) {
    if (!body.includes(pattern)) {
      record(failures, "route text", `${url.href} -> ${pattern}`);
    } else {
      record(passes, "route text", `${url.href} -> ${pattern}`);
    }
  }
}

[
  "public/campaign/kcg-hero-gold-bars.jpg",
  "public/campaign/kcg-hero-metal-bars.jpg",
  "public/campaign/kcg-hero-consulting.jpg",
  "public/brand/kcg-logo.png",
  "public/brand/kcg-lockup.png",
].forEach((relativePath) => expectFile(relativePath, { minBytes: 10_000 }));

expectText("src/components/market/price-lineup.tsx", [
  "/campaign/kcg-hero-gold-bars.jpg",
  "/campaign/kcg-hero-metal-bars.jpg",
  "/campaign/kcg-hero-consulting.jpg",
  "골드바와 순금 거래 상담 배너",
  "백금 실버바 골드바 상담 배너",
  "종로 방문 상담 안내 배너",
  "siteConfig.englishName",
  "시세는 고시 시각 기준이며 실제 거래 금액",
]);

expectText("src/components/layout/site-header.tsx", [
  "시세조회",
  "고금매입 상담",
  "골드바·실버바",
  "전화",
  "메뉴",
  "(주)한국센터",
  "금거래소",
]);

expectText("src/components/layout/mobile-contact-bar.tsx", ["전화상담", "시세", "위치"]);

expectText("src/app/(site)/services/page.tsx", [
  "고금·주얼리",
  "고금·예물·주얼리 정리 상담",
]);

expectText("src/lib/site-config.ts", [
  "고금·예물 정리 상담",
  "18K·14K 매입 기준 문의",
  "고금·주얼리",
]);

expectText("src/mock/products.ts", ["고금·주얼리 정리 상담", "18K·14K 귀금속 상담"]);

if (siteUrl) {
  await expectUrl("/", [
    "한국센터금거래소 시세표",
    "전화상담",
    "시세조회",
    "KOREA CENTER GOLD EXCHANGE",
    "시세는 고시 시각 기준이며 실제 거래 금액",
  ]);
  await expectUrl("/services", ["고금·주얼리", "18K·14K 매입 기준 문의"]);
  await expectUrl("/prices", ["한국센터금거래소 시세표", "품목별 회사 고시 시세 상세"]);
  await expectUrl("/about", ["전화 연결", "네이버 지도", "카카오맵"]);
  await expectUrl("/api/health", ['"ok":true']);
} else {
  record(skips, "url checks", "Set SITE_AUDIT_URL=http://localhost:3000 to audit rendered routes.");
}

for (const item of passes) {
  console.log(`PASS ${item.label}: ${item.detail}`);
}

for (const item of skips) {
  console.log(`SKIP ${item.label}: ${item.detail}`);
}

if (failures.length > 0) {
  for (const item of failures) {
    console.error(`FAIL ${item.label}: ${item.detail}`);
  }
  process.exit(1);
}

console.log(`Site fidelity audit passed (${passes.length} checks, ${skips.length} skipped).`);
