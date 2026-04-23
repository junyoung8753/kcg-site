import type { MetadataRoute } from "next";
import { isSearchIndexingEnabled } from "@/lib/runtime-env";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  if (!isSearchIndexingEnabled()) {
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
