import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outputFile = process.argv[2];

if (!outputFile) {
  console.error("Usage: node scripts/run-vercel-preview-deploy.mjs <output-json-file>");
  process.exit(1);
}

const requiredEnv = [
  "TEAM_SCOPE",
  "SITE_URL",
  "KCG_PREVIEW_ADMIN_PASSWORD",
  "KCG_PREVIEW_ADMIN_SESSION_SECRET",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`${key} is not set.`);
    process.exit(1);
  }
}

const vercelCli = resolve(".vercel-cli", "node_modules", "vercel", "dist", "index.js");

if (!existsSync(vercelCli)) {
  console.error(`Vercel CLI was not found at ${vercelCli}`);
  process.exit(1);
}

const args = [
  vercelCli,
  "--scope",
  process.env.TEAM_SCOPE,
  "--yes",
  "--format",
  "json",
  "--build-env",
  "KCG_FORCE_NOINDEX=1",
  "--build-env",
  `NEXT_PUBLIC_SITE_URL=${process.env.SITE_URL}`,
  "--build-env",
  `ADMIN_PASSWORD=${process.env.KCG_PREVIEW_ADMIN_PASSWORD}`,
  "--build-env",
  `ADMIN_SESSION_SECRET=${process.env.KCG_PREVIEW_ADMIN_SESSION_SECRET}`,
  "--env",
  "KCG_FORCE_NOINDEX=1",
  "--env",
  `NEXT_PUBLIC_SITE_URL=${process.env.SITE_URL}`,
  "--env",
  `ADMIN_PASSWORD=${process.env.KCG_PREVIEW_ADMIN_PASSWORD}`,
  "--env",
  `ADMIN_SESSION_SECRET=${process.env.KCG_PREVIEW_ADMIN_SESSION_SECRET}`,
];

const result = spawnSync(process.execPath, args, {
  encoding: "utf8",
  env: process.env,
  shell: false,
  stdio: ["ignore", "pipe", "inherit"],
});

writeFileSync(outputFile, result.stdout || "", "utf8");

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
