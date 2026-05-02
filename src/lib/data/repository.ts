import type { Announcement, AnnouncementUpsertInput } from "@/types/announcement";
import type { RepositoryMutationResult } from "@/types/admin";
import type {
  PriceAutoSettings,
  PriceAutoSettingsInput,
  PriceAutoSuggestion,
  PriceAutoSuggestionInput,
  PriceAutoSuggestionStatus,
  PriceHistoryEntry,
  PriceRecord,
  UpdatePriceInput,
} from "@/types/price";
import type { Product, ProductUpsertInput } from "@/types/product";

export interface SiteRepository {
  getPrices(options?: { visibleOnly?: boolean }): Promise<PriceRecord[]>;
  getPriceHistory(limit?: number): Promise<PriceHistoryEntry[]>;
  getPriceAutoSettings(): Promise<PriceAutoSettings>;
  updatePriceAutoSettings(input: PriceAutoSettingsInput): Promise<RepositoryMutationResult>;
  getLatestPriceAutoSuggestion(): Promise<PriceAutoSuggestion | null>;
  createPriceAutoSuggestion(input: PriceAutoSuggestionInput): Promise<PriceAutoSuggestion>;
  updatePriceAutoSuggestionStatus(
    id: string,
    status: PriceAutoSuggestionStatus,
    appliedBy?: string,
  ): Promise<RepositoryMutationResult>;
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
