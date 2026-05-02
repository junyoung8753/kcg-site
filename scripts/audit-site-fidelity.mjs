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

function expectFileSizeAtMost(relativePath, { maxBytes }) {
  const absolutePath = resolve(rootDir, relativePath);
  if (!existsSync(absolutePath)) {
    record(failures, "missing file", relativePath);
    return;
  }

  const size = statSync(absolutePath).size;
  if (size > maxBytes) {
    record(failures, "large asset", `${relativePath} is ${size} bytes, expected at most ${maxBytes}`);
    return;
  }

  record(passes, "optimized asset", `${relativePath} (${size} bytes <= ${maxBytes})`);
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

function expectTextCount(relativePath, pattern, expectedCount) {
  const text = readText(relativePath);
  if (text === null) {
    record(failures, "missing file", relativePath);
    return;
  }

  const actualCount = text.split(pattern).length - 1;
  if (actualCount !== expectedCount) {
    record(failures, "text count", `${relativePath} -> ${pattern} occurred ${actualCount}, expected ${expectedCount}`);
    return;
  }

  record(passes, "text count", `${relativePath} -> ${pattern} occurred ${actualCount}`);
}

function expectTextOrder(relativePath, firstPattern, secondPattern) {
  const text = readText(relativePath);
  if (text === null) {
    record(failures, "missing file", relativePath);
    return;
  }

  const firstIndex = text.indexOf(firstPattern);
  const secondIndex = text.indexOf(secondPattern);
  if (firstIndex === -1 || secondIndex === -1 || firstIndex > secondIndex) {
    record(failures, "text order", `${relativePath} -> expected ${firstPattern} before ${secondPattern}`);
    return;
  }

  record(passes, "text order", `${relativePath} -> ${firstPattern} before ${secondPattern}`);
}

async function expectUrl(pathname, patterns = []) {
  const url = new URL(pathname, siteUrl);
  const response = await fetch(url);

  if (!response.ok) {
    record(failures, "route", `${url.href} returned ${response.status}`);
    return;
  }

  const contentType = response.headers.get("content-type") || "";
  const body =
    contentType.includes("text") || contentType.includes("json") || contentType.includes("xml")
      ? await response.text()
      : "";
  record(passes, "route", `${url.href} returned ${response.status}`);

  for (const pattern of patterns) {
    if (!body.includes(pattern)) {
      record(failures, "route text", `${url.href} -> ${pattern}`);
    } else {
      record(passes, "route text", `${url.href} -> ${pattern}`);
    }
  }
}

async function expectRedirect(pathname, expectedLocation) {
  const url = new URL(pathname, siteUrl);
  const response = await fetch(url, { redirect: "manual" });
  const actualLocation = response.headers.get("location") || "";

  if (response.status < 300 || response.status >= 400) {
    record(failures, "route redirect", `${url.href} returned ${response.status}, expected redirect`);
    return;
  }

  if (!actualLocation.includes(expectedLocation)) {
    record(
      failures,
      "route redirect",
      `${url.href} redirected to ${actualLocation || "(missing location)"}, expected ${expectedLocation}`,
    );
    return;
  }

  record(passes, "route redirect", `${url.href} redirected to ${actualLocation}`);
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
  "public/campaign/kcg-brand-gold-bars-20260427-v4.png",
  "public/campaign/kcg-brand-gold-bars-20260427-v4.webp",
  "public/campaign/kcg-main-desk-photo-20260427-v3.png",
  "public/campaign/kcg-main-desk-photo-20260427-v3.webp",
  "public/campaign/kcg-hero-gold-bars.jpg",
  "public/campaign/kcg-hero-metal-bars.jpg",
  "public/campaign/kcg-hero-consulting.jpg",
  "public/campaign/kcg-consulting-desk-20260427.jpg",
  "public/campaign/kcg-visit-desk-20260427.jpg",
  "public/campaign/kcg-advisor-counter-20260430.png",
  "public/campaign/kcg-advisor-counter-20260430.webp",
  "public/company/kcg-company-heritage-20260430.png",
  "public/company/kcg-company-heritage-20260430.webp",
  "public/products/kcg-gold-bar-catalog-20260427-v2.jpg",
  "public/products/kcg-pure-gold-products-20260427-v2.jpg",
  "public/products/kcg-old-gold-jewelry-20260427-v2.jpg",
  "public/products/kcg-jewelry-buying-tray-20260430.png",
  "public/products/kcg-jewelry-buying-tray-20260430.webp",
  "public/products/kcg-silver-gift-20260427-v2.jpg",
  "public/products/kcg-b2b-bulk-consulting-20260427-v2.jpg",
  "public/products/kcg-b2b-gift-packaging-20260430.png",
  "public/products/kcg-b2b-gift-packaging-20260430.webp",
  "public/products/kcg-buying-process-20260427-v2.jpg",
  "public/services/kcg-service-counter-20260427.jpg",
  "public/brand/kcg-logo.png",
  "public/brand/kcg-lockup.png",
].forEach((relativePath) => expectFile(relativePath, { minBytes: 10_000 }));

[
  "public/campaign/kcg-brand-gold-bars-20260427-v4.webp",
  "public/campaign/kcg-main-desk-photo-20260427-v3.webp",
  "public/campaign/kcg-advisor-counter-20260430.webp",
  "public/company/kcg-company-heritage-20260430.webp",
  "public/products/kcg-jewelry-buying-tray-20260430.webp",
  "public/products/kcg-b2b-gift-packaging-20260430.webp",
].forEach((relativePath) => expectFileSizeAtMost(relativePath, { maxBytes: 300_000 }));

expectFile("docs/quality/product-experience-rubric.md", { minBytes: 3_000 });
expectFile("docs/quality/ai-site-production-playbook.md", { minBytes: 4_000 });
expectFile("docs/quality/data-source-compliance.md", { minBytes: 4_000 });
expectFile("docs/quality/design-review-checklist.md", { minBytes: 3_000 });
expectFile("docs/setup/OPEN_TASKS.md", { minBytes: 2_000 });
expectFile("docs/setup/DOMAIN_SUPABASE_MARKET_RUNBOOK.md", { minBytes: 4_000 });
expectFile("docs/setup/PRODUCT_OPERATIONS_CHECKLIST.md", { minBytes: 2_000 });
expectFile("docs/setup/LAUNCH_BRIEFING.md", { minBytes: 2_000 });
expectFile("docs/brand/campaign-image-prompts.md", { minBytes: 1_000 });
expectFile("scripts/render-open-tasks-dashboard.mjs", { minBytes: 5_000 });
expectFile("scripts/check-external-services.mjs", { minBytes: 2_000 });
expectFile("docs/research/gold-exchange-benchmark-2026-04-25.md", { minBytes: 3_000 });
expectFile("docs/research/gold-exchange-deep-audit-2026-04-27.md", { minBytes: 6_000 });
expectMissing("src/app/(site)/option-1/page.tsx");
expectMissing("src/app/(site)/option-2/page.tsx");
expectMissing("scripts/compare-source-url.mjs");
expectMissing("scripts/generate-kcg-main-banner.mjs");
expectMissing("public/campaign/kcg-main-commerce-banner-20260427-v2.jpg");
expectMissing("public/campaign/KakaoTalk_20260207_230604937.jpg");
expectMissing("public/products/KakaoTalk_20260207_230604937.jpg");
expectMissing("public/services/KakaoTalk_20260207_230604937.jpg");

expectText("package.json", [
  "\"check:external\": \"node scripts/check-external-services.mjs\"",
]);

expectText("scripts/check-external-services.mjs", [
  "https://kcg-confirm-preview.vercel.app",
  "76.76.21.21",
  "Disallow: /",
  "mode=",
  "--strict-domain",
]);
expectText("scripts/capture-site-screenshots.mjs", [
  "products-mobile.png",
  "products-desktop.png",
]);

expectText("src/components/market/price-lineup.tsx", [
  "/campaign/kcg-brand-gold-bars-20260427-v4.webp",
  "/campaign/kcg-main-desk-photo-20260427-v3.webp",
  "/campaign/kcg-hero-metal-bars.jpg",
  "/campaign/kcg-hero-gold-bars.jpg",
  "한국센터금거래소 골드바 브랜드 캠페인 이미지",
  "한국센터금거래소 금·은 상담 데스크 이미지",
  "골드바와 실버바 키비주얼 배너",
  "중량별 골드바 제품 배너",
  "siteConfig.englishName",
  "kcg-full-bleed-campaign",
  'data-testid="home-campaign-visual"',
  'data-testid="home-price-lineup-panel"',
  'sizes="100vw"',
  'const wrapperLayoutClass = "relative flex flex-col lg:block"',
  "lg:absolute lg:bottom-0 lg:left-[clamp(7rem,12vw,17rem)] lg:top-0 lg:order-none",
  "lg:w-[37vw] 2xl:w-[42rem]",
  "bg-[rgba(38,39,39,0.96)]",
  "bg-[rgba(13,13,13,0.98)]",
  "order-1 relative z-0 overflow-hidden",
  "24K · 3.75g 기준",
  "시세는 고시 시각 기준이며 실제 거래 금액",
]);
expectNoText("src/components/market/price-lineup.tsx", [
  "/campaign/kcg-main-commerce-banner-20260427-v2.jpg",
  "/campaign/kcg-brand-gold-bars-20260427-v4.png",
  "/campaign/kcg-main-desk-photo-20260427-v3.png",
  "KCG 순금 골드바 방문 상담 광고 배너",
  "방문 상담",
  "정지",
  "재생",
  "시세표 다시 보기",
  "시세 라인업 닫기",
  "64vw",
  "lg:ml-8 xl:ml-12",
  "lg:pl-[40rem]",
  "rgba(255,255,255,0.92)",
  "rgba(255,255,255,0.14)",
  "activeSlide.kicker",
  "activeSlide.title",
  "activeSlide.body",
]);
expectText("src/app/globals.css", [
  "kcg-hero-copy-in",
  ".kcg-hero-copy",
  ".kcg-hero-heading",
  "word-break: keep-all",
  "scroll-padding-bottom: calc(6.25rem + env(safe-area-inset-bottom))",
]);
expectText("src/app/(site)/layout.tsx", ["pb-[calc(6.25rem+env(safe-area-inset-bottom))]"]);
expectText("src/components/market/market-dashboard.tsx", [
  'data-testid="market-dashboard"',
  'data-testid="market-source-line"',
  "국제 현재가",
  "국내 환산",
  "매매기준가",
  "TradingViewDisclosure",
  "국내 뉴스",
  "국제 뉴스",
  "출처:",
  "참고용",
  "variant = \"compact\"",
]);
expectText("src/components/market/trading-view-disclosure.tsx", [
  "useState(false)",
  "onToggle",
  "isOpen ?",
  "TradingViewMarketWidget",
  "국제 금속 차트 열기",
]);
expectText("src/components/market/trading-view-widget.tsx", [
  "TRADINGVIEW CHART",
  "국제 금속 시세 차트",
  "TradingView 제공",
  "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js",
  "data-testid=\"tradingview-market-widget\"",
  "이 위젯 데이터를 저장하거나",
]);
expectNoText("src/components/market/market-dashboard.tsx", [
  "min-w-[40rem]",
  "USD / T.oz",
  'text-right">환율',
  "text-right\">업데이트",
  "<span>업데이트</span>",
  "3.75g 자동 환산",
  "업데이트 기준",
  "환율 {formatExchangeRate(data.krwRate)} 기준 자동 참고값",
  "실시간 국제시세와 국내 환산 참고값",
  "자동 환산표",
  "국제 현재가와 국내 환산 참고값",
  "차트 확장성",
  "무료 모드에서는 현재가 중심",
  "출처 및 이용 안내",
  "공급자 약관 확인",
]);
expectText("src/components/prices/price-table.tsx", ["고시가 /", "formatWon"]);
expectNoText("src/components/prices/price-table.tsx", ["단위: {price.unit}", ">단위<"]);
expectText("src/lib/price-announcement.ts", ["오늘 고시 예정 시각", "고시 예정 시각"]);
expectText("src/components/home/final-home.tsx", ["getPriceAnnouncementDisplay"]);
expectNoText("src/components/home/final-home.tsx", ["오늘 고시 시각: {"]);
expectText("src/app/(site)/prices/page.tsx", ["PriceContextGuide", "시세 이용 기준", "getPriceAnnouncementDisplay", "기준 고시 예정"]);
expectText("src/components/market/price-lineup.tsx", ["announcedHeading"]);
expectText("src/components/prices/price-table.tsx", ["getPriceAnnouncementDisplay", "tableLabel"]);
expectNoText("src/app/(site)/prices/page.tsx", ["PageIntro"]);
expectTextOrder("src/app/(site)/prices/page.tsx", "<PriceLineup", "시세 이용 기준");
expectText("src/components/prices/price-context-guide.tsx", [
  "품목별로 볼 기준만 확인합니다.",
  "고금·주얼리",
  "골드바·실버바",
  "법인·대량",
  "볼 시세",
  "준비 항목",
]);
expectText("tests/site-fidelity.spec.ts", [
  "expectNoVisibleElementEscapesViewport",
  "expectMobileBottomBarDoesNotCover",
  "admin prices exposes auto-fill draft workflow",
  "admin products uses a compact list-and-editor management surface",
  "product quick links sync same-route category query",
  "고시가 / 3.75g 기준",
  "품목별로 볼 기준만 확인합니다.",
  "USD/KRW",
  "단위: 3.75g",
  "한국센터금거래소 금·은 상담 데스크 이미지",
  "한국센터금거래소 골드바 브랜드 캠페인 이미지",
  "const explicitAdminPassword = process.env.KCG_TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD",
  'const adminPassword = explicitAdminPassword || (isExternalAuditUrl ? undefined : "0000")',
]);
expectNoText("tests/site-fidelity.spec.ts", ["KCG 순금 골드바 방문 상담 광고 배너", "시세 운영 및 방문 안내 공지"]);
expectText("src/lib/market-data.ts", [
  "https://gold-api.com/docs",
  "https://gold-api.com/terms",
  "https://www.metals.dev/docs",
  "순금 3.75g 참고가",
  "기사 제목·출처·날짜만 링크로 제공하며, 본문·이미지는 재게시하지 않습니다.",
]);
expectText("src/lib/price-auto.ts", [
  "getDefaultPriceAutoSettings",
  "buildPriceAutoSuggestionInput",
  "buildPriceUpdatesFromSuggestion",
  "roundToUnit",
  "goldSellPremiumRate",
  "maxAutoChangePercent",
]);
expectNoText("src/lib/price-auto.ts", [
  "Math.random",
  "koreagoldx.co.kr",
  "ssgold.co.kr",
  "gbkmall.com",
]);
expectText("src/actions/price-actions.ts", [
  "updatePriceAutoSettingsAction",
  "generatePriceAutoSuggestionAction",
  "applyPriceAutoSuggestionAction",
  "rejectPriceAutoSuggestionAction",
  "buildPriceWarnings",
]);
expectText("src/app/api/admin/price-auto-refresh/route.ts", [
  "CRON_SECRET",
  "PRICE_AUTOFILL_ALLOW_EMERGENCY_PUBLISH",
  "buildPriceAutoSuggestionInput",
  "auto-fill-disabled",
]);
expectText("src/app/api/admin/price-auto-apply/route.ts", [
  "verifyAdminSession",
  "draft-not-found",
  "buildPriceUpdatesFromSuggestion",
]);
expectText("vercel.json", ["/api/admin/price-auto-refresh", "0 */2 * * *"]);
expectNoText("src/lib/market-data.ts", [
  "koreagoldx.co.kr",
  "chart.gold-you.com",
  "ssggold.cafe24api.com",
  "irena111.cafe24.com",
  "kaggold.com/index.grp_ajax2.php",
]);

expectText("src/components/layout/site-header.tsx", [
  "siteConfig.familyLinks",
  "siteConfig.locations",
  "상품/매입",
  "매장안내",
  "siteNavigation.map",
  "전화",
  "메뉴",
  "(주)한국센터",
  "금거래소",
]);

expectText("src/components/layout/mobile-contact-bar.tsx", [
  'data-testid="mobile-contact-bar"',
  "전화",
  "시세",
  "위치",
]);
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
  "Cafe24 DNS",
]);
expectNoText("src/lib/launch-readiness.ts", ["Gabia", "Whois DNS"]);
expectText("src/app/robots.ts", ["canExposeToSearch"]);
expectText("src/app/sitemap.ts", ["canExposeToSearch"]);
expectText("src/app/layout.tsx", [
  "canExposeToSearch",
  "summary_large_image",
  "kcg-brand-gold-bars-20260427-v4.webp",
  "application/ld+json",
  "JewelryStore",
  "sameAs",
]);
expectText("src/app/api/health/route.ts", ["launchReadiness", "getSearchExposureStatus"]);
expectText("src/lib/auth/password.ts", ["missing-env", "return false"]);
expectNoText("src/lib/auth/password.ts", ["adminPreviewPassword", "0000"]);
expectNoText("src/lib/site-config.ts", ["adminPreviewPassword"]);
[
  "src/lib/site-config.ts",
  "src/components/home/final-home.tsx",
  "src/components/layout/site-header.tsx",
  "src/components/market/price-lineup.tsx",
  "src/components/prices/price-context-guide.tsx",
  "src/app/(site)/about/page.tsx",
  "src/app/(site)/announcements/page.tsx",
  "src/app/(site)/products/page.tsx",
  "src/app/(site)/services/page.tsx",
  "src/mock/announcements.ts",
  "src/mock/products.ts",
  "supabase/seed.sql",
].forEach((relativePath) =>
  expectNoText(relativePath, ["방문 상담", "B2C 방문 상담", "순금·골드바 방문 상담"]),
);
expectText("src/app/admin/login/page.tsx", ["missing-env", "ADMIN_PASSWORD"]);
expectNoText("src/app/admin/login/page.tsx", ["preview-default", "adminPreviewPassword"]);
expectText("src/app/admin/launch/page.tsx", [
  "오픈 전 점검판",
  "임시값은 화면에 보이더라도",
  "지금 미리 가능한 준비",
  "공개 직전 별도 승인 필요",
  "Cafe24 도메인 연결 절차",
  "KRX 데이터는 승인·계약 범위 확인 전 production 미사용",
  "Production 배포 승인",
  "robots/noindex 해제와 검색 색인 승인",
]);
expectText("src/app/admin/layout.tsx", ["/admin/launch", "오픈 점검"]);
expectText("src/app/admin/page.tsx", [
  "오늘 운영 상태",
  "자동입력 상태",
  "최근 자동 초안",
  "상품 공개 수",
]);
expectText("src/components/layout/site-footer.tsx", [
  "getBusinessRegistrationDisplay",
  "getLegalPlaceholderNotice",
]);
expectText("src/app/(site)/about/page.tsx", [
  "siteConfig.locations",
  "/campaign/kcg-visit-desk-20260427.jpg",
  "거래 전 준비 항목을 확인하면 현장 안내가 빨라집니다.",
  "본사와 매장을 구분해 확인",
  "본사 전화",
]);

