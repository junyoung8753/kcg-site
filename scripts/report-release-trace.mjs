import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function runGit(args) {
  const result = spawnSync("git", args, {
    cwd: rootDir,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return "";
  }

  return result.stdout.trim();
}

function read(relativePath) {
  return readFileSync(resolve(rootDir, relativePath), "utf8");
}

const packageJson = JSON.parse(read("package.json"));
const changelog = read("docs/setup/CHANGELOG.md");
const latestMatch = changelog.match(/^## v(\d+\.\d+\.\d+)\s*-\s*(.+)$/m);
const deployMatch = changelog.match(/^- Deploy Status:\s*(.+)$/m);
const rollbackMatch = changelog.match(/^- Rollback Hint:\s*(.+)$/m);
const head = runGit(["rev-parse", "--short", "HEAD"]) || "unknown";
const branch = runGit(["branch", "--show-current"]) || "unknown";
const status = runGit(["status", "--porcelain"]);
const dirtyFiles = status ? status.split(/\r?\n/).filter(Boolean).length : 0;

const latestVersion = latestMatch?.[1] || "missing";
const latestSummary = latestMatch?.[2] || "missing";
const statusLabel = dirtyFiles > 0 ? `${dirtyFiles} uncommitted path(s)` : "clean";

if (latestVersion !== packageJson.version) {
  console.error(`FAIL version mismatch: package ${packageJson.version}, changelog ${latestVersion}`);
  process.exit(1);
}

console.log("KCG release trace");
console.log(`- Version: v${packageJson.version}`);
console.log(`- Summary: ${latestSummary}`);
console.log(`- Branch: ${branch}`);
console.log(`- HEAD: ${head}`);
console.log(`- Working tree: ${statusLabel}`);
console.log(`- Deploy Status: ${deployMatch?.[1] || "missing"}`);
console.log(`- Rollback Hint: ${rollbackMatch?.[1] || "missing"}`);

if (dirtyFiles > 0) {
  console.log("- Note: this version is not fully commit-traceable until the current working tree is committed.");
}

