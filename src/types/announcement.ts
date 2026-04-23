export type AnnouncementStatus = "draft" | "published";

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  isPinned: boolean;
  status: AnnouncementStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementUpsertInput {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  isPinned: boolean;
  status: AnnouncementStatus;
  publishedAt: string;
}