expectText("src/app/(site)/services/page.tsx", [
  "/campaign/kcg-advisor-counter-20260430.webp",
  "취급 품목, 당일 기준, 실물 확인 순서로 봅니다.",
  "serviceFaqs",
  "거래 기준",
  "필요한 항목만 빠르게 확인합니다.",
  "자주 묻는 기준",
  "상품/매입 보기",
]);
expectText("src/app/(site)/products/page.tsx", [
  "상품/매입",
  "골드바, 실버바, 순금제품, 고금 매입을 바로 고릅니다.",
  "현재 고시가 기준 참고가와 상품 정보를 바로 확인",
  "ProductCatalog",
]);
expectText("src/app/(site)/products/[slug]/page.tsx", [
  "getProductPriceDisplay",
  "문의 전 확인하면 상담이 빨라집니다",
  "전화 문의",
]);
expectText("src/app/(site)/company/page.tsx", [
  "/company/kcg-company-heritage-20260430.webp",
  "한국센터금거래소 회사소개 상담 데스크 이미지",
]);
expectNoText("src/app/(site)/company/page.tsx", [
  "const businessScopes",
  "순금·고금 매입 순금",
  "골드바·실버바 판매 투자용",
  "B2B 대량 상담 법인",
  "사업자등록증 기준",
  "companyStory.specialties",
  "companyStory.specialtyTitle",
]);

