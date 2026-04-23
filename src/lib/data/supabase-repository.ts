import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  Announcement,
  AnnouncementUpsertInput,
} from "@/types/announcement";
import type { RepositoryMutationResult } from "@/types/admin";
import type { PriceHistoryEntry, PriceRecord, UpdatePriceInput } from "@/types/price";
import type { Product } from "@/types/product";
import type { SiteRepository } from "./repository";

type SupabasePriceRow = {
  id: string;
  category: PriceRecord["category"];
  label: string;
  value: number;
  unit: string;
  announced_at: string;
  note: string | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

type SupabasePriceHistoryRow = {
  id: string;
  price_id: string;
  category: PriceRecord["category"];
  label: string;
  previous_value: number;
  new_value: number;
  changed_at: string;
  changed_by: string;
  note: string | null;
};

type SupabaseAnnouncementRow = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  is_pinned: boolean;
  status: Announcement["status"];
  published_at: string;
  created_at: string;
  updated_at: string;
};

type SupabaseProductRow = {
  id: string;
  category: Product["category"];
  name: string;
  slug: string;
  short_description: string;
  description: string;
  image_url: string | null;
  status: Product["status"];
  price_visible: boolean;
  price_note: string | null;
  created_at: string;
  updated_at: string;
};

function mapPrice(row: SupabasePriceRow): PriceRecord {
  return {
    id: row.id,
    category: row.category,
    label: row.label,
    value: row.value,
    unit: row.unit,
    announcedAt: row.announced_at,
    note: row.note,
    isVisible: row.is_visible,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapHistory(row: SupabasePriceHistoryRow): PriceHistoryEntry {
  return {
    id: row.id,
    priceId: row.price_id,
    category: row.category,
    label: row.label,
    previousValue: row.previous_value,
    newValue: row.new_value,
    changedAt: row.changed_at,
    changedBy: row.changed_by,
    note: row.note,
  };
}

function mapAnnouncement(row: SupabaseAnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    isPinned: row.is_pinned,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProduct(row: SupabaseProductRow): Product {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    imageUrl: row.image_url,
    status: row.status,
    priceVisible: row.price_visible,
    priceNote: row.price_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseRepository implements SiteRepository {
  async getPrices(options?: { visibleOnly?: boolean }) {
    const client = getSupabaseAdminClient();
    let query = client
      .from("prices")
      .select("*")
      .order("display_order", { ascending: true });

    if (options?.visibleOnly) {
      query = query.eq("is_visible", true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data as SupabasePriceRow[]).map(mapPrice);
  }

  async getPriceHistory(limit = 5) {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("price_history")
      .select("*")
      .order("changed_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data as SupabasePriceHistoryRow[]).map(mapHistory);
  }

  async getAnnouncements(options?: { limit?: number; includeDrafts?: boolean }) {
    const client = getSupabaseAdminClient();
    let query = client.from("announcements").select("*");

    if (!options?.includeDrafts) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query.order("is_pinned", { ascending: false }).order(
      "published_at",
      { ascending: false },
    );

    if (error) {
      throw error;
    }

    const announcements = (data as SupabaseAnnouncementRow[]).map(mapAnnouncement);
    return options?.limit ? announcements.slice(0, options.limit) : announcements;
  }

  async getAnnouncementBySlug(slug: string) {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("announcements")
      .select("*")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapAnnouncement(data as SupabaseAnnouncementRow) : null;
  }

  async getProducts(options?: { includeHidden?: boolean }) {
    const client = getSupabaseAdminClient();
    let query = client.from("products").select("*").order("created_at", { ascending: false });

    if (!options?.includeHidden) {
      query = query.neq("status", "hidden");
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data as SupabaseProductRow[]).map(mapProduct);
  }

  async updatePrices(input: UpdatePriceInput[]) {
    const client = getSupabaseAdminClient();
    const ids = input.map((item) => item.id);
    const { data: currentRows, error: currentError } = await client
      .from("prices")
      .select("*")
      .in("id", ids);

    if (currentError) {
      throw currentError;
    }

    const rows = new Map(
      (currentRows as SupabasePriceRow[]).map((row) => [row.id, row] as const),
    );

    for (const item of input) {
      const current = rows.get(item.id);

      if (!current) {
        continue;
      }

      const { error: updateError } = await client
        .from("prices")
        .update({
          value: item.value,
          note: item.note,
          is_visible: item.isVisible,
          announced_at: item.announcedAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (updateError) {
        throw updateError;
      }

      if (
        current.value !== item.value ||
        current.note !== item.note ||
        current.announced_at !== item.announcedAt
      ) {
        const { error: historyError } = await client.from("price_history").insert({
          price_id: item.id,
          category: current.category,
          label: current.label,
          previous_value: current.value,
          new_value: item.value,
          changed_at: new Date().toISOString(),
          changed_by: item.changedBy,
          note: item.note,
        });

        if (historyError) {
          throw historyError;
        }
      }
    }

    return {
      success: true,
      message: "시세가 저장되었습니다.",
      mode: "supabase",
    } satisfies RepositoryMutationResult;
  }

  async upsertAnnouncement(input: AnnouncementUpsertInput) {
    const client = getSupabaseAdminClient();
    const payload = {
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      content: input.content,
      is_pinned: input.isPinned,
      status: input.status,
      published_at: input.publishedAt,
      updated_at: new Date().toISOString(),
    };

    if (input.id) {
      const { error } = await client.from("announcements").update(payload).eq("id", input.id);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await client.from("announcements").insert({
        ...payload,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }
    }

    return {
      success: true,
      message: "공지사항이 저장되었습니다.",
      mode: "supabase",
    } satisfies RepositoryMutationResult;
  }

  async deleteAnnouncement(id: string) {
    const client = getSupabaseAdminClient();
    const { error } = await client.from("announcements").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "공지사항이 삭제되었습니다.",
      mode: "supabase",
    } satisfies RepositoryMutationResult;
  }
}
