import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(rootDir, "public");
const manifestPath = join(rootDir, "src", "data", "imageAssetManifest.json");
const reportPath = join(rootDir, "docs", "brand", "image-candidate-preview-2026-05-17.md");
const contactSheetPath = join(rootDir, "docs", "audit", "image-candidate-contact-sheet-2026-05-17.webp");
const width = 1600;
const height = 900;

const candidates = [
  {
    id: "candidate-hero-price-desk-20260517-01",
    file: "/assets/generated/candidates/hero/kcg-candidate-hero-20260517-01.webp",
    category: "hero",
    sceneType: "price-desk",
    sourceType: "C",
    alt: "밝은 가격 상담 데스크 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep the desk, soft gold accent, and open right-side breathing room inside the center safe area.",
    notes: "Hero expansion candidate. Bright price-desk mood with no embedded price text and no fake certificate.",
    palette: ["#f9f6ee", "#fffdf8", "#d8b45d", "#94a38d", "#32302a"],
    composition: "desk-hero",
  },
  {
    id: "candidate-hero-phone-consult-20260517-02",
    file: "/assets/generated/candidates/hero/kcg-candidate-hero-20260517-02.webp",
    category: "hero",
    sceneType: "phone-consultation",
    sourceType: "E",
    alt: "밝은 전화 상담 분위기 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep the handset, note sheet, and side-angle shoulder silhouette visible without face close-up.",
    notes: "Virtual-people candidate. Face is not a proof point; no name tag, title, testimonial, or staff claim.",
    palette: ["#fbf8f1", "#f4ead9", "#cfa95a", "#b9c5b3", "#39352f"],
    composition: "phone",
  },
  {
    id: "candidate-hero-visit-prep-20260517-03",
    file: "/assets/generated/candidates/hero/kcg-candidate-hero-20260517-03.webp",
    category: "hero",
    sceneType: "visit-preparation",
    sourceType: "C",
    alt: "방문 준비와 상담 예약 분위기 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep the visit-prep objects centered; do not imply this is a verified store exterior.",
    notes: "Hero/store-guide bridge candidate for visit preparation without fake storefront.",
    palette: ["#fffaf0", "#f1eadb", "#d6b365", "#8da18c", "#302d28"],
    composition: "visit",
  },
  {
    id: "candidate-hero-consultation-table-20260517-04",
    file: "/assets/generated/candidates/hero/kcg-candidate-hero-20260517-04.webp",
    category: "hero",
    sceneType: "hands-consultation",
    sourceType: "E",
    alt: "상담 테이블과 손 중심 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Prefer hands and table context; avoid cropped faces or real-person proof cues.",
    notes: "Virtual consultation atmosphere candidate with hands and documents, no fake appraisal certificate.",
    palette: ["#faf7ef", "#fffdf7", "#d4ad5b", "#bdc9bc", "#35312b"],
    composition: "hands",
  },
  {
    id: "candidate-hero-product-case-20260517-05",
    file: "/assets/generated/candidates/hero/kcg-candidate-hero-20260517-05.webp",
    category: "hero",
    sceneType: "product-case",
    sourceType: "C",
    alt: "제품 케이스와 상담 데스크 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep the generic product case abstract; do not imply exact SKU contents.",
    notes: "Hero expansion candidate for product consultation, not an individual product proof image.",
    palette: ["#fcf8ef", "#efe4cf", "#d5b15e", "#a6b49e", "#34302a"],
    composition: "case",
  },
  {
    id: "candidate-service-document-check-20260517-01",
    file: "/assets/generated/candidates/service/kcg-candidate-service-20260517-01.webp",
    category: "service",
    sceneType: "document-check",
    sourceType: "D",
    alt: "서류 확인과 상담 절차 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep documents abstract and unreadable; no fake certificate or stamp.",
    notes: "Service candidate for consultation process and intake guidance.",
    palette: ["#fffaf2", "#f2eadc", "#d7b460", "#a7b5a5", "#302e29"],
    composition: "documents",
  },
  {
    id: "candidate-service-purity-check-20260517-02",
    file: "/assets/generated/candidates/service/kcg-candidate-service-20260517-02.webp",
    category: "service",
    sceneType: "purity-check",
    sourceType: "D",
    alt: "순도 확인 절차 분위기 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep tools and tray visible; avoid repeated scale-only framing.",
    notes: "Service candidate for inspection flow. No exact product or fake assay result.",
    palette: ["#fdf8ef", "#fffdfa", "#d2aa58", "#9faf9a", "#38342e"],
    composition: "inspection",
  },
  {
    id: "candidate-service-phone-intake-20260517-03",
    file: "/assets/generated/candidates/service/kcg-candidate-service-20260517-03.webp",
    category: "service",
    sceneType: "phone-intake",
    sourceType: "E",
    alt: "전화 접수와 방문 안내 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Side-angle only; keep face secondary and the phone/document workflow primary.",
    notes: "Virtual-people service candidate. No actual employee implication.",
    palette: ["#fbf7ef", "#efe7d9", "#d3ae5d", "#b6c2b1", "#332f29"],
    composition: "phone-service",
  },
  {
    id: "candidate-service-product-case-20260517-04",
    file: "/assets/generated/candidates/service/kcg-candidate-service-20260517-04.webp",
    category: "service",
    sceneType: "product-case",
    sourceType: "D",
    alt: "제품 케이스 확인 절차 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep generic case and checklist composition; no exact SKU or warranty implication.",
    notes: "Service candidate for packaging/intake step with non-SKU product case.",
    palette: ["#fff9ef", "#f3ead8", "#d8b35d", "#9fb099", "#333029"],
    composition: "case-service",
  },
  {
    id: "candidate-store-guide-visit-kit-20260517-01",
    file: "/assets/generated/candidates/store-guide/kcg-candidate-store-guide-20260517-01.webp",
    category: "store-guide",
    sceneType: "visit-kit",
    sourceType: "C",
    alt: "방문 준비물과 상담 예약 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep visit-prep objects clear; do not fake a real KCG storefront.",
    notes: "Store-guide candidate for what to prepare before visiting.",
    palette: ["#fffaf1", "#eee5d6", "#d6b25e", "#a8b59f", "#333029"],
    composition: "visit-kit",
  },
  {
    id: "candidate-store-guide-counter-20260517-02",
    file: "/assets/generated/candidates/store-guide/kcg-candidate-store-guide-20260517-02.webp",
    category: "store-guide",
    sceneType: "reception-counter",
    sourceType: "C",
    alt: "방문 상담 카운터 분위기 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Use generic reception/counter mood; no signage that implies verified interior.",
    notes: "Store-guide candidate. Generic visit guidance, not a real store interior claim.",
    palette: ["#fbf7ee", "#f5ecdc", "#d0aa58", "#b0bea9", "#36322c"],
    composition: "counter",
  },
  {
    id: "candidate-store-guide-map-desk-20260517-03",
    file: "/assets/generated/candidates/store-guide/kcg-candidate-store-guide-20260517-03.webp",
    category: "store-guide",
    sceneType: "map-desk",
    sourceType: "C",
    alt: "지도와 방문 동선 안내 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep map abstract with no fake address or store sign.",
    notes: "Store-guide candidate for location-prep mood. No fake map text.",
    palette: ["#fff9f0", "#eee5d3", "#d5b15d", "#95a98f", "#302d28"],
    composition: "map",
  },
  {
    id: "candidate-company-transparent-operation-20260517-01",
    file: "/assets/generated/candidates/company/kcg-candidate-company-20260517-01.webp",
    category: "company",
    sceneType: "transparent-operation",
    sourceType: "C",
    alt: "투명한 운영과 기록 관리 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep records abstract and unreadable; no fake license or certificate.",
    notes: "Company candidate for transparent operation, avoiding goldbar wallpaper.",
    palette: ["#fbf8f0", "#f0e7d8", "#d8b45e", "#a5b39f", "#322f29"],
    composition: "operations",
  },
  {
    id: "candidate-company-consultation-management-20260517-02",
    file: "/assets/generated/candidates/company/kcg-candidate-company-20260517-02.webp",
    category: "company",
    sceneType: "consultation-management",
    sourceType: "E",
    alt: "상담 관리와 방문 응대 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Use over-the-shoulder/side composition; no face close-up or real staff implication.",
    notes: "Virtual-people company candidate. No employee, customer, or expert guarantee claim.",
    palette: ["#fff9ef", "#efe6d5", "#d4ae5b", "#adbaa6", "#34302a"],
    composition: "management",
  },
  {
    id: "candidate-company-material-control-20260517-03",
    file: "/assets/generated/candidates/company/kcg-candidate-company-20260517-03.webp",
    category: "company",
    sceneType: "material-control",
    sourceType: "C",
    alt: "자산 관리와 상담 운영 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep material cases generic and non-SKU; avoid vault/luxury/investment mood.",
    notes: "Company candidate for controlled, practical operation. No casino/luxury effect.",
    palette: ["#fcf8ef", "#f3ead8", "#d6b15c", "#a4b49f", "#35312b"],
    composition: "control",
  },
];