expectText("src/lib/site-config.ts", [
  "/products",
  "505-88-03567",
  "110111-0950729",
  "02-747-1807",
  "02-747-1806",
  "서울시 종로구 봉익동 97-1 성창빌딩 1층 6호",
  "서울시 종로구 돈화문로6가길 12 골든타워 303호",
  "familyLinks",
  "https://davisdia.com/",
  "https://diamin.co.kr/",
  "https://blog.naver.com/davis_diamond",
  "순금·고금 매입",
  "B2C 전화 문의·B2B",
  "상품/매입",
  "고금·예물 정리 상담",
  "18K·14K 매입 기준 문의",
  "고금·주얼리",
  "custom_order",
  "고금매입은 시세표의 어느 금액을 보면 되나요?",
  "전화로 금액을 확정받을 수 있나요?",
  "KC주얼리 그룹 사명",
  "고객가치를 높이고 보다 많은 사람들이 귀금속과 다이아몬드를 즐기며 행복할수 있도록 돕는다.",
  "한국센터금거래소(KCG) 회사소개",
  "국내 다이아몬드 수입 도매유통 1위 기업",
  "국내최대 랩그로운 도매법인",
  "전문 품목",
]);
expectNoText("src/lib/site-config.ts", [
  "02-747-1802",
  "골든타워 본사",
  "성창빌딩 매장",
  "대표번호",
]);
expectNoText("src/lib/site-config.ts", [
  "잠언",
  "할리스",
  "공식 인증센터 10군데",
  "신사옥",
  "신문광고",
  "오푼",
]);
expectText("src/components/home/purchase-guide.tsx", ["백금·은 제품"]);
expectText("src/components/products/product-catalog.tsx", [
  "상품 <span",
  "추천순",
  "낮은가격순",
  "높은가격순",
  "등록일순",
  "20개씩보기",
  "현재 고시가 기준",
  "handleProductPromoNavigate",
  "onInternalNavigate",
  "window.history.replaceState",
  "prefetch={false}",
  "aria-pressed={isActive}",
  "data-testid=\"product-quick-rail\"",
  "상품/매입 빠른 링크",
  "fixed right-0",
  "2xl:block",
  "KC 랩그로운 다이아몬드",
  "getProductImageSrc",
]);
expectText("src/lib/product-presenter.ts", [
  "전체",
  "골드바",
  "실버바",
  "순금제품",
  "고금·주얼리 매입",
  "B2B·기업",
  "productCatalogTabs",
  "if (imageUrl?.startsWith(\"/\"))",
]);
expectNoText("src/lib/product-presenter.ts", ["!defaultProductImages.has(imageUrl)"]);
expectNoText("src/components/products/product-catalog.tsx", [
  "상품/매입 카탈로그",
  "온라인 결제 화면이 아니라",
  "사진과 가격 문구",
  "등록해 운영",
  "관리자에서",
  "장바구니",
  "구매하기",
  "결제하기",
  "주문하기",
  "TODAY VIEW",
  "TODAY",
  "VIEW",
  "koreagoldx.co.kr",
  "router.replace",
  "useRouter",
  "unoptimized",
]);
[
  "src/app/(site)/products/page.tsx",
  "src/components/products/product-catalog.tsx",
  "src/mock/products.ts",
  "supabase/seed.sql",
].forEach((relativePath) =>
  expectNoText(relativePath, ["사진과 가격 문구", "등록해 운영", "관리자에서"]),
);
expectText("src/lib/product-presenter.ts", [
  "/products/kcg-gold-bar-catalog-20260427-v2.jpg",
  "/products/kcg-silver-gift-20260427-v2.jpg",
  "/products/kcg-jewelry-buying-tray-20260430.webp",
  "/products/kcg-buying-process-20260427-v2.jpg",
  "/products/kcg-b2b-gift-packaging-20260430.webp",
]);

