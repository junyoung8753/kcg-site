import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import nextEnv from "@next/env";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(rootDir);

const externalBaseURL = process.env.SITE_AUDIT_URL || "";
const port = process.env.SITE_SCREENSHOT_PORT || "3038";
const baseURL = externalBaseURL || `http://127.0.0.1:${port}`;
const screenshotDir = resolve(rootDir, "output", "screenshots");
const includeAdminScreenshots = process.env.KCG_INCLUDE_ADMIN_SCREENSHOTS === "1";
const adminScreenshotsOnly = process.env.KCG_ADMIN_SCREENSHOTS_ONLY === "1";
const adminScreenshotFiles = [
  "admin-home-desktop.png",
  "admin-launch-mobile.png",
  "admin-launch-desktop.png",
  "admin-prices-manual-desktop.png",
  "admin-prices-auto-desktop.png",
  "admin-prices-auto-mobile.png",
  "admin-products-desktop.png",
];
const adminPassword =
  process.env.KCG_SCREENSHOT_ADMIN_PASSWORD ||
  process.env.KCG_TEST_ADMIN_PASSWORD ||
  process.env.ADMIN_PASSWORD ||
  "0000";

function startServer() {
  if (!/^\d+$/.test(port)) {
    throw new Error(`SITE_SCREENSHOT_PORT must be numeric, received: ${port}`);
  }

  const command =
    process.platform === "win32"
      ? ["cmd.exe", ["/d", "/s", "/c", `npm.cmd run start -- -p ${port}`]]
      : ["npm", ["run", "start", "--", "-p", port]];

  const server = spawn(command[0], command[1], {
    cwd: rootDir,
    env: { ...process.env, PORT: port },
    detached: process.platform !== "win32",
    stdio: "ignore",
  });
  server.unref();
  return server;
}

function stopServer(server) {
  if (!server?.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    server.kill("SIGTERM");
  }
}

async function waitForServer(url, timeoutMs = 120_000) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 750));
  }

  throw new Error(`Timed out waiting for ${url}: ${lastError?.message || "unknown error"}`);
}

async function primeLazyImagesForScreenshot(page) {
  const images = page.locator("img");
  const imageCount = await images.count();
  for (let index = 0; index < imageCount; index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded({ timeout: 2_000 }).catch(() => {});
    await image
      .evaluate(
        (node) =>
          node.complete && node.naturalWidth > 0
            ? true
            : Promise.race([
                new Promise((resolve) => {
                  const settle = () => resolve(true);
                  node.addEventListener("load", settle, { once: true });
                  node.addEventListener("error", settle, { once: true });
                }),
                new Promise((resolve) => setTimeout(resolve, 1_200)),
              ]),
      )
      .catch(() => {});
  }

  await page.evaluate(async () => {
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 180));
  });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
}

async function resetScrollForScreenshot(page) {
  await page.evaluate(async () => {
    window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    await new Promise((resolve) => setTimeout(resolve, 240));
  });
}

async function waitForTradingViewIfPresent(page, options = {}) {
  const widget = page.getByTestId("tradingview-market-widget");
  if ((await widget.count()) === 0) return false;

  if (options.scrollIntoView) {
    await widget.scrollIntoViewIfNeeded({ timeout: 3_000 }).catch(() => {});
  }
  await widget.locator("iframe").first().waitFor({ timeout: 20_000 });
  await page
    .waitForFunction(() => {
      const iframe = document.querySelector('[data-testid="tradingview-market-widget"] iframe');
      if (!iframe) return false;
      const loadingState = document.querySelector('[data-testid="tradingview-loading-state"]');
      return !loadingState;
    }, { timeout: 20_000 })
    .catch(() => {});
  await page.waitForTimeout(2_000);
  return true;
}

async function hideFixedChromeForFullPageScreenshot(page) {
  await page.addStyleTag({
    content: `
      [data-testid="site-header"],
      [data-testid="mobile-contact-bar"] {
        visibility: hidden !important;
      }
    `,
  });
}

