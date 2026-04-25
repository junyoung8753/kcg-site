import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const externalBaseURL = process.env.SITE_AUDIT_URL || "";
const port = process.env.SITE_SCREENSHOT_PORT || "3038";
const baseURL = externalBaseURL || `http://127.0.0.1:${port}`;
const screenshotDir = resolve(rootDir, "output", "screenshots");

function startServer() {
  if (!/^\d+$/.test(port)) {
    throw new Error(`SITE_SCREENSHOT_PORT must be numeric, received: ${port}`);
  }

  const command =
    process.platform === "win32"
      ? ["cmd.exe", ["/d", "/s", "/c", `npm.cmd run start -- -p ${port}`]]
      : ["npm", ["run", "start", "--", "-p", port]];

  return spawn(command[0], command[1], {
    cwd: rootDir,
    env: { ...process.env, PORT: port },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function stopServer(server) {
  if (!server?.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  server.kill("SIGTERM");
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
  await page.goto(new URL(route, baseURL).href, { waitUntil: "networkidle" });
  const bodyText = await page.locator("body").innerText();
  if (!bodyText.includes(expectedText)) {
    throw new Error(`Refusing to capture ${route}; missing expected text: ${expectedText}`);
  }
  await page.screenshot({ path: resolve(screenshotDir, filename), fullPage: true });
}

let server;
let browser;

try {
  mkdirSync(screenshotDir, { recursive: true });

  if (!externalBaseURL) {
    server = startServer();
    await waitForServer(baseURL);
  }

  browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  await capture(page, "/", { width: 390, height: 1800 }, "home-mobile.png", "한국센터금거래소 시세표");
  await capture(page, "/", { width: 1440, height: 1800 }, "home-desktop.png", "한국센터금거래소 시세표");
  await capture(page, "/prices", { width: 390, height: 1800 }, "prices-mobile.png", "품목별 회사 고시 시세 상세");
  await capture(page, "/services", { width: 390, height: 1800 }, "services-mobile.png", "취급 품목과 상담 범위 안내");

  console.log(`Screenshots saved in ${screenshotDir}`);
} finally {
  await browser?.close();
  stopServer(server);
}
