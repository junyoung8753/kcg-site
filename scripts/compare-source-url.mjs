import { spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceBase = process.env.SOURCE_SITE_URL || "https://kcg-confirm-preview.vercel.app";
const port = process.env.SOURCE_COMPARE_PORT || "3047";
const localBase = process.env.LOCAL_SITE_URL || `http://127.0.0.1:${port}`;
const routes = (process.env.SOURCE_COMPARE_ROUTES || "/,/prices,/announcements,/services,/about,/admin/login,/api/health")
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean);
const outputDir = resolve(rootDir, "output", "source-parity");

function normalizeText(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

function shortHash(text) {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function firstDiff(sourceText, localText) {
  const maxLength = Math.max(sourceText.length, localText.length);
  let index = 0;
  while (index < maxLength && sourceText[index] === localText[index]) index += 1;

  return {
    index,
    sourceAround: sourceText.slice(Math.max(0, index - 80), index + 160),
    localAround: localText.slice(Math.max(0, index - 80), index + 160),
  };
}

async function waitForServer(url, timeoutMs = 120_000) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 750));
  }

  throw new Error(`Timed out waiting for ${url}: ${lastError?.message || "unknown error"}`);
}

async function inspect(page, baseUrl, route, label) {
  const url = new URL(route, baseUrl).href;
  const response = await page.goto(url, { waitUntil: route === "/api/health" ? "load" : "networkidle" });
  const pageData = await page.evaluate(() => {
    const images = [...document.images].map((image) => ({
      alt: image.alt || "",
      src: image.getAttribute("src") || "",
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      complete: image.complete,
    }));
    const links = [...document.querySelectorAll("a")].map((link) => ({
      text: (link.textContent || "").replace(/\s+/g, " ").trim(),
      href: link.getAttribute("href") || "",
    }));

    return {
      title: document.title,
      h1: [...document.querySelectorAll("h1")].map((heading) =>
        (heading.textContent || "").replace(/\s+/g, " ").trim(),
      ),
      bodyText: document.body ? document.body.innerText : document.documentElement.innerText,
      htmlLength: document.documentElement.outerHTML.length,
      imageCount: images.length,
      linkCount: links.length,
      images,
      links,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  const text = normalizeText(pageData.bodyText);

  if (route !== "/api/health") {
    const filenameRoute = route === "/" ? "home" : route.replaceAll("/", "-");
    await page.screenshot({
      path: resolve(outputDir, `${label}-${filenameRoute}-mobile.png`),
      fullPage: true,
    });
  }

  return {
    url,
    status: response?.status() || 0,
    title: pageData.title,
    h1: pageData.h1,
    textLength: text.length,
    textHash: shortHash(text),
    text,
    htmlLength: pageData.htmlLength,
    imageCount: pageData.imageCount,
    linkCount: pageData.linkCount,
    images: pageData.images,
    links: pageData.links,
    overflow: pageData.overflow,
  };
}

function startLocalServer() {
  if (process.env.LOCAL_SITE_URL) return null;
  if (!existsSync(resolve(rootDir, ".next"))) {
    throw new Error("Missing .next build output. Run `npm run build` before `npm run compare:source`.");
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

function stopLocalServer(server) {
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

function comparableImageList(pageData) {
  return pageData.images.map((image) => `${image.alt}|${image.src}|${image.naturalWidth}x${image.naturalHeight}`);
}

function comparableLinkList(pageData) {
  return pageData.links.map((link) => `${link.text}|${link.href}`);
}

mkdirSync(outputDir, { recursive: true });

let server;
let browser;

try {
  server = startLocalServer();
  await waitForServer(localBase);

  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 1600 }, deviceScaleFactor: 1 });
  const results = [];

  for (const route of routes) {
    const source = await inspect(page, sourceBase, route, "source");
    const local = await inspect(page, localBase, route, "local");
    const sourceImages = comparableImageList(source);
    const localImages = comparableImageList(local);
    const sourceLinks = comparableLinkList(source);
    const localLinks = comparableLinkList(local);
    const textMatches = source.textHash === local.textHash;

    results.push({
      route,
      source: {
        url: source.url,
        status: source.status,
        title: source.title,
        h1: source.h1,
        textLength: source.textLength,
        textHash: source.textHash,
        imageCount: source.imageCount,
        linkCount: source.linkCount,
        overflow: source.overflow,
      },
      local: {
        url: local.url,
        status: local.status,
        title: local.title,
        h1: local.h1,
        textLength: local.textLength,
        textHash: local.textHash,
        imageCount: local.imageCount,
        linkCount: local.linkCount,
        overflow: local.overflow,
      },
      equal: {
        status: source.status === local.status,
        title: source.title === local.title,
        h1: JSON.stringify(source.h1) === JSON.stringify(local.h1),
        text: textMatches,
        imageList: JSON.stringify(sourceImages) === JSON.stringify(localImages),
        linkList: JSON.stringify(sourceLinks) === JSON.stringify(localLinks),
      },
      firstTextDiff: textMatches ? null : firstDiff(source.text, local.text),
      sourceOnlyImageAlts: [...new Set(source.images.map((image) => image.alt).filter(Boolean))].filter(
        (alt) => !new Set(local.images.map((image) => image.alt)).has(alt),
      ),
      localOnlyImageAlts: [...new Set(local.images.map((image) => image.alt).filter(Boolean))].filter(
        (alt) => !new Set(source.images.map((image) => image.alt)).has(alt),
      ),
    });
  }

  const reportPath = resolve(outputDir, "parity-report.json");
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        sourceBase,
        localBase,
        generatedAt: new Date().toISOString(),
        routes: results,
      },
      null,
      2,
    ),
    "utf8",
  );

  let mismatchCount = 0;
  for (const result of results) {
    const routeMismatches = Object.entries(result.equal).filter(([, value]) => !value);
    mismatchCount += routeMismatches.length;
    console.log(
      `${routeMismatches.length === 0 ? "PASS" : "DIFF"} ${result.route} ` +
        routeMismatches.map(([key]) => key).join(","),
    );
  }
  console.log(`Source parity report: ${reportPath}`);

  if (mismatchCount > 0) {
    process.exitCode = 1;
  }
} finally {
  await browser?.close();
  stopLocalServer(server);
}
