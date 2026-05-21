"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminActionSession } from "@/lib/auth/admin-action";
import { getRepository } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { ensureString, slugify, toBoolean } from "@/lib/utils";

export async function upsertAnnouncementAction(formData: FormData) {
  await requireAdminActionSession("/admin/announcements");

  if (!isSupabaseConfigured()) {
    redirect("/admin/announcements?status=demo");
  }

  const title = ensureString(formData.get("title"));
  const slugInput = ensureString(formData.get("slug"));
  const summary = ensureString(formData.get("summary"));
  const content = ensureString(formData.get("content"));
  const publishedAt =
    ensureString(formData.get("publishedAt")) || new Date().toISOString();

  try {
    const repository = getRepository();
    await repository.upsertAnnouncement({
      id: ensureString(formData.get("id")) || undefined,
      title,
      slug: slugify(slugInput || title),
      summary,
      content,
      isPinned: toBoolean(formData.get("isPinned")),
      status: ensureString(formData.get("status"), "published") as
        | "draft"
        | "published",
      publishedAt,
    });
  } catch {
    redirect("/admin/announcements?status=error");
  }

  revalidatePath("/");
  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
  redirect("/admin/announcements?status=saved");
}

export async function deleteAnnouncementAction(formData: FormData) {
  await requireAdminActionSession("/admin/announcements");

  if (!isSupabaseConfigured()) {
    redirect("/admin/announcements?status=demo");
  }

  const id = ensureString(formData.get("id"));
  if (!toBoolean(formData.get("confirmDelete"))) {
    redirect("/admin/announcements?status=confirm-delete");
  }

  try {
    const repository = getRepository();
    await repository.deleteAnnouncement(id);
  } catch {
    redirect("/admin/announcements?status=error");
  }

  revalidatePath("/");
  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
  redirect("/admin/announcements?status=deleted");
}
