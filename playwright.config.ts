import * as nextEnv from "@next/env";
import { defineConfig } from "@playwright/test";

nextEnv.loadEnvConfig(process.cwd());

const externalBaseURL = process.env.SITE_AUDIT_URL;
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
