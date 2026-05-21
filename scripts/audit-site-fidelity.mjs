import { createHash } from "node:crypto";
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

const imageSourceTypes = new Set(["A1", "A2", "A3", "B", "C", "D", "E", "F"]);
const imageApprovalStatuses = new Set(["approved", "candidate", "rejected", "quarantined", "needs_review"]);
const allowedImageUsages = new Set([
  "admin_reference",
  "b2b_category",
  "brand_identity",
  "candidate_preview",
  "category_card",
  "company_hero",
  "hero",
  "notice_template",
  "product_card",
  "product_detail",
  "product_guide",
  "product_placeholder",
  "quarantine_reference",
  "service_hero",
  "social_preview",
  "store_guide_hero",
]);
const allowedSkuMatches = new Set(["exact", "lineup", "category_only", "not_applicable", "pending", "needs_review", "mismatch"]);
const operationalImageSourceFiles = [
  "src/app/layout.tsx",
  "src/app/(site)/products/page.tsx",
  "src/app/(site)/services/page.tsx",
  "src/app/(site)/about/page.tsx",
  "src/app/(site)/company/page.tsx",
  "src/components/market/price-lineup.tsx",
  "src/components/products/product-catalog.tsx",
];
const generatedCandidatePrefix = "/assets/generated/candidates/";
const generatedApprovedPrefix = "/assets/generated/approved/";
const operationalUsageNames = new Set([
  "b2b_category",
  "brand_identity",
  "category_card",
  "company_hero",
  "hero",
  "notice_template",
  "product_card",
  "product_detail",
  "product_guide",
  "product_placeholder",
  "service_hero",
  "social_preview",
  "store_guide_hero",
]);
const requiredManifestFields = [
  "asset_id",
  "file_path",
  "image_source_type",
  "approval_status",
  "allowed_usage",
  "related_sku",
  "sku_match",
  "page_usage",
  "section_usage",
  "alt_text",
  "aspect_ratio",
  "mobile_crop_rule",
  "hash_or_checksum",
  "notes",
];

function sha256ForPublicPath(publicPath) {
  const absolutePath = resolve(rootDir, "public", publicPath.replace(/^\//, ""));
  if (!existsSync(absolutePath)) return null;
  const hash = createHash("sha256");
  hash.update(readFileSync(absolutePath));
  return `sha256:${hash.digest("hex")}`;
}

function readJson(relativePath) {
  const text = readText(relativePath);
  if (text === null) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    record(failures, "json parse", `${relativePath} could not be parsed: ${error.message}`);
    return null;
  }
}

function expectStringArray(value, relativePath, index, fieldName) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    record(failures, "image manifest schema", `${relativePath}[${index}].${fieldName} must be a string array`);
    return false;
  }

  return true;
}