expectText("src/mock/products.ts", [
  "KCG 골드바 1g",
  "KCG 골드바 3.75g",
  "KCG 실버바 1kg",
  "순금 돌반지 3.75g",
  "18K 주얼리 매입",
  "기업 기념품 제작",
  "현재 고시가 기준 참고가",
  "custom_order",
  "/products/kcg-gold-bar-catalog-20260427-v2.jpg",
  "/products/kcg-jewelry-buying-tray-20260430.webp",
  "/products/kcg-b2b-gift-packaging-20260430.webp",
]);
expectText("supabase/seed.sql", [
  "KCG 골드바 1g",
  "KCG 골드바 3.75g",
  "KCG 실버바 1kg",
  "순금 돌반지 3.75g",
  "18K 주얼리 매입",
  "귀금속 매입 절차 안내",
  "/products/kcg-gold-bar-catalog-20260427-v2.jpg",
  "/products/kcg-silver-gift-20260427-v2.jpg",
  "/products/kcg-jewelry-buying-tray-20260430.webp",
  "/products/kcg-b2b-gift-packaging-20260430.webp",
  "/products/kcg-buying-process-20260427-v2.jpg",
]);
expectText("src/types/product.ts", ["displayOrder", "priceLabel", "ProductUpsertInput", "ProductPriceBasis", "pure_gold"]);
expectText("src/actions/product-actions.ts", ["upsertProductAction", "revalidatePath(\"/products\")", "priceBasis", "weightGrams"]);
expectText("src/app/admin/products/page.tsx", [
  "상품 관리",
  "ProductManagementTable",
  "data-testid=\"admin-product-table\"",
  "편집 열기",
  "연동 시세",
  "중량(g)",
  "임시 공임",
  "수동 가격",
  "upsertProductAction",
]);
expectText("supabase/schema.sql", [
  "price_auto_settings",
  "price_auto_suggestions",
  "gold_sell_premium_rate",
  "max_auto_change_percent",
  "price_basis",
  "weight_grams",
  "making_fee",
  "manual_price",
  "subcategory",
  "display_order",
  "public_note",
  "drop constraint if exists products_status_check",
  "status in ('active', 'inquiry_required', 'hidden')",
]);