async function capture(page, route, viewport, filename, expectedText, options = {}) {
  await page.setViewportSize(viewport);
  await page.goto(new URL(route, baseURL).href, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  const bodyText = await page.locator("body").innerText();
  if (!bodyText.includes(expectedText)) {
    throw new Error(`Refusing to capture ${route}; missing expected text: ${expectedText}`);
  }
  if (options.primeImages ?? (options.fullPage ?? true)) {
    await primeLazyImagesForScreenshot(page);
  } else {
    await resetScrollForScreenshot(page);
  }
  const isFullPageCapture = options.fullPage ?? true;
  const primedTradingView = await waitForTradingViewIfPresent(page, { scrollIntoView: isFullPageCapture });
  if (isFullPageCapture && !primedTradingView) {
    await resetScrollForScreenshot(page);
  }
  if (isFullPageCapture) {
    await hideFixedChromeForFullPageScreenshot(page);
  }
  await page.screenshot({ path: resolve(screenshotDir, filename), fullPage: isFullPageCapture });
}

async function captureAdminLaunch(page, viewport, filename) {
  await page.setViewportSize(viewport);
  await page.goto(new URL("/admin/launch", baseURL).href, { waitUntil: "domcontentloaded" });

  if (page.url().includes("/admin/login")) {
    await page.getByLabel("관리자 비밀번호").fill(adminPassword);
    await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
    await page.waitForURL(/\/admin\/launch/);
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  }

  const bodyText = await page.locator("body").innerText();
  if (!bodyText.includes("공개 직전 별도 승인 필요")) {
    throw new Error("Refusing to capture /admin/launch; missing public-launch approval text.");
  }

  await page.screenshot({ path: resolve(screenshotDir, filename), fullPage: true });
}

async function captureAdminPricesAuto(page, viewport, filename) {
  await page.setViewportSize(viewport);
  await page.goto(new URL("/admin/prices", baseURL).href, { waitUntil: "domcontentloaded" });

  if (page.url().includes("/admin/login")) {
    await page.getByLabel("관리자 비밀번호").fill(adminPassword);
    await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
    await page.waitForURL(/\/admin\/prices/);
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  }

  await page.getByTestId("admin-price-mode-toggle").click();
  await page.waitForFunction(() => {
    return document
      .querySelector('[data-testid="admin-price-mode-toggle"]')
      ?.getAttribute("aria-pressed") === "true";
  });
  await page.getByTestId("admin-price-auto-panel").waitFor({ state: "visible", timeout: 5_000 });
  await page.screenshot({ path: resolve(screenshotDir, filename), fullPage: true });
}

async function captureAdminPricesManual(page, viewport, filename) {
  await page.setViewportSize(viewport);
  await page.goto(new URL("/admin/prices", baseURL).href, { waitUntil: "domcontentloaded" });

  if (page.url().includes("/admin/login")) {
    await page.getByLabel("관리자 비밀번호").fill(adminPassword);
    await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
    await page.waitForURL(/\/admin\/prices/);
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  }

  const toggle = page.getByTestId("admin-price-mode-toggle");
  if ((await toggle.getAttribute("aria-pressed")) === "true") {
    await toggle.click();
    await page.waitForFunction(() => {
      return document
        .querySelector('[data-testid="admin-price-mode-toggle"]')
        ?.getAttribute("aria-pressed") === "false";
    });
  }
  await page.getByTestId("admin-price-editor").waitFor({ state: "visible", timeout: 5_000 });
  await page.screenshot({ path: resolve(screenshotDir, filename), fullPage: true });
}

async function captureAdminRoute(page, route, viewport, filename, expectedText) {
  await page.setViewportSize(viewport);
  await page.goto(new URL(route, baseURL).href, { waitUntil: "domcontentloaded" });

  if (page.url().includes("/admin/login")) {
    await page.getByLabel("관리자 비밀번호").fill(adminPassword);
    await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
    await page.waitForURL(new RegExp(route.replace(/\//g, "\\/")));
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  }

  const bodyText = await page.locator("body").innerText();
  if (!bodyText.includes(expectedText)) {
    throw new Error(`Refusing to capture ${route}; missing expected text: ${expectedText}`);
  }

  await page.screenshot({ path: resolve(screenshotDir, filename), fullPage: true });
}

function removeSkippedAdminScreenshots() {
  for (const filename of adminScreenshotFiles) {
    rmSync(resolve(screenshotDir, filename), { force: true });
  }
}

let server;
let browser;

try {
  mkdirSync(screenshotDir, { recursive: true });
  if (!includeAdminScreenshots) {
    removeSkippedAdminScreenshots();
  }

  if (!externalBaseURL) {
    server = startServer();
    await waitForServer(baseURL);
  }

  browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  if (!adminScreenshotsOnly) {
    await capture(page, "/", { width: 390, height: 844 }, "home-mobile-viewport.png", "한국센터금거래소 시세표", {
      fullPage: false,
      primeImages: false,
    });
    await capture(page, "/", { width: 1440, height: 900 }, "home-desktop-viewport.png", "한국센터금거래소 시세표", {
      fullPage: false,
      primeImages: false,
    });
    await capture(
      page,
      "/prices",
      { width: 390, height: 844 },
      "prices-mobile-viewport.png",
      "품목별 회사 고시 시세 상세",
      { fullPage: false, primeImages: false },
    );
    await capture(
      page,
      "/products",
      { width: 390, height: 844 },
      "products-mobile-viewport.png",
      "상품/매입",
      { fullPage: false, primeImages: false },
    );
    await capture(
      page,
      "/services",
      { width: 390, height: 844 },
      "services-mobile-viewport.png",
      "품목 확인, 고시 기준",
      { fullPage: false, primeImages: false },
    );

    await capture(page, "/", { width: 390, height: 1800 }, "home-mobile.png", "한국센터금거래소 시세표");
    await capture(page, "/", { width: 1440, height: 1800 }, "home-desktop.png", "한국센터금거래소 시세표");
    await capture(page, "/prices", { width: 390, height: 1800 }, "prices-mobile.png", "품목별 회사 고시 시세 상세");
    await capture(page, "/products", { width: 390, height: 1800 }, "products-mobile.png", "상품/매입");
    await capture(page, "/products", { width: 1440, height: 1800 }, "products-desktop.png", "상품/매입");
    await capture(page, "/services", { width: 390, height: 1800 }, "services-mobile.png", "품목 확인, 고시 기준");
    await capture(page, "/company", { width: 390, height: 1800 }, "company-mobile.png", "사업자등록번호");
    await capture(page, "/about", { width: 390, height: 1800 }, "about-mobile.png", "사업자등록번호");
  }

  if (includeAdminScreenshots) {
    await captureAdminRoute(page, "/admin", { width: 1440, height: 1600 }, "admin-home-desktop.png", "오늘 운영 상태");
    await captureAdminLaunch(page, { width: 390, height: 1800 }, "admin-launch-mobile.png");
    await captureAdminLaunch(page, { width: 1440, height: 1600 }, "admin-launch-desktop.png");
    if (!externalBaseURL) {
      await captureAdminPricesManual(page, { width: 1440, height: 1800 }, "admin-prices-manual-desktop.png");
      await captureAdminPricesAuto(page, { width: 1440, height: 1800 }, "admin-prices-auto-desktop.png");
      await captureAdminPricesAuto(page, { width: 390, height: 1800 }, "admin-prices-auto-mobile.png");
      await captureAdminRoute(
        page,
        "/admin/products",
        { width: 1440, height: 1800 },
        "admin-products-desktop.png",
        "상품 관리",
      );
    }
  } else {
    console.log("Skipped admin launch screenshots. Set KCG_INCLUDE_ADMIN_SCREENSHOTS=1 for local evidence.");
  }

  console.log(`Screenshots saved in ${screenshotDir}`);
} finally {
  await browser?.close();
  stopServer(server);
}
