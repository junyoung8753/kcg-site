import { timingSafeEqual } from "node:crypto";
import { isConfirmPreviewMode, isPreviewDeployment } from "@/lib/runtime-env";
import { siteConfig } from "@/lib/site-config";

export type AdminPasswordMode = "demo" | "preview-default" | "env";

export function getAdminPassword() {
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD;
  }

  if (isPreviewDeployment()) {
    return siteConfig.adminPreviewPassword;
  }

  return siteConfig.adminDemoPassword;
}

export function getAdminPasswordMode(): AdminPasswordMode {
  if (process.env.ADMIN_PASSWORD) {
    if (
      isConfirmPreviewMode() &&
      process.env.ADMIN_PASSWORD === siteConfig.adminPreviewPassword
    ) {
      return "preview-default";
    }

    return "env";
  }

  if (isPreviewDeployment()) {
    return "preview-default";
  }

  return "demo";
}

export function isUsingDemoPassword() {
  return getAdminPasswordMode() === "demo";
}

export function compareAdminPassword(input: string) {
  const expected = Buffer.from(getAdminPassword());
  const actual = Buffer.from(input);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}
