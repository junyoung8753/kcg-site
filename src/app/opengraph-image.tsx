import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoBuffer = await readFile(join(process.cwd(), "public", "brand", "kcg-lockup.png"));
  const logoDataUri = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #f7fbfa 0%, #eef8f6 48%, #fff6cf 100%)",
          padding: 64,
          color: "#15191b",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={logoDataUri}
            alt={siteConfig.brandAssets.lockupAlt}
            style={{ width: 680, height: 120, objectFit: "contain", objectPosition: "left center" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 74, lineHeight: 1.15, fontWeight: 700 }}>
            (주)한국센터금거래소
          </div>
          <div style={{ fontSize: 34, lineHeight: 1.5, maxWidth: 900, opacity: 0.82 }}>
            오늘 고시 시세, 귀금속 매입 상담, 방문 거래 안내를 확인할 수 있는 종로 귀금속 거래 안내 사이트
          </div>
        </div>
        <div
          style={{
            height: 2,
            width: "100%",
            background:
              "linear-gradient(90deg, rgba(255,255,255,0), rgba(178,149,94,1), rgba(255,255,255,0))",
          }}
        />
      </div>
    ),
    size,
  );
}
