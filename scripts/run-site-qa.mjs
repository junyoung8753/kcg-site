import { spawnSync } from "node:child_process";

const npmCommand = "npm";

const steps = [
  ["Lint", npmCommand, ["run", "lint"]],
  ["Typecheck", npmCommand, ["run", "typecheck"]],
  ["Source fidelity audit", npmCommand, ["run", "audit:site"]],
  ["Build", npmCommand, ["run", "build"]],
  [
    "Rendered fidelity audit",
    process.execPath,
    ["scripts/run-rendered-site-audit.mjs"],
    { KCG_RENDERED_AUDIT_SKIP_BUILD: "1" },
  ],
  ["Browser fidelity tests", npmCommand, ["run", "test:site"]],
  ["Review screenshots", npmCommand, ["run", "screenshot:site"]],
  ["NPM audit", npmCommand, ["audit", "--audit-level=moderate"]],
];

for (const [label, command, args, extraEnv] of steps) {
  console.log(`\n==> ${label}`);
  const spawnTarget =
    process.platform === "win32" && command === npmCommand
      ? { command: "cmd.exe", args: ["/d", "/s", "/c", "npm.cmd", ...args] }
      : { command, args };

  const result = spawnSync(spawnTarget.command, spawnTarget.args, {
    env: { ...process.env, ...(extraEnv || {}) },
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\nKCG site QA passed.");
