import { timingSafeEqual } from "node:crypto";
import { isPreviewDeployment, isProductionDeployment } from "@/lib/runtime-env";
import { siteConfig } from "@/lib/site-config";

export type AdminPasswordMode = "demo" | "missing-env" | "env";

export function getAdminPassword() {
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD;
  }

  if (isPreviewDeployment() || isProductionDeployment()) {
    return "";
  }

  return siteConfig.adminDemoPassword;
}

export function getAdminPasswordMode(): AdminPasswordMode {
  if (process.env.ADMIN_PASSWORD) {
    return "env";
  }

  if (isPreviewDeployment() || isProductionDeployment()) {
    return "missing-env";
  }

  return "demo";
}

export function isUsingDemoPassword() {
  return getAdminPasswordMode() === "demo";
}

export function compareAdminPassword(input: string) {
  const adminPassword = getAdminPassword();
  if (!adminPassword || getAdminPasswordMode() === "missing-env") {
    return false;
  }

  const expected = Buffer.from(adminPassword);
  const actual = Buffer.from(input);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}
