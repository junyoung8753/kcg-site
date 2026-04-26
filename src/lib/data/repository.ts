import type { Announcement, AnnouncementUpsertInput } from "@/types/announcement";
import type { RepositoryMutationResult } from "@/types/admin";
import type { PriceHistoryEntry, PriceRecord, UpdatePriceInput } from "@/types/price";
import type { Product, ProductUpsertInput } from "@/types/product";

export interface SiteRepository {
  getPrices(options?: { visibleOnly?: boolean }): Promise<PriceRecord[]>;
  getPriceHistory(limit?: number): Promise<PriceHistoryEntry[]>;
  getAnnouncements(options?: {
    limit?: number;
    includeDrafts?: boolean;
  }): Promise<Announcement[]>;
  getAnnouncementBySlug(slug: string): Promise<Announcement | null>;
  getProducts(options?: { includeHidden?: boolean }): Promise<Product[]>;
  updatePrices(input: UpdatePriceInput[]): Promise<RepositoryMutationResult>;
  upsertAnnouncement(
    input: AnnouncementUpsertInput,
  ): Promise<RepositoryMutationResult>;
  deleteAnnouncement(id: string): Promise<RepositoryMutationResult>;
  upsertProduct(input: ProductUpsertInput): Promise<RepositoryMutationResult>;
}
