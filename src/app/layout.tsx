import type { Metadata } from "next";
import { IBM_Plex_Sans_KR, Inter } from "next/font/google";
import "./globals.css";
import { canExposeToSearch } from "@/lib/public-launch";
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

const socialImage = {
  url: "/campaign/kcg-brand-gold-bars-20260427-v4.webp",
  width: 1672,
  height: 941,
  alt: "한국센터금거래소 골드바와 금거래 상담 이미지",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  "@id": `${siteConfig.siteUrl}#kcg`,
  name: siteConfig.company.legalBusinessName,
  alternateName: siteConfig.shortBrandName,
  url: siteConfig.siteUrl,
  logo: new URL(siteConfig.brandAssets.lockupPath, siteConfig.siteUrl).toString(),
  image: new URL(socialImage.url, siteConfig.siteUrl).toString(),
  telephone: siteConfig.contact.phone,
  email: siteConfig.contact.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.company.registeredAddress,
    addressLocality: "종로구",
    addressRegion: "서울특별시",
    addressCountry: "KR",
  },
  openingHours: "Mo-Fr 09:00-18:30",
  sameAs: siteConfig.familyLinks.map((link) => link.href),
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.brandName,
  robots: canExposeToSearch()
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
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [socialImage.url],
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
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
