"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compareAdminPassword } from "@/lib/auth/password";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
} from "@/lib/auth/session";
import { ensureString } from "@/lib/utils";

export async function loginAction(formData: FormData) {
  const password = ensureString(formData.get("password"));
  const nextPath = ensureString(formData.get("next"), "/admin");

  if (!compareAdminPassword(password)) {
    redirect(`/admin/login?error=invalid&next=${encodeURIComponent(nextPath)}`);
  }

  const token = await createAdminSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect(nextPath || "/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login?logged_out=1");
}
