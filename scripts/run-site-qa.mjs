import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";

const npmCommand = "npm";
const isQuick = process.argv.includes("--quick") || process.env.KCG_QA_QUICK === "1";

const parallelPreflightSteps = [
  ["Lint", npmCommand, ["run", "lint"]],
  ["Typecheck", npmCommand, ["run", "typecheck"]],
  ["Source fidelity audit", npmCommand, ["run", "audit:site"]],
];

const fullOnlySteps = [
  ["Build", npmCommand, ["run", "build"]],
  ["NPM audit", npmCommand, ["audit", "--audit-level=moderate"]],
];

class StepFailure extends Error {
  constructor(label, status) {
    super(`${label} failed with exit code ${status ?? 1}`);
    this.status = status ?? 1;
  }
}

function getSpawnTarget(command, args) {
  return process.platform === "win32" && command === npmCommand
    ? { command: "cmd.exe", args: ["/d", "/s", "/c", "npm.cmd", ...args] }
    : { command, args };
}

function runStepSync([label, command, args, extraEnv]) {
  console.log(`\n==> ${label}`);
  const spawnTarget = getSpawnTarget(command, args);

  const result = spawnSync(spawnTarget.command, spawnTarget.args, {
    env: { ...process.env, ...(extraEnv || {}) },
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new StepFailure(label, result.status);
  }
}

function runStepCapture([label, command, args, extraEnv]) {
  console.log(`\n==> ${label}`);
  const spawnTarget = getSpawnTarget(command, args);

  const result = spawnSync(spawnTarget.command, spawnTarget.args, {
    env: { ...process.env, ...(extraEnv || {}) },
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new StepFailure(label, result.status);
  }

  return `${result.stdout || ""}\n${result.stderr || ""}`;
}

function runStepAsync([label, command, args, extraEnv]) {
  console.log(`\n==> ${label}`);
  const spawnTarget = getSpawnTarget(command, args);

  return new Promise((resolve, reject) => {
    const child = spawn(spawnTarget.command, spawnTarget.args, {
      env: { ...process.env, ...(extraEnv || {}) },
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (status) => {
      if (status === 0) {
        resolve();
        return;
      }
      reject(new Error(`${label} failed with exit code ${status ?? 1}`));
    });
  });
}

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

function getPreferredQaPort() {
  const rawPort = process.env.KCG_QA_PORT;
  if (!rawPort) return 3040;
  if (!/^\d+$/.test(rawPort)) {
    throw new Error("KCG_QA_PORT must be a numeric TCP port.");
  }
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("KCG_QA_PORT must be between 1024 and 65535.");
  }
  return port;
}

function getLocalQaEnv() {
  const env = {};
  if (!process.env.ADMIN_PASSWORD) env.ADMIN_PASSWORD = "0000";
  if (!process.env.ADMIN_SESSION_SECRET) env.ADMIN_SESSION_SECRET = "local-admin-session-secret";
  if (process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "production") {
    env.VERCEL_ENV = "development";
  }
  return env;
}

function startServer(port) {
  const command =
    process.platform === "win32"
      ? ["cmd.exe", ["/d", "/s", "/c", `npm.cmd run start -- -p ${port}`]]
      : [npmCommand, ["run", "start", "--", "-p", port]];

  const server = spawn(command[0], command[1], {
    env: { ...process.env, ...getLocalQaEnv(), PORT: port },
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

async function runBrowserStages() {
  const externalBaseURL = process.env.SITE_AUDIT_URL || "";
  const port = externalBaseURL ? "" : await getAvailablePort(getPreferredQaPort());
  const baseURL = externalBaseURL || `http://127.0.0.1:${port}`;
  let server;

  try {
    if (!externalBaseURL) {
      server = startServer(port);
      await waitForServer(baseURL);
    }

    const renderedAuditOutput = runStepCapture([
      "Rendered fidelity audit",
      process.execPath,
      ["scripts/audit-site-fidelity.mjs"],
      { SITE_AUDIT_URL: baseURL, ...getLocalQaEnv() },
    ]);
    if (!/Site fidelity audit passed \(\d+ checks, 0 skipped\)\./.test(renderedAuditOutput)) {
      throw new Error("Rendered audit did not finish with 0 skipped checks.");
    }

    runStepSync(["Browser fidelity tests", npmCommand, ["run", "test:site"], { SITE_AUDIT_URL: baseURL, ...getLocalQaEnv() }]);
    runStepSync(["Review screenshots", npmCommand, ["run", "screenshot:site"], { SITE_AUDIT_URL: baseURL, ...getLocalQaEnv() }]);
  } finally {
    stopServer(server);
  }
}

try {
  await Promise.all(parallelPreflightSteps.map((step) => runStepAsync(step)));

  if (isQuick) {
    console.log("\nKCG quick QA passed.");
    process.exit(0);
  }

  await Promise.all(fullOnlySteps.map((step) => runStepAsync(step)));
  await runBrowserStages();

  console.log("\nKCG site QA passed.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(error instanceof StepFailure ? error.status : 1);
}
