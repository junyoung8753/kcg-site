import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import nextEnv from "@next/env";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(rootDir);

const externalBaseURL = process.env.SITE_AUDIT_URL || "";
const configuredPort = process.env.SITE_SCREENSHOT_PORT || "";
const port = externalBaseURL ? "" : configuredPort || (await getAvailablePort(0));
const baseURL = externalBaseURL || `http://127.0.0.1:${port}`;
const screenshotDir = resolve(rootDir, "output", "screenshots");
const includeAdminScreenshots = process.env.KCG_INCLUDE_ADMIN_SCREENSHOTS === "1";
const adminScreenshotsOnly = process.env.KCG_ADMIN_SCREENSHOTS_ONLY === "1";
const adminScreenshotFiles = [
  "admin-login-mobile.png",
  "admin-home-desktop.png",
  "admin-launch-mobile.png",
  "admin-launch-desktop.png",
  "admin-prices-manual-desktop.png",
  "admin-prices-auto-desktop.png",
  "admin-prices-auto-mobile.png",
  "admin-announcements-desktop.png",
  "admin-products-mobile.png",
  "admin-products-desktop.png",
  "admin-media-mobile.png",
  "admin-media-desktop.png",
];
const adminPassword =
  process.env.ADMIN_PASSWORD ||
  process.env.KCG_SCREENSHOT_ADMIN_PASSWORD ||
  process.env.KCG_TEST_ADMIN_PASSWORD ||
  "0000";

async function getAvailablePort(preferredPort) {
  return new Promise((resolvePort, rejectPort) => {
    const tester = createServer();
    tester.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolvePort(getAvailablePort(preferredPort + 1));
        return;
      }
      rejectPort(error);
    });
    tester.once("listening", () => {
      const address = tester.address();
      const selectedPort = typeof address === "object" && address ? address.port : preferredPort;
      tester.close(() => resolvePort(String(selectedPort)));
    });
    tester.listen(preferredPort, "127.0.0.1");
  });
}

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
    env: {
      ...process.env,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || adminPassword,
      ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET || "local-admin-session-secret",
      PORT: port,
    },
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

async function isServerAvailable(url) {
  try {
    const response = await fetch(url);
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
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

async function assertScreenshotImagesLoaded(page, { fullPage, filename }) {
  const criticalAltPatterns = [
    "KCG 실물 골드바",
    "KCG 로고와 실물 골드바",
    "KCG 골드바",
  ];
  await page
    .waitForFunction(
      ({ fullPage: shouldCheckFullPage, criticalAlts }) => {
        const viewportHeight = window.innerHeight;
        const isActuallyVisible = (image) => {
          const rect = image.getBoundingClientRect();
          if (rect.width <= 1 || rect.height <= 1) return false;
          let element = image;
          while (element && element !== document.documentElement) {
            if (element instanceof HTMLDetailsElement && !element.open) {
              return false;
            }
            const style = window.getComputedStyle(element);
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              style.visibility === "collapse" ||
              style.opacity === "0"
            ) {
              return false;
            }
            element = element.parentElement;
          }
          return true;
        };
        return Array.from(document.images).every((image) => {
          const rect = image.getBoundingClientRect();
          const isVisible = isActuallyVisible(image);
          const isInViewport = rect.bottom > 0 && rect.top < viewportHeight;
          const isCritical = criticalAlts.some((pattern) => image.alt.includes(pattern));
          if (!isVisible || (!shouldCheckFullPage && !isInViewport) || (shouldCheckFullPage && !isCritical)) {
            return true;
          }
          return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
        });
      },
      { fullPage, criticalAlts: criticalAltPatterns },
      { timeout: 8_000 },
    )
    .catch(() => {});

  const unloadedImages = await page.evaluate(({ fullPage: shouldCheckFullPage, criticalAlts }) => {
    const viewportHeight = window.innerHeight;
    const isActuallyVisible = (image) => {
      const rect = image.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) return false;
      let element = image;
      while (element && element !== document.documentElement) {
        if (element instanceof HTMLDetailsElement && !element.open) {
          return false;
        }
        const style = window.getComputedStyle(element);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.visibility === "collapse" ||
          style.opacity === "0"
        ) {
          return false;
        }
        element = element.parentElement;
      }
      return true;
    };
    return Array.from(document.images)
      .map((image) => {
        const rect = image.getBoundingClientRect();
        const isVisible = isActuallyVisible(image);
        const isInViewport = rect.bottom > 0 && rect.top < viewportHeight;
        const isCritical = criticalAlts.some((pattern) => image.alt.includes(pattern));
        const loaded = image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
        return {
          alt: image.alt,
          src: image.currentSrc || image.src,
          isVisible,
          isInViewport,
          isCritical,
          loaded,
        };
      })
      .filter(
        (image) =>
          image.isVisible &&
          (shouldCheckFullPage ? image.isCritical : image.isInViewport) &&
          !image.loaded,
      )
      .slice(0, 8);
  }, { fullPage, criticalAlts: criticalAltPatterns });

  if (unloadedImages.length > 0) {
    const details = unloadedImages.map((image) => `${image.alt || "(no alt)"} -> ${image.src}`).join("; ");
    throw new Error(`Refusing to capture ${filename}; image(s) still unloaded: ${details}`);
  }
}

