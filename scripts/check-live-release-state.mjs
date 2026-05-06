#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const liveUrl = process.env.SITE_AUDIT_URL || "https://kcgold.co.kr";

function readJson(relativePath) {
  return JSON.parse(readFileSync(resolve(rootDir, relativePath), "utf8"));
}

function parseVersion(version) {
  return version.split(".").map((part) => Number(part));
}

function versionGte(version, minimum) {
  const current = parseVersion(version);
  const floor = parseVersion(minimum);

  for (let index = 0; index < Math.max(current.length, floor.length); index += 1) {
    const currentPart = current[index] || 0;
    const floorPart = floor[index] || 0;

    if (currentPart > floorPart) return true;
    if (currentPart < floorPart) return false;
  }

  return true;
}

async function fetchJson(pathname) {
  const response = await fetch(new URL(pathname, liveUrl));
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`${pathname} returned HTTP ${response.status}`);
  }

  return JSON.parse(text);
}

const packageJson = readJson("package.json");
const currentVersion = packageJson.version;
const expectedHealthFields = [
  {
    since: "0.2.18",
    name: "inquiry assistant health fields",
    fields: [
      "inquiryAssistantMode",
      "inquiryAssistantStoresMessages",
      "inquiryAssistantCollectsPersonalData",
    ],
  },
  {
    since: "0.2.20",
    name: "search approval health fields",
    fields: ["searchApprovalRequired", "searchApproved", "forceNoindex", "searchExposureStatus"],
  },
].filter((feature) => versionGte(currentVersion, feature.since));

const results = [];

function addResult(status, name, detail) {
  results.push({ status, name, detail });
}

try {
  const health = await fetchJson("/api/health");
  addResult(
    "pass",
    "live /api/health reachable",
    `mode=${health.mode}, deployment=${health.deployment}, indexing=${health.indexing}`,
  );

  for (const feature of expectedHealthFields) {
    const missingFields = feature.fields.filter((field) => !(field in health));

    if (missingFields.length > 0) {
      addResult(
        "warn",
        `live behind source: ${feature.name}`,
        `local v${currentVersion} expects ${missingFields.join(", ")} from v${feature.since}+`,
      );
    } else {
      addResult("pass", feature.name, `present for local v${currentVersion}`);
    }
  }

  if (health.indexing === "enabled" && health.searchApproved !== true) {
    addResult(
      "fail",
      "search exposure guard",
      "live reports indexing=enabled without searchApproved=true",
    );
  } else if (health.indexing === "enabled") {
    addResult("warn", "search exposure guard", "live reports indexing=enabled; confirm public-launch approval");
  } else {
    addResult("pass", "search exposure guard", "live is not search-indexable");
  }
} catch (error) {
  addResult("fail", "live release state", error instanceof Error ? error.message : String(error));
}

const maxStatus = Math.max(...results.map((result) => result.status.length));
const maxName = Math.max(...results.map((result) => result.name.length));

console.log(`KCG live release state for ${liveUrl}`);
console.log(`- Local source version: v${currentVersion}`);

for (const result of results) {
  console.log(
    `${result.status.toUpperCase().padEnd(maxStatus)} ${result.name.padEnd(maxName)}  ${result.detail}`,
  );
}

if (results.some((result) => result.status === "fail")) {
  process.exitCode = 1;
}
