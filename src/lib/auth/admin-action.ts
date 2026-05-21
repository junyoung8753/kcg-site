import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/auth/session";

export async function requireAdminActionSession(nextPath = "/admin") {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token || !(await verifyAdminSession(token))) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }
}
