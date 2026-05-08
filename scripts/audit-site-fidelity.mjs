import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = process.env.SITE_AUDIT_URL || "";
const failures = [];
const passes = [];
const skips = [];
const joinEndpointParts = (...parts) => parts.join("");
const blockedCompetitorEndpoints = [
  "koreagoldx.co.kr",
  "chart.gold-you.com",
  joinEndpointParts("ssg", "gold", ".cafe24", "api", ".com"),
  "irena111.cafe24.com",
  "kaggold.com/index.grp_ajax2.php",
];
const blockedMarketScrapingTerms = [
  "GenerateOTP",
  "OTP",
  "bldAttendant",
  "data.krx.co.kr/comm/fileDn",
  "dbms/MDC",
  "MDCSTAT",
];

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

const rawKakaoTalkFileNamePattern = /^KakaoTalk_\d{8}_\d+(?:_\d{2})?\.(?:jpe?g|png|webp)$/i;

function expectNoRawKakaoTalkFiles(relativeDirectories) {
  for (const relativeDirectory of relativeDirectories) {
    const absoluteDirectory = resolve(rootDir, relativeDirectory);
    if (!existsSync(absoluteDirectory)) {
      record(failures, "missing directory", relativeDirectory);
      continue;
    }

    let foundRawFiles = 0;
    const visit = (absolutePath, relativePath) => {
      for (const entry of readdirSync(absolutePath, { withFileTypes: true })) {
        const childAbsolutePath = resolve(absolutePath, entry.name);
        const childRelativePath = `${relativePath}/${entry.name}`;

        if (entry.isDirectory()) {
          visit(childAbsolutePath, childRelativePath);
          continue;
        }

        if (entry.isFile() && rawKakaoTalkFileNamePattern.test(entry.name)) {
          foundRawFiles += 1;
          record(failures, "raw KakaoTalk public file", childRelativePath);
        }
      }
    };

    visit(absoluteDirectory, relativeDirectory);

    if (foundRawFiles === 0) {
      record(passes, "raw KakaoTalk file scan", `${relativeDirectory} has no raw KakaoTalk filenames`);
    }
  }
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

function expectNoRegex(relativePath, patterns) {
  const text = readText(relativePath);
  if (text === null) {
    record(failures, "missing file", relativePath);
    return;
  }

  for (const pattern of patterns) {
    if (pattern.test(text)) {
      record(failures, "forbidden pattern", `${relativePath} -> ${pattern.source}`);
    } else {
      record(passes, "forbidden pattern absent", `${relativePath} -> ${pattern.source}`);
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

function expectLatestChangelogVersionMatchesPackage() {
  const packageText = readText("package.json");
  const changelogText = readText("docs/setup/CHANGELOG.md");

  if (packageText === null) {
    record(failures, "missing file", "package.json");
    return;
  }

  if (changelogText === null) {
    record(failures, "missing file", "docs/setup/CHANGELOG.md");
    return;
  }

  let packageVersion = "";
  try {
    packageVersion = JSON.parse(packageText).version;
  } catch (error) {
    record(failures, "package version", `package.json could not be parsed: ${error.message}`);
    return;
  }

  const latestChangelogMatch = changelogText.match(/^## v(\d+\.\d+\.\d+)\b/m);
  if (!latestChangelogMatch) {
    record(failures, "changelog version", "docs/setup/CHANGELOG.md has no latest ## vX.Y.Z entry");
    return;
  }

  const changelogVersion = latestChangelogMatch[1];
  if (packageVersion !== changelogVersion) {
    record(
      failures,
      "version mismatch",
      `package.json version ${packageVersion} does not match changelog latest v${changelogVersion}`,
    );
    return;
  }

  record(passes, "version traceability", `package.json ${packageVersion} matches CHANGELOG v${changelogVersion}`);
}

function expectCurrentHandoffMatchesLatestRelease() {
  const packageText = readText("package.json");
  const changelogText = readText("docs/setup/CHANGELOG.md");
  const handoffText = readText("docs/setup/CURRENT_HANDOFF.md");

  if (packageText === null) {
    record(failures, "missing file", "package.json");
    return;
  }

  if (changelogText === null) {
    record(failures, "missing file", "docs/setup/CHANGELOG.md");
    return;
  }

  if (handoffText === null) {
    record(failures, "missing file", "docs/setup/CURRENT_HANDOFF.md");
    return;
  }

  let packageVersion = "";
  try {
    packageVersion = JSON.parse(packageText).version;
  } catch (error) {
    record(failures, "package version", `package.json could not be parsed: ${error.message}`);
    return;
  }

  const latestTitleMatch = changelogText.match(/^## v(\d+\.\d+\.\d+) - (.+)$/m);
  if (!latestTitleMatch) {
    record(failures, "changelog version", "docs/setup/CHANGELOG.md has no latest ## vX.Y.Z - title entry");
    return;
  }

  const [, changelogVersion, changelogTitle] = latestTitleMatch;
  const expectedVersionLine = `Current KCG site version: \`v${packageVersion}\``;

  if (packageVersion !== changelogVersion) {
    record(
      failures,
      "version mismatch",
      `package.json version ${packageVersion} does not match changelog latest v${changelogVersion}`,
    );
    return;
  }

  if (!handoffText.includes(expectedVersionLine)) {
    record(failures, "missing text", `docs/setup/CURRENT_HANDOFF.md -> ${expectedVersionLine}`);
    return;
  }

  if (!handoffText.includes(changelogTitle)) {
    record(failures, "missing text", `docs/setup/CURRENT_HANDOFF.md -> ${changelogTitle}`);
    return;
  }

  record(
    passes,
    "handoff traceability",
    `CURRENT_HANDOFF.md references v${packageVersion} and latest changelog title`,
  );
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
  "public/campaign/kcg-generated-goldbar-banner-20260508.webp",
  "public/campaign/kcg-home-price-desk-20260506.webp",
  "public/campaign/kcg-home-human-consultation-20260506.webp",
  "public/campaign/kcg-home-product-keyvisual-20260503.webp",
  "public/campaign/kcg-home-seoul-retail-20260506.webp",
  "public/campaign/kcg-price-guide-visual-20260506.webp",
  "public/campaign/kcg-old-gold-process-20260506.webp",
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
  "public/products/kcg-generated-goldbar-lineup-20260508.webp",
  "public/products/kcg-generated-goldbar-detail-20260508.webp",
  "public/products/kcg-product-minimal-bars-20260506.webp",
  "public/products/kcg-product-gold-silver-catalog-20260503.webp",
  "public/products/kcg-product-jewelry-buying-20260503.webp",
  "public/products/kcg-product-b2b-consulting-20260503.webp",
  "public/products/kcg-product-pure-gold-gifts-20260506.webp",
  "public/products/kcg-product-corporate-consulting-20260506.webp",
  "public/products/kcg-buying-process-20260427-v2.jpg",
  "public/services/kcg-service-counter-20260427.jpg",
  "public/brand/kcg-logo.png",
  "public/brand/kcg-lockup.png",
  "public/image-options/2026-05-03/existing-current-contact-sheet.jpg",
  "public/image-options/2026-05-03/new-candidates-contact-sheet.jpg",
  "public/image-options/2026-05-06/generated/contact-sheet.jpg",
].forEach((relativePath) => expectFile(relativePath, { minBytes: 10_000 }));
expectFile("public/image-options/2026-05-06/generated/manifest.json", { minBytes: 1_000 });

[
  "public/campaign/kcg-brand-gold-bars-20260427-v4.webp",
  "public/campaign/kcg-main-desk-photo-20260427-v3.webp",
  "public/campaign/kcg-advisor-counter-20260430.webp",
  "public/campaign/kcg-generated-goldbar-banner-20260508.webp",
  "public/campaign/kcg-home-price-desk-20260506.webp",
  "public/campaign/kcg-home-human-consultation-20260506.webp",
  "public/campaign/kcg-home-product-keyvisual-20260503.webp",
  "public/campaign/kcg-home-seoul-retail-20260506.webp",
  "public/campaign/kcg-price-guide-visual-20260506.webp",
  "public/campaign/kcg-old-gold-process-20260506.webp",
  "public/company/kcg-company-heritage-20260430.webp",
  "public/products/kcg-jewelry-buying-tray-20260430.webp",
  "public/products/kcg-b2b-gift-packaging-20260430.webp",
  "public/products/kcg-generated-goldbar-lineup-20260508.webp",
  "public/products/kcg-generated-goldbar-detail-20260508.webp",
  "public/products/kcg-product-minimal-bars-20260506.webp",
  "public/products/kcg-product-gold-silver-catalog-20260503.webp",
  "public/products/kcg-product-jewelry-buying-20260503.webp",
  "public/products/kcg-product-b2b-consulting-20260503.webp",
  "public/products/kcg-product-pure-gold-gifts-20260506.webp",
  "public/products/kcg-product-corporate-consulting-20260506.webp",
].forEach((relativePath) => expectFileSizeAtMost(relativePath, { maxBytes: 300_000 }));

expectFile("docs/quality/product-experience-rubric.md", { minBytes: 3_000 });
expectFile("docs/quality/ai-site-production-playbook.md", { minBytes: 4_000 });
expectFile("docs/quality/data-source-compliance.md", { minBytes: 4_000 });
expectFile("docs/quality/design-review-checklist.md", { minBytes: 3_000 });
expectFile("docs/quality/operations-product-audit-checklist.md", { minBytes: 4_000 });
expectFile("docs/quality/existing-api-integration-audit-2026-05-05.md", { minBytes: 4_000 });
expectFile("docs/quality/kcg-10000-point-qa-scorecard.md", { minBytes: 2_000 });
expectFile("docs/quality/official-docs-index.md", { minBytes: 2_000 });
expectFile("code_review.md", { minBytes: 1_500 });
expectFile(".agents/skills/kcg-site-quality/SKILL.md", { minBytes: 1_500 });
expectFile("docs/setup/PROJECT_STATUS_FOR_BEGINNER.md", { minBytes: 3_000 });
expectFile("docs/setup/OPEN_TASKS.md", { minBytes: 2_000 });
expectFile("docs/setup/CHANGELOG.md", { minBytes: 1_500 });
expectFile("docs/setup/COMPANY_ACCOUNT_MIGRATION_RUNBOOK.md", { minBytes: 4_000 });
expectFile("docs/setup/KCG_ACCOUNT_OWNERSHIP_CHECKLIST.md", { minBytes: 2_000 });
expectFile("docs/setup/CONTACT_CHANNELS_RUNBOOK.md", { minBytes: 1_000 });
expectFile("docs/setup/DOMAIN_SUPABASE_MARKET_RUNBOOK.md", { minBytes: 4_000 });
expectFile("docs/setup/KRX_API_APPROVAL_RUNBOOK.md", { minBytes: 3_000 });
expectFile("docs/setup/PRODUCT_OPERATIONS_CHECKLIST.md", { minBytes: 2_000 });
expectFile("docs/setup/AUTO_PRICE_OPERATIONS_BRIEF.md", { minBytes: 2_000 });
expectFile("docs/setup/LAUNCH_BRIEFING.md", { minBytes: 2_000 });
expectFile("docs/setup/QA_REPORT_2026-05-05.md", { minBytes: 1_500 });
expectFile("docs/brand/campaign-image-prompts.md", { minBytes: 1_000 });
expectFile("docs/brand/image-review-2026-05-03.md", { minBytes: 2_000 });
expectFile("docs/brand/generated-goldbar-assets-2026-05-08.md", { minBytes: 1_000 });
expectFile("docs/brand/kcg-image-intake-2026-05-08.md", { minBytes: 2_000 });
expectFile("docs/brand/product-image-replacement-map-2026-05-08.md", { minBytes: 2_500 });
expectFile("docs/brand/font-license.md", { minBytes: 800 });
expectFile("src/app/fonts/PretendardVariable.woff2", { minBytes: 1_500_000 });
expectFile("scripts/render-open-tasks-dashboard.mjs", { minBytes: 5_000 });
expectFile("scripts/check-external-services.mjs", { minBytes: 2_000 });
expectFile("scripts/run-rendered-site-audit.mjs", { minBytes: 2_000 });
expectFile("scripts/run-site-qa.mjs", { minBytes: 1_000 });
expectFile("scripts/capture-admin-screenshots.mjs", { minBytes: 100 });
expectFile("src/lib/inquiry-assistant.ts", { minBytes: 8_000 });
expectFile("src/components/inquiry/inquiry-assistant-widget.tsx", { minBytes: 6_000 });
expectFile("src/app/api/inquiry-assistant/route.ts", { minBytes: 1_000 });
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
expectMissing("public/brand/KakaoTalk_20260427_125126082.png");
expectMissing("public/brand/KakaoTalk_20260427_125126082_01.png");
expectMissing("public/products/KakaoTalk_20260508_091553653.png");
expectMissing("public/products/KakaoTalk_20260508_091553653_01.png");
expectMissing("public/products/KakaoTalk_20260508_091553653_02.png");
expectMissing("public/products/KakaoTalk_20260508_091553653_03.png");
expectMissing("public/products/KakaoTalk_20260508_091603752.jpg");
expectMissing("public/products/KakaoTalk_20260508_091613735.jpg");
expectMissing("public/products/KakaoTalk_20260508_110154617.jpg");
expectMissing("public/products/KakaoTalk_20260508_110154617_01.jpg");
expectMissing("public/products/KakaoTalk_20260508_110154617_02.jpg");
expectMissing("public/products/KakaoTalk_20260508_110154617_03.jpg");
expectMissing("public/products/KakaoTalk_20260508_110154617_04.jpg");
expectMissing("public/products/KakaoTalk_20260508_110154617_05.jpg");
expectMissing("public/products/KakaoTalk_20260508_110154617_06.jpg");
expectNoRawKakaoTalkFiles(["public"]);

expectText("package.json", [
  "\"check:external\": \"node scripts/check-external-services.mjs\"",
  "\"audit:rendered\": \"node scripts/run-rendered-site-audit.mjs\"",
  "\"qa:site\": \"node scripts/run-site-qa.mjs\"",
  "\"release:trace\": \"node scripts/report-release-trace.mjs\"",
  "\"check:release-state\": \"node scripts/check-live-release-state.mjs\"",
  "\"screenshot:admin\": \"node scripts/capture-admin-screenshots.mjs\"",
]);
expectLatestChangelogVersionMatchesPackage();
expectText("docs/setup/CHANGELOG.md", [
  "## v0.2.29 - Generated KCG gold-bar representative assets",
  "kcg-generated-goldbar-banner-20260508.webp",
  "Generated KCG gold-bar representative assets",
  "generated KCG-style gold-bar representative assets",
  "KCG-TODO-081",
  "v0.2.29 전으로 되돌려줘",
  "## v0.2.28 - Public catalog representative-image clarity",
  "상담용 대표 이미지",
  "실물 색상과 패키지는 현장 확인 후 안내합니다.",
  "representative before real-photo approval",
  "KCG-TODO-080",
  "v0.2.28 전으로 되돌려줘",
  "## v0.2.27 - Product image replacement map QA",
  "docs/brand/product-image-replacement-map-2026-05-08.md",
  "No public image was replaced",
  "do not use raw KakaoTalk filenames in public paths",
  "KCG-TODO-079",
  "v0.2.27 전으로 되돌려줘",
  "## v0.2.26 - KCG image intake guardrail QA",
  "docs/brand/kcg-image-intake-2026-05-08.md",
  "No files were copied into public",
  "metadata and visual review only",
  "v0.2.26 전으로 되돌려줘",
  "## v0.2.18 - Inquiry assistant and KRX no-scraping boundary",
  "거래 상담 도우미",
  "store: false",
  "inquiryAssistantMode",
  "v0.2.18 상담 도우미 전으로 되돌려줘",
  "## v0.2.17 - KRX approval-first guardrails",
  "KRX Open API (승인 전 사용 불가)",
  "marketBlockedProvider",
  "KRX_API_APPROVAL_RUNBOOK.md",
  "v0.2.17 전으로 되돌려줘",
  "## v0.2.16 - Company transfer feasibility and live launch QA",
  "source owner rights",
  "SITE_AUDIT_URL=https://kcgold.co.kr npm run audit:site",
  "1265 checks, 0 skipped",
  "v0.2.16 전으로 되돌려줘",
  "## v0.2.15 - Company Vercel and Supabase ownership start",
  "kcgoldx-7259",
  "vercel.com/kcgoldx",
  "Korea Center Gold Exchange",
  "raqltqjuqcrusylilnqs",
  "Do not restore the old personal CLI sessions",
  "v0.2.15 전으로 되돌려줘",
  "## v0.2.14 - Minimal company account onboarding mode",
  "Minimal Required Mode",
  "kcgoldx@gmail.com",
  "Codex가 가능한 생성·연결·검증",
  "유료 서버/API 결제",
  "v0.2.14 전으로 되돌려줘",
  "## v0.2.13 - Company Gmail ownership and billing migration plan",
  "kcgoldx@gmail.com",
  "KCG_ACCOUNT_OWNERSHIP_CHECKLIST.md",
  "Google Workspace / `admin@kcgold.co.kr` is optional later domain-mail work",
  "v0.2.13 전으로 되돌려줘",
  "## v0.2.12 - Pre-launch customer flow and catalog image QA",
  "Price-first operational guidance",
  "전화 전 확인",
  "살 때",
  "팔 때",
  "대량",
  "v0.2.12 전으로 되돌려줘",
  "## v0.2.11 - Admin launch readability and price-time clarity",
  "고시 기준",
  "관리자 저장",
  "다음 계산 가능",
  "v0.2.11 전으로 되돌려줘",
  "## v0.2.10 - Visual guidance refresh and infographic FAQ polish",
  "Graphite Desk",
  "kcg-home-price-desk-20260506.webp",
  "시세표 보는 법",
  "v0.2.10 전으로 되돌려줘",
  "## v0.2.9 - Operations QA guard, TradingView visibility, and price history storage",
  "24시간 이상 수동 시세 등록",
  "price_daily_snapshots",
  "v0.2.9 전으로 되돌려줘",
  "## v0.2.8 - Admin mode persistence and operational readability",
  "자동시세 ON을 눌러도 다시 OFF로 저장될 수 있던",
  "v0.2.8 전으로 되돌려줘",
  "## v0.2.7 - Light admin console and automatic price UX",
  "관리자 화면을 어두운 카드형 화면에서 밝은 운영 콘솔로 바꾸고",
  "실제 사이트 화면이 바뀐 것: 관리자 로그인/대시보드/시세 관리 라이트 테마",
  "v0.2.7 전으로 되돌려줘",
  "## v0.2.6 - Expert panel deep QA public and admin polish",
  "홈 시세표가 한 화면 안에 더 안정적으로 들어오고",
  "실제 사이트 화면이 바뀐 것: 홈 시세표 크기/간격",
  "v0.2.6 전으로 되돌려줘",
  "## v0.2.5 - Existing API integration audit",
  "이미 붙어 있는 Gold API",
  "실제 사이트 화면이 바뀐 것: 없음",
  "v0.2.5 전으로 되돌려줘",
  "## v0.2.4 - Operations product-audit checklist and beginner status guide",
  "사람이 읽는 요약",
  "실제 사이트 화면이 바뀐 것: 없음",
  "v0.2.4 전으로 되돌려줘",
  "## v0.2.2 - Expert panel deep QA and admin evidence hardening",
  "Admin screenshot evidence can now be refreshed independently",
  "Vercel Hobby Cron is limited to once-daily automatic checks",
  "v0.2.2 전으로 되돌려줘",
  "## v0.2.1 - Release trace, market readability, and contact readiness",
  "Deploy Status",
  "Verification",
  "Rollback Hint",
  "Remaining User-only",
  "TradingView",
  "카카오톡 문의",
  "v0.2.1 전으로 되돌려줘",
]);
expectText("docs/setup/CURRENT_HANDOFF.md", [
  "PROJECT_STATUS_FOR_BEGINNER.md",
  "Current KCG site version: `v0.2.29`",
  "Generated KCG gold-bar representative assets",
  "docs/brand/generated-goldbar-assets-2026-05-08.md",
  "kcg-generated-goldbar-banner-20260508.webp",
  "Current KCG site version: `v0.2.28`",
  "Public catalog representative-image clarity",
  "상담용 대표 이미지",
  "real-photo approval",
  "Current KCG site version: `v0.2.27`",
  "Product image replacement map QA",
  "docs/brand/product-image-replacement-map-2026-05-08.md",
  "generated separate representative WebP assets",
  "raw KakaoTalk filenames",
  "docs/brand/kcg-image-intake-2026-05-08.md",
  "no raw source files were copied into public",
  "metadata and visual review only",
  "raw KakaoTalk filenames",
  "admin-products-mobile.png",
  "이미지 확인 필터",
  "실사진 확인",
  "교체 대상",
  "운영 상태 구분",
  "소스 QA",
  "라이브 리뷰 반영",
  "공개 검색 런칭",
  "이미지 성격",
  "대표/생성",
  "KCG_PUBLIC_SEARCH_APPROVED=1",
  "npm run check:release-state",
  "상담 도우미",
  "junyoung8753-2361s-projects/kcg-confirm-preview",
  "temporary free deployment path",
  "KRX_API_APPROVAL_RUNBOOK.md",
  "existing-api-integration-audit-2026-05-05.md",
  "데스크톱 오른쪽 하단 `상담 도우미` 버튼",
  "모바일 하단 고정 CTA의 `상담` 버튼",
  "kcgoldx@gmail.com",
  "personal Vercel Hobby project",
  "company transfer",
  "temporary free deployment path",
  "backup/pre-v0.2.4-operations-product-audit",
]);
expectText("docs/setup/PROJECT_STATUS_FOR_BEGINNER.md", [
  "지금 내가 보면 되는 것",
  "v0.2.29",
  "v0.2.28",
  "v0.2.27",
  "v0.2.26",
  "v0.2.25",
  "v0.2.24",
  "v0.2.20",
  "v0.2.18",
  "kcgoldx@gmail.com",
  "상담 도우미",
  "이번 `v0.2.29`에서 source 기준 실제 사이트 화면이 새로 바뀌는 것",
  "kcg-generated-goldbar-banner-20260508.webp",
  "KCG-TODO-081",
  "상담용 대표 이미지",
  "docs/brand/product-image-replacement-map-2026-05-08.md",
  "docs/brand/kcg-image-intake-2026-05-08.md",
  "raw KakaoTalk 파일",
  "이미지 확인 필터",
  "실사진 확인",
  "교체 대상",
  "운영 상태 구분",
  "라이브 리뷰 반영",
  "이미지 성격",
  "KCG_PUBLIC_SEARCH_APPROVED=1",
  "상담 기준 공임",
  "현재 source에는 들어갔지만 live에는 아직 안 보이는 화면 변경",
  "모바일 하단 고정 CTA에는 `상담` 버튼",
  "backup/pre-v0.2.4-operations-product-audit",
  "LOW",
  "MEDIUM",
  "HIGH",
  "FORBIDDEN",
  "그대로 복사해서 Codex에게 말하면 되는 문장",
  "검증 전 push/deploy 하지 않음",
  "검색 노출/noindex 해제하지 않음",
]);
expectText("docs/setup/COMPANY_ACCOUNT_MIGRATION_RUNBOOK.md", [
  "Permanent representative company account: `kcgoldx@gmail.com`",
  "Minimal required mode",
  "Current Progress - 2026-05-06 KST",
  "refreshed in `v0.2.19`",
  "kcgoldx-7259",
  "KCG` with slug `kcgoldx`",
  "junyoung8753-2361` to team `KCG` as `MEMBER`",
  "transfer UI still does not expose `KCG`",
  "Korea Center Gold Exchange",
  "Confirmed official transfer boundary",
  "Junyoung Only",
  "Codex Handles After Login",
  "Pay Only When Needed",
  "Optional future domain mailbox",
  "Do not record passwords",
  "Optional password-manager item for `kcgoldx@gmail.com`",
  "Vercel team/workspace display name",
  "Project ref: `ehmsqlfxxydnebzjfarr`",
  "GitHub organization slug candidates",
  "Google Workspace / `admin@kcgold.co.kr` is optional later domain-mail work",
  "Do not remove robots/noindex/search blocking",
  "Do not add checkout/cart/payment/live trading behavior",
]);
expectText("docs/setup/KCG_ACCOUNT_OWNERSHIP_CHECKLIST.md", [
  "Permanent representative company account: `kcgoldx@gmail.com`",
  "Minimal required mode",
  "Current Company CLI State",
  "Official Transfer Conditions",
  "Vercel CLI account: `kcgoldx-7259`",
  "Vercel company team: `KCG`",
  "Supabase company organizations",
  "Korea Center Gold Exchange",
  "Do Now / Defer",
  "Vercel project transfer",
  "Supabase project transfer",
  "Service Ownership Matrix",
  "Google 2-Step Verification",
  "Vercel",
  "Supabase",
  "GitHub",
  "Cafe24 / domain DNS",
  "Do not write passwords",
  "User-Only Decisions Still Required",
]);
expectText("docs/setup/QA_REPORT_2026-05-05.md", [
  "Public site | 9380 / 10000",
  "Admin console | 9520 / 10000",
  "Operations readiness | 9250 / 10000",
  "v0.2.8 Admin Console Follow-Up",
  "v0.2.7 Admin Console Follow-Up",
  "v0.2.6 Expert-Panel Follow-Up",
]);
expectText("src/app/admin/prices/price-mode-workspace.tsx", [
  "순금 살 때",
  "순금 팔 때",
  "백금 살 때",
  "은 팔 때",
  "고시 기준",
  "관리자 저장",
  "다음 계산 가능",
  "formatDateTimeLocalKorean",
]);
expectText("src/app/admin/page.tsx", [
  "dynamic = \"force-dynamic\"",
  "미리보기 저장",
  "formatDateTimeKorean",
  "오늘 먼저 확인할 것",
  "헷갈리면 이것만 기준",
  "공개 시세 보기",
]);
expectText("src/app/admin/announcements/page.tsx", [
  "bg-[#fff0ed]",
  "text-[#8a2c20]",
]);
expectText("src/components/market/market-dashboard.tsx", [
  "text-xl font-bold tabular-nums",
]);
expectText("docs/quality/operations-product-audit-checklist.md", [
  "Technical QA",
  "Product / Operations QA",
  "Business / Conversion QA",
  "Main Price Disclosure Priority",
  "Existing API Integration Audit",
  "Image / Visual Asset Audit",
  "Placeholder Vs Real Product Photo Policy",
  "Infographic Opportunity Review",
  "고객이 보는 첫 화면 영향",
]);
expectText("docs/quality/existing-api-integration-audit-2026-05-05.md", [
  "KCG company posted prices remain the source of truth",
  "Gold API",
  "Metals.Dev",
  "Google News RSS-style feed",
  "TradingView official widget",
  "Supabase storage",
  "Vercel Cron / auto-price refresh",
  "Existing API integration is a current-site QA scope",
  "P0 Audit Findings",
  "P1 Operational QA Checks",
  "P2 Or Blocked Items",
  "Competitor sites must remain human-reference/benchmark sources only",
]);
expectText("docs/quality/agent-quality-system.md", [
  "operations-product-audit-checklist.md",
  "Main Price Disclosure Priority",
  "Existing API Integration Audit",
  "Image / Visual Asset Audit",
]);
expectText(".agents/skills/kcg-site-quality/SKILL.md", [
  "operations-product-audit-checklist.md",
  "existing-api-integration-audit-2026-05-05.md",
  "Main Price Disclosure Priority",
  "Existing API Integration Audit",
  "Image / Visual Asset Audit",
]);
expectText("code_review.md", [
  "Main price disclosure",
  "Existing API integration",
  "Image / visual asset strategy",
]);
expectText("docs/setup/OPEN_TASKS.md", [
  "Risk Labels",
  "KCG-TODO-052",
  "KCG-TODO-053",
  "KCG-TODO-055",
  "KCG-TODO-060",
  "KCG-TODO-072",
  "KCG_PUBLIC_SEARCH_APPROVED=1",
  "existing-api-integration-audit-2026-05-05.md",
  "실제 제품 사진",
]);
expectText("scripts/report-release-trace.mjs", [
  "KCG release trace",
  "Deploy Status",
  "Rollback Hint",
  "version mismatch",
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
  "home-mobile-viewport.png",
  "home-desktop-viewport.png",
  "prices-mobile-viewport.png",
  "products-mobile-viewport.png",
  "services-mobile-viewport.png",
  "KCG_ADMIN_SCREENSHOTS_ONLY",
  "admin-products-mobile.png",
  "계산 설정 열기",
  'select[name="autoSource"]',
]);
expectText("scripts/capture-admin-screenshots.mjs", [
  "KCG_INCLUDE_ADMIN_SCREENSHOTS",
  "KCG_ADMIN_SCREENSHOTS_ONLY",
  "capture-site-screenshots.mjs",
]);

expectText("src/components/market/price-lineup.tsx", [
  "/campaign/kcg-generated-goldbar-banner-20260508.webp",
  "/campaign/kcg-home-human-consultation-20260506.webp",
  "/campaign/kcg-home-seoul-retail-20260506.webp",
  "/campaign/kcg-old-gold-process-20260506.webp",
  "한국센터금거래소 골드바 상담용 대표 배너 이미지",
  "한국센터금거래소 상담원과 고객 상담 장면",
  "종로 귀금속 매장 분위기 이미지",
  "고금 주얼리 매입 절차 상담 이미지",
  "siteConfig.englishName",
  "kcg-full-bleed-campaign",
  'data-testid="home-campaign-visual"',
  'data-testid="home-price-lineup-panel"',
  'data-testid="home-price-lineup-restore"',
  'aria-label="시세표 닫기"',
  "isHydrated",
  "시세표 보기",
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
  "--font-pretendard",
  "kcg-hero-copy-in",
  ".kcg-hero-copy",
  ".kcg-hero-heading",
  ".kcg-price-primary",
  ".kcg-data-label",
  ".kcg-caption",
  "word-break: keep-all",
  "scroll-padding-bottom: calc(6.25rem + env(safe-area-inset-bottom))",
]);
expectText("src/app/(site)/layout.tsx", ["pb-[calc(6.25rem+env(safe-area-inset-bottom))]"]);
[
  "src/app/globals.css",
  "src/components/market/price-lineup.tsx",
  "src/components/products/product-catalog.tsx",
  "src/components/layout/site-header.tsx",
  "src/components/prices/price-table.tsx",
  "src/app/(site)/prices/page.tsx",
  "src/app/(site)/products/page.tsx",
  "src/app/(site)/services/page.tsx",
  "src/app/(site)/company/page.tsx",
  "src/app/(site)/about/page.tsx",
  "src/app/admin/layout.tsx",
  "src/app/admin/page.tsx",
  "src/app/admin/login/page.tsx",
  "src/app/admin/prices/page.tsx",
].forEach((relativePath) =>
  expectNoRegex(relativePath, [
    /tracking-\[-0\.(03|04|05|06|07)em\]/,
    /tracking-\[0\.(22|24|28|34)em\]/,
  ]),
);
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
  "국제 금속 차트 보기",
]);
expectText("src/components/market/trading-view-widget.tsx", [
  "TRADINGVIEW CHART",
  "국제 금속 시세 차트",
  "TradingView 제공",
  "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js",
  "data-testid=\"tradingview-market-widget\"",
  "data-testid=\"tradingview-loading-state\"",
  "widget.style.height = \"100%\"",
  "h-[26rem] min-h-[26rem]",
  "TradingView 차트를 불러오지 못했습니다.",
  "이 위젯 데이터를 저장하거나",
]);
expectText("scripts/capture-site-screenshots.mjs", [
  "waitForTradingViewIfPresent",
  "hideFixedChromeForFullPageScreenshot",
  "tradingview-market-widget",
  "tradingview-loading-state",
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
expectText("src/app/(site)/prices/page.tsx", [
  "PriceContextGuide",
  "시세 이용 기준",
  "priceUseCards",
  "자동 참고 시세",
  "국제 현재가와 환산값은 시장 흐름 확인용입니다.",
  "getPriceAnnouncementDisplay",
  "기준 고시 예정",
]);
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
  "preCallChecks",
  "전화 전 확인",
  "무엇을 보유했나요?",
  "얼마나 있나요?",
  "어떻게 오시나요?",
]);
expectText("tests/site-fidelity.spec.ts", [
  "expectNoVisibleElementEscapesViewport",
  "expectMobileBottomBarDoesNotCover",
  "inquiry assistant answers safe questions and protects personal data",
  "admin prices exposes automatic price operation",
  "KRX Open API (승인 전 사용 불가)",
  'option[value="krx"]',
  "admin products uses a compact list-and-editor management surface",
  "이미지 성격",
  "이미지 확인 필터",
  "대표/생성",
  "실사진 확인 필요",
  "needs-real-photo",
  "replace-placeholder",
  "admin-product-row-14k-jewelry-buying",
  "admin-product-mobile-image-note-14k-jewelry-buying",
  "product quick links sync same-route category query",
  "고시가 / 3.75g 기준",
  "품목별로 볼 기준만 확인합니다.",
  "무엇을 보유했나요?",
  "처음 연락할 때 무엇부터 말하면 되나요?",
  "firstProductImageSources",
  "USD/KRW",
  "단위: 3.75g",
  "한국센터금거래소 상담원과 고객 상담 장면",
  "한국센터금거래소 골드바 상담용 대표 배너 이미지",
  "const explicitAdminPassword = process.env.KCG_TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD",
  'const adminPassword = explicitAdminPassword || (isExternalAuditUrl ? undefined : "0000")',
]);
expectNoText("tests/site-fidelity.spec.ts", ["KCG 순금 골드바 방문 상담 광고 배너", "시세 운영 및 방문 안내 공지"]);
expectText("src/lib/market-data.ts", [
  "https://gold-api.com/docs",
  "https://gold-api.com/terms",
  "https://www.metals.dev/docs",
  "KRX_BLOCKED_PROVIDER_REASON",
  "isBlockedKrxProviderPreference",
  "krx-open-api",
  "koscom",
  "순금 3.75g 참고가",
  "기사 제목·출처·날짜만 링크로 제공하며, 본문·이미지는 재게시하지 않습니다.",
]);
expectText("src/lib/price-auto.ts", [
  "getDefaultPriceAutoSettings",
  "buildPriceAutoSuggestionInput",
  "buildPriceUpdatesFromSuggestion",
  "roundToUnit",
  "goldSellPremiumRate",
  "maxAutoPublishChangePercent",
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
expectText("src/app/admin/prices/price-mode-workspace.tsx", [
  "지금 계산 실행",
  "검토 후 반영",
  "계산 기록 폐기",
]);
expectNoText("src/app/admin/prices/price-mode-workspace.tsx", ["{needsReview ? ("]);
expectText("src/app/api/admin/price-auto-refresh/route.ts", [
  "CRON_SECRET",
  "runPriceAutoRefresh",
]);
expectText("src/lib/price-auto-runner.ts", [
  "auto-fill-disabled",
  "not-due",
  "outside-business-hours",
  "24시간 이상 수동 시세 등록",
  "isManualRegistrationStale",
  "autoEnabledByStaleGuard",
  "small-change",
  "needs-review",
  "data-not-safe",
  "isKoreaBusinessTime",
]);
expectText("src/app/api/admin/price-auto-apply/route.ts", [
  "verifyAdminSession",
  "draft-not-found",
  "buildPriceUpdatesFromSuggestion",
]);
expectText("vercel.json", ["/api/admin/price-auto-refresh", "0 0 * * *"]);
expectNoText("src/lib/market-data.ts", blockedCompetitorEndpoints);
expectNoText("src/lib/market-data.ts", blockedMarketScrapingTerms);
expectNoText("src/lib/inquiry-assistant.ts", blockedCompetitorEndpoints);
expectNoText("src/lib/inquiry-assistant.ts", blockedMarketScrapingTerms);
expectNoText("src/app/api/inquiry-assistant/route.ts", blockedCompetitorEndpoints);
expectNoText("src/app/api/inquiry-assistant/route.ts", blockedMarketScrapingTerms);

expectText("src/lib/inquiry-assistant.ts", [
  "INQUIRY_ASSISTANT_PROVIDER",
  "OPENAI_API_KEY",
  "store: false",
  "containsPersonalContactInfo",
  "KRX 데이터는 승인·계약 범위",
  "Final transaction amount",
]);
expectText("src/components/inquiry/inquiry-assistant-widget.tsx", [
  "data-testid=\"inquiry-assistant-widget\"",
  "거래 상담 도우미",
  "/api/inquiry-assistant",
  "연락처·주민등록번호·카드정보는 입력하지 마세요.",
]);
expectText("src/app/api/inquiry-assistant/route.ts", [
  "answerInquiryAssistant",
  "getInquiryAssistantStatus",
  "자동 상담 안내를 불러오지 못했습니다.",
]);
expectText("src/app/(site)/layout.tsx", ["InquiryAssistantWidget"]);

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
  "상담",
]);
expectTextOrder("src/lib/site-config.ts", '{ href: "/about", label: "매장안내" }', '{ href: "/company", label: "회사소개" }');
expectText("src/lib/legal-info.ts", [
  "TEMP_BUSINESS_REGISTRATION_NUMBER",
  "000-00-00000",
  "오픈 전 교체 필요",
]);
expectText("src/lib/public-launch.ts", [
  "canExposeToSearch",
  "getPublicLaunchContentBlockers",
  "disabled-pending-approval",
  "isPublicSearchApproved",
]);
expectText("src/lib/launch-readiness.ts", [
  "사업자·법적 표시",
  "대표 도메인",
  "관리자 인증",
  "운영 데이터 저장소",
  "Cafe24 DNS",
  "KCG_PUBLIC_SEARCH_APPROVED",
]);
expectNoText("src/lib/launch-readiness.ts", ["Gabia", "Whois DNS"]);
expectText("src/app/robots.ts", ["canExposeToSearch"]);
expectText("src/app/sitemap.ts", ["canExposeToSearch"]);
expectText("src/app/layout.tsx", [
  "next/font/local",
  "PretendardVariable.woff2",
  "canExposeToSearch",
  "summary_large_image",
  "kcg-generated-goldbar-banner-20260508.webp",
  "application/ld+json",
  "JewelryStore",
  "sameAs",
]);
expectNoText("src/app/layout.tsx", ["next/font/google", "IBM_Plex_Sans_KR", "Inter({"]);
expectText("src/app/api/health/route.ts", [
  "launchReadiness",
  "getSearchExposureStatus",
  "searchApprovalRequired",
  "searchApproved",
  "forceNoindex",
  "marketBlockedProvider",
  "marketBlockedProviderReason",
  "krxProviderApprovalStatus",
  "blocked-pending-approval",
  "inquiryAssistantMode",
  "inquiryAssistantStoresMessages",
  "inquiryAssistantCollectsPersonalData",
]);
expectText("scripts/check-external-services.mjs", [
  "searchApproved",
  "forceNoindex",
  "indexing=enabled without searchApproved=true",
]);
expectText("scripts/check-live-release-state.mjs", [
  "live behind source",
  "search approval health fields",
  "search exposure guard",
]);
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
  expectNoText(relativePath, ["B2C 방문 상담", "순금·골드바 방문 상담"]),
);
expectText("src/app/admin/login/page.tsx", ["missing-env", "ADMIN_PASSWORD"]);
expectNoText("src/app/admin/login/page.tsx", ["preview-default", "adminPreviewPassword"]);
expectText("src/app/admin/launch/page.tsx", [
  "dynamic = \"force-dynamic\"",
  "오픈 전 점검판",
  "임시값은 화면에 보이더라도",
  "data-testid=\"admin-release-stage-map\"",
  "운영 상태 구분",
  "소스 QA",
  "라이브 리뷰 반영",
  "공개 검색 런칭",
  "npm run check:release-state",
  "robots/noindex 유지",
  "지금 미리 가능한 준비",
  "공개 직전 별도 승인 필요",
  "data-testid=\"admin-public-launch-approval\"",
  "text-[#5f2721]",
  "Cafe24 도메인 연결 절차",
  "KRX 데이터는 승인·계약 범위 확인 전 production 미사용",
  "KCG_PUBLIC_SEARCH_APPROVED=1 명시 승인 env 설정",
  "Production 배포 승인",
  "robots/noindex 해제와 검색 색인 승인",
]);
expectText("src/app/admin/layout.tsx", ["/admin/launch", "오픈 점검"]);
expectText("src/app/admin/layout.tsx", ["admin-light", "한국센터금거래소 운영 콘솔"]);
expectText("src/app/admin/page.tsx", [
  "오늘 먼저 확인할 것",
  "시세 운영",
  "검토 대기",
  "상품 공개 수",
  "운영자가 바로 눌러야 할 메뉴",
  "헷갈리면 이것만 기준",
]);
expectText("src/app/admin/prices/page.tsx", [
  "자동시세 ON이면 산식과 안전 기준",
  "AdminPricesWorkspace",
  "auto-on-saved",
  "auto-off-saved",
]);
expectText("src/app/admin/prices/price-mode-workspace.tsx", [
  "자동시세 ON",
  "자동시세 OFF",
  "data-testid=\"admin-price-mode-switch\"",
  "data-testid=\"admin-price-auto-panel\"",
  "자동 계산 공식",
  "국제 금 3.75g 환산가",
  "자동 게시 허용 변동폭",
  "최소 반영 금액",
  "KRX Open API (승인 전 사용 불가)",
  "KRX는 승인·계약 범위 확인 전 선택할 수 없습니다.",
  "지금 계산 실행",
  "계산 설정 열기",
  "저장 상태:",
  "AdminActionFeedback",
  "검토 후 반영",
  "저장 중...",
  "계산 중...",
  "반영 중...",
  "nextIsAutoOn",
  "enabled={nextIsAutoOn}",
  "mode={nextIsAutoOn ? \"auto_publish\" : \"manual_review\"}",
]);
expectNoText("src/app/admin/prices/price-mode-workspace.tsx", [
  "대표가 직접 넣는",
  "자동입력 사용",
  "선택한 모드 저장",
  "Formula",
  "Auto Run",
  "type=\"checkbox\" defaultChecked={settings.isEnabled}",
  "최대 자동 변동률",
  "세부 설정 수정",
  "초안 적용",
  "지금 자동 확인",
  "버튼을 누르면 바로 저장됩니다",
  "드래프트",
  "onModeChange(!isAutoOn)",
  "enabled={isAutoOn}",
  "mode={isAutoOn",
]);
expectText("src/components/layout/site-footer.tsx", [
  "getBusinessRegistrationDisplay",
  "getLegalPlaceholderNotice",
]);
expectText("src/app/(site)/about/page.tsx", [
  "siteConfig.locations",
  "/campaign/kcg-home-seoul-retail-20260506.webp",
  "위치, 전화, 준비 항목만 먼저 확인합니다.",
  "거래 전 준비 항목",
  "visitPrepCards",
  "본사 전화",
]);

expectText("src/app/(site)/services/page.tsx", [
  "/campaign/kcg-old-gold-process-20260506.webp",
  "품목 확인, 고시 기준, 실물 확인",
  "serviceFaqs",
  "거래 기준",
  "필요한 항목만 빠르게 확인합니다.",
  "자주 묻는 기준",
  "상품/매입 보기",
]);
expectText("src/app/(site)/products/page.tsx", [
  "상품/매입",
  "/products/kcg-generated-goldbar-lineup-20260508.webp",
  "탭에서 품목을 고르고 기준가를 확인합니다.",
  "골드바, 실버바, 순금제품, 고금 매입 항목을 바로 볼 수 있습니다.",
  "decisionPaths",
  "내가 팔 때 기준과 실물 확인 항목을 먼저 봅니다.",
  "품목 목록, 예상 수량, 희망 일정을 정리합니다.",
  "ProductCatalog",
]);
expectText("src/app/(site)/products/[slug]/page.tsx", [
  "getProductPriceDisplay",
  "문의 전 확인하면 상담이 빨라집니다",
  "전화 문의",
]);
expectText("src/app/(site)/company/page.tsx", [
  "/campaign/kcg-home-human-consultation-20260506.webp",
  "한국센터금거래소 회사소개 상담 장면 이미지",
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
  "처음 연락할 때 무엇부터 말하면 되나요?",
  "보증서나 영수증이 없으면 진행이 어렵나요?",
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
  "kcg-generated-goldbar-banner-20260508.webp",
  "kcg-old-gold-process-20260506.webp",
  "kcg-product-corporate-consulting-20260506.webp",
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
  "legacyProductImageReplacements",
  "replaceablePlaceholderImages",
  "kcg-generated-goldbar-lineup-20260508.webp",
  "kcg-generated-goldbar-detail-20260508.webp",
  "kcg-generated-goldbar-banner-20260508.webp",
  "kcg-product-minimal-bars-20260506.webp",
  "kcg-product-gold-silver-catalog-20260503.webp",
  "kcg-home-product-keyvisual-20260503.webp",
  "kcg-product-jewelry-buying-20260503.webp",
  "kcg-product-b2b-consulting-20260503.webp",
  "kcg-b2b-gift-packaging-20260430.webp",
  "kcg-silver-gift-20260427-v2.jpg",
  "kcg-product-pure-gold-gifts-20260506.webp",
  "kcg-old-gold-process-20260506.webp",
  "kcg-product-corporate-consulting-20260506.webp",
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
  "/products/kcg-generated-goldbar-lineup-20260508.webp",
  "/products/kcg-generated-goldbar-detail-20260508.webp",
  "/campaign/kcg-generated-goldbar-banner-20260508.webp",
  "/products/kcg-product-minimal-bars-20260506.webp",
  "/products/kcg-product-gold-silver-catalog-20260503.webp",
  "/campaign/kcg-home-product-keyvisual-20260503.webp",
  "/products/kcg-product-jewelry-buying-20260503.webp",
  "/products/kcg-product-b2b-consulting-20260503.webp",
  "/products/kcg-silver-gift-20260427-v2.jpg",
  "/products/kcg-product-pure-gold-gifts-20260506.webp",
  "/campaign/kcg-old-gold-process-20260506.webp",
  "/products/kcg-product-corporate-consulting-20260506.webp",
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
  "/products/kcg-generated-goldbar-lineup-20260508.webp",
  "/products/kcg-generated-goldbar-detail-20260508.webp",
  "/campaign/kcg-generated-goldbar-banner-20260508.webp",
  "/products/kcg-product-gold-silver-catalog-20260503.webp",
  "/campaign/kcg-home-product-keyvisual-20260503.webp",
  "/products/kcg-product-jewelry-buying-20260503.webp",
  "/products/kcg-product-b2b-consulting-20260503.webp",
  "/products/kcg-b2b-gift-packaging-20260430.webp",
  "/products/kcg-silver-gift-20260427-v2.jpg",
  "/products/kcg-product-pure-gold-gifts-20260506.webp",
  "/campaign/kcg-old-gold-process-20260506.webp",
  "/products/kcg-product-corporate-consulting-20260506.webp",
]);
expectText("supabase/seed.sql", [
  "KCG 골드바 1g",
  "KCG 골드바 3.75g",
  "KCG 실버바 1kg",
  "순금 돌반지 3.75g",
  "18K 주얼리 매입",
  "귀금속 매입 절차 안내",
  "/products/kcg-generated-goldbar-lineup-20260508.webp",
  "/products/kcg-generated-goldbar-detail-20260508.webp",
  "/campaign/kcg-generated-goldbar-banner-20260508.webp",
  "/products/kcg-product-gold-silver-catalog-20260503.webp",
  "/campaign/kcg-home-product-keyvisual-20260503.webp",
  "/products/kcg-product-jewelry-buying-20260503.webp",
  "/products/kcg-product-b2b-consulting-20260503.webp",
  "/products/kcg-b2b-gift-packaging-20260430.webp",
  "/products/kcg-silver-gift-20260427-v2.jpg",
  "/products/kcg-product-pure-gold-gifts-20260506.webp",
  "/products/kcg-product-corporate-consulting-20260506.webp",
  "/campaign/kcg-old-gold-process-20260506.webp",
]);
expectText("src/types/product.ts", ["displayOrder", "priceLabel", "ProductUpsertInput", "ProductPriceBasis", "pure_gold"]);
expectText("src/actions/product-actions.ts", ["upsertProductAction", "revalidatePath(\"/products\")", "priceBasis", "weightGrams"]);
expectText("src/app/admin/products/page.tsx", [
  "상품 관리",
  "ProductManagementTable",
  "ProductImageFilterPanel",
  "data-testid=\"admin-product-table\"",
  "data-testid=\"admin-product-image-filter\"",
  "getImageProvenance",
  "이미지 성격",
  "이미지 확인 필터",
  "대표/생성",
  "실사진 확인 필요",
  "needs-real-photo",
  "replace-placeholder",
  "admin-product-row-${product.slug}",
  "admin-product-mobile-image-note-${product.slug}",
  "/products/kcg-generated-goldbar-lineup-20260508.webp",
  "/products/kcg-generated-goldbar-detail-20260508.webp",
  "/campaign/kcg-generated-goldbar-banner-20260508.webp",
  "/products/kcg-jewelry-buying-tray-20260430.webp",
  "실사진은 파일명만으로 확정하지 않습니다.",
  "편집 열기",
  "연동 시세",
  "중량(g)",
  "상담 기준 공임",
  "수동 가격",
  "upsertProductAction",
]);
expectNoText("src/app/admin/products/page.tsx", [
  'imageUrl.startsWith("/products/kcg-")',
  'imageUrl.startsWith("/campaign/")',
]);
expectText("supabase/schema.sql", [
  "price_daily_snapshots",
  "change_origin",
  "metadata jsonb",
  "stale_guard_enabled",
  "stale_after_hours",
  "시스템: 기준 시세 보관",
  "price_auto_settings",
  "price_auto_suggestions",
  "gold_sell_premium_rate",
  "max_auto_publish_change_percent",
  "min_apply_change_won",
  "check_interval_minutes",
  "when interval_hours = 2 then 120",
  "business_hours_only",
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
  "npm run qa:site",
  "docs/quality/official-docs-index.md",
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
  '"audit:rendered": "node scripts/run-rendered-site-audit.mjs"',
  '"tasks:dashboard": "node scripts/render-open-tasks-dashboard.mjs"',
  '"screenshot:site": "node scripts/capture-site-screenshots.mjs"',
  '"qa:site": "node scripts/run-site-qa.mjs"',
]);
expectText("playwright.config.ts", ["nextEnv.loadEnvConfig(process.cwd())", "process.env.SITE_AUDIT_URL"]);
expectText("tests/site-fidelity.spec.ts", [
  "/admin/launch",
  "/admin/announcements",
  "공개 직전 별도 승인 필요",
  "expectReadableTextContrast",
  "persistent chrome does not cover first-viewport decision content",
  "site-header",
]);
expectText("src/components/layout/site-header.tsx", ['data-testid="site-header"']);
expectText("scripts/capture-site-screenshots.mjs", [
  "/admin/launch",
  "home-mobile-viewport.png",
  "home-desktop-viewport.png",
  "prices-mobile-viewport.png",
  "products-mobile-viewport.png",
  "services-mobile-viewport.png",
  "admin-launch-mobile.png",
  "admin-launch-desktop.png",
  "admin-prices-manual-desktop.png",
  "admin-prices-auto-desktop.png",
  "admin-prices-auto-mobile.png",
  "admin-announcements-desktop.png",
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
  "Full-page screenshots can show sticky headers or fixed mobile CTAs",
  "npm run audit:rendered",
  "npm run qa:site",
  "docs/quality/product-experience-rubric.md",
  "docs/quality/ai-site-production-playbook.md",
  "Proactive Launch Steward Review",
  "Adaptive Expert Panel",
  "Role Discovery Pass",
  "Deployment/status owner",
  "Rollback operator",
  "디자이너",
  "웹설계 전문가",
  "금거래소 베테랑 직원",
  "docs/setup/CHANGELOG.md",
]);
expectText("docs/quality/official-docs-index.md", [
  "OpenAI Codex AGENTS.md guidance",
  "Next.js App Router",
  "Playwright screenshots and visual comparisons",
  "Tailwind CSS v4 theme variables",
  "Vercel environment variables",
  "Supabase docs",
  "KRX Open API service method",
  "KRX Open API terms",
  "Koscom market data service",
]);
expectText(".agents/skills/kcg-site-quality/SKILL.md", [
  "description: Use in the KCG site repo",
  "npm run qa:site",
  "0 skipped",
  "Deploy completed, verified KCG site changes",
  "Proactive Launch Steward Review",
  "docs/setup/CHANGELOG.md",
]);
expectText("code_review.md", [
  "Price-first hierarchy",
  "Mobile first viewport",
  "Rendered audit must complete with `0 skipped`",
  "Do not request broad refactors",
]);
expectText("docs/quality/data-source-compliance.md", [
  "Gold API",
  "Metals.Dev",
  "KRX OPEN API",
  "KRX Use Boundary",
  "Koscom",
  "MARKET_DATA_PROVIDER=krx",
  "KRX_API_APPROVAL_RUNBOOK.md",
  "Google News RSS-style URLs",
  "Do not add scraping of third-party sites",
  "Competitor API Observation Rule",
  "KCG must not call, scrape, proxy, cache, republish, or chart competitor internal endpoints",
  "KRX-specific blocked shortcuts",
  "Do not extract TradingView widget data",
  "거래 상담 도우미",
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
  "docs/setup/CHANGELOG.md",
  "Adaptive Expert Panel",
  "Role Discovery Pass",
  "디자이너",
  "웹설계 전문가",
  "금거래소 베테랑 직원",
  "Proactive Completion Questions",
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
expectCurrentHandoffMatchesLatestRelease();
expectText("docs/setup/CURRENT_HANDOFF.md", [
  "npm run screenshot:admin",
  "Reflection status: `v0.2.29` applies generated KCG-style gold-bar representative assets",
  "Reflection status: `v0.2.28` makes the public catalog safer before real-photo approval",
  "상담용 대표 이미지",
  "actual product photo, packaging, stock, crop, and final-use decisions",
  "Reflection status: `v0.2.27` maps current public product image usage",
  "docs/brand/product-image-replacement-map-2026-05-08.md",
  "generated separate representative WebP assets",
  "raw KakaoTalk filenames",
  "Reflection status: `v0.2.26` makes KCG image replacement safer before public use",
  "docs/brand/kcg-image-intake-2026-05-08.md",
  "raw KakaoTalk filenames",
  "Gold-bar product/catalog surfaces use",
  "Other category surfaces still distribute approved placeholders by slug",
  "KCG_ACCOUNT_OWNERSHIP_CHECKLIST.md",
  "KRX_API_APPROVAL_RUNBOOK.md",
  "docs/setup/CHANGELOG.md",
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
  "Junyoung has approved deploying completed, verified KCG site changes by default",
  "temporary personal-Hobby deployment",
  "temporary personal-Hobby deployment",
  "junyoung8753-2361s-projects/kcg-confirm-preview",
  "company Vercel/Supabase ownership transfer",
  "Current image source folder",
  "kcg-generated-goldbar-banner-20260508.webp",
  "kcg-old-gold-process-20260506.webp",
  "505-88-03567",
  "The home carousel now starts with `kcg-generated-goldbar-banner-20260508.webp`",
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
  "KCG-TODO-045",
  "KCG-TODO-048",
  "KCG-TODO-049",
  "KCG-TODO-050",
  "KCG-TODO-059",
  "KCG-TODO-060",
  "KCG-TODO-061",
  "KCG-TODO-062",
  "KCG-TODO-063",
  "KCG-TODO-064",
  "KCG-TODO-065",
  "KCG-TODO-066",
  "KCG-TODO-067",
  "KCG-TODO-068",
  "KCG-TODO-069",
  "KCG-TODO-070",
  "KCG-TODO-071",
  "KCG-TODO-072",
  "KCG-TODO-074",
  "KCG-TODO-075",
  "KCG-TODO-076",
  "KCG-TODO-077",
  "KCG-TODO-078",
  "KCG-TODO-079",
  "KCG-TODO-080",
  "product image replacement map",
  "public product images as representative",
  "상담용 대표 이미지",
  "KCG-TODO-054",
  "admin product image provenance",
  "admin launch release-stage visibility",
  "admin product image follow-up filters",
  "mobile admin product image evidence",
  "KCG image intake classification guardrail",
  "raw KakaoTalk filenames",
  "실사진 확인 필요",
  "KRX_API_APPROVAL_RUNBOOK.md",
  "KCG_ACCOUNT_OWNERSHIP_CHECKLIST.md",
  "temporary free deploy path",
  "junyoung8753-2361s-projects/kcg-confirm-preview",
  "Korea Center Gold Exchange",
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
expectText("docs/setup/AUTO_PRICE_OPERATIONS_BRIEF.md", [
  "KCG Automatic Price Operations Brief",
  "Gold API",
  "KCG internal formula",
  "Vercel Hobby",
  "once per day",
  "Vercel Pro",
  "external scheduler",
  "KRX / Koscom Approval-First Boundary",
  "MARKET_DATA_PROVIDER=krx",
  "no competitor scraping",
  "company approval",
]);
expectText("docs/setup/KRX_API_APPROVAL_RUNBOOK.md", [
  "approval first",
  "kcgoldx@gmail.com",
  "법인은 사업자 정보 등록",
  "KRX_OPEN_API_KEY",
  "MARKET_DATA_PROVIDER=krx",
  "한국센터금거래소 내부 시세 산정 참고용",
  "Do not paste API keys",
]);
expectText("docs/setup/CONTACT_CHANNELS_RUNBOOK.md", [
  "KCG Contact Channels Runbook",
  "카카오톡 문의",
  "거래 상담 도우미",
  "SMS staff alerts require",
  "kakaoChatUrl",
  "developers.kakao.com",
]);
expectNoText("docs/setup/OPEN_TASKS.md", ["Gabia", "Whois DNS"]);
expectText("docs/setup/DOMAIN_SUPABASE_MARKET_RUNBOOK.md", [
  "Cafe24 And Vercel Domain Connection",
  "Vercel project: `kcg-confirm-preview`",
  "Preserve existing MX/TXT/SPF/DKIM records",
  "SUPABASE_SERVICE_ROLE_KEY=<server-only secret>",
  "Gold API free current prices",
  "KRX boundary",
  "MARKET_DATA_PROVIDER=krx",
  "KRX_API_APPROVAL_RUNBOOK.md",
  "Completed, verified KCG site source/UI changes may be deployed",
]);
expectText("docs/setup/PRODUCT_OPERATIONS_CHECKLIST.md", [
  "consultation-first catalog",
  "/admin/products",
  "현재 고시가 기준 참고가",
  "Real Photo Replacement Priority",
  "docs/brand/product-image-replacement-map-2026-05-08.md",
  "상담용 대표 이미지",
  "Do not use `구매하기`, `결제하기`, `주문하기`, `장바구니`",
]);
expectText("src/components/products/product-catalog.tsx", [
  "상담용 대표 이미지",
  "실물 색상과 패키지는 현장 확인 후 안내합니다.",
]);
expectText("src/app/(site)/products/[slug]/page.tsx", [
  "상담용 대표 이미지",
  "실제 상품 사진·포장·재고는 전화 상담과 현장 확인 후 안내합니다.",
]);
expectText("tests/site-fidelity.spec.ts", [
  "public product images are labeled as representative before real-photo approval",
  "실물 색상과 패키지는 현장 확인 후 안내",
  "실제 상품 사진·포장·재고는 전화 상담과 현장 확인 후 안내합니다.",
]);
expectText("docs/setup/LAUNCH_BRIEFING.md", [
  "가격 확인 → 상품/매입 범위 확인 → 전화 문의 → 본사·매장 확인",
  "Search exposure is still blocked",
  "Metals.Dev is not mandatory now",
  "Do not treat domain connection or production deployment as public launch approval",
]);
expectText("docs/quality/kcg-10000-point-qa-scorecard.md", [
  "KCG 10000-Point QA Scorecard",
  "Public Site: 10000 Points",
  "Admin Console: 10000 Points",
  "Overall Launch Candidate Score",
]);
expectText("docs/setup/QA_REPORT_2026-05-05.md", [
  "KCG QA Report - 2026-05-05",
  "Public site",
  "Admin console",
  "Weighted launch candidate",
  "Issues Found And Fixed In This Pass",
]);
expectText("docs/brand/campaign-image-prompts.md", [
  "Source Folder",
  "KakaoTalk_20260427_125126082_01.png",
  "ChatGPT Image 2026년 4월 27일 오후 01_02_09.png",
  "kcg-home-price-desk-20260506.webp",
  "public/image-options/2026-05-03",
  "contact sheets",
  "optimized `.webp` versions",
  "Wikimedia Commons",
  "Do not copy private document photos",
  "Natural tiny bar engravings",
  "Home main slide banner",
  "large white haze",
  "Old gold and jewelry buying card",
  "No readable personal documents",
]);
expectText("docs/brand/kcg-image-intake-2026-05-08.md", [
  "KCG Image Intake 2026-05-08",
  "C:\\Users\\junyo\\Documents\\File-Hub\\30_Media\\Images\\KCG 이미지",
  "metadata and visual review only",
  "No raw source files were copied into `public/`",
  "KakaoTalk_20260427_125126082.png",
  "KakaoTalk_20260427_125126082_01.png",
  "KakaoTalk_20260508_091553653.png",
  "KakaoTalk_20260508_091603752.jpg",
  "KakaoTalk_20260508_110154617.jpg",
  "logo candidate",
  "gold-bar product-photo candidate",
  "approval required",
  "Do not use as final product proof",
]);
expectText("docs/brand/product-image-replacement-map-2026-05-08.md", [
  "Product Image Replacement Map 2026-05-08",
  "KCG-TODO-054",
  "No public image was replaced",
  "approval-first",
  "current public image",
  "recommended KCG candidate group",
  "KakaoTalk_20260508_091603752.jpg",
  "KakaoTalk_20260508_091553653.png",
  "do not use raw KakaoTalk filenames in public paths",
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
expectNoRegex("2-preview-deploy.cmd", [/(^|[\s;&])ADMIN_PASSWORD\s*=/m, /(^|[\s;&])ADMIN_SESSION_SECRET\s*=/m]);
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
    "국제 금속 차트 보기",
  ]);
  await expectUrl("/services", [
    "품목 확인, 고시 기준, 실물 확인",
    "매입 가능 품목",
    "처음 연락할 때 무엇부터 말하면 되나요?",
    "자주 묻는 기준",
  ]);
  await expectUrl("/products", [
    "상품/매입",
    "내가 팔 때 기준과 실물 확인 항목을 먼저 봅니다.",
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
    "무엇을 보유했나요?",
    "국제 현재가",
    "TradingView 제공",
  ]);
  await expectUrl("/about", [
    "본사 전화",
    "네이버 지도",
    "카카오맵",
    "위치, 전화, 준비 항목만 먼저 확인합니다.",
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
