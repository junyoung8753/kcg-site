import type { MetadataRoute } from "next";
import { canExposeToSearch } from "@/lib/public-launch";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  if (!canExposeToSearch()) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin"],
      },
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
