export type DeploymentStage = "local" | "preview" | "production";

function isTruthyEnv(value: string | undefined) {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function getDeploymentStage(): DeploymentStage {
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv === "preview") {
    return "preview";
  }

  if (vercelEnv === "production") {
    return "production";
  }

  return "local";
}

export function isPreviewDeployment() {
  return getDeploymentStage() === "preview";
}

export function isProductionDeployment() {
  return getDeploymentStage() === "production";
}

export function isConfirmPreviewMode() {
  return isTruthyEnv(process.env.KCG_FORCE_NOINDEX);
}

export function isPublicSearchApproved() {
  return isTruthyEnv(process.env.KCG_PUBLIC_SEARCH_APPROVED);
}

export function getResolvedSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://127.0.0.1:3000";
}

export function isSearchIndexingEnabled() {
  return isProductionDeployment() && !isConfirmPreviewMode() && isPublicSearchApproved();
}
