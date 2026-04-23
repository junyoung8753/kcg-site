export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function toBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

export function ensureString(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function ensureNumber(value: FormDataEntryValue | null, fallback = 0) {
  const raw = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(raw) ? raw : fallback;
}
