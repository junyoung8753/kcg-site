import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = process.env.SITE_AUDIT_URL || "";
const failures = [];
const passes = [];
const skips = [];

function readText(relativePath) {
  const absolutePath = resolve(rootDir, relativePath);
  if (!existsSync(absolutePath)) return null;
  return readFileSync(absolutePath, "utf8");
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

function expectMissing(relativePath) {
  const absolutePath = resolve(rootDir, relativePath);
  if (existsSync(absolutePath)) {
    record(failures, "unexpected file", relativePath);
    return;
  }

  record(passes, "file absent", relativePath);
}

function expectText(relativePath, patterns) {
  const text = readText(relativePath);
  if (text === null) {
    record(failures, "missing file", relativePath);
    return;
  }

  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      record(failures, "missing text", `${relativePath} -> ${pattern}`);
    } else {
      record(passes, "text", `${relativePath} -> ${pattern}`);
    }
  }
}

function expectNoText(relativePath, patterns) {
  const text = readText(relativePath);
  if (text === null) {
    record(failures, "missing file", relativePath);
    return;
  }

  for (const pattern of patterns) {
    if (text.includes(pattern)) {
      record(failures, "forbidden text", `${relativePath} -> ${pattern}`);
    } else {
      record(passes, "forbidden text absent", `${relativePath} -> ${pattern}`);
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

async function expectUrlStatus(pathname, expectedStatus) {
  const url = new URL(pathname, siteUrl);
  const response = await fetch(url);
  const actualStatus = response.status;

  if (actualStatus !== expectedStatus) {
    record(failures, "route status", `${url.href} returned ${actualStatus}, expected ${expectedStatus}`);
    return;
  }

  record(passes, "route status", `${url.href} returned ${actualStatus}`);
}

[
  "public/campaign/kcg-hero-gold-bars.jpg",
  "public/campaign/kcg-hero-metal-bars.jpg",
  "public/campaign/kcg-hero-consulting.jpg",
  "public/brand/kcg-logo.png",
  "public/brand/kcg-lockup.png",
].forEach((relativePath) => expectFile(relativePath, { minBytes: 10_000 }));

expectFile("docs/quality/product-experience-rubric.md", { minBytes: 3_000 });
expectFile("docs/quality/ai-site-production-playbook.md", { minBytes: 4_000 });
expectFile("docs/quality/data-source-compliance.md", { minBytes: 4_000 });
expectFile("docs/research/gold-exchange-benchmark-2026-04-25.md", { minBytes: 3_000 });
expectFile("docs/research/gold-exchange-deep-audit-2026-04-27.md", { minBytes: 6_000 });
expectMissing("src/app/(site)/option-1/page.tsx");
expectMissing("src/app/(site)/option-2/page.tsx");
expectMissing("scripts/compare-source-url.mjs");

expectText("src/components/market/price-lineup.tsx", [
  "/campaign/kcg-hero-gold-bars.jpg",
  "/campaign/kcg-hero-metal-bars.jpg",
  "/campaign/kcg-hero-consulting.jpg",
  "골드바와 순금 거래 상담 배너",
  "백금 실버바 골드바 상담 배너",
  "종로 방문 상담 안내 배너",
  "siteConfig.englishName",
  "KCG PRICE DESK",
  "오늘 고시 시세와 방문 상담 기준을 한 화면에서 확인합니다.",
  "order-1 relative z-0 overflow-hidden",
  "lg:ml-8 xl:ml-12",
  "24K · 3.75g 기준",
  "시세는 고시 시각 기준이며 실제 거래 금액",
]);
expectText("src/app/globals.css", ["kcg-hero-copy-in", ".kcg-hero-copy", ".kcg-hero-heading", "word-break: keep-all"]);
expectText("src/components/market/market-dashboard.tsx", [
  "실시간 국제 참고 시세",
  "3.75g 기준 자동 환산가",
  "md:hidden",
  "출처 및 이용 안내",
  "공급자 약관 확인",
]);
expectNoText("src/components/market/market-dashboard.tsx", ["min-w-[40rem]", "USD / T.oz"]);
expectText("src/components/prices/price-table.tsx", ["고시가 /", "formatWon"]);
expectNoText("src/components/prices/price-table.tsx", ["단위: {price.unit}", ">단위<"]);
expectText("src/app/(site)/prices/page.tsx", ["PriceContextGuide"]);
expectText("src/components/prices/price-context-guide.tsx", [
  "시세를 볼 때 먼저 확인할 기준",
  "고금·주얼리 매입 상담",
  "법인·상속·대량 정리",
  "회사 고시 시세",
  "자동 국제 참고 시세",
  "타사 내부 API·가격표·뉴스 본문은 고객 화면에 직접 사용하지 않습니다.",
]);
expectText("tests/site-fidelity.spec.ts", [
  "expectNoVisibleElementEscapesViewport",
  "오늘 고시 시세와 방문 상담 기준을 한 화면에서 확인합니다.",
  "고시가 / 3.75g 기준",
  "시세를 볼 때 먼저 확인할 기준",
  "단위: 3.75g",
]);
expectText("src/lib/market-data.ts", [
  "https://gold-api.com/docs",
  "https://gold-api.com/terms",
  "https://www.metals.dev/docs",
  "순금 3.75g 참고가",
  "기사 제목·출처·날짜만 링크로 제공하며, 본문·이미지는 재게시하지 않습니다.",
]);
expectNoText("src/lib/market-data.ts", [
  "koreagoldx.co.kr",
  "chart.gold-you.com",
  "ssggold.cafe24api.com",
  "irena111.cafe24.com",
  "kaggold.com/index.grp_ajax2.php",
]);

expectText("src/components/layout/site-header.tsx", [
  "시세조회",
  "고금매입 상담",
  "골드바·실버바",
  "/products",
  "전화",
  "메뉴",
  "(주)한국센터",
  "금거래소",
]);

expectText("src/components/layout/mobile-contact-bar.tsx", ["전화 상담", "시세", "위치"]);
expectText("src/lib/legal-info.ts", [
  "TEMP_BUSINESS_REGISTRATION_NUMBER",
  "000-00-00000",
  "오픈 전 교체 필요",
]);
expectText("src/lib/public-launch.ts", ["canExposeToSearch", "getPublicLaunchContentBlockers"]);
expectText("src/lib/launch-readiness.ts", [
  "사업자·법적 표시",
  "대표 도메인",
  "관리자 인증",
  "운영 데이터 저장소",
]);
expectText("src/app/robots.ts", ["canExposeToSearch"]);
expectText("src/app/sitemap.ts", ["canExposeToSearch"]);
expectText("src/app/layout.tsx", ["canExposeToSearch"]);
expectText("src/app/api/health/route.ts", ["launchReadiness", "getSearchExposureStatus"]);
expectText("src/lib/auth/password.ts", ["missing-env", "__KCG_ADMIN_PASSWORD_NOT_CONFIGURED__"]);
expectNoText("src/lib/auth/password.ts", ["adminPreviewPassword", "0000"]);
expectNoText("src/lib/site-config.ts", ["adminPreviewPassword"]);
expectText("src/app/admin/login/page.tsx", ["missing-env", "ADMIN_PASSWORD"]);
expectNoText("src/app/admin/login/page.tsx", ["preview-default", "adminPreviewPassword"]);
expectText("src/app/admin/launch/page.tsx", ["오픈 전 점검판", "임시값은 화면에 보이더라도"]);
expectText("src/app/admin/layout.tsx", ["/admin/launch", "오픈 점검"]);
expectText("src/components/layout/site-footer.tsx", [
  "getBusinessRegistrationDisplay",
  "getLegalPlaceholderNotice",
]);
expectText("src/app/(site)/about/page.tsx", [
  "getBusinessRegistrationDisplay",
  "getLegalPlaceholderNotice",
]);

expectText("src/app/(site)/services/page.tsx", [
  "PurchaseGuide",
  "serviceFaqs",
  "고금·주얼리",
  "주얼리와 예물 정리 상담",
  "getProductStatusLabel",
  "상품 문의 보기",
]);
expectText("src/app/(site)/products/page.tsx", [
  "골드바·실버바와 귀금속 상담 카탈로그",
  "상품 가격을 확정 결제하는 쇼핑몰이 아니라",
  "ProductCatalog",
]);
expectText("src/app/(site)/products/[slug]/page.tsx", [
  "getProductPriceLabel",
  "문의 전 확인하면 상담이 빨라집니다",
  "전화 문의",
]);

expectText("src/lib/site-config.ts", [
  "/products",
  "000-00-00000",
  "임시값",
  "상품 문의",
  "고금·예물 정리 상담",
  "18K·14K 매입 기준 문의",
  "고금·주얼리",
  "custom_order",
  "고금매입은 시세표의 어느 금액을 보면 되나요?",
  "전화로 금액을 확정받을 수 있나요?",
]);
expectText("src/components/home/purchase-guide.tsx", ["백금·은 제품"]);
expectText("src/components/products/product-catalog.tsx", [
  "상담형 상품 카탈로그",
  "온라인 결제나 장바구니가 아닌 전화 상담형 카탈로그입니다.",
  "getProductImageSrc",
]);

expectText("src/mock/products.ts", [
  "고금·주얼리 정리 상담",
  "18K·14K 귀금속 상담",
  "고시 시세 기준 문의",
  "custom_order",
]);
expectText("src/types/product.ts", ["displayOrder", "priceLabel", "ProductUpsertInput"]);
expectText("src/actions/product-actions.ts", ["upsertProductAction", "revalidatePath(\"/products\")"]);
expectText("src/app/admin/products/page.tsx", ["상품 카탈로그 관리", "확정 가격처럼 노출", "upsertProductAction"]);

expectText("AGENTS.md", ["npm run test:site", "docs/quality/agent-quality-system.md"]);
expectText("package.json", [
  '"name": "korea-center-gold-exchange-site"',
  '"test:site": "playwright test"',
  '"screenshot:site": "node scripts/capture-site-screenshots.mjs"',
]);
expectText("docs/quality/agent-quality-system.md", [
  "vague quality goals were not translated into deterministic acceptance checks",
  "Do not treat route `200` as visual completeness.",
  "Benchmark-driven work must inspect more than the first screen.",
  "docs/quality/product-experience-rubric.md",
  "docs/quality/ai-site-production-playbook.md",
]);
expectText("docs/quality/data-source-compliance.md", [
  "Gold API",
  "Metals.Dev",
  "Google News RSS-style URLs",
  "Do not add scraping of third-party sites",
  "Competitor API Observation Rule",
  "KCG must not call, scrape, proxy, cache, republish, or chart competitor internal endpoints",
  "기사 제목·출처·날짜만 링크로 제공",
  "Do not add online payment, cart, live trading",
]);
expectText("docs/quality/product-experience-rubric.md", [
  "회사 고시 시세가 주인공",
  "전화/방문 상담",
  "자동 참고 시세는 보조 정보",
  "가격·거래·법적 사실은 검증 없이 만들지 않는다",
  "Benchmark depth",
  "docs/quality/data-source-compliance.md",
]);
expectText("docs/quality/ai-site-production-playbook.md", [
  "Context Pack",
  "Product Surface",
  "KCG constraints",
  "gold-exchange-deep-audit-2026-04-27.md",
  "Acceptance criteria",
  "Browser Evidence",
  "Durable Guardrail",
  "single production candidate",
  "company posted prices",
  "automatic market references",
  "Do not invent",
  "Do not scrape, republish, or chart third-party data",
]);
expectText("docs/setup/CURRENT_HANDOFF.md", [
  "docs/quality/ai-site-production-playbook.md",
  "docs/quality/data-source-compliance.md",
  "docs/research/gold-exchange-deep-audit-2026-04-27.md",
  "single production candidate",
  "Do not restore old option routes",
]);
expectText("docs/research/gold-exchange-benchmark-2026-04-25.md", [
  "KCG Direction Chosen",
  "Korea Gold Exchange-style price-first hierarchy",
  "KRX-style confusion prevention",
  "Do not copy competitor layouts",
]);
expectText("docs/research/gold-exchange-deep-audit-2026-04-27.md", [
  "Sites And Depth Covered",
  "API, Chart, And Data Findings",
  "A benchmark-driven KCG task is not complete if it only checks competitor home screens.",
]);
expectText("2-preview-deploy.cmd", [
  "SITE_AUDIT_URL=%DEPLOY_URL%",
  "scripts\\extract-vercel-url.mjs",
  "KCG_PREVIEW_ADMIN_PASSWORD",
  "KCG_PREVIEW_ADMIN_SESSION_SECRET",
]);
expectText("3-validation-check.cmd", ["npm.cmd run screenshot:site"]);
expectText(".github/workflows/site-quality.yml", [
  "npm run test:site",
  "npm run screenshot:site",
  "npm audit --audit-level=moderate",
]);
expectNoText("2-preview-deploy.cmd", ["--prod"]);
expectNoText("2-preview-deploy.cmd", ["/option-1", "/option-2", "Main compare hub"]);
expectNoText("2-preview-deploy.cmd", [
  "ADMIN_PASSWORD=0000",
  "ADMIN_SESSION_SECRET=kcg-confirm-preview-session-2026-04-20-seoul",
]);
expectNoText("3-validation-check.cmd", ["playwright-cli open %SITE_URL%"]);
expectNoText("package.json", ["compare:source", "compare-source-url"]);
expectNoText("README.md", ["/option-1", "/option-2", "compare:source", "MVP"]);
expectNoText("docs/quality/ai-site-production-playbook.md", ["compare:source", "source parity", "source-parity"]);
expectNoText("docs/quality/product-experience-rubric.md", ["compare:source", "source parity", "source-parity"]);
expectNoText("docs/setup/CLOUD_ONLY_WORKFLOW.md", ["compare:source", "source parity", "source-parity"]);
expectNoText("docs/setup/continue-anywhere.md", ["compare:source", "source parity", "source-parity"]);

if (siteUrl) {
  await expectUrl("/", [
    "한국센터금거래소 시세표",
    "오늘 고시 시세와 방문 상담 기준을 한 화면에서 확인합니다.",
    "전화 상담",
    "시세조회",
    "KOREA CENTER GOLD EXCHANGE",
    "시세는 고시 시각 기준이며 실제 거래 금액",
    "출처 및 이용 안내",
    "본문·이미지는 재게시하지 않습니다",
  ]);
  await expectUrl("/services", ["고금·주얼리", "18K·14K 매입 기준 문의"]);
  await expectUrl("/products", [
    "골드바·실버바와 귀금속 상담 카탈로그",
    "사진과 가격 문구를 등록해 운영할 상품 문의란",
    "고시 시세 기준 문의",
  ]);
  await expectUrl("/products/investment-gold-bar-consulting", [
    "투자용 골드바 상담",
    "문의 전 확인하면 상담이 빨라집니다",
  ]);
  await expectUrl("/prices", [
    "한국센터금거래소 시세표",
    "품목별 회사 고시 시세 상세",
    "시세를 볼 때 먼저 확인할 기준",
    "타사 내부 API·가격표·뉴스 본문은 고객 화면에 직접 사용하지 않습니다.",
  ]);
  await expectUrl("/about", ["전화 연결", "네이버 지도", "카카오맵", "사업자등록번호(임시)"]);
  await expectUrl("/api/health", ['"ok":true', "marketSourceUrl", "headlineAttribution", "launchReadiness"]);
  await expectUrlStatus("/option-1", 404);
  await expectUrlStatus("/option-2", 404);
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
