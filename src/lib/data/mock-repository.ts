import { mockAnnouncements } from "@/mock/announcements";
import { mockPriceHistory, mockPrices } from "@/mock/prices";
import { mockProducts } from "@/mock/products";
import type { AnnouncementUpsertInput } from "@/types/announcement";
import type { RepositoryMutationResult } from "@/types/admin";
import type { UpdatePriceInput } from "@/types/price";
import type { ProductUpsertInput } from "@/types/product";
import type { SiteRepository } from "./repository";

const demoResult: RepositoryMutationResult = {
  success: false,
  message: "Supabase 미연결 상태에서는 저장이 비활성화됩니다. 화면 미리보기만 가능합니다.",
  mode: "mock",
};

export class MockRepository implements SiteRepository {
  async getPrices(options?: { visibleOnly?: boolean }) {
    const visibleOnly = options?.visibleOnly ?? false;
    return mockPrices
      .filter((entry) => (visibleOnly ? entry.isVisible : true))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getPriceHistory(limit = 5) {
    return mockPriceHistory.slice(0, limit);
  }

  async getAnnouncements(options?: { limit?: number; includeDrafts?: boolean }) {
    const includeDrafts = options?.includeDrafts ?? false;
    const list = mockAnnouncements
      .filter((item) => includeDrafts || item.status === "published")
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return Number(b.isPinned) - Number(a.isPinned);
        }

        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      });

    return options?.limit ? list.slice(0, options.limit) : list;
  }

  async getAnnouncementBySlug(slug: string) {
    return mockAnnouncements.find((item) => item.slug === slug) || null;
  }

  async getProducts(options?: { includeHidden?: boolean }) {
    const includeHidden = options?.includeHidden ?? false;
    return mockProducts
      .filter((item) => (includeHidden ? true : item.status !== "hidden"))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async updatePrices(input: UpdatePriceInput[]) {
    void input;
    return demoResult;
  }

  async upsertAnnouncement(input: AnnouncementUpsertInput) {
    void input;
    return demoResult;
  }

  async deleteAnnouncement(id: string) {
    void id;
    return demoResult;
  }

  async upsertProduct(input: ProductUpsertInput) {
    void input;
    return demoResult;
  }
}