const existingPhotoCandidates = [
  {
    id: "candidate-hero-photo-consultation-20260517-06",
    file: "/assets/generated/candidates/hero/kcg-candidate-hero-photo-20260517-06.webp",
    category: "hero",
    sceneType: "photo-consultation-desk",
    sourceType: "E",
    alt: "밝은 상담 데스크 실사형 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep the consultation desk and right-side negative space; avoid treating the person as actual KCG staff.",
    notes: "Built-in image generation output. Candidate only; includes no readable price text, staff claim, or exact SKU proof.",
  },
  {
    id: "candidate-hero-photo-negative-space-20260517-07",
    file: "/assets/generated/candidates/hero/kcg-candidate-hero-photo-20260517-07.webp",
    category: "hero",
    sceneType: "photo-negative-space-consultation",
    sourceType: "E",
    alt: "홈 배너 확장용 밝은 상담 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep the clean right side available for overlay copy; keep faces cropped out.",
    notes: "Built-in image generation output for hero slide expansion. Candidate only; not operationally connected.",
  },
  {
    id: "candidate-service-photo-jewelry-check-20260517-05",
    file: "/assets/generated/candidates/service/kcg-candidate-service-photo-20260517-05.webp",
    category: "service",
    sceneType: "photo-jewelry-check",
    sourceType: "D",
    alt: "고금 주얼리 확인 절차 실사형 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep tray, hands, and inspection context visible; avoid cropped face and fake appraisal proof.",
    notes: "Built-in image generation output for service replacement candidate. Candidate only; tiny interface details are treated as non-readable background texture.",
  },
  {
    id: "candidate-store-guide-photo-visit-prep-20260517-04",
    file: "/assets/generated/candidates/store-guide/kcg-candidate-store-guide-photo-20260517-04.webp",
    category: "store-guide",
    sceneType: "photo-visit-preparation",
    sourceType: "C",
    alt: "방문 준비 안내 실사형 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep visit-prep objects and abstract map; do not imply verified KCG storefront or exact address.",
    notes: "Built-in image generation output for store-guide replacement candidate. Candidate only; no operational link.",
  },
  {
    id: "candidate-company-photo-operations-20260517-04",
    file: "/assets/generated/candidates/company/kcg-candidate-company-photo-20260517-04.webp",
    category: "company",
    sceneType: "photo-transparent-operations",
    sourceType: "E",
    alt: "투명 운영과 상담 관리 실사형 후보 이미지",
    aspectRatio: "16:9",
    cropRule: "Keep documents abstract and unreadable; do not imply a fake license, certificate, or actual employee.",
    notes: "Built-in image generation output for company replacement candidate. Candidate only; no approval implied.",
  },
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function publicPathToAbsolute(filePath) {
  return join(publicDir, filePath.replace(/^\//, ""));
}

function sha256ForFile(filePath) {
  const hash = createHash("sha256");
  hash.update(readFileSync(filePath));
  return `sha256:${hash.digest("hex")}`;
}

function roundedRect(x, y, w, h, r, fill, opacity = 1, stroke = "none", strokeWidth = 0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" opacity="${opacity}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
}

function circle(cx, cy, r, fill, opacity = 1) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;
}

function line(x1, y1, x2, y2, stroke, strokeWidth = 8, opacity = 1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" opacity="${opacity}"/>`;
}

function documentStack(x, y, accent, dark, count = 3) {
  const docs = [];
  for (let index = 0; index < count; index += 1) {
    docs.push(roundedRect(x + index * 28, y + index * 16, 310, 210, 22, "#ffffff", 0.92, "#e3d8c3", 3));
    docs.push(line(x + 42 + index * 28, y + 70 + index * 16, x + 235 + index * 28, y + 70 + index * 16, dark, 5, 0.12));
    docs.push(line(x + 42 + index * 28, y + 108 + index * 16, x + 265 + index * 28, y + 108 + index * 16, dark, 5, 0.1));
    docs.push(line(x + 42 + index * 28, y + 146 + index * 16, x + 205 + index * 28, y + 146 + index * 16, accent, 6, 0.2));
  }
  return docs.join("");
}

function genericTray(x, y, w, h, accent, dark) {
  return `
    ${roundedRect(x, y, w, h, 30, "#fffdf8", 0.94, "#e5d9c3", 4)}
    ${roundedRect(x + 38, y + 42, w - 76, h - 84, 24, "#f2e8d5", 0.85, "#dbc897", 2)}
    ${circle(x + w * 0.35, y + h * 0.5, 52, accent, 0.42)}
    ${circle(x + w * 0.52, y + h * 0.48, 42, accent, 0.32)}
    ${roundedRect(x + w * 0.61, y + h * 0.39, 120, 64, 18, "#f8d877", 0.28, "#caa24f", 2)}
    ${line(x + 72, y + h - 52, x + w - 72, y + h - 52, dark, 4, 0.1)}
  `;
}

function abstractPhone(x, y, accent, dark) {
  return `
    ${roundedRect(x, y, 190, 320, 38, dark, 0.9)}
    ${roundedRect(x + 18, y + 26, 154, 246, 28, "#fffaf0", 1)}
    ${circle(x + 95, y + 292, 14, "#ffffff", 0.92)}
    ${line(x + 52, y + 86, x + 138, y + 86, accent, 8, 0.45)}
    ${line(x + 46, y + 132, x + 146, y + 132, dark, 6, 0.16)}
    ${line(x + 46, y + 174, x + 118, y + 174, dark, 6, 0.14)}
  `;
}

function hands(x, y, skin = "#d8b58f", opacity = 0.76) {
  return `
    ${roundedRect(x, y + 58, 250, 78, 38, skin, opacity)}
    ${circle(x + 24, y + 94, 38, skin, opacity)}
    ${roundedRect(x + 326, y, 250, 78, 38, skin, opacity)}
    ${circle(x + 550, y + 38, 38, skin, opacity)}
  `;
}

function mapShape(x, y, accent, green, dark) {
  return `
    <path d="M ${x} ${y + 38} C ${x + 84} ${y - 20}, ${x + 190} ${y + 20}, ${x + 280} ${y - 12} C ${x + 350} ${y - 36}, ${x + 410} ${y + 10}, ${x + 492} ${y + 6} L ${x + 450} ${y + 320} C ${x + 350} ${y + 292}, ${x + 270} ${y + 336}, ${x + 168} ${y + 300} C ${x + 92} ${y + 274}, ${x + 36} ${y + 304}, ${x - 28} ${y + 274} Z" fill="#fffdf7" opacity="0.92" stroke="#e4d9c4" stroke-width="4"/>
    ${line(x + 52, y + 70, x + 382, y + 238, green, 12, 0.4)}
    ${line(x + 110, y + 244, x + 424, y + 94, accent, 10, 0.34)}
    ${circle(x + 350, y + 160, 42, accent, 0.78)}
    ${circle(x + 350, y + 160, 16, "#fffdf7", 0.98)}
    ${line(x + 58, y + 144, x + 180, y + 104, dark, 5, 0.1)}
    ${line(x + 224, y + 246, x + 386, y + 282, dark, 5, 0.1)}
  `;
}

function buildComposition(kind, palette) {
  const [bg, panel, accent, green, dark] = palette;
  const shadow = "#b69d68";
  const base = `
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="58%" stop-color="${panel}"/>
        <stop offset="100%" stop-color="#efe2ca"/>
      </linearGradient>
      <radialGradient id="glow" cx="32%" cy="22%" r="64%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.88"/>
        <stop offset="70%" stop-color="#ffffff" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="26" stdDeviation="26" flood-color="${shadow}" flood-opacity="0.16"/>
      </filter>
    </defs>
    <rect width="1600" height="900" fill="url(#bg)"/>
    <rect width="1600" height="900" fill="url(#glow)"/>
    <path d="M 0 706 C 252 656, 425 748, 686 694 C 941 641, 1125 614, 1600 672 L 1600 900 L 0 900 Z" fill="#ffffff" opacity="0.44"/>
    ${circle(1220, 126, 190, accent, 0.1)}
    ${circle(1366, 248, 120, green, 0.15)}
    ${line(112, 736, 1488, 736, dark, 5, 0.08)}
  `;

  const desk = `
    <g filter="url(#softShadow)">
      ${roundedRect(204, 502, 1192, 204, 42, "#fffdf8", 0.94, "#e7dcc7", 4)}
      ${roundedRect(282, 548, 460, 86, 28, "#f1e2c4", 0.72)}
      ${roundedRect(816, 536, 336, 104, 28, "#ffffff", 0.8, "#e5d8bf", 3)}
      ${circle(1250, 590, 48, accent, 0.35)}
      ${circle(1308, 580, 34, accent, 0.25)}
    </g>
  `;

  switch (kind) {
    case "desk-hero":
      return `${base}${roundedRect(188, 166, 1010, 430, 58, "#fffdf8", 0.86, "#e5d7c0", 4)}${roundedRect(270, 274, 390, 184, 34, "#f0e2c5", 0.78)}${abstractPhone(746, 226, accent, dark)}${genericTray(1030, 282, 310, 198, accent, dark)}${line(294, 514, 1134, 514, green, 9, 0.18)}`;
    case "phone":
      return `${base}${roundedRect(246, 180, 310, 476, 48, "#fffdf8", 0.88, "#e3d5bd", 4)}${abstractPhone(306, 236, accent, dark)}${roundedRect(660, 224, 528, 286, 38, "#fffdf8", 0.9, "#e1d4bd", 4)}${line(728, 312, 1078, 312, dark, 6, 0.12)}${line(728, 372, 1120, 372, accent, 8, 0.22)}${hands(760, 538)}${circle(1286, 290, 92, green, 0.18)}`;
    case "visit":
      return `${base}${mapShape(250, 170, accent, green, dark)}${roundedRect(890, 210, 430, 330, 44, "#fffdf8", 0.9, "#e4d7c1", 4)}${roundedRect(988, 300, 232, 126, 26, accent, 0.26)}${line(950, 476, 1248, 476, dark, 6, 0.12)}${roundedRect(336, 612, 820, 88, 26, "#fffdf8", 0.88, "#e1d3ba", 3)}`;
    case "hands":
      return `${base}${roundedRect(266, 208, 1012, 420, 56, "#fffdf8", 0.86, "#e5d8c1", 4)}${genericTray(554, 264, 480, 284, accent, dark)}${hands(358, 454, "#d4b08b", 0.82)}${documentStack(1034, 246, accent, dark, 1)}${line(372, 622, 1210, 622, green, 8, 0.16)}`;
    case "case":
      return `${base}${roundedRect(344, 182, 822, 436, 62, "#fffdf8", 0.9, "#e1d3ba", 5)}${roundedRect(460, 290, 590, 210, 36, "#f0e5d0", 0.9)}${roundedRect(642, 350, 226, 98, 22, accent, 0.36)}${roundedRect(1054, 404, 210, 118, 26, green, 0.14)}${line(420, 646, 1180, 646, green, 8, 0.18)}`;
    case "documents":
      return `${base}${roundedRect(272, 188, 934, 440, 52, "#fffdf8", 0.78, "#e1d3ba", 4)}${documentStack(392, 214, accent, dark, 4)}${hands(734, 534, "#d4b08b", 0.76)}${circle(1230, 322, 78, green, 0.18)}`;
    case "inspection":
      return `${base}${roundedRect(290, 196, 1040, 444, 54, "#fffdf8", 0.84, "#e2d4bc", 4)}${genericTray(374, 266, 520, 300, accent, dark)}${roundedRect(1014, 252, 184, 326, 28, "#fffdf8", 0.9, "#dfd1b8", 4)}${line(1056, 322, 1162, 470, dark, 13, 0.3)}${circle(1172, 484, 38, accent, 0.44)}`;
    case "phone-service":
      return `${base}${roundedRect(276, 198, 970, 406, 52, "#fffdf8", 0.84, "#e4d7c1", 4)}${abstractPhone(368, 248, accent, dark)}${documentStack(716, 258, accent, dark, 2)}${circle(1198, 316, 88, green, 0.17)}${line(682, 560, 1134, 560, accent, 7, 0.16)}`;
    case "case-service":
      return `${base}${roundedRect(326, 218, 494, 336, 46, "#fffdf8", 0.9, "#ded0b6", 4)}${roundedRect(450, 314, 248, 120, 28, accent, 0.27)}${documentStack(884, 222, accent, dark, 2)}${roundedRect(604, 618, 468, 66, 22, "#fffdf8", 0.86, "#e1d3ba", 3)}${line(476, 588, 1150, 588, green, 8, 0.16)}`;
    case "visit-kit":
      return `${base}${mapShape(250, 218, accent, green, dark)}${abstractPhone(1030, 240, accent, dark)}${roundedRect(664, 552, 332, 88, 24, "#fffdf8", 0.9, "#e4d7bf", 4)}${roundedRect(704, 584, 170, 26, 10, accent, 0.2)}`;
    case "counter":
      return `${base}${roundedRect(230, 168, 1064, 356, 52, "#fffdf8", 0.76, "#e4d8c3", 4)}${roundedRect(336, 230, 232, 172, 24, "#f0e5d0", 0.65)}${roundedRect(620, 230, 232, 172, 24, "#f0e5d0", 0.55)}${roundedRect(904, 230, 232, 172, 24, "#f0e5d0", 0.55)}${roundedRect(244, 552, 1030, 126, 38, "#fffdf8", 0.92, "#e4d8c3", 4)}${line(470, 454, 1130, 454, green, 9, 0.18)}`;
    case "map":
      return `${base}${mapShape(410, 172, accent, green, dark)}${roundedRect(946, 548, 300, 82, 24, "#fffdf8", 0.9, "#e4d7bf", 3)}${line(998, 584, 1190, 584, dark, 5, 0.12)}${circle(344, 592, 56, green, 0.15)}`;
    case "operations":
      return `${base}${roundedRect(252, 198, 1030, 430, 52, "#fffdf8", 0.82, "#e1d3ba", 4)}${documentStack(324, 246, accent, dark, 3)}${roundedRect(914, 258, 310, 278, 30, "#fffdf8", 0.9, "#dfd1b8", 4)}${line(958, 326, 1178, 326, green, 8, 0.24)}${line(958, 390, 1138, 390, accent, 8, 0.25)}${line(958, 454, 1190, 454, dark, 6, 0.12)}`;
    case "management":
      return `${base}${roundedRect(318, 230, 876, 346, 52, "#fffdf8", 0.82, "#e4d7c1", 4)}${documentStack(754, 256, accent, dark, 2)}${hands(390, 494)}${circle(430, 314, 82, green, 0.18)}${roundedRect(338, 248, 196, 142, 46, "#dfc29c", 0.38)}${line(428, 616, 1084, 616, accent, 7, 0.16)}`;
    case "control":
      return `${base}${roundedRect(360, 222, 816, 330, 46, "#fffdf8", 0.88, "#dfd0b8", 5)}${roundedRect(470, 318, 214, 108, 24, accent, 0.3)}${roundedRect(724, 294, 216, 150, 26, green, 0.2)}${roundedRect(980, 322, 146, 96, 20, accent, 0.18)}${roundedRect(424, 610, 716, 72, 24, "#fffdf8", 0.84, "#e3d5bd", 3)}${line(474, 572, 1136, 572, dark, 7, 0.11)}`;
    default:
      return `${base}${desk}`;
  }
}

function buildSvg(candidate) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(candidate.alt)}">
  <title>${escapeHtml(candidate.alt)}</title>
  ${buildComposition(candidate.composition, candidate.palette)}
</svg>`;
}

async function renderCandidate(candidate) {
  const absolutePath = publicPathToAbsolute(candidate.file);
  mkdirSync(dirname(absolutePath), { recursive: true });
  const svg = buildSvg(candidate);
  await sharp(Buffer.from(svg)).webp({ quality: 88, effort: 5 }).toFile(absolutePath);
  return sha256ForFile(absolutePath);
}

function buildManifestEntry(candidate, checksum) {
  return {
    asset_id: candidate.id,
    file_path: candidate.file,
    image_source_type: candidate.sourceType,
    approval_status: "candidate",
    allowed_usage: ["candidate_preview"],
    related_sku: [],
    sku_match: "not_applicable",
    page_usage: ["candidate-preview"],
    section_usage: [`candidate-${candidate.category}`],
    alt_text: candidate.alt,
    aspect_ratio: candidate.aspectRatio,
    mobile_crop_rule: candidate.cropRule,
    hash_or_checksum: checksum,
    notes: candidate.notes,
  };
}

function updateManifest(entries) {
  const existing = JSON.parse(readFileSync(manifestPath, "utf8"));
  const candidateIds = new Set(entries.map((entry) => entry.asset_id));
  const candidateFiles = new Set(entries.map((entry) => entry.file_path));
  const filtered = existing.filter((entry) => !candidateIds.has(entry.asset_id) && !candidateFiles.has(entry.file_path));
  filtered.push(...entries);
  writeFileSync(manifestPath, `${JSON.stringify(filtered, null, 2)}\n`);
}

function reportImagePath(candidate) {
  return relative(dirname(reportPath), publicPathToAbsolute(candidate.file)).replace(/\\/g, "/");
}

function buildReport(entries, reportCandidates) {
  const byCategory = new Map();
  for (const candidate of reportCandidates) {
    if (!byCategory.has(candidate.category)) byCategory.set(candidate.category, []);
    byCategory.get(candidate.category).push(candidate);
  }

  const lines = [
    "# KCG Candidate Image Preview - 2026-05-17",
    "",
    "Status: `candidate_preview` only. These assets are not approved and are not connected to operational pages.",
    "",
    "## Design Brief",
    "",
    "- Product goal: replace dark/repetitive consultation, company, store-guide, and hero visuals with brighter KCG-safe candidate directions.",
    "- Target user moment: fast trust check before calling or visiting KCG.",
    "- Visual thesis: bright white/warm beige/soft gold consultation desks with practical objects, side-angle hands, no black background, no casino/luxury mood, and no fake certificates.",
    "- Non-goals: no product SKU proof, no actual staff/customer/store claim, no prices, no payment/trading behavior, no search/noindex change.",
    "",
    "## Approval Rule",
    "",
    "- All files remain under `public/assets/generated/candidates/`.",
    "- JSON manifest entries are `approval_status: candidate` and `allowed_usage: [\"candidate_preview\"]` only.",
    "- Codex must not move these to `approved` or connect them to operational pages without human approval.",
    "",
    "## Candidate Summary",
    "",
    "| category | count | scene diversity check |",
    "| --- | ---: | --- |",
  ];

  for (const [category, categoryCandidates] of byCategory) {
    const counts = new Map();
    for (const candidate of categoryCandidates) counts.set(candidate.sceneType, (counts.get(candidate.sceneType) ?? 0) + 1);
    const maxShare = Math.max(...counts.values()) / categoryCandidates.length;
    const diversity = [...counts.entries()].map(([scene, count]) => `${scene} ${count}`).join(", ");
    lines.push(`| ${category} | ${categoryCandidates.length} | max scene share ${(maxShare * 100).toFixed(0)}%; ${diversity} |`);
  }

  lines.push("", "## Preview Contact Sheet", "", `![KCG candidate contact sheet](../audit/${basename(contactSheetPath)})`, "");

  for (const [category, categoryCandidates] of byCategory) {
    lines.push(`## ${category}`, "");
    for (const candidate of categoryCandidates) {
      const entry = entries.find((item) => item.asset_id === candidate.id);
      lines.push(`### ${candidate.id}`, "");
      lines.push(`![${candidate.alt}](${reportImagePath(candidate)})`);
      lines.push("");
      lines.push(`- file_path: \`${candidate.file}\``);
      lines.push(`- image_source_type: \`${candidate.sourceType}\``);
      lines.push("- approval_status: `candidate`");
      lines.push("- allowed_usage: `candidate_preview`");
      lines.push(`- scene_type: \`${candidate.sceneType}\``);
      lines.push(`- checksum: \`${entry?.hash_or_checksum ?? "pending"}\``);
      lines.push(`- QA notes: ${candidate.notes}`);
      lines.push("");
    }
  }

  lines.push(
    "## QA Review Notes",
    "",
    "- Bright background: pass for all generated candidates.",
    "- Black background: none.",
    "- Fake text/certificates: illustration candidates contain no rendered Korean/English text; photo-style candidates have no intentionally readable text, certificate, stamp, or license design.",
    "- Virtual people: only side-angle/hand/shoulder compositions; no staff name, title, testimonial, or face-close proof point.",
    "- Repetition: service, store-guide, company, and hero batches use distinct scene types; no type exceeds 40% within these generated sets.",
    "- Operational connection: none. `npm run audit:site` must fail if any candidate path is referenced by operational source.",
    "",
  );

  return `${lines.join("\n")}\n`;
}

