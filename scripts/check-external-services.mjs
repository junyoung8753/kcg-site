#!/usr/bin/env node

import { lookup, resolve4 } from "node:dns/promises";

const stableUrl = process.env.SITE_AUDIT_URL || "https://kcg-confirm-preview.vercel.app";
const expectedVercelA = "76.76.21.21";
const strictDomain = process.argv.includes("--strict-domain");

const results = [];

function addResult(name, status, detail) {
  results.push({ name, status, detail });
}

async function fetchText(path) {
  const response = await fetch(new URL(path, stableUrl));
  const text = await response.text();
  return { response, text };
}

async function checkStableHealth() {
  try {
    const { response, text } = await fetchText("/api/health");
    if (!response.ok) {
      addResult("stable /api/health", "fail", `HTTP ${response.status}`);
      return;
    }

    const health = JSON.parse(text);
    addResult(
      "stable /api/health",
      "pass",
      `mode=${health.mode}, deployment=${health.deployment}, indexing=${health.indexing}, adminAuth=${health.adminAuth}`,
    );
  } catch (error) {
    addResult("stable /api/health", "fail", error instanceof Error ? error.message : String(error));
  }
}

async function checkRobotsAndSitemap() {
  try {
    const { response, text } = await fetchText("/robots.txt");
    if (!response.ok) {
      addResult("stable robots.txt", "fail", `HTTP ${response.status}`);
    } else if (text.includes("Disallow: /")) {
      addResult("stable robots.txt", "pass", "pre-launch crawling remains blocked");
    } else {
      addResult("stable robots.txt", "fail", "Disallow: / is missing");
    }
  } catch (error) {
    addResult("stable robots.txt", "fail", error instanceof Error ? error.message : String(error));
  }

  try {
    const { response, text } = await fetchText("/sitemap.xml");
    if (!response.ok) {
      addResult("stable sitemap.xml", "fail", `HTTP ${response.status}`);
    } else if (text.includes("<urlset") && !text.includes("<loc>")) {
      addResult("stable sitemap.xml", "pass", "pre-launch sitemap is empty");
    } else {
      addResult("stable sitemap.xml", "warn", "sitemap contains URL entries; confirm launch approval before indexing");
    }
  } catch (error) {
    addResult("stable sitemap.xml", "fail", error instanceof Error ? error.message : String(error));
  }
}

async function checkDomainARecord(domain) {
  try {
    let records;
    try {
      records = await resolve4(domain);
    } catch (resolveError) {
      const lookupRecords = await lookup(domain, { all: true, family: 4 });
      records = lookupRecords.map((record) => record.address);
      if (!records.length) {
        throw resolveError;
      }
    }

    if (records.includes(expectedVercelA)) {
      addResult(`${domain} DNS`, "pass", `A ${records.join(", ")}`);
    } else {
      addResult(`${domain} DNS`, strictDomain ? "fail" : "warn", `A ${records.join(", ")}; expected ${expectedVercelA}`);
    }
  } catch (error) {
    addResult(
      `${domain} DNS`,
      strictDomain ? "fail" : "warn",
      `${error instanceof Error ? error.message : String(error)}; Cafe24 needs A ${domain} ${expectedVercelA}`,
    );
  }
}

await checkStableHealth();
await checkRobotsAndSitemap();
await checkDomainARecord("kcgold.co.kr");
await checkDomainARecord("www.kcgold.co.kr");

const maxName = Math.max(...results.map((result) => result.name.length));
for (const result of results) {
  console.log(`${result.status.toUpperCase().padEnd(4)} ${result.name.padEnd(maxName)}  ${result.detail}`);
}

const hasFailure = results.some((result) => result.status === "fail");
if (hasFailure) {
  process.exitCode = 1;
}
