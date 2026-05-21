import { mockAnnouncements } from "@/mock/announcements";
import { mockPriceHistory, mockPrices } from "@/mock/prices";
import { mockProducts } from "@/mock/products";
import type { AnnouncementUpsertInput } from "@/types/announcement";
import type { RepositoryMutationResult } from "@/types/admin";
import type {
  PriceAutoSuggestion,
  PriceAutoSettingsInput,
  PriceAutoSuggestionInput,
  PriceAutoSuggestionStatus,
  UpdatePriceInput,
} from "@/types/price";
import type { ProductUpsertInput } from "@/types/product";
import type { SiteAssetInput, SiteAssetUsageInput } from "@/types/media";
import { getDefaultPriceAutoSettings } from "@/lib/price-auto";
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

  async getPriceDailySnapshots(limit = 90) {
    return mockPrices.slice(0, limit).map((price) => ({
      id: `snapshot-${price.id}`,
      snapshotDate: price.announcedAt.slice(0, 10),
      priceId: price.id,
      category: price.category,
      label: price.label,
      value: price.value,
      announcedAt: price.announcedAt,
      source: "mock",
      createdAt: price.announcedAt,
    }));
  }

  async getPriceFreshness() {
    const latest = mockPriceHistory[0]?.changedAt ?? null;
    return {
      latestManualChangedAt: latest,
      latestAnyChangedAt: latest,
      historyCount: mockPriceHistory.length,
      dailySnapshotCount: mockPrices.length,
    };
  }

  async ensurePriceHistoryBaseline() {
    return {
      success: true,
      message: "mock 기준 시세 이력이 준비되어 있습니다.",
      mode: "mock",
    } satisfies RepositoryMutationResult;
  }

  async getPriceAutoSettings() {
    return getDefaultPriceAutoSettings();
  }

  async updatePriceAutoSettings(input: PriceAutoSettingsInput) {
    void input;
    return demoResult;
  }

  async updatePriceAutoRunState() {
    return demoResult;
  }

  async getLatestPriceAutoSuggestion() {
    return null;
  }

  async createPriceAutoSuggestion(input: PriceAutoSuggestionInput) {
    return {
      id: "mock-auto-suggestion",
      status: "draft",
      source: input.source,
      providerLabel: input.providerLabel,
      sourceUpdatedAt: input.sourceUpdatedAt,
      generatedAt: new Date().toISOString(),
      settingsSnapshot: input.settingsSnapshot,
      items: input.items,
      warnings: [
        ...input.warnings,
        "Supabase 미연결 상태에서는 자동시세 검토 기록을 저장할 수 없습니다.",
      ],
      appliedAt: null,
      appliedBy: null,
    } satisfies PriceAutoSuggestion;
  }

  async updatePriceAutoSuggestionStatus(
    id: string,
    status: PriceAutoSuggestionStatus,
    appliedBy?: string,
  ) {
    void id;
    void status;
    void appliedBy;
    return demoResult;
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

  async getSiteAssets() {
    return [];
  }

  async getSiteAssetUsages() {
    return [];
  }

  async createSiteAsset(input: SiteAssetInput) {
    return {
      id: `mock-${input.assetId}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async upsertSiteAssetUsage(input: SiteAssetUsageInput) {
    void input;
    return demoResult;
  }
}