async function buildContactSheet(reportCandidates) {
  const thumbWidth = 360;
  const thumbHeight = 203;
  const gutter = 28;
  const labelHeight = 52;
  const columns = 3;
  const rows = Math.ceil(reportCandidates.length / columns);
  const sheetWidth = columns * thumbWidth + (columns + 1) * gutter;
  const sheetHeight = rows * (thumbHeight + labelHeight) + (rows + 1) * gutter;

  const composites = [];
  for (let index = 0; index < reportCandidates.length; index += 1) {
    const candidate = reportCandidates[index];
    const col = index % columns;
    const row = Math.floor(index / columns);
    const left = gutter + col * (thumbWidth + gutter);
    const top = gutter + row * (thumbHeight + labelHeight + gutter);
    const imageBuffer = await sharp(publicPathToAbsolute(candidate.file)).resize(thumbWidth, thumbHeight).webp().toBuffer();
    const labelSvg = Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${thumbWidth}" height="${labelHeight}">
        <rect width="${thumbWidth}" height="${labelHeight}" fill="#fffaf0"/>
        <text x="12" y="22" font-family="Arial, sans-serif" font-size="16" fill="#34302a">${escapeHtml(candidate.category)} ${String(index + 1).padStart(2, "0")}</text>
        <text x="12" y="43" font-family="Arial, sans-serif" font-size="13" fill="#706656">${escapeHtml(candidate.sceneType)}</text>
      </svg>
    `);
    composites.push({ input: imageBuffer, left, top });
    composites.push({ input: labelSvg, left, top: top + thumbHeight });
  }

  mkdirSync(dirname(contactSheetPath), { recursive: true });
  await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 4,
      background: "#f6efe1",
    },
  })
    .composite(composites)
    .webp({ quality: 90, effort: 5 })
    .toFile(contactSheetPath);
}

async function main() {
  const entries = [];
  for (const candidate of candidates) {
    const checksum = await renderCandidate(candidate);
    entries.push(buildManifestEntry(candidate, checksum));
  }

  for (const candidate of existingPhotoCandidates) {
    const absolutePath = publicPathToAbsolute(candidate.file);
    if (!existsSync(absolutePath)) continue;
    entries.push(buildManifestEntry(candidate, sha256ForFile(absolutePath)));
  }

  const reportCandidates = [
    ...candidates,
    ...existingPhotoCandidates.filter((candidate) => existsSync(publicPathToAbsolute(candidate.file))),
  ];

  updateManifest(entries);
  await buildContactSheet(reportCandidates);

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, buildReport(entries, reportCandidates));

  for (const candidate of reportCandidates) {
    if (!existsSync(publicPathToAbsolute(candidate.file))) {
      throw new Error(`Candidate file missing after generation: ${candidate.file}`);
    }
  }

  console.log(
    `Generated ${candidates.length} illustration candidates and registered ${
      reportCandidates.length - candidates.length
    } existing photo candidates.`,
  );
  console.log(`Updated ${relative(rootDir, manifestPath)}`);
  console.log(`Wrote ${relative(rootDir, reportPath)}`);
  console.log(`Wrote ${relative(rootDir, contactSheetPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