async function waitForTradingViewIfPresent(page, options = {}) {
  const widget = page.getByTestId("tradingview-market-widget");
  if ((await widget.count()) === 0) return false;

  if (options.scrollIntoView) {
    await widget.scrollIntoViewIfNeeded({ timeout: 3_000 }).catch(() => {});
  }
  await widget
    .locator("iframe")
    .first()
    .waitFor({ timeout: 20_000 })
    .catch(() => false);
  if ((await widget.locator("iframe").count()) === 0) return false;
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
  let bodyText = "";
  for (let attempt = 0; attempt < 3; attempt += 1) {
    bodyText = await page.locator("body").innerText();
    if (bodyText.includes(expectedText)) break;
    if (attempt === 2) break;
    await page.waitForTimeout(900);
    await page.goto(new URL(route, baseURL).href, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  }
  if (!bodyText.includes(expectedText)) {
    const bodyPreview = bodyText.replace(/\s+/g, " ").slice(0, 320);
    throw new Error(
      `Refusing to capture ${route}; missing expected text: ${expectedText}; url=${page.url()}; body=${bodyPreview}`,
    );
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
  await assertScreenshotImagesLoaded(page, { fullPage: isFullPageCapture, filename });
  await page.screenshot({ path: resolve(screenshotDir, filename), fullPage: isFullPageCapture });
}

async function captureFresh(browser, route, viewport, filename, expectedText, options = {}) {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  try {
    await capture(page, route, viewport, filename, expectedText, options);
  } finally {
    await page.close();
  }
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
  await page.getByText("자동시세 세부 설정").click();
  await page.locator('select[name="autoSource"]').waitFor({ state: "visible", timeout: 5_000 });
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
    await page.waitForURL((url) => url.pathname === route);
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  }

  const bodyText = await page.locator("body").innerText();
  if (!bodyText.includes(expectedText)) {
    throw new Error(`Refusing to capture ${route}; missing expected text: ${expectedText}`);
  }

  if (route === "/admin/announcements") {
    await page.getByTestId("admin-announcement-editor").waitFor({ state: "visible", timeout: 5_000 });
    await page.getByRole("button", { name: "공지 삭제" }).waitFor({ state: "visible", timeout: 5_000 });
  }

  await page.screenshot({ path: resolve(screenshotDir, filename), fullPage: true });
}

async function captureAdminLogin(page, viewport, filename) {
  await page.setViewportSize(viewport);
  await page.goto(new URL("/admin/login", baseURL).href, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});

  const bodyText = await page.locator("body").innerText();
  if (!bodyText.includes("관리자 로그인")) {
    throw new Error("Refusing to capture /admin/login; missing login heading.");
  }
  if (bodyText.includes("오늘 먼저 확인할 것")) {
    throw new Error("Refusing to capture /admin/login; admin shell is visible before login.");
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
    if (configuredPort && (await isServerAvailable(baseURL))) {
      console.log(`Reusing existing screenshot server at ${baseURL}`);
    } else {
      server = startServer();
      await waitForServer(baseURL);
    }
  }

  browser = await chromium.launch();

  if (!adminScreenshotsOnly) {
    await captureFresh(browser, "/", { width: 390, height: 844 }, "home-mobile-viewport.png", "한국센터금거래소 시세표", {
      fullPage: false,
      primeImages: false,
    });
    await captureFresh(browser, "/", { width: 1440, height: 900 }, "home-desktop-viewport.png", "한국센터금거래소 시세표", {
      fullPage: false,
      primeImages: false,
    });
    await captureFresh(
      browser,
      "/prices",
      { width: 390, height: 844 },
      "prices-mobile-viewport.png",
      "품목별 회사 고시 시세 상세",
      { fullPage: false, primeImages: false },
    );
    await captureFresh(
      browser,
      "/products",
      { width: 390, height: 844 },
      "products-mobile-viewport.png",
      "상품/매입",
      { fullPage: false, primeImages: false },
    );
    await captureFresh(
      browser,
      "/products/investment-gold-bar-consulting",
      { width: 390, height: 844 },
      "product-detail-mobile-viewport.png",
      "KCG 골드바 1돈",
      { fullPage: false, primeImages: false },
    );
    await captureFresh(
      browser,
      "/products/investment-gold-bar-consulting",
      { width: 1440, height: 900 },
      "product-detail-desktop-viewport.png",
      "KCG 골드바 1돈",
      { fullPage: false, primeImages: false },
    );
    await captureFresh(
      browser,
      "/services",
      { width: 390, height: 844 },
      "services-mobile-viewport.png",
      "품목 확인, 고시 기준",
      { fullPage: false, primeImages: false },
    );

    await captureFresh(browser, "/", { width: 390, height: 1800 }, "home-mobile.png", "한국센터금거래소 시세표");
    await captureFresh(browser, "/", { width: 1440, height: 1800 }, "home-desktop.png", "한국센터금거래소 시세표");
    await captureFresh(browser, "/prices", { width: 390, height: 1800 }, "prices-mobile.png", "품목별 회사 고시 시세 상세");
    await captureFresh(browser, "/products", { width: 390, height: 1800 }, "products-mobile.png", "상품/매입");
    await captureFresh(browser, "/products", { width: 1440, height: 1800 }, "products-desktop.png", "상품/매입");
    await captureFresh(
      browser,
      "/products/investment-gold-bar-consulting",
      { width: 390, height: 1800 },
      "product-detail-mobile.png",
      "KCG 골드바 1돈",
    );
    await captureFresh(browser, "/services", { width: 390, height: 1800 }, "services-mobile.png", "품목 확인, 고시 기준");
    await captureFresh(browser, "/company", { width: 390, height: 1800 }, "company-mobile.png", "사업자등록번호");
    await captureFresh(browser, "/about", { width: 390, height: 1800 }, "about-mobile.png", "사업자등록번호");
  }

  if (includeAdminScreenshots) {
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    try {
      await captureAdminLogin(page, { width: 390, height: 844 }, "admin-login-mobile.png");
      await captureAdminRoute(page, "/admin", { width: 1440, height: 1600 }, "admin-home-desktop.png", "오늘 먼저 확인할 것");
      await captureAdminLaunch(page, { width: 390, height: 1800 }, "admin-launch-mobile.png");
      await captureAdminLaunch(page, { width: 1440, height: 1600 }, "admin-launch-desktop.png");
      if (!externalBaseURL) {
        await captureAdminPricesManual(page, { width: 1440, height: 1800 }, "admin-prices-manual-desktop.png");
        await captureAdminPricesAuto(page, { width: 1440, height: 1800 }, "admin-prices-auto-desktop.png");
        await captureAdminPricesAuto(page, { width: 390, height: 1800 }, "admin-prices-auto-mobile.png");
        await captureAdminRoute(
          page,
          "/admin/announcements",
          { width: 1440, height: 1800 },
          "admin-announcements-desktop.png",
          "공지 관리",
        );
        await captureAdminRoute(
          page,
          "/admin/products",
          { width: 390, height: 1800 },
          "admin-products-mobile.png",
          "상품 관리",
        );
        await captureAdminRoute(
          page,
          "/admin/products",
          { width: 1440, height: 1800 },
          "admin-products-desktop.png",
          "상품 관리",
        );
        await captureAdminRoute(
          page,
          "/admin/media",
          { width: 390, height: 1800 },
          "admin-media-mobile.png",
          "이미지 교체 센터",
        );
        await captureAdminRoute(
          page,
          "/admin/media",
          { width: 1440, height: 1800 },
          "admin-media-desktop.png",
          "이미지 교체 센터",
        );
      }
    } finally {
      await page.close();
    }
  } else {
    console.log("Skipped admin launch screenshots. Set KCG_INCLUDE_ADMIN_SCREENSHOTS=1 for local evidence.");
  }

  console.log(`Screenshots saved in ${screenshotDir}`);
} finally {
  await browser?.close();
  stopServer(server);
}
