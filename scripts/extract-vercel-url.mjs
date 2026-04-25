import { readFileSync } from "node:fs";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: node scripts/extract-vercel-url.mjs <vercel-output-file>");
  process.exit(1);
}

const output = readFileSync(filePath, "utf8").trim();
let deploymentUrl = "";

try {
  const parsed = JSON.parse(output);
  deploymentUrl = parsed?.deployment?.url || parsed?.url || "";
} catch {
  const match = output.match(/https:\/\/[^\s"]+\.vercel\.app/);
  deploymentUrl = match?.[0] || "";
}

if (!deploymentUrl) {
  console.error(`Could not find a Vercel deployment URL in ${filePath}`);
  process.exit(1);
}

console.log(deploymentUrl);
