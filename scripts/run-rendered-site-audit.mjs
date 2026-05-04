import { spawn, spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = "npm";
const port = process.env.SITE_AUDIT_PORT || "3039";
const externalBaseURL = process.env.SITE_AUDIT_URL || "";
const baseURL = externalBaseURL || `http://127.0.0.1:${port}`;
const skipBuild = process.env.KCG_RENDERED_AUDIT_SKIP_BUILD === "1";

function run(command, args, options = {}) {
  const spawnTarget =
    process.platform === "win32" && command === npmCommand
      ? { command: "cmd.exe", args: ["/d", "/s", "/c", "npm.cmd", ...args] }
      : { command, args };

  const result = spawnSync(spawnTarget.command, spawnTarget.args, {
    cwd: rootDir,
    env: { ...process.env, ...options.env },
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (options.capture) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  if (result.status !== 0) {
    throw new Error(`${spawnTarget.command} ${spawnTarget.args.join(" ")} exited with ${result.status}`);
  }

  return result;
}

function startServer() {
  if (!/^\d+$/.test(port)) {
    throw new Error(`SITE_AUDIT_PORT must be numeric, received: ${port}`);
  }

  const command =
    process.platform === "win32"
      ? ["cmd.exe", ["/d", "/s", "/c", `npm.cmd run start -- -p ${port}`]]
      : [npmCommand, ["run", "start", "--", "-p", port]];

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

let server;

try {
  if (!externalBaseURL) {
    if (!skipBuild) {
      run(npmCommand, ["run", "build"]);
    }

    server = startServer();
    await waitForServer(baseURL);
  }

  const audit = run(process.execPath, ["scripts/audit-site-fidelity.mjs"], {
    capture: true,
    env: { SITE_AUDIT_URL: baseURL },
  });

  const combinedOutput = `${audit.stdout || ""}\n${audit.stderr || ""}`;
  if (!/Site fidelity audit passed \(\d+ checks, 0 skipped\)\./.test(combinedOutput)) {
    throw new Error("Rendered audit did not finish with 0 skipped checks.");
  }
} finally {
  stopServer(server);
}
