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
const adminScreenshotFiles = ["admin-launch-mobile.png", "admin-launch-desktop.png"];
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

async function capture(page, route, viewport, filename, expectedText) {
  await page.setViewportSize(viewport);
  await page.goto(new URL(route, baseURL).href, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  const bodyText = await page.locator("body").innerText();
  if (!bodyText.includes(expectedText)) {
    throw new Error(`Refusing to capture ${route}; missing expected text: ${expectedText}`);
  }
  await page.screenshot({ path: resolve(screenshotDir, filename), fullPage: true });
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

  await capture(page, "/", { width: 390, height: 1800 }, "home-mobile.png", "한국센터금거래소 시세표");
  await capture(page, "/", { width: 1440, height: 1800 }, "home-desktop.png", "한국센터금거래소 시세표");
  await capture(page, "/prices", { width: 390, height: 1800 }, "prices-mobile.png", "품목별 회사 고시 시세 상세");
  await capture(page, "/products", { width: 390, height: 1800 }, "products-mobile.png", "상품/매입");
  await capture(page, "/services", { width: 390, height: 1800 }, "services-mobile.png", "취급 품목, 당일 기준");
  await capture(page, "/company", { width: 390, height: 1800 }, "company-mobile.png", "사업자등록번호");
  await capture(page, "/about", { width: 390, height: 1800 }, "about-mobile.png", "사업자등록번호");

  if (includeAdminScreenshots) {
    await captureAdminLaunch(page, { width: 390, height: 1800 }, "admin-launch-mobile.png");
    await captureAdminLaunch(page, { width: 1440, height: 1600 }, "admin-launch-desktop.png");
  } else {
    console.log("Skipped admin launch screenshots. Set KCG_INCLUDE_ADMIN_SCREENSHOTS=1 for local evidence.");
  }

  console.log(`Screenshots saved in ${screenshotDir}`);
} finally {
  await browser?.close();
  stopServer(server);
}
