import type { Metadata } from "next";
import { IBM_Plex_Sans_KR, Inter } from "next/font/google";
import "./globals.css";
import { isSearchIndexingEnabled } from "@/lib/runtime-env";
import { siteConfig } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexSansKr = IBM_Plex_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.brandName,
  robots: isSearchIndexingEnabled()
    ? {
        index: true,
        follow: true,
      }
    : {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
        },
      },
  keywords: [
    "한국 금 거래소",
    "금 시세",
    "귀금속 매입",
    "골드바",
    "한국센터금거래소",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteConfig.siteUrl,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.brandName,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${ibmPlexSansKr.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-[var(--color-ivory)] text-[var(--color-ink)]">
        {children}
      </body>
    </html>
  );
}
