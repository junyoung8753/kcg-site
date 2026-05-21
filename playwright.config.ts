import * as nextEnv from "@next/env";
import { defineConfig } from "@playwright/test";

const loadedEnv = nextEnv.loadEnvConfig(process.cwd(), true);
for (const [key, value] of Object.entries(loadedEnv.parsedEnv ?? {})) {
  if (value) {
    process.env[key] ??= value;
  }
}

const externalBaseURL = process.env.SITE_AUDIT_URL;
const isLoopbackBaseURL = !externalBaseURL || /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(?::|\/|$)/.test(externalBaseURL);
if (isLoopbackBaseURL) {
  process.env.ADMIN_PASSWORD ||= "0000";
  process.env.ADMIN_SESSION_SECRET ||= "local-admin-session-secret";
}
const localBaseURL = "http://127.0.0.1:3037";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [["list"]],
  use: {
    baseURL: externalBaseURL || localBaseURL,
    browserName: "chromium",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: externalBaseURL
    ? undefined
    : {
        command: "npm run start -- -p 3037",
        url: localBaseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
