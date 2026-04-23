import type { MetadataRoute } from "next";
import { isSearchIndexingEnabled } from "@/lib/runtime-env";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSearchIndexingEnabled()) {
    return [];
  }

  const routes = ["", "/prices", "/announcements", "/services", "/about"];

  return routes.map((route) => ({
    url: `${siteConfig.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