expectText("AGENTS.md", [
  "npm run test:site",
  "docs/quality/agent-quality-system.md",
  "BEGIN: FRONTEND_DESIGN_QUALITY_ADDON",
  "docs/quality/product-experience-rubric.md",
  "docs/quality/design-review-checklist.md",
  "docs/quality/ai-site-production-playbook.md",
  "docs/quality/data-source-compliance.md",
  "Use actual subagents only when the user explicitly permits delegated agent work",
]);
expectTextCount("AGENTS.md", "BEGIN: FRONTEND_DESIGN_QUALITY_ADDON", 1);
expectTextCount("AGENTS.md", "END: FRONTEND_DESIGN_QUALITY_ADDON", 1);
expectText("package.json", [
  '"name": "korea-center-gold-exchange-site"',
  '"test:site": "playwright test"',
  '"tasks:dashboard": "node scripts/render-open-tasks-dashboard.mjs"',
  '"screenshot:site": "node scripts/capture-site-screenshots.mjs"',
]);
expectText("playwright.config.ts", ["nextEnv.loadEnvConfig(process.cwd())", "process.env.SITE_AUDIT_URL"]);
expectText("tests/site-fidelity.spec.ts", ["/admin/launch", "공개 직전 별도 승인 필요"]);
expectText("scripts/capture-site-screenshots.mjs", [
  "/admin/launch",
  "admin-launch-mobile.png",
  "admin-launch-desktop.png",
  "KCG_INCLUDE_ADMIN_SCREENSHOTS",
  "nextEnv.loadEnvConfig(rootDir)",
  "primeLazyImagesForScreenshot",
  "removeSkippedAdminScreenshots",
  "if (includeAdminScreenshots)",
  "process.env.ADMIN_PASSWORD",
]);
expectText("docs/quality/agent-quality-system.md", [
  "vague quality goals were not translated into deterministic acceptance checks",
  "Do not treat route `200` as visual completeness.",
  "Benchmark-driven work must inspect more than the first screen.",
  "Product tabs were allowed to behave like route refreshes",
  "Product/category tabs that filter already-loaded data must be tested as local interactions.",
  "Public route typography should stay inside the KCG scale.",
  "docs/quality/product-experience-rubric.md",
  "docs/quality/ai-site-production-playbook.md",
]);
expectText("docs/quality/data-source-compliance.md", [
  "Gold API",
  "Metals.Dev",
  "KRX OPEN API",
  "KRX Use Boundary",
  "Koscom",
  "Google News RSS-style URLs",
  "Do not add scraping of third-party sites",
  "Competitor API Observation Rule",
  "KCG must not call, scrape, proxy, cache, republish, or chart competitor internal endpoints",
  "기사 제목·출처·날짜만 링크로 제공",
  "Do not add online payment, cart, live trading",
]);
expectText("docs/quality/product-experience-rubric.md", [
  "회사 고시 시세가 주인공",
  "Confirmed operating scope",
  "B2C",
  "B2B",
  "전화 문의/거래 상담",
  "자동 참고 시세는 보조 정보",
  "가격·거래·법적 사실은 검증 없이 만들지 않는다",
  "Benchmark depth",
  "docs/quality/data-source-compliance.md",
]);
expectText("docs/quality/design-review-checklist.md", [
  "KCG Design Review Checklist",
  "Visual thesis",
  "Product surface",
  "Context of use",
  "Company posted prices are primary",
  "automatic market references are secondary",
  "KRX affiliation",
  "WCAG 2.2",
  "390px",
  "1440px",
  "KCG_INCLUDE_ADMIN_SCREENSHOTS",
  "codex review --uncommitted",
  "Score out of 100",
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
  "docs/quality/design-review-checklist.md",
  "docs/setup/OPEN_TASKS.md",
  "docs/setup/DOMAIN_SUPABASE_MARKET_RUNBOOK.md",
  "docs/brand/campaign-image-prompts.md",
  "전체`, `골드바`, `실버바`, `순금제품`, `고금·주얼리 매입`, and `B2B·기업`",
  "current posted-price reference calculations",
  "Cafe24 DNS",
  "docs/research/gold-exchange-deep-audit-2026-04-27.md",
  "single production candidate",
  "Do not restore old option routes",
  "Public Launch Terms",
  "Repository visibility decision as of 2026-04-27 KST",
  "Do not perform production deploys beyond an explicitly approved stable review refresh",
  "Current image source folder",
  "kcg-main-desk-photo-20260427-v3.webp",
  "kcg-brand-gold-bars-20260427-v4.webp",
  "505-88-03567",
  "The home carousel now starts with `kcg-brand-gold-bars-20260427-v4.webp`",
  "Stable Review Deploy Boundary",
]);
expectNoText("docs/setup/CURRENT_HANDOFF.md", ["Gabia", "Whois DNS"]);
expectText("docs/setup/OPEN_TASKS.md", [
  "KCG Open Tasks",
  "KCG-TODO-001",
  "KCG-TODO-009",
  "KCG-TODO-010",
  "KCG-TODO-011",
  "KCG-TODO-012",
  "KCG-TODO-018",
  "KCG-TODO-020",
  "KCG-TODO-021",
  "KCG-TODO-023",
  "KCG-TODO-024",
  "KCG-TODO-025",
  "KCG-TODO-026",
  "KCG-TODO-039",
  "KCG-TODO-040",
  "PRODUCT_OPERATIONS_CHECKLIST.md",
  "LAUNCH_BRIEFING.md",
  "Cafe24 DNS",
  "DOMAIN_SUPABASE_MARKET_RUNBOOK.md",
  "campaign-image-prompts.md",
  "tasks:dashboard",
  "user-only",
  "codex",
  "public launch",
  "/review",
  "KCG_INCLUDE_ADMIN_SCREENSHOTS",
  "codex review --uncommitted",
  "codex review --base main",
  "kcgold.co.kr",
  "Do not record passwords",
]);
expectNoText("docs/setup/OPEN_TASKS.md", ["Gabia", "Whois DNS"]);
expectText("docs/setup/DOMAIN_SUPABASE_MARKET_RUNBOOK.md", [
  "Cafe24 And Vercel Domain Connection",
  "Vercel project: `kcg-confirm-preview`",
  "Preserve existing MX/TXT/SPF/DKIM records",
  "SUPABASE_SERVICE_ROLE_KEY=<server-only secret>",
  "Gold API free current prices",
  "KRX boundary",
  "Run production deploy only when junyoung explicitly approves",
]);
expectText("docs/setup/PRODUCT_OPERATIONS_CHECKLIST.md", [
  "consultation-first catalog",
  "/admin/products",
  "현재 고시가 기준 참고가",
  "Real Photo Replacement Priority",
  "Do not use `구매하기`, `결제하기`, `주문하기`, `장바구니`",
]);
expectText("docs/setup/LAUNCH_BRIEFING.md", [
  "가격 확인 → 상품/매입 범위 확인 → 전화 문의 → 본사·매장 확인",
  "Search exposure is still blocked",
  "Metals.Dev is not mandatory now",
  "Do not treat domain connection or production deployment as public launch approval",
]);
expectText("docs/brand/campaign-image-prompts.md", [
  "Source Folder",
  "KakaoTalk_20260427_125126082_01.png",
  "ChatGPT Image 2026년 4월 27일 오후 01_02_09.png",
  "kcg-main-desk-photo-20260427-v3.webp",
  "optimized `.webp` versions",
  "Wikimedia Commons",
  "Do not copy private document photos",
  "Natural tiny bar engravings",
  "Home main slide banner",
  "large white haze",
  "Old gold and jewelry buying card",
  "No readable personal documents",
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
expectNoText(".github/workflows/site-quality.yml", ["KCG_INCLUDE_ADMIN_SCREENSHOTS"]);
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
    "전화",
    "시세조회",
    "KOREA CENTER GOLD EXCHANGE",
    "시세는 고시 시각 기준이며 실제 거래 금액",
    "국제 현재가",
    "자동 참고 시세와 외부 뉴스는 회사 고시 시세를 대체하지 않습니다.",
    "국제 금속 차트 열기",
  ]);
  await expectUrl("/services", [
    "취급 품목, 당일 기준, 실물 확인 순서로 봅니다.",
    "매입 가능 품목",
    "자주 묻는 기준",
  ]);
  await expectUrl("/products", [
    "상품/매입",
    "KCG 골드바 3.75g",
    "현재 고시가 기준",
  ]);
  await expectUrl("/products/investment-gold-bar-consulting", [
    "KCG 골드바 3.75g",
    "문의 전 확인하면 상담이 빨라집니다",
  ]);
  await expectUrl("/announcements", ["시세 운영 및 거래 준비 공지"]);
  await expectUrl("/prices", [
    "한국센터금거래소 시세표",
    "품목별 회사 고시 시세 상세",
    "품목별로 볼 기준만 확인합니다.",
    "국제 현재가",
    "TradingView 제공",
  ]);
  await expectUrl("/about", [
    "본사 전화",
    "네이버 지도",
    "카카오맵",
    "거래 전 준비 항목을 확인하면 현장 안내가 빨라집니다.",
    "사업자등록번호",
    "매장",
  ]);
  await expectUrl("/company", [
    "주식회사 한국센터금거래소",
    "505-88-03567",
    "대표이사",
    "패밀리 사이트",
    "다비스 다이아몬드",
    "다이아민족",
  ]);
  await expectUrl("/admin/login", ["관리자 로그인"]);
  await expectRedirect("/admin/launch", "/admin/login?next=%2Fadmin%2Flaunch");
  await expectUrl("/api/health", ['"ok":true', "marketSourceUrl", "headlineAttribution", "launchReadiness"]);
  await expectUrl("/robots.txt", ["Disallow: /"]);
  await expectUrl("/sitemap.xml", ['<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', "</urlset>"]);
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
