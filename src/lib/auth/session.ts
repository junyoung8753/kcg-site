const encoder = new TextEncoder();

export const ADMIN_SESSION_COOKIE = "kcga_admin_session";

function requiresExplicitAdminSessionSecret() {
  return process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "production";
}

export function getAdminSessionSecretMode() {
  if (process.env.ADMIN_SESSION_SECRET) return "env";
  return requiresExplicitAdminSessionSecret() ? "missing-required" : "local-fallback";
}

function getSessionSecret() {
  if (requiresExplicitAdminSessionSecret() && !process.env.ADMIN_SESSION_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET is required for preview and production admin sessions.");
  }
  return process.env.ADMIN_SESSION_SECRET || "local-admin-session-secret";
}

function stringToBase64(value: string) {
  if (typeof btoa === "function") {
    return btoa(value);
  }

  return Buffer.from(value, "utf-8").toString("base64");
}

function base64ToString(value: string) {
  if (typeof atob === "function") {
    return atob(value);
  }

  return Buffer.from(value, "base64").toString("utf-8");
}

function base64UrlEncode(value: string) {
  return stringToBase64(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return base64ToString(padded);
}

function arrayBufferToBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return stringToBase64(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function sign(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return arrayBufferToBase64Url(signature);
}

export async function createAdminSessionToken() {
  if (getAdminSessionSecretMode() === "missing-required") {
    throw new Error("ADMIN_SESSION_SECRET is required before creating admin sessions.");
  }

  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      role: "admin",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    }),
  );
  const data = `${header}.${payload}`;
  const signature = await sign(data);
  return `${data}.${signature}`;
}

export async function verifyAdminSession(token: string) {
  if (getAdminSessionSecretMode() === "missing-required") {
    return false;
  }

  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    return false;
  }

  const expected = await sign(`${header}.${payload}`);

  if (expected !== signature) {
    return false;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as {
      exp?: number;
      role?: string;
    };

    return parsed.role === "admin" && Boolean(parsed.exp && parsed.exp * 1000 > Date.now());
  } catch {
    return false;
  }
}