function collectPublicImageReferences(relativePaths) {
  const imagePattern = /["'`](\/(?:assets\/generated|brand|campaign|company|products|services)\/[^"'`]+\.(?:avif|gif|jpe?g|png|svg|webp))["'`]/gi;
  const references = new Set();

  for (const relativePath of relativePaths) {
    const text = readText(relativePath);
    if (text === null) {
      record(failures, "missing file", relativePath);
      continue;
    }

    for (const match of text.matchAll(imagePattern)) {
      references.add(match[1]);
    }
  }

  return references;
}

function validateImageAssetManifest() {
  const relativePath = "src/data/imageAssetManifest.json";
  const manifest = readJson(relativePath);
  if (!manifest) return;

  if (!Array.isArray(manifest)) {
    record(failures, "image manifest schema", `${relativePath} must be a JSON array`);
    return;
  }

  const assetIds = new Set();
  const filePaths = new Set();
  const manifestByPath = new Map();

  manifest.forEach((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      record(failures, "image manifest schema", `${relativePath}[${index}] must be an object`);
      return;
    }

    for (const fieldName of requiredManifestFields) {
      if (!(fieldName in entry)) {
        record(failures, "image manifest schema", `${relativePath}[${index}] is missing ${fieldName}`);
      }
    }

    if (typeof entry.asset_id !== "string" || !entry.asset_id.trim()) {
      record(failures, "image manifest schema", `${relativePath}[${index}].asset_id must be a non-empty string`);
    } else if (assetIds.has(entry.asset_id)) {
      record(failures, "image manifest schema", `${relativePath} duplicate asset_id ${entry.asset_id}`);
    } else {
      assetIds.add(entry.asset_id);
    }

    if (typeof entry.file_path !== "string" || !entry.file_path.trim()) {
      record(failures, "image manifest schema", `${relativePath}[${index}].file_path must be a non-empty string`);
    } else if (filePaths.has(entry.file_path)) {
      record(failures, "image manifest schema", `${relativePath} duplicate file_path ${entry.file_path}`);
    } else {
      filePaths.add(entry.file_path);
      manifestByPath.set(entry.file_path, entry);
    }

    if (!imageSourceTypes.has(entry.image_source_type)) {
      record(failures, "image manifest schema", `${relativePath}[${index}].image_source_type=${entry.image_source_type}`);
    }

    if (!imageApprovalStatuses.has(entry.approval_status)) {
      record(failures, "image manifest schema", `${relativePath}[${index}].approval_status=${entry.approval_status}`);
    }

    if (!allowedSkuMatches.has(entry.sku_match)) {
      record(failures, "image manifest schema", `${relativePath}[${index}].sku_match=${entry.sku_match}`);
    }

    for (const fieldName of ["allowed_usage", "related_sku", "page_usage", "section_usage"]) {
      expectStringArray(entry[fieldName], relativePath, index, fieldName);
    }

    if (Array.isArray(entry.allowed_usage)) {
      for (const usage of entry.allowed_usage) {
        if (!allowedImageUsages.has(usage)) {
          record(failures, "image manifest schema", `${relativePath}[${index}].allowed_usage has ${usage}`);
        }
      }
    }

    for (const fieldName of ["alt_text", "aspect_ratio", "mobile_crop_rule", "hash_or_checksum", "notes"]) {
      if (typeof entry[fieldName] !== "string") {
        record(failures, "image manifest schema", `${relativePath}[${index}].${fieldName} must be a string`);
      }
    }

    if (typeof entry.file_path === "string" && entry.file_path.startsWith(generatedCandidatePrefix)) {
      if (entry.approval_status === "approved") {
        record(failures, "candidate asset approved", `${entry.file_path} is in candidates but marked approved`);
      }

      const hasOperationalUsage = Array.isArray(entry.allowed_usage)
        ? entry.allowed_usage.some((usage) => operationalUsageNames.has(usage))
        : false;
      if (hasOperationalUsage) {
        record(failures, "candidate asset usage", `${entry.file_path} has operational allowed_usage`);
      }
    }

    if (typeof entry.file_path === "string" && entry.file_path.startsWith(generatedApprovedPrefix)) {
      if (entry.approval_status !== "approved") {
        record(failures, "approved asset status", `${entry.file_path} is in approved but status=${entry.approval_status}`);
      }
    }

    if (entry.image_source_type === "A3" && entry.approval_status === "approved") {
      record(failures, "unverified product image", `${entry.file_path} is A3 but approved`);
    }

    if (typeof entry.file_path === "string" && entry.file_path.startsWith("/")) {
      const absolutePath = resolve(rootDir, "public", entry.file_path.replace(/^\//, ""));
      if (!existsSync(absolutePath)) {
        record(failures, "image manifest file", `${entry.file_path} does not exist under public`);
      }

      if (typeof entry.hash_or_checksum === "string" && entry.hash_or_checksum.startsWith("sha256:")) {
        const actualHash = sha256ForPublicPath(entry.file_path);
        if (actualHash && actualHash !== entry.hash_or_checksum) {
          record(
            failures,
            "image manifest checksum",
            `${entry.file_path} hash ${actualHash} does not match manifest ${entry.hash_or_checksum}`,
          );
        }
      }
    }
  });

  for (const reference of collectPublicImageReferences(operationalImageSourceFiles)) {
    if (reference.startsWith(generatedCandidatePrefix)) {
      record(failures, "candidate asset active", `${reference} is referenced by an operational page`);
      continue;
    }

    const entry = manifestByPath.get(reference);
    if (!entry) {
      record(failures, "missing manifest asset", `${reference} is referenced by operational code but absent from manifest`);
      continue;
    }

    if (entry.approval_status !== "approved") {
      record(
        failures,
        "non-approved active asset",
        `${reference} is referenced by operational code but status=${entry.approval_status}`,
      );
    }
  }

  record(passes, "image manifest", `${relativePath} validated ${manifest.length} entries`);
}

function readGoldbarLockSnapshot() {
  const relativePath = "docs/audit/goldbar-sku-image-lock-snapshot.md";
  const text = readText(relativePath);
  if (text === null) {
    record(failures, "missing file", relativePath);
    return [];
  }

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.includes("/products/"))
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 6 && cells[1] && cells[2] && cells[3])
    .map((cells) => ({
      sku: cells[1],
      path: cells[2],
      checksum: cells[3],
      type: cells[4],
      status: cells[5],
    }));
}

function validateGoldbarSkuImageLockSnapshot() {
  const snapshotRows = readGoldbarLockSnapshot();
  if (snapshotRows.length === 0) {
    record(failures, "goldbar image lock", "snapshot has no lock rows");
    return;
  }

  const lockedSkus = new Set(snapshotRows.map((row) => row.sku));
  for (const expectedSku of [
    "kcg-gold-bar-1g",
    "investment-gold-bar-consulting",
    "kcg-gold-bar-10g",
    "kcg-gold-bar-37-5g",
    "kcg-gold-bar-100g",
    "goldbar-don-guide-1don",
    "goldbar-don-guide-2don",
    "goldbar-don-guide-3don",
    "goldbar-don-guide-5don",
    "goldbar-don-guide-10don",
    "bulk-gold-bar-consulting",
  ]) {
    if (!lockedSkus.has(expectedSku)) {
      record(failures, "goldbar image lock", `missing locked sku ${expectedSku}`);
    }
  }

  for (const row of snapshotRows) {
    if (!row.path.startsWith("/products/")) {
      record(failures, "goldbar image lock", `${row.sku} path must stay under /products/: ${row.path}`);
      continue;
    }

    if (row.status !== "approved") {
      record(failures, "goldbar image lock", `${row.sku} status must be approved`);
    }

    if (!["A1", "A2"].includes(row.type)) {
      record(failures, "goldbar image lock", `${row.sku} image_source_type must be A1 or A2`);
    }

    const actualChecksum = sha256ForPublicPath(row.path);
    if (!actualChecksum) {
      record(failures, "goldbar image lock", `${row.sku} locked file missing: ${row.path}`);
      continue;
    }

    if (actualChecksum !== row.checksum) {
      record(
        failures,
        "goldbar image lock",
        `${row.sku} ${row.path} hash ${actualChecksum} does not match snapshot ${row.checksum}`,
      );
    }
  }

  record(passes, "goldbar image lock", `validated ${snapshotRows.length} locked source image rows`);
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

async function expectUrlRobotsMeta(pathname, expectedDirectives) {
  const url = new URL(pathname, siteUrl);
  const response = await fetch(url);

  if (!response.ok) {
    record(failures, "robots meta route", `${url.href} returned ${response.status}`);
    return;
  }

  const body = await response.text();
  const robotsContent = body.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] ?? "";
  const googleBotContent = body.match(/<meta\s+name="googlebot"\s+content="([^"]+)"/i)?.[1] ?? "";

  for (const directive of expectedDirectives) {
    if (!robotsContent.includes(directive) && !googleBotContent.includes(directive)) {
      record(failures, "robots meta", `${url.href} missing ${directive}`);
    } else {
      record(passes, "robots meta", `${url.href} includes ${directive}`);
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
  "public/campaign/kcg-real-goldbar-price-desk-20260511.webp",
  "public/campaign/kcg-korean-consultation-hands-20260511.webp",
  "public/campaign/kcg-real-opening-campaign-20260511.webp",
  "public/campaign/kcg-real-goldbar-promo-banner-20260513.webp",
  "public/campaign/kcg-approved-goldbar-lineup-reflection-20260517.jpg",
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
  "public/products/kcg-b2b-gift-packaging-20260430.png",
  "public/products/kcg-b2b-gift-packaging-20260430.webp",
  "public/products/kcg-real-goldbar-lineup-20260511.webp",
  "public/products/kcg-real-goldbar-detail-20260511.webp",
  "public/products/kcg-real-goldbar-single-20260511.webp",
  "public/products/kcg-real-goldbar-don-lineup-20260511-v2.webp",
  "public/products/kcg-real-goldbar-1don-20260511.webp",
  "public/products/kcg-real-goldbar-2don-20260511.webp",
  "public/products/kcg-real-goldbar-3don-20260511.webp",
  "public/products/kcg-real-goldbar-5don-20260511.webp",
  "public/products/kcg-real-goldbar-10don-20260511.webp",
  "public/products/kcg-real-photo-goldbar-lineup-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-1don-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-2don-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-3don-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-5don-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-10don-20260514.jpg",
  "public/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
  "public/products/kcg-approved-goldbar-1don-20260517.jpg",
  "public/products/kcg-approved-goldbar-2don-20260517.jpg",
  "public/products/kcg-approved-goldbar-3don-20260517.jpg",
  "public/products/kcg-approved-goldbar-5don-20260517.jpg",
  "public/products/kcg-approved-goldbar-10don-20260517.jpg",
  "public/products/kcg-real-photo-goldbar-product-1g-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-product-3-75g-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-product-10g-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-product-37-5g-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-product-100g-20260514.jpg",
  "public/products/kcg-product-minimal-bars-20260506.webp",
  "public/products/kcg-product-jewelry-buying-20260503.webp",
  "public/products/kcg-product-pure-gold-gifts-20260506.webp",
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
  "public/campaign/kcg-real-goldbar-price-desk-20260511.webp",
  "public/campaign/kcg-korean-consultation-hands-20260511.webp",
  "public/campaign/kcg-real-opening-campaign-20260511.webp",
  "public/campaign/kcg-real-goldbar-promo-banner-20260513.webp",
  "public/campaign/kcg-approved-goldbar-lineup-reflection-20260517.jpg",
  "public/campaign/kcg-home-price-desk-20260506.webp",
  "public/campaign/kcg-home-human-consultation-20260506.webp",
  "public/campaign/kcg-home-product-keyvisual-20260503.webp",
  "public/campaign/kcg-home-seoul-retail-20260506.webp",
  "public/campaign/kcg-price-guide-visual-20260506.webp",
  "public/campaign/kcg-old-gold-process-20260506.webp",
  "public/company/kcg-company-heritage-20260430.webp",
  "public/products/kcg-jewelry-buying-tray-20260430.webp",
  "public/products/kcg-b2b-gift-packaging-20260430.webp",
  "public/products/kcg-real-goldbar-lineup-20260511.webp",
  "public/products/kcg-real-goldbar-detail-20260511.webp",
  "public/products/kcg-real-goldbar-single-20260511.webp",
  "public/products/kcg-real-goldbar-don-lineup-20260511-v2.webp",
  "public/products/kcg-real-goldbar-1don-20260511.webp",
  "public/products/kcg-real-goldbar-2don-20260511.webp",
  "public/products/kcg-real-goldbar-3don-20260511.webp",
  "public/products/kcg-real-goldbar-5don-20260511.webp",
  "public/products/kcg-real-goldbar-10don-20260511.webp",
  "public/products/kcg-real-photo-goldbar-lineup-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-1don-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-2don-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-3don-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-5don-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-10don-20260514.jpg",
  "public/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
  "public/products/kcg-approved-goldbar-1don-20260517.jpg",
  "public/products/kcg-approved-goldbar-2don-20260517.jpg",
  "public/products/kcg-approved-goldbar-3don-20260517.jpg",
  "public/products/kcg-approved-goldbar-5don-20260517.jpg",
  "public/products/kcg-approved-goldbar-10don-20260517.jpg",
  "public/products/kcg-real-photo-goldbar-product-1g-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-product-3-75g-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-product-10g-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-product-37-5g-20260514.jpg",
  "public/products/kcg-real-photo-goldbar-product-100g-20260514.jpg",
  "public/products/kcg-product-minimal-bars-20260506.webp",
  "public/products/kcg-product-jewelry-buying-20260503.webp",
  "public/products/kcg-product-pure-gold-gifts-20260506.webp",
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
expectFile("docs/brand/IMAGE_ASSET_MANIFEST.md", { minBytes: 2_000 });
expectFile("docs/brand/IMAGE_QA_CHECKLIST.md", { minBytes: 1_500 });
expectFile("docs/brand/image-review-2026-05-03.md", { minBytes: 2_000 });
expectFile("docs/brand/generated-goldbar-assets-2026-05-08.md", { minBytes: 1_000 });
expectFile("docs/brand/kcg-ai-goldbar-product-assets-2026-05-11.md", { minBytes: 1_000 });
expectFile("docs/brand/kcg-real-goldbar-product-assets-2026-05-11.md", { minBytes: 1_000 });
expectFile("docs/brand/kcg-real-image-assets-2026-05-11.md", { minBytes: 2_000 });
expectFile("docs/brand/kcg-silverbar-banner-assets-2026-05-13.md", { minBytes: 1_000 });
expectFile("docs/brand/kcg-real-photo-goldbar-assets-2026-05-14.md", { minBytes: 1_000 });
expectFile("docs/brand/kcg-image-intake-2026-05-08.md", { minBytes: 2_000 });
expectFile("docs/brand/product-image-replacement-map-2026-05-08.md", { minBytes: 2_500 });
expectFile("docs/brand/font-license.md", { minBytes: 800 });
expectFile("docs/audit/goldbar-sku-image-lock-snapshot.md", { minBytes: 1_000 });
expectFile("docs/audit/quarantined-assets.md", { minBytes: 1_000 });
expectFile("src/data/imageAssetManifest.json", { minBytes: 2_000 });
validateImageAssetManifest();
validateGoldbarSkuImageLockSnapshot();
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
expectMissing("src/app/api/internal/media-upload-smoke/route.ts");
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
expectMissing("public/products/KakaoTalk_20260508_150411746.jpg");
expectMissing("public/products/KakaoTalk_20260508_150416296.jpg");
expectMissing("public/products/KakaoTalk_20260508_164514053.jpg");
[
  "public/campaign/kcg-generated-goldbar-banner-20260508.webp",
  "public/campaign/kcg-gold-silver-premium-banner-20260513.webp",
  "public/campaign/kcg-price-desk-gold-silver-banner-20260513.webp",
  "public/campaign/kcg-opening-premium-banner-20260513.webp",
  "public/campaign/kcg-products-gold-silver-consult-banner-20260513.webp",
  "public/campaign/kcg-real-goldbar-hand-consultation-20260511-v2.webp",
  "public/campaign/kcg-real-goldbar-promo-banner-20260511-v2.webp",
  "public/campaign/kcg-real-photo-goldbar-products-banner-20260514.jpg",
  "public/campaign/kcg-real-photo-goldbar-price-banner-20260514.jpg",
  "public/campaign/kcg-real-photo-goldbar-opening-banner-20260514.jpg",
  "public/products/kcg-ai-goldbar-don-lineup-20260511.webp",
  "public/products/kcg-ai-goldbar-hand-consultation-20260511.webp",
  "public/products/kcg-ai-goldbar-tray-20260511.webp",
  "public/products/kcg-ai-goldbar-large-inquiry-20260511.webp",
  "public/products/kcg-ai-goldbar-1g-representative-20260512.webp",
  "public/products/kcg-ai-goldbar-10g-representative-20260512.webp",
  "public/products/kcg-ai-goldbar-100g-representative-20260512.webp",
  "public/products/kcg-generated-goldbar-lineup-20260508.webp",
  "public/products/kcg-generated-goldbar-detail-20260508.webp",
  "public/products/kcg-b2b-bulk-consulting-20260427-v2.jpg",
  "public/products/kcg-b2b-consulting-20260427.jpg",
  "public/products/kcg-product-b2b-consulting-20260503.webp",
  "public/products/kcg-product-corporate-consulting-20260506.webp",
  "public/products/kcg-product-gold-silver-catalog-20260503.webp",
  "public/products/kcg-silver-bar-catalog-20260427.jpg",
  "public/products/kcg-silver-gift-20260427-v2.jpg",
  "public/products/kcg-real-goldbar-don-lineup-studio-20260513.webp",
  "public/products/kcg-real-goldbar-don-lineup-studio-v2-20260513.webp",
  "public/products/kcg-real-goldbar-1don-studio-20260513.webp",
  "public/products/kcg-real-goldbar-2don-studio-20260513.webp",
  "public/products/kcg-real-goldbar-3don-studio-20260513.webp",
  "public/products/kcg-real-goldbar-5don-studio-20260513.webp",
  "public/products/kcg-real-goldbar-10don-studio-20260513.webp",
  "public/products/kcg-real-goldbar-frontback-1g-20260513.webp",
  "public/products/kcg-real-goldbar-frontback-3-75g-20260513.webp",
  "public/products/kcg-real-goldbar-frontback-10g-20260513.webp",
  "public/products/kcg-real-goldbar-frontback-37-5g-20260513.webp",
  "public/products/kcg-real-goldbar-frontback-100g-20260513.webp",
  "public/products/kcg-silverbar-don-lineup-studio-20260513.webp",
  "public/products/kcg-silverbar-don-lineup-studio-v2-20260513.webp",
  "public/products/kcg-silverbar-1don-studio-20260513.webp",
  "public/products/kcg-silverbar-2don-studio-20260513.webp",
  "public/products/kcg-silverbar-3don-studio-20260513.webp",
  "public/products/kcg-silverbar-5don-studio-20260513.webp",
  "public/products/kcg-silverbar-10don-studio-20260513.webp",
  "public/products/kcg-silverbar-frontback-100g-20260513.webp",
  "public/products/kcg-silverbar-frontback-500g-20260513.webp",
  "public/products/kcg-silverbar-frontback-1kg-20260513.webp",
].forEach((relativePath) => expectMissing(relativePath));
expectNoRawKakaoTalkFiles(["public"]);

expectText("package.json", [
  "\"check:external\": \"node scripts/check-external-services.mjs\"",
  "\"audit:rendered\": \"node scripts/run-rendered-site-audit.mjs\"",
  "\"qa:quick\": \"node scripts/run-site-qa.mjs --quick\"",
  "\"qa:site\": \"node scripts/run-site-qa.mjs\"",
  "\"release:trace\": \"node scripts/report-release-trace.mjs\"",
  "\"check:release-state\": \"node scripts/check-live-release-state.mjs\"",
  "\"screenshot:admin\": \"node scripts/capture-admin-screenshots.mjs\"",
]);
expectText("scripts/run-site-qa.mjs", [
  "class StepFailure extends Error",
  "KCG_QA_PORT must be a numeric TCP port.",
  "KCG_QA_PORT must be between 1024 and 65535.",
  "await Promise.all(fullOnlySteps.map",
  "stopServer(server);",
]);
expectLatestChangelogVersionMatchesPackage();
expectText("docs/setup/CHANGELOG.md", [
  "## v0.2.46 - Main banner mock image removal",
  "Main banner mock image removal",
  "kcg-home-seoul-retail-20260506.webp",
  "kcg-old-gold-process-20260506.webp",
  "kcg-jewelry-buying-tray-20260430.webp",
  "KCG-TODO-098",
  "v0.2.46 메인 배너 목업 이미지 제거 전으로 되돌려줘",
  "## v0.2.45 - Product image cleanup and admin purity-rate controls",
  "Product image cleanup and admin purity-rate controls",
  "kcg-real-photo-goldbar-products-banner-20260514.jpg",
  "kcg-real-photo-goldbar-product-3-75g-20260514.jpg",
  "KCG-TODO-097",
  "v0.2.45 상품 이미지 정리와 관리자 계수 UI 전으로 되돌려줘",
  "## v0.2.44 - Public UI wrap and token stability polish",
  "Public UI wrap and token stability polish",
  "kcg-number-token",
  "kcg-action-token",
  "KCG-TODO-096",
  "v0.2.44 공개 UI 줄바꿈 안정화 전으로 되돌려줘",
  "## v0.2.43 - Silverbar guide and campaign banner correction",
  "Silverbar guide and campaign banner correction",
  "kcg-gold-silver-premium-banner-20260513.webp",
  "kcg-price-desk-gold-silver-banner-20260513.webp",
  "kcg-opening-premium-banner-20260513.webp",
  "kcg-products-gold-silver-consult-banner-20260513.webp",
  "kcg-silverbar-don-lineup-studio-v2-20260513.webp",
  "kcg-silverbar-1don-studio-20260513.webp",
  "kcg-silverbar-2don-studio-20260513.webp",
  "kcg-silverbar-3don-studio-20260513.webp",
  "kcg-silverbar-5don-studio-20260513.webp",
  "kcg-silverbar-10don-studio-20260513.webp",
  "kcg-silverbar-frontback-100g-20260513.webp",
  "kcg-silverbar-frontback-500g-20260513.webp",
  "kcg-silverbar-frontback-1kg-20260513.webp",
  "KCG-TODO-095",
  "v0.2.43 실버바 가이드와 홈 배너 교정 전으로 되돌려줘",
  "## v0.2.42 - KCG goldbar product-shot correction",
  "KCG goldbar product-shot correction",
  "kcg-real-goldbar-frontback-1g-20260513.webp",
  "kcg-real-goldbar-frontback-3-75g-20260513.webp",
  "kcg-real-goldbar-frontback-10g-20260513.webp",
  "kcg-real-goldbar-frontback-37-5g-20260513.webp",
  "kcg-real-goldbar-frontback-100g-20260513.webp",
  "KCG-TODO-094",
  "v0.2.42 골드바 front/back 상품컷 교정 전으로 되돌려줘",
  "상담용 대표 이미지",
  "사이트용으로 최적화한 파생 이미지",
  "## v0.2.39 - KCG studio goldbar product/banner images",
  "KCG studio goldbar product/banner images",
  "kcg-real-goldbar-promo-banner-20260513.webp",
  "kcg-real-goldbar-don-lineup-studio-v2-20260513.webp",
  "kcg-real-goldbar-1don-studio-20260513.webp",
  "kcg-real-goldbar-2don-studio-20260513.webp",
  "kcg-real-goldbar-3don-studio-20260513.webp",
  "kcg-real-goldbar-5don-studio-20260513.webp",
  "kcg-real-goldbar-10don-studio-20260513.webp",
  "kcg-real-goldbar-frontback-1g-20260513.webp",
  "kcg-real-goldbar-frontback-3-75g-20260513.webp",
  "kcg-real-goldbar-frontback-10g-20260513.webp",
  "kcg-real-goldbar-frontback-37-5g-20260513.webp",
  "kcg-real-goldbar-frontback-100g-20260513.webp",
  "kcg-real-goldbar-frontback-1g-20260513.webp",
  "kcg-real-goldbar-frontback-3-75g-20260513.webp",
  "kcg-real-goldbar-frontback-10g-20260513.webp",
  "kcg-real-goldbar-frontback-37-5g-20260513.webp",
  "kcg-real-goldbar-frontback-100g-20260513.webp",
  "IMG_4282.PNG",
  "IMG_4283.PNG",
  "KCG-TODO-091",
  "v0.2.39 KCG 골드바 스튜디오형 상품/배너 이미지 전으로 되돌려줘",
  "## v0.2.38 - Product catalog merch polish",
  "Product catalog merch polish",
  "KCG-TODO-090",
  "v0.2.38 상품 쇼케이스형 카탈로그 전으로 되돌려줘",
  "## v0.2.37 - Goldbar weight-matched product images",
  "Goldbar weight-matched product images",
  "kcg-real-goldbar-frontback-1g-20260513.webp",
  "kcg-real-goldbar-frontback-3-75g-20260513.webp",
  "kcg-real-goldbar-frontback-10g-20260513.webp",
  "kcg-real-goldbar-frontback-37-5g-20260513.webp",
  "kcg-real-goldbar-frontback-100g-20260513.webp",
  "KCG-TODO-089",
  "v0.2.37 골드바 중량별 상품 이미지 매핑 전으로 되돌려줘",
  "## v0.2.36 - No-hand core visual correction",
  "No-hand core visual correction",
  "kcg-real-goldbar-price-desk-20260511.webp",
  "kcg-ai-goldbar-tray-20260511.webp",
  "KCG-TODO-088",
  "v0.2.36 손바닥 골드바 핵심 이미지 제거 전으로 되돌려줘",
  "## v0.2.35 - Real KCG goldbar product/banner rework",
  "Real KCG goldbar product/banner rework",
  "kcg-real-goldbar-promo-banner-20260513.webp",
  "kcg-real-goldbar-hand-consultation-20260511-v2.webp",
  "kcg-real-goldbar-don-lineup-20260511-v2.webp",
  "kcg-real-goldbar-1don-20260511.webp",
  "kcg-real-goldbar-2don-20260511.webp",
  "kcg-real-goldbar-3don-20260511.webp",
  "kcg-real-goldbar-5don-20260511.webp",
  "kcg-real-goldbar-10don-20260511.webp",
  "KCG-TODO-087",
  "v0.2.35 실제 KCG 골드바 상품/배너 재작업 전으로 되돌려줘",
  "## v0.2.34 - Goldbar product image guide",
  "Goldbar product image guide",
  "kcg-ai-goldbar-don-lineup-20260511.webp",
  "kcg-ai-goldbar-hand-consultation-20260511.webp",
  "kcg-ai-goldbar-tray-20260511.webp",
  "kcg-ai-goldbar-large-inquiry-20260511.webp",
  "KCG-TODO-086",
  "v0.2.34 골드바 상품 이미지 가이드 전으로 되돌려줘",
  "## v0.2.32 - Real KCG gold-bar image application",
  "Real KCG gold-bar image application",
  "kcg-real-goldbar-price-desk-20260511.webp",
  "kcg-korean-consultation-hands-20260511.webp",
  "kcg-real-opening-campaign-20260511.webp",
  "kcg-real-goldbar-lineup-20260511.webp",
  "docs/brand/kcg-real-image-assets-2026-05-11.md",
  "KCG-TODO-084",
  "v0.2.32 실제 KCG 이미지 파생 적용 전으로 되돌려줘",
  "## v0.2.31 - Current KCG image intake path QA",
  "Current KCG image intake path QA",
  "C:\\Users\\junyo\\Documents\\File-Hub\\80_보관\\사진_영상\\Images\\KCG 이미지",
  "KakaoTalk_20260508_150411746*.jpg",
  "KakaoTalk_20260508_150416296*.jpg",
  "KakaoTalk_20260508_164514053.jpg",
  "KCG-TODO-083",
  "v0.2.31 이미지 intake 경로 QA 전으로 되돌려줘",
  "## v0.2.30 - Admin price input lineup parity",
  "고객 화면의 시세표와 같은 품목명, 순서, 살 때/팔 때 배열",
  "priceLineupRows",
  "KCG-TODO-082",
  "docs/setup/QA_LAUNCH_REVIEW_2026-05-08.md",
  "v0.2.30 전으로 되돌려줘",
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
  "Current KCG site version: `v0.2.49`",
  "QA speed and closed-day price guard",
  "KCG-TODO-101",
  "npm run qa:quick",
  "KCG_QA_PORT",
  "v0.2.49 QA 속도와 휴무일 고시 안내 전으로 되돌려줘",
  "Current KCG site version: `v0.2.48`",
  "Source-ready goldbar image QA gate",
  "KCG-TODO-100",
  "kcg-approved-goldbar-lineup-reflection-20260517.jpg",
  "kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
  "kcg-approved-goldbar-1don/2don/3don/5don/10don-20260517.jpg",
  "trust placeholder",
  "v0.2.48 source-ready 골드바 이미지 QA 전으로 되돌려줘",
  "Current KCG site version: `v0.2.47`",
  "Goldbar real lineup banner restore",
  "KCG-TODO-099",
  "kcg-real-goldbar-promo-banner-20260513.webp",
  "kcg-real-photo-goldbar-lineup-20260514.jpg",
  "v0.2.47 골드바 실물 라인업 배너 복구 전으로 되돌려줘",
  "Current KCG site version: `v0.2.46`",
  "Main banner mock image removal",
  "KCG-TODO-098",
  "v0.2.46 메인 배너 목업 이미지 제거 전으로 되돌려줘",
  "Current KCG site version: `v0.2.45`",
  "Product image cleanup and admin purity-rate controls",
  "KCG-TODO-097",
  "kcg-real-photo-goldbar-products-banner-20260514.jpg",
  "kcg-real-photo-goldbar-product-3-75g-20260514.jpg",
  "v0.2.45 상품 이미지 정리와 관리자 계수 UI 전으로 되돌려줘",
  "Current KCG site version: `v0.2.44`",
  "Public UI wrap and token stability polish",
  "KCG-TODO-096",
  "kcg-number-token",
  "kcg-action-token",
  "v0.2.44 공개 UI 줄바꿈 안정화 전으로 되돌려줘",
  "Current KCG site version: `v0.2.43`",
  "Silverbar guide and campaign banner correction",
  "KCG-TODO-095",
  "kcg-gold-silver-premium-banner-20260513.webp",
  "kcg-price-desk-gold-silver-banner-20260513.webp",
  "kcg-opening-premium-banner-20260513.webp",
  "kcg-products-gold-silver-consult-banner-20260513.webp",
  "kcg-silverbar-don-lineup-studio-v2-20260513.webp",
  "v0.2.43 실버바 가이드와 홈 배너 교정 전으로 되돌려줘",
  "Current KCG site version: `v0.2.42`",
  "KCG goldbar product-shot correction",
  "KCG-TODO-094",
  "kcg-real-goldbar-frontback-1g-20260513.webp",
  "kcg-real-goldbar-frontback-3-75g-20260513.webp",
  "kcg-real-goldbar-frontback-10g-20260513.webp",
  "kcg-real-goldbar-frontback-37-5g-20260513.webp",
  "kcg-real-goldbar-frontback-100g-20260513.webp",
  "v0.2.42 골드바 front/back 상품컷 교정 전으로 되돌려줘",
  "Current KCG site version: `v0.2.39`",
  "KCG studio goldbar product/banner images",
  "KCG-TODO-091",
  "kcg-real-goldbar-don-lineup-studio-v2-20260513.webp",
  "kcg-real-goldbar-1don-studio-20260513.webp",
  "kcg-real-goldbar-2don-studio-20260513.webp",
  "kcg-real-goldbar-3don-studio-20260513.webp",
  "kcg-real-goldbar-5don-studio-20260513.webp",
  "kcg-real-goldbar-10don-studio-20260513.webp",
  "v0.2.39 KCG 골드바 스튜디오형 상품/배너 이미지 전으로 되돌려줘",
  "Current KCG site version: `v0.2.38`",
  "Product catalog merch polish",
  "KCG-TODO-090",
  "v0.2.38 상품 쇼케이스형 카탈로그 전으로 되돌려줘",
  "Current KCG site version: `v0.2.37`",
  "Goldbar weight-matched product images",
  "KCG-TODO-089",
  "kcg-ai-goldbar-1g-representative-20260512.webp",
  "kcg-ai-goldbar-10g-representative-20260512.webp",
  "kcg-ai-goldbar-100g-representative-20260512.webp",
  "v0.2.37 골드바 중량별 상품 이미지 매핑 전으로 되돌려줘",
  "Current KCG site version: `v0.2.36`",
  "No-hand core visual correction",
  "KCG-TODO-088",
  "kcg-real-goldbar-price-desk-20260511.webp",
  "kcg-ai-goldbar-tray-20260511.webp",
  "v0.2.36 손바닥 골드바 핵심 이미지 제거 전으로 되돌려줘",
  "Current KCG site version: `v0.2.35`",
  "Real KCG goldbar product/banner rework",
  "KCG-TODO-087",
  "kcg-real-goldbar-promo-banner-20260511-v2.webp",
  "kcg-real-goldbar-hand-consultation-20260511-v2.webp",
  "kcg-real-goldbar-don-lineup-20260511-v2.webp",
  "docs/brand/kcg-real-goldbar-product-assets-2026-05-11.md",
  "v0.2.35 실제 KCG 골드바 상품/배너 재작업 전으로 되돌려줘",
  "Current KCG site version: `v0.2.34`",
  "Goldbar product image guide",
  "Current KCG site version: `v0.2.32`",
  "Real KCG gold-bar image application",
  "KCG-TODO-084",
  "kcg-real-goldbar-price-desk-20260511.webp",
  "kcg-korean-consultation-hands-20260511.webp",
  "docs/brand/kcg-real-image-assets-2026-05-11.md",
  "v0.2.32 실제 KCG 이미지 파생 적용 전으로 되돌려줘",
  "Current KCG site version: `v0.2.31`",
  "Current KCG image intake path QA",
  "KCG-TODO-083",
  "KakaoTalk_20260508_150411746*",
  "KakaoTalk_20260508_150416296*",
  "KakaoTalk_20260508_164514053.jpg",
  "v0.2.31 이미지 intake 경로 QA 전으로 되돌려줘",
  "Current KCG site version: `v0.2.30`",
  "Admin price input lineup parity",
  "고객 화면의 시세표와 같은 품목명, 순서, 살 때/팔 때 배열",
  "KCG-TODO-082",
  "docs/setup/QA_LAUNCH_REVIEW_2026-05-08.md",
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
  "v0.2.46",
  "Main banner mock image removal",
  "KCG-TODO-098",
  "served `public/campaign` 밖으로 격리",
  "v0.2.45",
  "Product image cleanup and admin purity-rate controls",
  "KCG-TODO-097",
  "kcg-real-photo-goldbar-*-20260514.jpg",
  "v0.2.44",
  "Public UI wrap and token stability polish",
  "KCG-TODO-096",
  "kcg-number-token",
  "kcg-action-token",
  "v0.2.43",
  "Silverbar guide and campaign banner correction",
  "KCG-TODO-095",
  "kcg-gold-silver-premium-banner-20260513.webp",
  "kcg-price-desk-gold-silver-banner-20260513.webp",
  "kcg-opening-premium-banner-20260513.webp",
  "kcg-products-gold-silver-consult-banner-20260513.webp",
  "kcg-silverbar-frontback-100g-20260513.webp",
  "kcg-silverbar-frontback-500g-20260513.webp",
  "kcg-silverbar-frontback-1kg-20260513.webp",
  "v0.2.42",
  "KCG-TODO-094",
  "kcg-real-goldbar-frontback-1g-20260513.webp",
  "kcg-real-goldbar-frontback-3-75g-20260513.webp",
  "kcg-real-goldbar-frontback-10g-20260513.webp",
  "kcg-real-goldbar-frontback-37-5g-20260513.webp",
  "kcg-real-goldbar-frontback-100g-20260513.webp",
  "v0.2.39",
  "KCG studio goldbar product/banner images",
  "KCG-TODO-091",
  "kcg-real-goldbar-promo-banner-20260513.webp",
  "kcg-real-goldbar-don-lineup-studio-v2-20260513.webp",
  "kcg-real-goldbar-1don-studio-20260513.webp",
  "kcg-real-goldbar-2don-studio-20260513.webp",
  "kcg-real-goldbar-3don-studio-20260513.webp",
  "kcg-real-goldbar-5don-studio-20260513.webp",
  "kcg-real-goldbar-10don-studio-20260513.webp",
  "v0.2.38",
  "Product catalog merch polish",
  "KCG-TODO-090",
  "v0.2.37",
  "KCG-TODO-089",
  "kcg-ai-goldbar-1g-representative-20260512.webp",
  "kcg-ai-goldbar-10g-representative-20260512.webp",
  "kcg-ai-goldbar-100g-representative-20260512.webp",
  "v0.2.36",
  "KCG-TODO-088",
  "kcg-real-goldbar-price-desk-20260511.webp",
  "kcg-ai-goldbar-tray-20260511.webp",
  "v0.2.35",
  "KCG-TODO-087",
  "kcg-real-goldbar-promo-banner-20260511-v2.webp",
  "kcg-real-goldbar-hand-consultation-20260511-v2.webp",
  "docs/brand/kcg-real-goldbar-product-assets-2026-05-11.md",
  "이번 `v0.2.35`에서 실제 사이트 화면이 새로 바뀌는 것",
  "v0.2.34",
  "v0.2.32",
  "v0.2.31",
  "v0.2.30",
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
  "이번 `v0.2.32`에서 source 기준 실제 사이트 화면이 새로 바뀌는 것",
  "kcg-real-goldbar-price-desk-20260511.webp",
  "KCG-TODO-084",
  "docs/brand/kcg-real-image-assets-2026-05-11.md",
  "이번 `v0.2.31`에서 source 기준 실제 사이트 화면이 새로 바뀌는 것",
  "KCG-TODO-083",
  "raw KakaoTalk filename audit guardrail",
  "이번 `v0.2.30`에서 source 기준 실제 사이트 화면이 새로 바뀌는 것",
  "고객 화면의 시세표와 같은 품목명, 순서, 살 때/팔 때 배열",
  "KCG-TODO-082",
  "QA_LAUNCH_REVIEW_2026-05-08.md",
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
  "이번 배포에 포함되어 live에서도 보이는 이전 source 변경",
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
expectText("docs/setup/QA_LAUNCH_REVIEW_2026-05-08.md", [
  "KCG Launch-Candidate Rendered QA",
  "Customer",
  "Staff",
  "Mobile",
  "Admin",
  "Visual quality",
  "Data source",
  "Launch readiness",
  "hasPublicLineupLabels=false",
  "TDD RED",
  "TDD GREEN",
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
  "AdminAnnouncementsWorkspace",
  "저장됨 · 공지사항이 반영되었습니다.",
  "삭제 확인 체크가 필요합니다.",
]);
expectText("src/app/admin/announcements/admin-announcements-workspace.tsx", [
  "admin-announcement-table",
  "admin-announcement-editor",
  "새 공지 작성",
  "삭제 확인",
  "공지 삭제",
  "data-admin-save-guard",
  "게시중",
  "초안",
  "Pinned",
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
  "KCG-TODO-082",
  "KCG-TODO-083",
  "KCG-TODO-084",
  "KCG-TODO-094",
  "Correct public goldbar product-card/detail images to KCG front/back product shots",
  "Align admin manual price entry with the public price lineup",
  "Completed in v0.2.30",
  "Refresh current KCG image intake path and raw-filename guardrail",
  "Completed in v0.2.31",
  "Apply real KCG-derived gold-bar/logo and consultation images",
  "Completed in v0.2.32",
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
  "admin-media-mobile.png",
  "admin-media-desktop.png",
  "자동시세 세부 설정",
  'select[name="autoSource"]',
]);
expectText("scripts/capture-admin-screenshots.mjs", [
  "KCG_INCLUDE_ADMIN_SCREENSHOTS",
  "KCG_ADMIN_SCREENSHOTS_ONLY",
  "capture-site-screenshots.mjs",
]);
expectText("scripts/capture-site-screenshots.mjs", [
  "url.pathname === route",
  "ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || adminPassword",
  'ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET || "local-admin-session-secret"',
]);

expectText("src/components/market/price-lineup.tsx", [
  "/campaign/kcg-approved-goldbar-lineup-reflection-20260517.jpg",
  "KCG 골드바 1돈 2돈 3돈 5돈 10돈 라인업 배너",
  "/campaign/kcg-home-human-consultation-20260506.webp",
  "KCG 상담과 방문 준비 이미지",
  "/campaign/kcg-home-seoul-retail-20260506.webp",
  "KCG 종로 매장 방문 안내 이미지",
  "hasMultipleCampaignSlides",
  "siteConfig.englishName",
  "kcg-full-bleed-campaign",
  'data-testid="home-campaign-visual"',
  'data-testid="home-campaign-slide"',
  'data-testid="home-price-lineup-panel"',
  'data-testid="price-announcement-notice"',
  "announcementNoticeBody",
  "announcementIsStale",
  'sizes="100vw"',
  'const wrapperLayoutClass = "relative flex flex-col lg:block"',
  "lg:absolute lg:bottom-0 lg:left-[clamp(7rem,12vw,17rem)] lg:top-0 lg:order-none",
  "lg:w-[37vw] 2xl:w-[42rem]",
  "bg-[rgba(38,39,39,0.96)]",
  "bg-[rgba(13,13,13,0.98)]",
  "order-1 relative z-0 overflow-hidden",
  "priceLineupRows",
  "lineupBasisLabel",
  "3.75g 기준",
  "내가 살 때 (VAT포함)",
  "내가 팔 때 (현장 기준)",
  "시세는 고시 시각 기준이며 실제 거래 금액",
]);
expectNoText("src/components/market/price-lineup.tsx", [
  "/campaign/kcg-main-commerce-banner-20260427-v2.jpg",
  "/campaign/kcg-brand-gold-bars-20260427-v4.png",
  "/campaign/kcg-real-goldbar-price-desk-20260511.webp",
  "/campaign/kcg-real-opening-campaign-20260511.webp",
  "/campaign/kcg-real-photo-goldbar-price-banner-20260514.jpg",
  "/campaign/kcg-real-photo-goldbar-products-banner-20260514.jpg",
  "/campaign/kcg-real-photo-goldbar-opening-banner-20260514.jpg",
  "한국센터금거래소 오픈 캠페인 상담 대표 이미지",
  "/campaign/kcg-real-goldbar-hand-consultation-20260511-v2.webp",
  "손 위에 놓인 KCG 실물 골드바 상담 이미지",
  "/campaign/kcg-main-desk-photo-20260427-v3.png",
  "KCG 순금 골드바 방문 상담 광고 배너",
  "방문 상담",
  "정지",
  "재생",
  'data-testid="home-price-lineup-restore"',
  'aria-label="시세표 닫기"',
  "isHydrated",
  "시세표 보기",
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
  "scroll-padding-bottom: calc(5.5rem + env(safe-area-inset-bottom))",
]);
expectText("src/app/(site)/layout.tsx", ["pb-[calc(5.5rem+env(safe-area-inset-bottom))]"]);
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
  "참고 데이터 기준",
  "고시 시세 우선",
  "원화 거래 금액은 KCG 고시 시세표",
  "시장 기준",
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
  "data-kcg-widget-state={widgetState}",
  "data-testid=\"tradingview-loading-state\"",
  "widget.style.height = \"100%\"",
  "h-[26rem] min-h-[26rem]",
  "TradingView 차트를 불러오지 못했습니다.",
  "TradingView에서 보기",
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
  "국내 환산",
  "매매기준가",
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
expectText("src/lib/price-presenter.ts", ["내가 살 때 (VAT 포함)", "return \"내가 팔 때\""]);
expectText("src/lib/price-announcement.ts", [
  "오늘 고시 예정 시각",
  "고시 예정 시각",
  "주말·휴무일 거래 전 전화 확인",
  "영업시간 외 거래 전 전화 확인",
  "휴무일 고시",
  "휴무일 최근 고시",
  "requiresTradeConfirmation",
  "최근 고시 시각",
]);
expectNoText("src/lib/price-announcement.ts", ["isClosedDay && !sameKoreanDay"]);
expectText("src/components/home/final-home.tsx", ["getPriceAnnouncementDisplay"]);
expectNoText("src/components/home/final-home.tsx", ["오늘 고시 시각: {"]);
expectText("src/app/(site)/prices/page.tsx", [
  "PriceContextGuide",
  "시세 이용 기준",
  "priceUseCards",
  "자동 참고 시세",
  "국제 현재가와 환율은 시장 방향 확인용이며 거래가는 아닙니다.",
  "closed-day-price-policy",
  "휴무일·영업시간 외 적용 기준",
  "화면 금액은 거래 확정가가 아닙니다.",
  "getPriceAnnouncementDisplay",
  "기준 고시 예정",
]);
expectText("src/app/admin/prices/price-mode-workspace.tsx", [
  "admin-public-price-status",
  "고객 화면 고지",
  "화면 금액만으로 거래 확정 답변을 하지 않습니다.",
  "휴무일·영업시간 외 고객 문의",
]);
expectText("src/components/market/price-lineup.tsx", ["announcedHeading", "if (diff === 0) return null;"]);
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
  "admin prices exposes automatic price operation and public-lineup manual editor",
  "KRX Open API (승인 전 사용 불가)",
  'option[value="krx"]',
  "admin products mirrors the public catalog in a compact list-and-editor surface",
  "admin media works as an operator-friendly image replacement center",
  "admin save guard, media boundary, and session guards stay wired",
  "이미지 상태",
  "이미지 교체",
  "이미지 확인 필터",
  "KCG 골드바 1돈",
  "고금 주얼리 매입",
  "needs-real-photo",
  "image=needs-real-photo",
  "admin-media-upload-form",
  "admin-media-operator-cards",
  "admin-media-slot-manager",
  "beforeunload",
  "sanitizeAdminNextPath",
  "admin-product-row-investment-gold-bar-consulting",
  "admin-product-mobile-image-note-investment-gold-bar-consulting",
  "product quick links sync same-route category query",
  'getByTestId("home-price-lineup-panel").getByText("3.75g 기준")',
  'mainText.split("3.75g 기준").length - 1).toBe(1)',
  "품목별로 볼 기준만 확인합니다.",
  "무엇을 보유했나요?",
  "처음 연락할 때 무엇부터 말하면 되나요?",
  "firstProductImageSources",
  "USD/KRW",
  "단위: 3.75g",
  "data-kcg-widget-state",
  ".toMatch(/^(iframe|failed)$/)",
  "TradingView 차트를 불러오지 못했습니다.",
  "product-trust-placeholder",
  "product-detail-trust-placeholder",
  "kcg-approved-goldbar-1don-20260517",
  "kcg-approved-goldbar-10don-20260517",
  "data-image-role",
  "representative_category",
  "KCG 골드바 1돈 2돈 3돈 5돈",
  "참고가입니다. 전화 또는 현장 확인 후 최종 안내합니다.",
  "mobile about route shows map actions in the first viewport",
  "admin login keeps the login form as the first mobile task",
  "const explicitAdminPassword = process.env.KCG_TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD",
  'const adminPassword = explicitAdminPassword || (isExternalAuditUrl ? undefined : "0000")',
]);
expectNoText("tests/site-fidelity.spec.ts", [
  "KCG 순금 골드바 방문 상담 광고 배너",
  "시세 운영 및 방문 안내 공지",
  "손 위에 놓인 KCG 실물 골드바 상담 이미지",
]);
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
  "roundPriceToUnit",
  "goldSellPremiumRate",
  "maxAutoPublishChangePercent",
]);
expectText("src/lib/price-formulas.ts", [
  "DEFAULT_PRICE_ROUNDING_UNIT",
  "roundPriceToUnit",
  "calculateGoldPurityBuyPrices",
  "gold_18k_buy",
  "gold_14k_buy",
]);
expectNoText("src/lib/price-auto.ts", [
  "Math.random",
  "koreagoldx.co.kr",
  "ssgold.co.kr",
  "gbkmall.com",
]);
expectText("src/actions/price-actions.ts", [
  "requireAdminActionSession",
  "updatePriceAutoSettingsAction",
  "generatePriceAutoSuggestionAction",
  "applyPriceAutoSuggestionAction",
  "rejectPriceAutoSuggestionAction",
  "buildPriceWarnings",
  "applyManualGoldPurityDerivation",
  "goldPurityAuto",
  "saved-derived",
]);
expectText("src/actions/product-actions.ts", ["requireAdminActionSession", "upsertProductAction"]);
expectText("src/actions/announcement-actions.ts", [
  "requireAdminActionSession",
  "upsertAnnouncementAction",
  "deleteAnnouncementAction",
]);
expectText("src/lib/auth/admin-action.ts", [
  "requireAdminActionSession",
  "ADMIN_SESSION_COOKIE",
  "verifyAdminSession",
]);
expectText("src/app/admin/prices/price-mode-workspace.tsx", [
  "지금 계산 실행",
  "검토 후 반영",
  "계산 기록 폐기",
  "자동시세 OFF는 유지됩니다",
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
  "수동 시세 등록이 오래 없어도 자동시세 OFF는 유지됩니다",
  "isManualRegistrationStale",
  "small-change",
  "needs-review",
  "data-not-safe",
  "isKoreaBusinessTime",
]);
expectNoText("src/lib/price-auto-runner.ts", [
  "updatePriceAutoSettings(enabledSettings)",
  "autoEnabledByStaleGuard",
  "ON으로 전환",
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
  "user-only-launch-blockers",
  "최종 상품 가격·공임·운영자료 확인",
  "대표 이미지·실사진 final-use 승인",
  "최종 관리자 비밀번호 rotation",
]);
expectNoText("src/lib/launch-readiness.ts", ["Gabia", "Whois DNS"]);
expectText("src/app/robots.ts", ["canExposeToSearch"]);
expectText("src/app/sitemap.ts", ["canExposeToSearch"]);
expectText("src/app/layout.tsx", [
  "next/font/local",
  "PretendardVariable.woff2",
  "canExposeToSearch",
  "summary_large_image",
  "kcg-approved-goldbar-lineup-reflection-20260517.jpg",
  "KCG 골드바 1돈 2돈 3돈 5돈 10돈 라인업 이미지",
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
  "최종 상품 가격·공임·운영자료 확인",
  "대표 이미지·실사진 final-use 승인",
  "최종 관리자 비밀번호 rotation",
  "KCG_PUBLIC_SEARCH_APPROVED=1 명시 승인 env 설정",
  "Production 배포 승인",
  "robots/noindex 해제와 검색 색인 승인",
]);
expectText("src/app/admin/layout.tsx", ["/admin/launch", "오픈 점검"]);
expectText("src/app/admin/layout.tsx", ["admin-light", "한국센터금거래소 운영 콘솔"]);
expectText("middleware.ts", ["x-kcg-path", "`${pathname}${search}`"]);
expectText("src/app/admin/page.tsx", [
  "오늘 먼저 확인할 것",
  "시세 운영",
  "검토 대기",
  "상품 공개 수",
  "운영자가 바로 눌러야 할 메뉴",
  "헷갈리면 이것만 기준",
]);
expectText("src/app/admin/prices/page.tsx", [
  "자동시세 전환, 직접 입력, 18K/14K 계산 기준",
  "AdminPricesWorkspace",
  "auto-on-saved",
  "auto-off-saved",
]);
expectText("src/lib/price-presenter.ts", [
  "priceLineupRows",
  "id: \"gold-24k\"",
  "sellCategory: \"gold_24k_sell\"",
  "buyCategory: \"gold_24k_buy\"",
  "sellText: \"제품시세적용\"",
  "buyNote: \"(자사백금바기준)\"",
  "buyNote: \"(자사실버바기준)\"",
]);
expectNoText("src/lib/price-presenter.ts", [
  "· 3.75g 기준",
]);
expectText("src/app/admin/prices/price-mode-workspace.tsx", [
  "priceLineupRows",
  "고객 화면과 같은 품목 순서",
  "manual-gold-purity-helper",
  "18K/14K 자동 계산",
  "저장 시 자동 반영",
  "manual-gold-purity-settings-form",
  "환산 계수",
  "calculateGoldPurityBuyPrices",
  "data-testid={`admin-price-lineup-row-${row.id}`}",
  "data-testid={`admin-price-cell-${price.category}`}",
  "내가 살 때 (VAT포함)",
  "내가 팔 때 (현장 기준)",
  "차액 {deltaLabel}",
  "inputMode=\"numeric\"",
  "min={1}",
  "required",
  "자동시세 ON",
  "자동시세 OFF",
  "data-testid=\"admin-price-mode-switch\"",
  "data-testid=\"admin-price-auto-panel\"",
  "자동 계산 공식",
  "국제 금 3.75g 환산가",
  "자동 게시 허용 변동폭",
  "최소 반영 금액",
  "KRX Open API (승인 전 사용 불가)",
  "KRX는 승인 전 선택할 수 없습니다.",
  "지금 계산 실행",
  "자동시세 세부 설정",
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
expectText("src/lib/data/supabase-repository.ts", [
  "missingHistoryRows",
  "snapshotRows",
  "Promise.all(updateJobs)",
  "price_daily_snapshots",
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
  "data-testid=\"route-hero-media\"",
  "h-[12rem] min-h-[12rem]",
  "VISIT CHECK",
  "defaultStoreGuideHeroImages",
  "getOperationalSlotImages",
  "위치, 전화, 준비 항목을 먼저 확인합니다.",
  "위치, 전화, 준비 항목만 먼저 확인합니다.",
  "거래 전 준비 항목",
  "visitPrepCards",
  "본사 전화",
]);

expectText("src/app/(site)/services/page.tsx", [
  "data-testid=\"route-hero-media\"",
  "h-[12rem] min-h-[12rem]",
  "KCG SERVICE",
  "defaultServicesHeroImages",
  "getOperationalSlotImages",
  "고시 기준과 실물 확인 절차만 명확하게 안내합니다.",
  "품목 확인, 고시 기준, 실물 확인",
  "serviceFaqs",
  "거래 기준",
  "필요한 항목만 빠르게 확인합니다.",
  "자주 묻는 기준",
  "상품/매입 보기",
]);
expectText("src/app/(site)/products/page.tsx", [
  "data-testid=\"route-hero-media\"",
  "h-[12rem] min-h-[12rem]",
  "상품/매입",
  "defaultProductsHeroImages",
  "getOperationalSlotImages",
  "1·2·3·5·10돈 골드바와 고금 주얼리 매입 기준을 바로 확인합니다.",
  "decisionPaths",
  "내가 팔 때 기준과 실물 확인 항목을 먼저 봅니다.",
  "품목 목록, 예상 수량, 희망 일정을 정리합니다.",
  "getPriceAnnouncementDisplay",
  "ProductCatalog",
  "priceAnnouncement",
]);
expectText("src/app/(site)/products/[slug]/page.tsx", [
  "getProductPriceDisplay",
  "getPriceAnnouncementDisplay",
  "data-testid=\"product-detail-image-stage\"",
  "product-detail-price-confirmation-policy",
  "상품 참고가는 거래 확정가가 아니며",
  "문의 전 확인하면 상담이 빨라집니다",
  "전화 상담",
]);
expectText("src/app/(site)/company/page.tsx", [
  "data-testid=\"route-hero-media\"",
  "h-[12rem] min-h-[12rem]",
  "defaultCompanyHeroImages",
  "getOperationalSlotImages",
]);
expectNoText("src/app/(site)/company/page.tsx", [
  "/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
  "KCG 골드바 1돈 2돈 3돈 5돈 10돈 라인업 회사소개 이미지",
  "/campaign/kcg-real-goldbar-hand-consultation-20260511-v2.webp",
  "손 위에 놓인 KCG 실물 골드바 상담 이미지",
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
  "고금 주얼리",
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
  "참고가 낮은순",
  "참고가 높은순",
  "등록일순",
  "20개씩보기",
  "현재 고시가 기준",
  "product-price-confirmation-policy",
  "상품 참고가 적용 기준",
  "상품 카드의 참고가는 회사 고시 시세 기반이며 거래 확정가가 아닙니다.",
  "참고가입니다. 전화 또는 현장 확인 후 최종 안내합니다.",
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
  "getPublicProductImage",
  "data-image-role={productImage.role}",
  "representative_category",
  "image_pending",
  "data-testid=\"product-image-stage\"",
  "data-testid=\"product-trust-placeholder\"",
  "이미지 준비중",
  "승인된 상품 사진이 준비되면 같은 위치에 표시합니다.",
  "return \"aspect-[1/1.02]\"",
  "상담 확인",
  "goldbarDonGuide",
  "data-testid=\"goldbar-don-guide\"",
  "1·2·3·5·10돈 골드바를 상담 단위로 확인합니다.",
  "본사 연결",
  "kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
  "kcg-approved-goldbar-1don-20260517.jpg",
  "kcg-approved-goldbar-2don-20260517.jpg",
  "kcg-approved-goldbar-3don-20260517.jpg",
  "kcg-approved-goldbar-5don-20260517.jpg",
  "kcg-approved-goldbar-10don-20260517.jpg",
  "getPublicCatalogProducts",
  "col-span-2 sm:col-span-1",
]);
expectText("src/lib/product-presenter.ts", [
  "전체",
  "골드바",
  "실버바",
  "순금제품",
  "고금 주얼리 매입",
  "B2B·기업",
  "productCatalogTabs",
  "if (imageUrl?.startsWith(\"/\"))",
  "legacyProductImageReplacements",
  "replaceablePlaceholderImages",
  "publicProductCatalogTabs",
  "isPublicCatalogProduct",
  "publicProductOverridesBySlug",
  "getPublicCatalogProduct",
  "shouldUseImageOverride",
  "getProductImageOverridePresentation",
  "getPublicCatalogProducts",
  "findPublicCatalogProductBySlug",
  "forcedDefaultImageSlugs",
  "trustedPublicProductImageRulesBySlug",
  "representativePublicProductImageRulesByCategory",
  "approvedRepresentativeProductImagePaths",
  "imagePendingProductSlugs",
  "isApprovedImageAssetForUsage",
  "image_pending",
  "pure-gold-card-1g",
  "pure-gold-commemorative-medal",
  "getTrustedProductImageSrc",
  "getPublicProductImage",
  "bulk-gold-bar-consulting",
  "대량 골드바 상담",
  "kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
  "canonicalPublicProducts",
  "kcg-approved-goldbar-2don-20260517.jpg",
  "kcg-approved-goldbar-3don-20260517.jpg",
  "kcg-approved-goldbar-5don-20260517.jpg",
  "/brand/kcg-logo.png",
  "kcg-home-product-keyvisual-20260503.webp",
  "kcg-product-jewelry-buying-20260503.webp",
  "kcg-b2b-gift-packaging-20260430.webp",
  "kcg-product-pure-gold-gifts-20260506.webp",
  "kcg-old-gold-process-20260506.webp",
]);
expectNoText("src/lib/product-presenter.ts", ["!defaultProductImages.has(imageUrl)"]);
expectNoText("src/lib/product-presenter.ts", [
  "kcg-ai-goldbar",
  "kcg-generated-goldbar",
  "kcg-real-goldbar-frontback",
  "kcg-real-goldbar-don-lineup-studio",
  "kcg-gold-silver",
  "kcg-products-gold-silver",
  "kcg-silverbar-",
  "kcg-product-b2b-consulting",
  "kcg-product-corporate-consulting",
  "kcg-product-gold-silver-catalog",
  "kcg-silver-bar-catalog",
  "kcg-silver-gift",
]);
expectNoText("src/components/products/product-catalog.tsx", [
  "if (!imageSrc) return \"min-h",
  "min-h-[15.5rem] sm:min-h-[16rem]",
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
  "silverbarDonGuide",
  "data-testid=\"silverbar-don-guide\"",
  "kcg-silverbar-",
  "kcg-gold-silver",
  "kcg-ai-goldbar",
  "kcg-generated-goldbar",
  "kcg-real-goldbar-frontback",
  "kcg-real-goldbar-don-lineup-studio",
  "kcg-real-photo-goldbar-lineup-20260514.jpg",
  "kcg-real-photo-goldbar-1don-20260514.jpg",
  "kcg-real-photo-goldbar-2don-20260514.jpg",
  "kcg-real-photo-goldbar-3don-20260514.jpg",
  "kcg-real-photo-goldbar-5don-20260514.jpg",
  "kcg-real-photo-goldbar-10don-20260514.jpg",
]);
expectNoText("src/app/(site)/products/page.tsx", ["kcg-real-photo-goldbar-lineup-20260514.jpg"]);
expectNoText("src/lib/product-presenter.ts", ["kcg-real-photo-goldbar-lineup-20260514.jpg"]);
[
  "src/app/(site)/products/page.tsx",
  "src/components/products/product-catalog.tsx",
  "src/mock/products.ts",
  "supabase/seed.sql",
].forEach((relativePath) =>
  expectNoText(relativePath, ["사진과 가격 문구", "등록해 운영", "관리자에서"]),
);
expectText("src/lib/product-presenter.ts", [
  "/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
  "/products/kcg-approved-goldbar-1don-20260517.jpg",
  "/products/kcg-approved-goldbar-2don-20260517.jpg",
  "/products/kcg-approved-goldbar-3don-20260517.jpg",
  "/products/kcg-approved-goldbar-5don-20260517.jpg",
  "/products/kcg-approved-goldbar-10don-20260517.jpg",
  "/brand/kcg-logo.png",
  "trustedPublicProductImageRulesBySlug",
  "getTrustedProductImageSrc",
  "getPublicProductImage",
  "bulk-gold-bar-consulting",
  "대량 골드바 상담",
]);

expectText("src/mock/products.ts", [
  "KCG 골드바 1돈",
  "KCG 골드바 2돈",
  "KCG 골드바 3돈",
  "KCG 골드바 5돈",
  "KCG 골드바 10돈",
  "KCG 실버바 1kg",
  "고금 주얼리 매입",
  "old-gold-jewelry-buying",
  "현재 고시가 기준 참고가",
  "custom_order",
  "bulk-gold-bar-consulting",
  "대량 골드바 상담",
  "imageUrl: null",
  "/products/kcg-approved-goldbar-1don-20260517.jpg",
  "/products/kcg-approved-goldbar-10don-20260517.jpg",
  "/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
]);
expectText("supabase/seed.sql", [
  "KCG 골드바 1돈",
  "KCG 골드바 2돈",
  "KCG 골드바 3돈",
  "KCG 골드바 5돈",
  "KCG 골드바 10돈",
  "KCG 실버바 1kg",
  "고금 주얼리 매입",
  "old-gold-jewelry-buying",
  "귀금속 매입 절차 안내",
  "bulk-gold-bar-consulting",
  "대량 골드바 상담",
  "image_url,",
  "/products/kcg-approved-goldbar-1don-20260517.jpg",
  "/products/kcg-approved-goldbar-10don-20260517.jpg",
  "/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
]);
["src/mock/products.ts", "supabase/seed.sql"].forEach((relativePath) =>
  expectNoText(relativePath, ["/campaign/kcg-real-goldbar-hand-consultation-20260511-v2.webp"]),
);
["src/mock/products.ts", "supabase/seed.sql"].forEach((relativePath) =>
  expectNoText(relativePath, [
    "/products/kcg-silverbar-",
    "/campaign/kcg-gold-silver-",
    "/campaign/kcg-products-gold-silver-",
    "/products/kcg-ai-goldbar-tray-20260511.webp",
    "/products/kcg-ai-goldbar-1g-representative-20260512.webp",
    "/products/kcg-ai-goldbar-10g-representative-20260512.webp",
    "/products/kcg-ai-goldbar-100g-representative-20260512.webp",
    "/products/kcg-real-goldbar-don-lineup-20260511-v2.webp",
    "/campaign/kcg-real-goldbar-promo-banner-20260511-v2.webp",
    "/products/kcg-product-b2b-consulting-20260503.webp",
    "/products/kcg-product-corporate-consulting-20260506.webp",
    "/products/kcg-product-gold-silver-catalog-20260503.webp",
    "/products/kcg-silver-bar-catalog-20260427.jpg",
    "/products/kcg-silver-gift-20260427-v2.jpg",
  ]),
);
expectText("src/types/product.ts", ["displayOrder", "priceLabel", "ProductUpsertInput", "ProductPriceBasis", "pure_gold"]);
expectText("src/actions/product-actions.ts", ["upsertProductAction", "revalidatePath(\"/products\")", "priceBasis", "weightGrams"]);
expectText("src/app/admin/products/page.tsx", [
  "AdminProductsWorkspace",
  "getApprovedProductImageAssets",
  "approvedUploadedAssets",
  "imageOptions",
  "getActiveProductKey",
  "siteImageUploadMaxLabel",
  "저장됨 · 상품 정보가 공개 데이터에 반영되었습니다.",
  "이미지는 KCG 기본 자산 또는 관리자 업로드 자산만 연결할 수 있습니다.",
  "교체 완료 · 선택한 파일이 이 상품 대표 사진으로 바로 반영되었습니다.",
  "상품 대표 사진 연결 중 오류가 발생했습니다.",
  "Storage 업로드 중 오류가 발생했습니다. 파일 크기/형식 또는 Supabase Storage 로그를 확인해야 합니다.",
  "이미지 파일을 확인해 주세요. JPG, PNG, WebP만 가능하고",
]);
expectText("src/app/admin/products/admin-products-workspace.tsx", [
  "상품 관리",
  "AdminProductsWorkspace",
  "ProductEditor",
  "data-testid=\"admin-product-table\"",
  "data-testid=\"admin-product-image-filter\"",
  "data-testid=\"admin-product-editor\"",
  "data-testid=\"admin-product-image-workflow\"",
  "admin-product-editor-panel",
  "scrollIntoView",
  "getImageProvenance",
  "이미지 상태",
  "이미지 교체",
  "admin-product-image-upload-form",
  "handleUploadSubmit",
  "uploadSiteAssetFromForm",
  "admin-product-upload-status",
  "이미지 확인 필터",
  "실물 기준",
  "업로드 이미지",
  "공개 상품 화면과 동일한 기본 이미지",
  "상품 사진 바로 교체",
  "파일 선택 후 한 번에 반영",
  "이 사진으로 바로 교체",
  "applyToProduct",
  "productKey",
  "고급 설정 열기",
  "3. 상품명·가격·노출 정보도 같이 수정하기",
  "고급 설정 저장",
  "siteImageUploadMaxLabel",
  "siteImageUploadMaxBytes",
  "admin-product-selected-file",
  "formatUploadFileSize",
  "이미지 준비중 placeholder 유지",
  "needs-real-photo",
  "replace-placeholder",
  "admin-product-row-${product.slug}",
  "admin-product-mobile-image-note-${product.slug}",
  "공개 `/products`와 같은 1·2·3·5·10돈 골드바",
  "대표 사진 저장 중",
  "연동 시세",
  "중량(g)",
  "상담 기준 공임",
  "수동 가격",
  "upsertProductAction",
]);
expectText("src/lib/image-asset-manifest.ts", [
  "getApprovedProductImageAssets",
  "isApprovedOperationalProductImagePath",
  "isLockedGoldbarSkuImagePath",
  "isTrustedSiteAssetUrl",
]);
expectText("src/actions/product-actions.ts", [
  "isApprovedOperationalProductImagePath",
  "isGeneratedCandidateAssetPath",
  "isTrustedSiteAssetUrl",
  "invalid-image",
  "validateProductImagePath",
]);
expectNoText("src/app/admin/products/page.tsx", [
  "/products/kcg-silverbar-",
  "/products/kcg-ai-goldbar-",
  "/products/kcg-generated-goldbar-",
  "/products/kcg-real-goldbar-frontback-",
  "/products/kcg-real-goldbar-don-lineup-studio",
  "/campaign/kcg-gold-silver-",
  "/campaign/kcg-products-gold-silver-",
  "/campaign/kcg-real-photo-goldbar-products-banner-20260514.jpg",
  "/campaign/kcg-real-photo-goldbar-price-banner-20260514.jpg",
  "/campaign/kcg-real-photo-goldbar-opening-banner-20260514.jpg",
  "/products/kcg-product-b2b-consulting-20260503.webp",
  "/products/kcg-product-corporate-consulting-20260506.webp",
  "/products/kcg-product-gold-silver-catalog-20260503.webp",
  "/products/kcg-silver-bar-catalog-20260427.jpg",
  "/products/kcg-silver-gift-20260427-v2.jpg",
]);
expectNoText("src/app/admin/products/admin-products-workspace.tsx", [
  'imageUrl.startsWith("/products/kcg-")',
  'imageUrl.startsWith("/campaign/")',
]);
expectText("src/app/admin/media/page.tsx", [
  "AdminMediaWorkspace",
  "siteImageUploadMaxLabel",
  "홈 배너 이미지",
  "상품 이미지",
  "상품/매입 상단 이미지",
  "서비스 이미지",
  "매장안내 이미지",
  "회사소개 이미지",
  "공지 썸네일",
  "defaultHomeHeroImages",
  "defaultProductsHeroImages",
  "defaultServicesHeroImages",
  "defaultStoreGuideHeroImages",
  "defaultCompanyHeroImages",
]);
expectText("src/app/admin/media/admin-media-workspace.tsx", [
  "이미지 교체 센터",
  "admin-media-operator-cards",
  "admin-media-upload-form",
  "admin-media-slot-manager",
  "admin-media-approved-list",
  "admin-media-review-list",
  "admin-media-selected-file",
  "admin-media-upload-status",
  "siteImageUploadMaxLabel",
  "siteImageUploadMaxBytes",
  "formatUploadFileSize",
  "고급 정보 보기",
  "고급 연결 열기",
  "이 이미지로 바로 반영",
  "connectToSlot",
  "바로 사용 가능 이미지로 업로드",
  "상태 변경 후 연결 가능",
  "슬라이드에 추가",
  "handleUploadSubmit",
  "uploadSiteAssetFromForm",
  "connectSiteAssetUsageAction",
  "updateSiteAssetApprovalAction",
]);
expectText("src/lib/site-asset-upload-client.ts", [
  "createSiteAssetSignedUploadAction",
  "finalizeSiteAssetSignedUploadAction",
  "cleanupSiteAssetSignedUploadAction",
  "crypto.subtle.digest",
  "fetch(signedUrl",
  "method: \"PUT\"",
  "x-upsert",
]);
expectText("src/lib/site-assets.ts", [
  "getOperationalSlotImages",
  "defaultHomeHeroImages",
  "defaultProductsHeroImages",
  "defaultServicesHeroImages",
  "defaultStoreGuideHeroImages",
  "defaultCompanyHeroImages",
  "/campaign/kcg-approved-goldbar-lineup-reflection-20260517.jpg",
  "/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
  "/campaign/kcg-old-gold-process-20260506.webp",
  "/campaign/kcg-home-seoul-retail-20260506.webp",
  "/campaign/kcg-home-human-consultation-20260506.webp",
  "KCG 실물 골드바 1돈 2돈 3돈 5돈 10돈 라인업 이미지",
  "approvalStatus !== \"approved\"",
  "isTrustedSiteAssetUrl",
  "slotAllowedUsage",
]);
expectText("src/components/home/final-home.tsx", [
  "getOperationalSlotImages",
  "defaultHomeHeroImages",
  "campaignSlides={homeHeroImages.map",
]);
expectText("src/app/(site)/products/page.tsx", [
  "getOperationalSlotImages",
  "defaultProductsHeroImages",
  "products_hero",
]);
expectText("src/app/(site)/services/page.tsx", [
  "getOperationalSlotImages",
  "defaultServicesHeroImages",
  "services_hero",
]);
expectText("src/app/(site)/about/page.tsx", [
  "getOperationalSlotImages",
  "defaultStoreGuideHeroImages",
  "store_guide_hero",
]);
expectText("src/app/(site)/company/page.tsx", [
  "getOperationalSlotImages",
  "defaultCompanyHeroImages",
  "company_hero",
]);
expectText("src/lib/site-upload-policy.ts", [
  "siteImageUploadMaxBytes = 10 * 1024 * 1024",
  "siteImageUploadMaxLabel = \"10MB\"",
  "siteImageUploadServerActionBodyLimit = \"12mb\"",
  "image/jpeg",
  "image/png",
  "image/webp",
  "formatUploadFileSize",
]);
expectText("next.config.ts", [
  "siteImageUploadServerActionBodyLimit",
  "serverActions",
  "bodySizeLimit",
]);
expectText("src/actions/media-actions.ts", [
  "requireAdminActionSession",
  "allowedMimeTypes",
  "siteImageUploadAllowedMimeTypes",
  "siteImageUploadMaxBytes",
  "site-assets",
  "approvalStatus !== \"approved\"",
  "ensureSiteAssetsBucket",
  "createBucket",
  "createSignedUploadUrl",
  "createSiteAssetSignedUploadAction",
  "finalizeSiteAssetSignedUploadAction",
  "applyUploadedProductImage",
  "connectToSlot",
  "image-saved",
  "image-applied",
  "media-schema-error",
  "operatorUploadPresets",
  "targetKind",
  "getSafeReturnPath",
]);
expectText("src/components/admin/admin-form-guard.tsx", [
  "beforeunload",
  "data-admin-save-guard",
  "adminPendingMessage",
  "aria-live",
  "admin-save-live-region",
]);
expectText("src/components/admin/admin-submit-button.tsx", [
  "data-admin-pending",
  "pendingLabel",
  "useFormStatus",
]);
expectText("src/lib/auth/session.ts", [
  "missing-required",
  "requiresExplicitAdminSessionSecret",
  "process.env.VERCEL_ENV === \"preview\"",
  "process.env.VERCEL_ENV === \"production\"",
]);
expectText("src/actions/auth-actions.ts", [
  "sanitizeAdminNextPath",
  "value.startsWith(\"/admin/\")",
  "session",
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
  "image_asset_id",
  "site_assets",
  "site_asset_usages",
  "site_assets_size_bytes_check check (size_bytes > 0 and size_bytes <= 10485760)",
  "10485760",
  "product_change_history",
  "media_change_history",
  "kcg_update_prices_atomic",
  "prices_value_positive_check",
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
  '"qa:quick": "node scripts/run-site-qa.mjs --quick"',
  '"qa:site": "node scripts/run-site-qa.mjs"',
]);
expectText("playwright.config.ts", ["nextEnv.loadEnvConfig(process.cwd(), true)", "process.env.SITE_AUDIT_URL"]);
expectText("tests/site-fidelity.spec.ts", [
  "/admin/launch",
  "/admin/announcements",
  "/admin/media",
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
  "admin-media-mobile.png",
  "admin-media-desktop.png",
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
  "Goldbar product/catalog surfaces use",
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
  "전체`, `골드바`, `고금 주얼리 매입`, and `B2B·기업`",
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
  "kcg-approved-goldbar-lineup-reflection-20260517.jpg",
  "kcg-approved-goldbar-lineup-no-reflection-20260517.jpg",
  "kcg-approved-goldbar-1don/2don/3don/5don/10don-20260517.jpg",
  "source-ready KCG goldbar image QA gate",
  "trust placeholders",
  "kcg-real-photo-goldbar-lineup-20260514.jpg",
  "kcg-real-photo-goldbar-1don-20260514.jpg",
  "kcg-real-photo-goldbar-10don-20260514.jpg",
  "kcg-real-photo-goldbar-product-3-75g-20260514.jpg",
  "docs/brand/kcg-real-photo-goldbar-assets-2026-05-14.md",
  "Public silverbar guide/card/detail surfaces are disabled until separate approval",
  "505-88-03567",
  "the rejected campaign banner variants are no longer active UI",
  "Stable Review Deploy Boundary",
]);
expectNoText("docs/setup/CURRENT_HANDOFF.md", ["Gabia", "Whois DNS"]);
expectText("docs/setup/OPEN_TASKS.md", [
  "KCG Open Tasks",
  "KCG-TODO-001",
  "KCG-TODO-128",
  "Post-v0.2.75 operational risk ledger",
  "production write smoke remain separate Gates",
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
  "KCG-TODO-097",
  "KCG-TODO-096",
  "KCG-TODO-095",
  "KCG-TODO-094",
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
  "KCG-TODO-084",
  "KCG-TODO-086",
  "KCG-TODO-087",
  "KCG-TODO-088",
  "KCG-TODO-089",
  "KCG-TODO-090",
  "KCG-TODO-091",
  "KCG-TODO-098",
  "kcg-real-photo-goldbar-products-banner-20260514.jpg",
  "kcg-real-photo-goldbar-product-3-75g-20260514.jpg",
  "Main banner mock image removal",
  "docs/brand/retired-public-assets/2026-05-14/public/campaign/",
  "kcg-gold-silver-premium-banner-20260513.webp",
  "kcg-price-desk-gold-silver-banner-20260513.webp",
  "kcg-opening-premium-banner-20260513.webp",
  "kcg-products-gold-silver-consult-banner-20260513.webp",
  "kcg-silverbar-don-lineup-studio-v2-20260513.webp",
  "kcg-silverbar-1don/2don/3don/5don/10don-studio-20260513.webp",
  "kcg-silverbar-frontback-100g/500g/1kg-20260513.webp",
  "kcg-real-goldbar-promo-banner-20260513.webp",
  "kcg-real-goldbar-don-lineup-studio-v2-20260513.webp",
  "kcg-real-goldbar-1don-studio-20260513.webp",
  "kcg-real-goldbar-2don-studio-20260513.webp",
  "kcg-real-goldbar-3don-studio-20260513.webp",
  "kcg-real-goldbar-5don-studio-20260513.webp",
  "kcg-real-goldbar-10don-studio-20260513.webp",
  "kcg-ai-goldbar-1g-representative-20260512.webp",
  "kcg-ai-goldbar-10g-representative-20260512.webp",
  "kcg-ai-goldbar-100g-representative-20260512.webp",
  "kcg-real-goldbar-promo-banner-20260511-v2.webp",
  "kcg-real-goldbar-hand-consultation-20260511-v2.webp",
  "kcg-ai-goldbar-tray-20260511.webp",
  "kcg-real-goldbar-don-lineup-20260511-v2.webp",
  "kcg-ai-goldbar-don-lineup-20260511.webp",
  "real KCG-derived",
  "kcg-real-goldbar-price-desk-20260511.webp",
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
  "Operator Image Ownership",
  "/admin/products",
  "/admin/products` is for product-specific photos",
  "/admin/media` is for banners and page-level images",
  "Default `/admin/products` must mirror the public 7-row catalog",
  "hidden/stale data",
  "Production upload smoke is not routine QA",
  "현재 고시가 기준 참고가",
  "Real Photo Replacement Priority",
  "docs/brand/product-image-replacement-map-2026-05-08.md",
  "상담용 대표 이미지",
  "As of v0.2.46",
  "rejected campaign banner images",
  "As of v0.2.45",
  "public `/products` hides silverbar cards, guide, and detail routes until separate approval",
  "Use approved real silverbar photos only",
  "Do not use `구매하기`, `결제하기`, `주문하기`, `장바구니`",
]);
expectFile("docs/setup/POST_V0_2_75_OPERATIONAL_RISK_LEDGER.md", { minBytes: 3_000 });
expectText("docs/setup/POST_V0_2_75_OPERATIONAL_RISK_LEDGER.md", [
  "Post v0.2.75 Operational Risk Ledger",
  "v0.2.75 Release Surface",
  "getPublicCatalogProducts()",
  "public image presenter",
  "Admin default `/admin/products` list must mirror that public 7-row catalog",
  "hidden/stale data",
  "Production DB cleanup requires a separate SQL plan, rollback SQL, and explicit production DB data-change approval.",
  "KCG-TODO-124 Owner SQL Plan",
  "site_assets",
  "site_asset_usages",
  "media_change_history",
  "products.image_asset_id",
  "site_assets_size_bytes_check",
  "10485760",
  "Production Write Smoke Policy",
  "Default QA is read-only",
  "Production write smoke requires explicit approval",
  "SITE_AUDIT_URL=https://kcgold.co.kr npm run audit:site",
  "SITE_AUDIT_URL=https://kcgold.co.kr npm run test:site",
  "This pass does not change",
  "public prices",
  "search/noindex/robots release state",
  "payment, cart, checkout, or live trading behavior",
  "secrets, env values, admin password, or OAuth",
]);
expectNoText("src/components/products/product-catalog.tsx", [
  "상담용 대표 이미지",
  "실물 색상과 패키지는 현장 확인 후 안내합니다.",
  "KCG 실물 골드바 사진을 사이트용으로 최적화한 파생 이미지입니다.",
]);
expectNoText("src/app/(site)/products/[slug]/page.tsx", [
  "상담용 대표 이미지",
  "실제 상품 사진·포장·재고는 전화 상담과 현장 확인 후 안내합니다.",
]);
expectText("tests/site-fidelity.spec.ts", [
  "public goldbar product images use product-shot assets without representative labels",
  "not.toContainText(\"상담용 대표 이미지\")",
  "not.toContainText(\"사이트용으로 최적화한 파생 이미지\")",
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
  "kcg-real-photo-goldbar-products-banner-20260514.jpg",
  "kcg-real-photo-goldbar-price-banner-20260514.jpg",
  "kcg-real-photo-goldbar-opening-banner-20260514.jpg",
  "kcg-real-photo-goldbar-product-3-75g-20260514.jpg",
  "kcg-real-goldbar-promo-banner-20260513.webp",
  "kcg-real-goldbar-frontback-1g-20260513.webp",
  "kcg-real-goldbar-frontback-3-75g-20260513.webp",
  "kcg-real-goldbar-frontback-10g-20260513.webp",
  "kcg-real-goldbar-frontback-37-5g-20260513.webp",
  "kcg-real-goldbar-frontback-100g-20260513.webp",
  "kcg-silverbar-don-lineup-studio-v2-20260513.webp",
  "kcg-silverbar-1don-studio-20260513.webp",
  "kcg-silverbar-2don-studio-20260513.webp",
  "kcg-silverbar-3don-studio-20260513.webp",
  "kcg-silverbar-5don-studio-20260513.webp",
  "kcg-silverbar-10don-studio-20260513.webp",
  "kcg-silverbar-frontback-100g-20260513.webp",
  "kcg-silverbar-frontback-500g-20260513.webp",
  "kcg-silverbar-frontback-1kg-20260513.webp",
  "docs/brand/kcg-silverbar-banner-assets-2026-05-13.md",
  "kcg-real-goldbar-hand-consultation-20260511-v2.webp",
  "kcg-real-goldbar-price-desk-20260511.webp",
  "kcg-korean-consultation-hands-20260511.webp",
  "kcg-real-goldbar-lineup-20260511.webp",
  "kcg-ai-goldbar-don-lineup-20260511.webp",
  "kcg-ai-goldbar-hand-consultation-20260511.webp",
  "kcg-ai-goldbar-tray-20260511.webp",
  "kcg-ai-goldbar-large-inquiry-20260511.webp",
  "kcg-ai-goldbar-1g-representative-20260512.webp",
  "kcg-ai-goldbar-10g-representative-20260512.webp",
  "kcg-ai-goldbar-100g-representative-20260512.webp",
  "docs/brand/kcg-ai-goldbar-product-assets-2026-05-11.md",
  "docs/brand/kcg-real-goldbar-product-assets-2026-05-11.md",
  "docs/brand/kcg-real-image-assets-2026-05-11.md",
  "kcg-home-price-desk-20260506.webp",
  "public/image-options/2026-05-03",
  "contact sheets",
  "optimized WebPs",
  "Wikimedia Commons",
  "Do not copy private document photos",
  "Natural tiny bar engravings",
  "Home main slide banner",
  "large white haze",
  "Old gold and jewelry buying card",
  "No readable personal documents",
]);
expectText("docs/brand/kcg-real-image-assets-2026-05-11.md", [
  "Competitor Benchmark",
  "한국금거래소",
  "삼성금거래소",
  "한국표준금거래소",
  "KGS",
  "한국감정금거래소",
  "GBK",
  "/campaign/kcg-real-goldbar-price-desk-20260511.webp",
  "/campaign/kcg-korean-consultation-hands-20260511.webp",
  "/campaign/kcg-real-opening-campaign-20260511.webp",
  "/products/kcg-real-goldbar-lineup-20260511.webp",
  "/products/kcg-real-goldbar-detail-20260511.webp",
  "/products/kcg-real-goldbar-single-20260511.webp",
  "/campaign/kcg-real-goldbar-promo-banner-20260511-v2.webp",
  "/campaign/kcg-real-goldbar-hand-consultation-20260511-v2.webp",
  "/products/kcg-real-goldbar-don-lineup-20260511-v2.webp",
  "/products/kcg-real-goldbar-1don-20260511.webp",
  "/products/kcg-real-goldbar-10don-20260511.webp",
  "/products/kcg-real-goldbar-frontback-1g-20260513.webp",
  "/products/kcg-real-goldbar-frontback-3-75g-20260513.webp",
  "/products/kcg-real-goldbar-frontback-10g-20260513.webp",
  "/products/kcg-real-goldbar-frontback-37-5g-20260513.webp",
  "/products/kcg-real-goldbar-frontback-100g-20260513.webp",
  "Public product pages should not show `상담용 대표 이미지`",
  "Raw KakaoTalk filenames are still not used in public URLs.",
  "v0.2.32 실제 KCG 이미지 파생 적용 전으로 되돌려줘",
]);
expectText("docs/brand/kcg-real-goldbar-product-assets-2026-05-11.md", [
  "KCG Real Goldbar Product Assets",
  "/campaign/kcg-real-goldbar-promo-banner-20260513.webp",
  "/products/kcg-real-goldbar-don-lineup-studio-v2-20260513.webp",
  "/products/kcg-real-goldbar-1don-studio-20260513.webp",
  "/products/kcg-real-goldbar-2don-studio-20260513.webp",
  "/products/kcg-real-goldbar-3don-studio-20260513.webp",
  "/products/kcg-real-goldbar-5don-studio-20260513.webp",
  "/products/kcg-real-goldbar-10don-studio-20260513.webp",
  "/products/kcg-real-goldbar-frontback-1g-20260513.webp",
  "/products/kcg-real-goldbar-frontback-3-75g-20260513.webp",
  "/products/kcg-real-goldbar-frontback-10g-20260513.webp",
  "/products/kcg-real-goldbar-frontback-37-5g-20260513.webp",
  "/products/kcg-real-goldbar-frontback-100g-20260513.webp",
  "Public wording: customer-facing `/products` and goldbar detail pages do not show `상담용 대표 이미지`",
  "IMG_4282.PNG",
  "IMG_4283.PNG",
  "/campaign/kcg-real-goldbar-promo-banner-20260511-v2.webp",
  "/campaign/kcg-real-goldbar-hand-consultation-20260511-v2.webp",
  "/products/kcg-real-goldbar-don-lineup-20260511-v2.webp",
  "/products/kcg-real-goldbar-1don-20260511.webp",
  "/products/kcg-real-goldbar-2don-20260511.webp",
  "/products/kcg-real-goldbar-3don-20260511.webp",
  "/products/kcg-real-goldbar-5don-20260511.webp",
  "/products/kcg-real-goldbar-10don-20260511.webp",
  "No raw KakaoTalk original filename was copied into `public`.",
  "v0.2.35 실제 KCG 골드바 상품/배너 재작업 전으로 되돌려줘",
  "v0.2.36 손바닥 골드바 핵심 이미지 제거 전으로 되돌려줘",
  "v0.2.39 KCG 골드바 스튜디오형 상품/배너 이미지 전으로 되돌려줘",
  "v0.2.42 골드바 front/back 상품컷 교정 전으로 되돌려줘",
]);
expectText("docs/brand/kcg-ai-goldbar-product-assets-2026-05-11.md", [
  "KCG AI Goldbar Product Assets",
  "/products/kcg-ai-goldbar-don-lineup-20260511.webp",
  "/products/kcg-ai-goldbar-hand-consultation-20260511.webp",
  "/products/kcg-ai-goldbar-tray-20260511.webp",
  "/products/kcg-ai-goldbar-large-inquiry-20260511.webp",
  "/products/kcg-ai-goldbar-1g-representative-20260512.webp",
  "/products/kcg-ai-goldbar-10g-representative-20260512.webp",
  "/products/kcg-ai-goldbar-100g-representative-20260512.webp",
  "/products/kcg-real-goldbar-frontback-1g-20260513.webp",
  "/products/kcg-real-goldbar-frontback-3-75g-20260513.webp",
  "/products/kcg-real-goldbar-frontback-10g-20260513.webp",
  "/products/kcg-real-goldbar-frontback-37-5g-20260513.webp",
  "/products/kcg-real-goldbar-frontback-100g-20260513.webp",
  "1돈 = 3.75g",
  "2돈 = 7.5g",
  "3돈 = 11.25g",
  "5돈 = 18.75g",
  "10돈 = 37.5g",
  "No raw KakaoTalk original filename was copied into `public`.",
  "v0.2.34 골드바 상품 이미지 가이드 전으로 되돌려줘",
]);
expectText("docs/brand/kcg-image-intake-2026-05-08.md", [
  "KCG Image Intake 2026-05-08",
  "C:\\Users\\junyo\\Documents\\File-Hub\\80_보관\\사진_영상\\Images\\KCG 이미지",
  "metadata and visual review only",
  "No raw source files were copied into `public/`",
  "KakaoTalk_20260427_125126082.png",
  "KakaoTalk_20260427_125126082_01.png",
  "KakaoTalk_20260508_091553653.png",
  "KakaoTalk_20260508_091603752.jpg",
  "KakaoTalk_20260508_150411746.jpg",
  "KakaoTalk_20260508_150416296.jpg",
  "KakaoTalk_20260508_164514053.jpg",
  "logo candidate",
  "gold-bar product-photo candidate",
  "approval required",
  "Do not use as final product proof",
]);
expectText("docs/brand/kcg-silverbar-banner-assets-2026-05-13.md", [
  "KCG Silverbar And Banner Assets",
  "v0.2.43",
  "kcg-gold-silver-premium-banner-20260513.webp",
  "kcg-price-desk-gold-silver-banner-20260513.webp",
  "kcg-opening-premium-banner-20260513.webp",
  "kcg-products-gold-silver-consult-banner-20260513.webp",
  "kcg-silverbar-don-lineup-studio-v2-20260513.webp",
  "kcg-silverbar-1don-studio-20260513.webp",
  "kcg-silverbar-10don-studio-20260513.webp",
  "kcg-silverbar-frontback-100g-20260513.webp",
  "kcg-silverbar-frontback-500g-20260513.webp",
  "kcg-silverbar-frontback-1kg-20260513.webp",
  "consultation-unit guide only",
  "final inventory proof",
  "KCG-TODO-095",
]);
expectText("docs/brand/product-image-replacement-map-2026-05-08.md", [
  "Product Image Replacement Map 2026-05-08",
  "KCG-TODO-054",
  "No public image was replaced",
  "approval-first",
  "current public image",
  "recommended KCG candidate group",
  "docs/brand/kcg-silverbar-banner-assets-2026-05-13.md",
  "kcg-gold-silver-premium-banner-20260513.webp",
  "kcg-price-desk-gold-silver-banner-20260513.webp",
  "kcg-opening-premium-banner-20260513.webp",
  "kcg-products-gold-silver-consult-banner-20260513.webp",
  "kcg-silverbar-don-lineup-studio-v2-20260513.webp",
  "kcg-silverbar-frontback-100g-20260513.webp",
  "kcg-silverbar-frontback-500g-20260513.webp",
  "kcg-silverbar-frontback-1kg-20260513.webp",
  "IMG_4282.PNG",
  "IMG_4283.PNG",
  "kcg-real-goldbar-promo-banner-20260513.webp",
  "kcg-real-goldbar-don-lineup-studio-v2-20260513.webp",
  "kcg-real-goldbar-1don-studio-20260513.webp",
  "kcg-real-goldbar-10don-studio-20260513.webp",
  "kcg-real-goldbar-frontback-1g-20260513.webp",
  "kcg-real-goldbar-frontback-3-75g-20260513.webp",
  "kcg-real-goldbar-frontback-10g-20260513.webp",
  "kcg-real-goldbar-frontback-37-5g-20260513.webp",
  "kcg-real-goldbar-frontback-100g-20260513.webp",
  "KakaoTalk_20260508_091603752.jpg",
  "KakaoTalk_20260508_091553653.png",
  "KakaoTalk_20260508_150411746*.jpg",
  "kcg-real-goldbar-don-lineup-20260511-v2.webp",
  "kcg-real-goldbar-1don-20260511.webp",
  "kcg-ai-goldbar-1g-representative-20260512.webp",
  "kcg-ai-goldbar-10g-representative-20260512.webp",
  "kcg-ai-goldbar-100g-representative-20260512.webp",
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
    "KCG 골드바 1돈",
    "현재 고시가 기준",
  ]);
  await expectUrl("/products/investment-gold-bar-consulting", [
    "KCG 골드바 1돈",
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
  await expectUrlRobotsMeta("/", ["noindex", "nofollow"]);
  await expectUrlRobotsMeta("/prices", ["noindex", "nofollow"]);
  await expectUrlRobotsMeta("/products", ["noindex", "nofollow"]);
  await expectUrlRobotsMeta("/services", ["noindex", "nofollow"]);
  await expectUrlRobotsMeta("/about", ["noindex", "nofollow"]);
  await expectUrlRobotsMeta("/announcements", ["noindex", "nofollow"]);
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
