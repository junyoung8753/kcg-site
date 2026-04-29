import type { MetadataRoute } from "next";
import { canExposeToSearch } from "@/lib/public-launch";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!canExposeToSearch()) {
    return [];
  }

  const routes = ["", "/prices", "/products", "/announcements", "/services", "/company", "/about"];

  return routes.map((route) => ({
    url: `${siteConfig.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
