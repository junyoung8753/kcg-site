import type { NextConfig } from "next";
import { siteImageUploadServerActionBodyLimit } from "./src/lib/site-upload-policy";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: supabaseUrl
    ? {
        remotePatterns: [
          {
            protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
            hostname: supabaseUrl.hostname,
            pathname: "/storage/v1/object/public/site-assets/**",
          },
        ],
      }
    : undefined,
  experimental: {
    cpus: 1,
    serverActions: {
      bodySizeLimit: siteImageUploadServerActionBodyLimit,
    },
    workerThreads: true,
    webpackBuildWorker: false,
  },
};

export default nextConfig;
