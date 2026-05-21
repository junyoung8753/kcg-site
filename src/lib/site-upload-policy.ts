export const siteImageUploadMaxBytes = 10 * 1024 * 1024;
export const siteImageUploadMaxLabel = "10MB";
export const siteImageUploadServerActionBodyLimit = "12mb";
export const siteImageUploadAllowedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export function formatUploadFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0KB";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}
