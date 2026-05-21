import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const campaignAlts = [
  "KCG 골드바 1돈 2돈 3돈 5돈 10돈 라인업 배너",
  "KCG 상담과 방문 준비 이미지",
  "KCG 종로 매장 방문 안내 이미지",
];
const forbiddenMainBannerImageSnippets = [
  "kcg-real-opening-campaign-20260511",
  "kcg-real-goldbar-hand-consultation",
  "kcg-ai-goldbar",
  "kcg-generated-goldbar",
  "kcg-gold-silver",
  "kcg-products-gold-silver",
  "kcg-silverbar",
];
const explicitAdminPassword = process.env.KCG_TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
const auditUrl = process.env.SITE_AUDIT_URL;
const isExternalAuditUrl = auditUrl ? !/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?/i.test(auditUrl) : false;
const adminPassword = explicitAdminPassword || (isExternalAuditUrl ? undefined : "0000");
const repoRoot = process.cwd();
const oneDonApprovedGoldbarImagePattern =
  /(?:kcg-approved-goldbar-1don-20260517|kcg-real-photo-goldbar-product-3-75g-20260514)/;
const tenDonApprovedGoldbarImagePattern =
  /(?:kcg-approved-goldbar-10don-20260517|kcg-real-photo-goldbar-product-37-5g-20260514)/;

function hasOneDonApprovedGoldbarImage(src: string) {
  return oneDonApprovedGoldbarImagePattern.test(decodeURIComponent(src));
}

function hasTenDonApprovedGoldbarImage(src: string) {
  return tenDonApprovedGoldbarImagePattern.test(decodeURIComponent(src));
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(2);
}

async function expectNoVisibleElementEscapesViewport(page: Page) {
  const escapes = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;

    return Array.from(document.body.querySelectorAll<HTMLElement>("*"))
      .map((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const isVisible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity) !== 0 &&
          rect.width > 1 &&
          rect.height > 1 &&
          rect.bottom > 0 &&
          rect.top < viewportHeight;

        if (!isVisible) return null;
        if (rect.left >= -2 && rect.right <= viewportWidth + 2) return null;

        return {
          tag: element.tagName.toLowerCase(),
          text: (element.textContent || "").trim().slice(0, 80),
          className: element.className.toString().slice(0, 120),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          viewportWidth,
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  });

  expect(escapes).toEqual([]);
}

async function expectAtomicPublicTokens(page: Page) {
  const brokenTokens = await page.evaluate(() => {
    const tokenPattern = /(02-747-180[67]|전화 문의|전화 상담|본사 연결|매장안내|상담 도우미|제품시세적용)/;
    const badPattern =
      /02-747-\s*\n\s*180[67]|02-747\s*\n\s*-180[67]|전화\s*\n\s*문의|전화\s*\n\s*상담|본사\s*\n\s*연결|매장\s*\n\s*안내|상담\s*\n\s*도우미|제품시세\s*\n\s*적용/;

    return Array.from(document.body.querySelectorAll<HTMLElement>("a, button, p, h1, h2, h3, span"))
      .map((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const isVisible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity) !== 0 &&
          rect.width > 1 &&
          rect.height > 1;

        if (!isVisible) return null;

        const text = element.innerText?.replace(/\r/g, "") || "";
        if (!tokenPattern.test(text) || !badPattern.test(text)) return null;

        return {
          tag: element.tagName.toLowerCase(),
          text: text.trim().slice(0, 80),
          className: element.className.toString().slice(0, 120),
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  });

  expect(brokenTokens).toEqual([]);
}

async function expectReadableTextContrast(locator: Locator, minimumRatio = 4.5) {
  const contrast = await locator.evaluate((element) => {
    type Rgb = { r: number; g: number; b: number; a: number };

    function clamp(value: number, min = 0, max = 255) {
      return Math.min(max, Math.max(min, value));
    }

    function tokenize(value: string) {
      return value
        .trim()
        .replace(/\//g, " ")
        .split(/[,\s]+/)
        .filter(Boolean);
    }

    function parseChannel(token: string, percentScale = 255) {
      return token.endsWith("%")
        ? (Number.parseFloat(token) / 100) * percentScale
        : Number.parseFloat(token);
    }

    function parseAlpha(token?: string) {
      if (!token) return 1;
      return token.endsWith("%") ? Number.parseFloat(token) / 100 : Number.parseFloat(token);
    }

    function parseRgb(value: string): Rgb | null {
      const match = value.match(/rgba?\(([^)]+)\)/i);
      if (!match) return null;
      const parts = tokenize(match[1]);
      const rgb = {
        r: parseChannel(parts[0] ?? "0"),
        g: parseChannel(parts[1] ?? "0"),
        b: parseChannel(parts[2] ?? "0"),
        a: parseAlpha(parts[3]),
      };
      if ([rgb.r, rgb.g, rgb.b, rgb.a].some((part) => Number.isNaN(part))) return null;
      return rgb;
    }

    function parseHex(value: string): Rgb | null {
      const match = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
      if (!match) return null;
      const raw = match[1].length === 3
        ? match[1].split("").map((digit) => digit + digit).join("")
        : match[1];
      return {
        r: Number.parseInt(raw.slice(0, 2), 16),
        g: Number.parseInt(raw.slice(2, 4), 16),
        b: Number.parseInt(raw.slice(4, 6), 16),
        a: 1,
      };
    }

    function gammaEncode(value: number) {
      return value <= 0.0031308
        ? 12.92 * value
        : 1.055 * value ** (1 / 2.4) - 0.055;
    }

    function xyzToRgb(x: number, y: number, z: number): Rgb {
      const r = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
      const g = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
      const b = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;
      return {
        r: clamp(gammaEncode(r) * 255),
        g: clamp(gammaEncode(g) * 255),
        b: clamp(gammaEncode(b) * 255),
        a: 1,
      };
    }

    function labToRgb(l: number, a: number, b: number): Rgb {
      const fy = (l + 16) / 116;
      const fx = fy + a / 500;
      const fz = fy - b / 200;
      const epsilon = 216 / 24389;
      const kappa = 24389 / 27;
      const pivot = (value: number) => {
        const cubed = value ** 3;
        return cubed > epsilon ? cubed : (116 * value - 16) / kappa;
      };

      const xD50 = 0.96422 * pivot(fx);
      const yD50 = pivot(fy);
      const zD50 = 0.82521 * pivot(fz);

      const xD65 = 0.9555766 * xD50 - 0.0230393 * yD50 + 0.0631636 * zD50;
      const yD65 = -0.0282895 * xD50 + 1.0099416 * yD50 + 0.0210077 * zD50;
      const zD65 = 0.0122982 * xD50 - 0.020483 * yD50 + 1.3299098 * zD50;

      return xyzToRgb(xD65, yD65, zD65);
    }

    function parseLab(value: string): Rgb | null {
      const match = value.match(/^lab\(([^)]+)\)$/i);
      if (!match) return null;
      const parts = tokenize(match[1]);
      const lightness = parseChannel(parts[0] ?? "0", 100);
      const a = Number.parseFloat(parts[1] ?? "0");
      const b = Number.parseFloat(parts[2] ?? "0");
      const alpha = parseAlpha(parts[3]);
      if ([lightness, a, b, alpha].some((part) => Number.isNaN(part))) return null;
      return { ...labToRgb(lightness, a, b), a: alpha };
    }

    function parseLch(value: string): Rgb | null {
      const match = value.match(/^lch\(([^)]+)\)$/i);
      if (!match) return null;
      const parts = tokenize(match[1]);
      const lightness = parseChannel(parts[0] ?? "0", 100);
      const chroma = Number.parseFloat(parts[1] ?? "0");
      const hue = (Number.parseFloat(parts[2] ?? "0") * Math.PI) / 180;
      const alpha = parseAlpha(parts[3]);
      if ([lightness, chroma, hue, alpha].some((part) => Number.isNaN(part))) return null;
      return { ...labToRgb(lightness, chroma * Math.cos(hue), chroma * Math.sin(hue)), a: alpha };
    }

    function oklabToRgb(lightness: number, a: number, b: number): Rgb {
      const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
      const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
      const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
      return {
        r: clamp(gammaEncode(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s) * 255),
        g: clamp(gammaEncode(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s) * 255),
        b: clamp(gammaEncode(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s) * 255),
        a: 1,
      };
    }

    function parseOklab(value: string): Rgb | null {
      const match = value.match(/^oklab\(([^)]+)\)$/i);
      if (!match) return null;
      const parts = tokenize(match[1]);
      const lightness = parseChannel(parts[0] ?? "0", 1);
      const a = Number.parseFloat(parts[1] ?? "0");
      const b = Number.parseFloat(parts[2] ?? "0");
      const alpha = parseAlpha(parts[3]);
      if ([lightness, a, b, alpha].some((part) => Number.isNaN(part))) return null;
      return { ...oklabToRgb(lightness, a, b), a: alpha };
    }

    function parseOklch(value: string): Rgb | null {
      const match = value.match(/^oklch\(([^)]+)\)$/i);
      if (!match) return null;
      const parts = tokenize(match[1]);
      const lightness = parseChannel(parts[0] ?? "0", 1);
      const chroma = Number.parseFloat(parts[1] ?? "0");
      const hue = (Number.parseFloat(parts[2] ?? "0") * Math.PI) / 180;
      const alpha = parseAlpha(parts[3]);
      if ([lightness, chroma, hue, alpha].some((part) => Number.isNaN(part))) return null;
      return { ...oklabToRgb(lightness, chroma * Math.cos(hue), chroma * Math.sin(hue)), a: alpha };
    }

    function parseSrgbColorFunction(value: string): Rgb | null {
      const match = value.match(/^color\(\s*(?:srgb|display-p3)\s+([^)]+)\)$/i);
      if (!match) return null;
      const parts = tokenize(match[1]);
      const toChannel = (token: string) => {
        if (token.endsWith("%")) return (Number.parseFloat(token) / 100) * 255;
        const parsed = Number.parseFloat(token);
        return parsed <= 1 ? parsed * 255 : parsed;
      };
      const rgb = {
        r: toChannel(parts[0] ?? "0"),
        g: toChannel(parts[1] ?? "0"),
        b: toChannel(parts[2] ?? "0"),
        a: parseAlpha(parts[3]),
      };
      if ([rgb.r, rgb.g, rgb.b, rgb.a].some((part) => Number.isNaN(part))) return null;
      return rgb;
    }

    function parseCssColor(value: string): Rgb | null {
      if (value === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
      return (
        parseRgb(value) ??
        parseHex(value) ??
        parseLab(value) ??
        parseLch(value) ??
        parseOklab(value) ??
        parseOklch(value) ??
        parseSrgbColorFunction(value)
      );
    }

    function relativeLuminance(channel: number) {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }

    function contrastRatio(foreground: Rgb, background: Rgb) {
      const fg =
        0.2126 * relativeLuminance(foreground.r) +
        0.7152 * relativeLuminance(foreground.g) +
        0.0722 * relativeLuminance(foreground.b);
      const bg =
        0.2126 * relativeLuminance(background.r) +
        0.7152 * relativeLuminance(background.g) +
        0.0722 * relativeLuminance(background.b);
      return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
    }

    const style = window.getComputedStyle(element);
    const color = parseCssColor(style.color);
    let background = parseCssColor(style.backgroundColor);
    let backgroundText = style.backgroundColor;
    let current: Element | null = element.parentElement;

    while ((!background || background.a === 0) && current) {
      backgroundText = window.getComputedStyle(current).backgroundColor;
      background = parseCssColor(backgroundText);
      current = current.parentElement;
    }

    return {
      background: backgroundText,
      color: style.color,
      ratio: color && background ? contrastRatio(color, background) : 0,
    };
  });

  expect(contrast.ratio, JSON.stringify(contrast)).toBeGreaterThanOrEqual(minimumRatio);
}

async function expectMobileBottomBarDoesNotCover(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await expect(locator).toBeVisible();

  const overlap = await locator.evaluate((element) => {
    const bar = document.querySelector<HTMLElement>('[data-testid="mobile-contact-bar"]');
    if (!bar) return false;

    const targetRect = element.getBoundingClientRect();
    const barRect = bar.getBoundingClientRect();
    const horizontalOverlap = Math.max(0, Math.min(targetRect.right, barRect.right) - Math.max(targetRect.left, barRect.left));
    const verticalOverlap = Math.max(0, Math.min(targetRect.bottom, barRect.bottom) - Math.max(targetRect.top, barRect.top));

    return horizontalOverlap > 0 && verticalOverlap > 0;
  });

  expect(overlap).toBe(false);
}

async function expectPersistentChromeDoesNotCover(locator: Locator) {
  await expect(locator).toBeVisible();

  const overlaps = await locator.evaluate((element) => {
    const targetRect = element.getBoundingClientRect();
    const chromeIds = ["site-header", "mobile-contact-bar"];

    return chromeIds
      .map((testId) => {
        const chrome = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
        if (!chrome) return null;

        const style = window.getComputedStyle(chrome);
        const chromeRect = chrome.getBoundingClientRect();
        const isVisible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity) !== 0 &&
          chromeRect.width > 1 &&
          chromeRect.height > 1;

        if (!isVisible) return null;

        const horizontalOverlap = Math.max(
          0,
          Math.min(targetRect.right, chromeRect.right) - Math.max(targetRect.left, chromeRect.left),
        );
        const verticalOverlap = Math.max(
          0,
          Math.min(targetRect.bottom, chromeRect.bottom) - Math.max(targetRect.top, chromeRect.top),
        );
        const overlapArea = horizontalOverlap * verticalOverlap;

        return overlapArea > 4 ? testId : null;
      })
      .filter(Boolean);
  });

  expect(overlaps).toEqual([]);
}

async function expectMarketDashboardCompact(page: Page) {
  const dashboard = page.getByTestId("market-dashboard");
  await expect(dashboard.getByRole("heading", { name: "국제 현재가" })).toBeVisible();
  await expect(dashboard.getByText("참고 데이터 기준").first()).toBeVisible();
  await expect(dashboard.getByText("고시 시세 우선").first()).toBeVisible();
  await expect(dashboard.getByText("원화 거래 금액은 KCG 고시 시세표").first()).toBeVisible();
  await expect(dashboard.getByTestId("market-source-line")).toContainText("출처:");
  await expect(dashboard.getByTestId("market-source-line")).toContainText("USD/KRW");
  await expect(dashboard).not.toContainText("국내 환산");
  await expect(dashboard).not.toContainText("매매기준가");
  await expect(dashboard).not.toContainText("3.75g");
  await expect(dashboard).not.toContainText("실시간 국제시세와 국내 환산 참고값");
  await expect(dashboard).not.toContainText("자동 환산표");
  await expect(dashboard).not.toContainText("차트 확장성");
  await expect(dashboard).not.toContainText("무료 모드에서는 현재가 중심");
}

async function expectTradingViewWidgetRendered(page: Page, widget: Locator) {
  await expect(widget).toBeVisible();
  const widgetHeight = await widget.evaluate((element) => Math.round(element.getBoundingClientRect().height));
  expect(widgetHeight).toBeGreaterThanOrEqual(390);

  await expect
    .poll(
      async () => {
        const iframeCount = await widget.locator("iframe").count();
        if (iframeCount > 0) return "iframe";
        return (await widget.getAttribute("data-kcg-widget-state")) || "missing";
      },
      { timeout: 20_000 },
    )
    .toMatch(/^(iframe|failed)$/);

  const widgetState = await widget.getAttribute("data-kcg-widget-state");
  if (widgetState === "failed" && (await widget.locator("iframe").count()) === 0) {
    const fallback = page.getByTestId("tradingview-loading-state");
    await expect(fallback).toContainText("TradingView 차트를 불러오지 못했습니다.");
    await expect(fallback.getByRole("link", { name: "TradingView에서 보기" })).toHaveAttribute(
      "href",
      "https://www.tradingview.com/symbols/TVC-GOLD/",
    );
    return;
  }

  await expect
    .poll(
      async () => {
        const iframe = await widget.locator("iframe").first().evaluate((node) => {
          const rect = node.getBoundingClientRect();
          return {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            src: node instanceof HTMLIFrameElement ? node.src : "",
          };
        });
        return iframe.width > 300 && iframe.height > 300 && iframe.src.includes("tradingview");
      },
      { timeout: 20_000 },
    )
    .toBe(true);
}

async function expectCampaignImagesLoaded(page: Page) {
  for (const [index, alt] of campaignAlts.entries()) {
    const image = page.getByAltText(alt);
    await expect(image).toHaveCount(1);
    if (index > 0) continue;
    await expect
      .poll(async () =>
        image.evaluate((node) => {
          if (!(node instanceof HTMLImageElement)) return false;
          return node.naturalWidth > 0 && node.naturalHeight > 0;
        }),
      )
      .toBe(true);
  }
}

async function expectNoForbiddenMainBannerImages(page: Page) {
  const imageSources = await page.getByTestId("home-campaign-visual").locator("img").evaluateAll((images) =>
    images.map((image) => (image instanceof HTMLImageElement ? decodeURIComponent(image.currentSrc || image.src) : "")),
  );

  for (const forbiddenImageSnippet of forbiddenMainBannerImageSnippets) {
    expect(imageSources.some((src) => src.includes(forbiddenImageSnippet))).toBe(false);
  }
}

async function getActiveCampaignSlideImage(page: Page) {
  return page
    .locator('[data-testid="home-campaign-slide"][data-active="true"]')
    .first()
    .getAttribute("data-slide-image");
}

async function expectPublicPriceLineupHidesZeroDelta(page: Page) {
  const panel = page.getByTestId("home-price-lineup-panel").first();
  await expect(panel).toBeVisible();
  await expect(panel).not.toContainText("0.00%");
  await expect(panel).toContainText("내가 살 때");
  await expect(panel).toContainText("내가 팔 때");
}

test("mobile home keeps the production conversion surface", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const header = page.locator("header");
  await expect(header.getByText("(주)한국센터")).toBeVisible();
  await expect(header.getByText("금거래소")).toBeVisible();
  await expect(header.getByRole("link", { name: "전화", exact: true })).toBeVisible();
  await expect(header.getByText("메뉴", { exact: true })).toBeVisible();

  await expect(page.getByRole("heading", { name: "한국센터금거래소 시세표" })).toBeVisible();
  await expect(page.getByText("KOREA CENTER GOLD EXCHANGE")).toBeVisible();
  await expect(page.getByText("내가 살 때 (VAT포함)")).toBeVisible();
  await expect(page.getByText("내가 팔 때 (현장 기준)")).toBeVisible();
  await expect(page.getByTestId("price-announcement-notice")).toBeVisible();
  await expectPublicPriceLineupHidesZeroDelta(page);
  await expect(page.getByText("시세는 고시 시각 기준이며 실제 거래 금액")).toBeVisible();
  await expect(page.getByLabel("시세표 닫기")).toHaveCount(0);
  await expect(page.getByTestId("home-price-lineup-restore")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "한국센터금거래소 시세표" })).toBeVisible();
  await expect(page.getByTestId("market-source-line").first()).toBeVisible();
  await expect(page.getByText("국제 금속 차트 보기").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "국내 뉴스" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "국제 뉴스" })).toBeVisible();

  const mobileContactBar = page.locator("div.fixed.inset-x-0.bottom-0");
  await expect(mobileContactBar.getByRole("link", { name: "전화", exact: true })).toBeVisible();
  await expect(mobileContactBar.getByRole("link", { name: "시세", exact: true })).toBeVisible();
  await expect(mobileContactBar.getByRole("link", { name: "위치", exact: true })).toBeVisible();

  await expectCampaignImagesLoaded(page);
  await expectNoForbiddenMainBannerImages(page);
  await expect(page.getByTestId("home-campaign-slide")).toHaveCount(3);
  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("desktop home keeps campaign slider and streamlined navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1800 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const header = page.locator("header");
  const gnb = header.getByRole("navigation");
  await expect(gnb.getByRole("link", { name: "시세", exact: true })).toBeVisible();
  await expect(gnb.getByRole("link", { name: "상품/매입", exact: true })).toBeVisible();
  await expect(gnb.getByRole("link", { name: "서비스", exact: true })).toBeVisible();
  await expect(gnb.getByRole("link", { name: "회사소개", exact: true })).toBeVisible();
  await expect(gnb.getByRole("link", { name: "매장안내", exact: true })).toBeVisible();
  await expect(gnb.getByRole("link", { name: "공지", exact: true })).toBeVisible();
  const navText = await gnb.innerText();
  expect(navText.indexOf("매장안내")).toBeLessThan(navText.indexOf("회사소개"));
  await expect(header).not.toContainText("운영 공지");
  await expect(page.getByRole("heading", { name: "한국센터금거래소 시세표" })).toBeVisible();
  await expectPublicPriceLineupHidesZeroDelta(page);
  const campaignVisual = page.getByTestId("home-campaign-visual");
  await expect(campaignVisual.getByRole("heading")).toHaveCount(0);
  await expect(campaignVisual).not.toContainText("방문 상담");
  await expect(page.getByTestId("tradingview-market-widget")).toHaveCount(0);
  const tradingViewDisclosure = page.getByTestId("tradingview-disclosure").first();
  await expect(tradingViewDisclosure).toHaveAttribute("data-kcg-disclosure-ready", "true", { timeout: 15000 });
  await tradingViewDisclosure.getByText("국제 금속 차트 보기").click();
  await expectTradingViewWidgetRendered(page, page.getByTestId("tradingview-market-widget"));

  await expectCampaignImagesLoaded(page);
  await expectNoForbiddenMainBannerImages(page);
  await expect(page.getByTestId("home-campaign-slide")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "이전 슬라이드" })).toBeVisible();
  await expect(page.getByRole("button", { name: "다음 슬라이드" })).toBeVisible();
  const firstActiveSlide = await getActiveCampaignSlideImage(page);
  await expect
    .poll(() => getActiveCampaignSlideImage(page), { timeout: 7_000, intervals: [1_000] })
    .not.toBe(firstActiveSlide);
  const heroImageWidth = await page.getByAltText(campaignAlts[0]).evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return Math.round(rect.width);
  });
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(heroImageWidth).toBeGreaterThanOrEqual(viewportWidth - 2);

  const campaignBox = await page.getByTestId("home-campaign-visual").boundingBox();
  const pricePanelBox = await page.getByTestId("home-price-lineup-panel").boundingBox();
  expect(campaignBox).not.toBeNull();
  expect(pricePanelBox).not.toBeNull();
  const overlaps =
    pricePanelBox!.x < campaignBox!.x + campaignBox!.width &&
    pricePanelBox!.x + pricePanelBox!.width > campaignBox!.x &&
    pricePanelBox!.y < campaignBox!.y + campaignBox!.height &&
    pricePanelBox!.y + pricePanelBox!.height > campaignBox!.y;
  expect(overlaps).toBe(true);
  expect(Math.round(pricePanelBox!.x)).toBeGreaterThanOrEqual(Math.round(viewportWidth * 0.075));
  expect(Math.round(pricePanelBox!.x)).toBeLessThanOrEqual(Math.round(viewportWidth * 0.18));
  expect(Math.round(pricePanelBox!.y)).toBeLessThanOrEqual(Math.round(campaignBox!.y) + 2);
  expect(Math.round(pricePanelBox!.width)).toBeLessThan(Math.round(viewportWidth * 0.45));
  expect(Math.round(pricePanelBox!.width)).toBeGreaterThan(500);
  expect(Math.round(pricePanelBox!.x + pricePanelBox!.width)).toBeLessThanOrEqual(Math.round(viewportWidth * 0.55));
  expect(Math.round(pricePanelBox!.y + pricePanelBox!.height)).toBeLessThanOrEqual(900);

  await expect(page.getByTestId("price-announcement-notice")).toBeVisible();
  await expect(page.getByLabel("시세표 닫기")).toHaveCount(0);
  await expect(page.getByTestId("home-price-lineup-restore")).toHaveCount(0);
  await expect(page.getByTestId("home-price-lineup-panel")).toBeVisible();

  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("persistent chrome does not cover first-viewport decision content", async ({ page }) => {
  const cases: Array<{ path: string; viewport: { width: number; height: number }; target: () => Locator }> = [
    {
      path: "/",
      viewport: { width: 390, height: 844 },
      target: () => page.getByRole("heading", { name: "한국센터금거래소 시세표" }),
    },
    {
      path: "/",
      viewport: { width: 1440, height: 900 },
      target: () => page.getByTestId("home-price-lineup-panel"),
    },
    {
      path: "/prices",
      viewport: { width: 390, height: 844 },
      target: () => page.getByRole("heading", { name: "품목별로 볼 기준만 확인합니다." }),
    },
    {
      path: "/products",
      viewport: { width: 390, height: 844 },
      target: () => page.getByRole("heading", { name: "상품/매입" }),
    },
    {
      path: "/services",
      viewport: { width: 390, height: 844 },
      target: () => page.getByRole("heading", { name: "품목 확인, 고시 기준, 실물 확인" }),
    },
  ];

  for (const item of cases) {
    await page.setViewportSize(item.viewport);
    await page.goto(item.path, { waitUntil: "domcontentloaded" });
    await expectPersistentChromeDoesNotCover(item.target());
    await expectNoHorizontalOverflow(page);
  }
});

test("services route preserves high-risk business wording", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.goto("/services", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "품목 확인, 고시 기준, 실물 확인" })).toBeVisible();
  await expect(page.getByText("고시 기준과 실물 확인 절차만 명확하게 안내합니다.")).toBeVisible();
  await expect(page.getByAltText("고금과 주얼리 매입 절차 상담 데스크")).toBeVisible();
  await expect(page.getByText("취급 품목", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("당일 기준", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("실물 확인", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("거래 기준")).toBeVisible();
  await expect(page.getByText("매입 가능 품목")).toBeVisible();
  await expect(page.getByText("판매·수급 품목")).toBeVisible();
  await expect(page.getByRole("heading", { name: "고금 매입 절차" })).toBeVisible();
  await expect(page.getByText("고금매입은 시세표의 어느 금액을 보면 되나요?")).toBeVisible();
  await expect(page.getByText("처음 연락할 때 무엇부터 말하면 되나요?")).toBeVisible();
  await expect(page.getByText("보증서나 영수증이 없으면 진행이 어렵나요?")).toBeVisible();
  await expect(page.getByText("전화로 금액을 확정받을 수 있나요?")).toBeVisible();
  await expect(page.getByText("자동 참고시세와 회사 게시 시세는 무엇이 다른가요?")).toBeVisible();
  await expect(page.getByRole("link", { name: "상품/매입 보기" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("mobile products route exposes a consultation catalog without checkout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.goto("/products", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "상품/매입" })).toBeVisible();
  await expect(page.getByText("돈 단위 골드바")).toBeVisible();
  await expect(page.getByText("내가 팔 때 기준과 실물 확인 항목을 먼저 봅니다.")).toBeVisible();
  await expect(page.getByText("품목 목록, 예상 수량, 희망 일정을 정리합니다.")).toBeVisible();
  await expect(page.getByRole("button", { name: "전체" })).toBeVisible();
  await expect(page.getByRole("button", { name: "골드바" })).toBeVisible();
  await expect(page.getByTestId("product-tab-silver-bar")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "순금제품" })).toHaveCount(0);
  await expect(page.getByTestId("product-tab-jewelry")).toBeVisible();
  await expect(page.getByTestId("product-count")).toContainText(/상품 \d+개/);
  const productCountBox = await page.getByTestId("product-count").boundingBox();
  expect(productCountBox?.y ?? 9999).toBeLessThan(900);
  const productPricePolicy = page.getByTestId("product-price-confirmation-policy");
  await expect(productPricePolicy).toBeVisible();
  await expect(productPricePolicy).toContainText("상품 참고가 적용 기준");
  await expect(productPricePolicy).toContainText("상품 카드의 참고가는 회사 고시 시세 기반이며 거래 확정가가 아닙니다.");
  await expect(page.getByText("추천순")).toBeVisible();
  await expect(page.getByText("참고가 낮은순")).toBeVisible();
  await expect(page.getByText("참고가 높은순")).toBeVisible();
  await expect(page.getByText("등록일순")).toBeVisible();
  const pageSizeSelect = page.getByLabel("목록 개수");
  await expect(pageSizeSelect).toBeVisible();
  await expect(pageSizeSelect).toHaveValue("20");
  for (const productName of [
    "KCG 골드바 1돈",
    "KCG 골드바 2돈",
    "KCG 골드바 3돈",
    "KCG 골드바 5돈",
    "KCG 골드바 10돈",
    "고금 주얼리 매입",
  ]) {
    await expect(page.getByText(productName).first()).toBeVisible();
  }
  const goldbarDonGuide = page.getByTestId("goldbar-don-guide");
  await expect(goldbarDonGuide).toBeVisible();
  await expect(page.getByRole("heading", { name: "1·2·3·5·10돈 골드바를 상담 단위로 확인합니다." })).toBeVisible();
  await expect(goldbarDonGuide.getByText("2돈", { exact: true })).toBeVisible();
  await expect(goldbarDonGuide).not.toContainText("7.5g");
  await expect(goldbarDonGuide).not.toContainText("KCG 실물 골드바 사진을 사이트용으로 최적화한 파생 이미지입니다.");
  await expect(page.getByTestId("silverbar-don-guide")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("실버바도 1·2·3·5·10돈");
  await expect(page.getByText("현재 고시가 기준 참고가").first()).toBeVisible();
  await expect(page.getByText("참고가입니다. 전화 또는 현장 확인 후 최종 안내합니다.").first()).toBeVisible();
  await expect(page.getByTestId("product-card").first()).toContainText("본사 연결");
  await expect(page.getByTestId("product-card").first()).toContainText("999.9 FINE GOLD");
  await expect(page.getByRole("link", { name: /KCG 골드바 1돈 전화 상담 02-747-1807/ })).toBeVisible();
  await expect(page.locator("main")).not.toContainText("장바구니");
  const productImageSources = await page.locator("main img[alt$='이미지']").evaluateAll((images) =>
    images.map((image) => (image instanceof HTMLImageElement ? image.currentSrc || image.src : "")),
  );
  const productCardImages = page.locator('main article[data-testid="product-card"] img');
  await expect(page.getByTestId("product-card")).toHaveCount(7);
  await expect(page.locator('[data-testid="product-card"][data-image-role="verified_product"]')).toHaveCount(5);
  await expect(page.locator('[data-testid="product-card"][data-image-role="representative_lineup"]')).toHaveCount(1);
  await expect(page.locator('[data-testid="product-card"][data-image-role="representative_category"]')).toHaveCount(1);
  await expect(page.locator('[data-testid="product-card"][data-image-role="image_pending"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="product-card"][data-image-role="fallback_brand"]')).toHaveCount(0);
  await expect(page.locator('main img[alt="KCG 골드바 1돈 실물 기준 이미지"]').first()).toHaveAttribute(
    "src",
    oneDonApprovedGoldbarImagePattern,
  );
  await expect(page.locator('main img[alt="KCG 골드바 10돈 실물 기준 이미지"]').first()).toHaveAttribute(
    "src",
    tenDonApprovedGoldbarImagePattern,
  );
  const articleImageSources = await productCardImages.evaluateAll((images) =>
    images.map((image) => (image instanceof HTMLImageElement ? image.currentSrc || image.src : "")),
  );
  await expect(page.locator("main")).not.toContainText("KCG 실버바 100g");
  await expect(page.locator("main")).not.toContainText("KCG 실버바 500g");
  await expect(page.locator("main")).not.toContainText("KCG 실버바 1kg");
  await expect(page.locator("main")).not.toContainText("대량 골드바·실버바 상담");
  await expect(page.locator("main")).not.toContainText("실버바 대량 수량 상담");
  await expect(page.locator("main")).not.toContainText("KCG 골드바 1g");
  await expect(page.locator("main")).not.toContainText("KCG 골드바 10g");
  await expect(page.locator("main")).not.toContainText("KCG 골드바 100g");
  await expect(page.locator("main")).not.toContainText("KCG 골드바 3.75g");
  await expect(page.locator("main")).not.toContainText("KCG 골드바 37.5g");
  await expect(page.locator("main")).not.toContainText("순금 돌반지");
  await expect(page.locator("main")).not.toContainText("순금 카드");
  await expect(page.locator("main")).not.toContainText("순금 기념 메달");
  await expect(page.locator("main")).not.toContainText("18K 주얼리 매입");
  await expect(page.locator("main")).not.toContainText("14K 주얼리 매입");
  await expect(page.locator("main")).not.toContainText("백금·은 제품 매입");
  await expect(page.getByRole("link", { name: /대량 골드바 상담 전화 상담 02-747-1807/ })).toBeVisible();
  expect(productImageSources.some((src) => src.includes("kcg-approved-goldbar-lineup-no-reflection-20260517"))).toBe(true);
  expect(productImageSources.some(hasOneDonApprovedGoldbarImage)).toBe(true);
  expect(productImageSources.some((src) => src.includes("kcg-approved-goldbar-2don-20260517"))).toBe(true);
  expect(productImageSources.some((src) => src.includes("kcg-approved-goldbar-3don-20260517"))).toBe(true);
  expect(productImageSources.some((src) => src.includes("kcg-approved-goldbar-5don-20260517"))).toBe(true);
  expect(productImageSources.some(hasTenDonApprovedGoldbarImage)).toBe(true);
  for (const forbiddenImageSnippet of [
    "kcg-real-goldbar-don-lineup-studio-v2-20260513",
    "kcg-real-goldbar-frontback-",
    "kcg-real-goldbar-hand-consultation",
    "kcg-ai-goldbar",
    "kcg-generated-goldbar",
    "kcg-silverbar",
    "kcg-products-gold-silver",
    "kcg-gold-silver",
    "kcg-product-b2b-consulting-20260503",
    "kcg-product-corporate-consulting-20260506",
    "kcg-b2b-bulk-consulting-20260427",
    "kcg-product-gold-silver-catalog",
    "kcg-real-photo-goldbar-lineup-20260514",
    "kcg-real-photo-goldbar-1don-20260514",
    "kcg-real-photo-goldbar-2don-20260514",
    "kcg-real-photo-goldbar-3don-20260514",
    "kcg-real-photo-goldbar-5don-20260514",
    "kcg-real-photo-goldbar-10don-20260514",
    "kcg-home-product-keyvisual-20260503",
    "kcg-old-gold-process-20260506",
    "kcg-b2b-gift-packaging-20260430",
    "kcg-silver-bar-catalog",
    "kcg-silver-gift",
  ]) {
    expect(productImageSources.some((src) => src.includes(forbiddenImageSnippet))).toBe(false);
  }
  expect(productImageSources.some((src) => src.includes("kcg-silver-gift-20260427-v2"))).toBe(false);
  expect(productImageSources.some((src) => src.includes("kcg-hero-metal-bars"))).toBe(false);
  expect(articleImageSources.some((src) => src.includes("kcg-product-jewelry-buying-20260503"))).toBe(true);
  expect(articleImageSources.some((src) => src.includes("kcg-real-photo-goldbar-product-1g-20260514"))).toBe(false);
  expect(articleImageSources.some((src) => src.includes("kcg-real-photo-goldbar-product-10g-20260514"))).toBe(false);
  expect(articleImageSources.some((src) => src.includes("kcg-real-photo-goldbar-product-100g-20260514"))).toBe(false);
  expect(new Set(articleImageSources).size).toBeGreaterThanOrEqual(5);
  await expect(page.getByTestId("product-trust-placeholder")).toHaveCount(0);
  await expect(page.getByText("사진 준비중")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("KCG VERIFIED ITEM");
  const firstProductImageSources = await productCardImages.evaluateAll((images) =>
    images.slice(0, 6).map((image) => (image instanceof HTMLImageElement ? image.currentSrc || image.src : "")),
  );
  expect(firstProductImageSources.some(hasOneDonApprovedGoldbarImage)).toBe(true);
  expect(firstProductImageSources.some(hasTenDonApprovedGoldbarImage)).toBe(true);
  await expect(page.locator("main")).not.toContainText("방문 상담");
  await expect(page.locator("main")).not.toContainText("관리자에서");
  await expect(page.locator("main")).not.toContainText("등록해 운영");
  await expect(page.locator("main")).not.toContainText("사진과 가격 문구");
  await expect(page.locator("main")).not.toContainText("구매하기");
  await expect(page.locator("main")).not.toContainText("결제하기");
  await expect(page.locator("main")).not.toContainText("주문하기");
  await expect(page.locator("main")).not.toContainText("바로 구매");
  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("public products HTML payload only serializes the public consultation catalog", async ({ request }) => {
  const response = await request.get("/products");
  expect(response.status()).toBe(200);
  const html = await response.text();

  for (const productName of [
    "KCG 골드바 1돈",
    "KCG 골드바 2돈",
    "KCG 골드바 3돈",
    "KCG 골드바 5돈",
    "KCG 골드바 10돈",
    "고금 주얼리 매입",
    "대량 골드바 상담",
  ]) {
    expect(html).toContain(productName);
  }

  for (const hiddenProductName of [
    "KCG 골드바 1g",
    "KCG 골드바 10g",
    "KCG 골드바 100g",
    "KCG 골드바 3.75g",
    "KCG 골드바 37.5g",
    "순금 돌반지",
    "순금 카드",
    "순금 기념 메달",
    "18K 주얼리 매입",
    "14K 주얼리 매입",
    "백금·은 제품 매입",
  ]) {
    expect(html).not.toContain(hiddenProductName);
  }
});

test("public goldbar product images use product-shot assets without representative labels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1400 });
  await page.goto("/products", { waitUntil: "domcontentloaded" });

  await expect(page.locator("main")).not.toContainText("상담용 대표 이미지");
  await expect(page.locator("main")).not.toContainText("실물 색상과 패키지는 현장 확인 후 안내");
  await expect(page.locator("main")).not.toContainText("사이트용으로 최적화한 파생 이미지");

  await page.goto("/products/investment-gold-bar-consulting", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).not.toContainText("상담용 대표 이미지");
  await expect(page.getByText("PRODUCT INFO")).toBeVisible();
  await expect(page.getByRole("heading", { name: "KCG 골드바 1돈" })).toBeVisible();
  await expect(page.getByRole("link", { name: /전화 상담 02-747-1807/ })).toBeVisible();
  await expect(page.locator("main")).not.toContainText("실제 상품 사진·포장·재고는 전화 상담과 현장 확인 후 안내합니다.");
  await expect(page.getByTestId("product-detail-price-confirmation-policy")).toContainText(
    "상품 참고가는 거래 확정가가 아니며",
  );
  await expect(page.locator("main")).not.toContainText("KCG 골드바 3.75g");
  const detailImageSrc = await page.locator("main img").first().evaluate((image) =>
    image instanceof HTMLImageElement ? image.currentSrc || image.src : "",
  );
  expect(decodeURIComponent(detailImageSrc)).toMatch(oneDonApprovedGoldbarImagePattern);
  expect(detailImageSrc).not.toContain("kcg-real-goldbar-detail-20260511");

  await page.goto("/products/kcg-gold-bar-37-5g", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "KCG 골드바 10돈" })).toBeVisible();
  await expect(page.locator("main")).not.toContainText("KCG 골드바 37.5g");
  const tenDonDetailImageSrc = await page.locator("main img").first().evaluate((image) =>
    image instanceof HTMLImageElement ? image.currentSrc || image.src : "",
  );
  expect(decodeURIComponent(tenDonDetailImageSrc)).toMatch(tenDonApprovedGoldbarImagePattern);

  for (const [slug, imagePath] of [
    ["kcg-gold-bar-2don", "kcg-approved-goldbar-2don-20260517"],
    ["kcg-gold-bar-3don", "kcg-approved-goldbar-3don-20260517"],
    ["kcg-gold-bar-5don", "kcg-approved-goldbar-5don-20260517"],
  ] as const) {
    await page.goto(`/products/${slug}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("product-detail-trust-placeholder")).toHaveCount(0);
    await expect(page.getByText("이미지 준비중")).toHaveCount(0);
    await expect(page.getByText("사진 준비중")).toHaveCount(0);
    await expect(page.locator("main img")).toHaveCount(1);
    await expect(page.locator("main img").first()).toHaveAttribute("data-image-role", "verified_product");
    const representativeImageSrc = await page.locator("main img").first().evaluate((image) =>
      image instanceof HTMLImageElement ? image.currentSrc || image.src : "",
    );
    expect(decodeURIComponent(representativeImageSrc)).toContain(imagePath);
    await expect(page.locator("main")).not.toContainText("상담용 대표 이미지");
  }

  for (const slug of [
    "kcg-gold-bar-1g",
    "kcg-gold-bar-10g",
    "kcg-gold-bar-100g",
    "kcg-silver-bar-100g",
    "kcg-silver-bar-500g",
    "kcg-silver-bar-1kg",
    "pure-gold-baby-ring-3-75g",
    "pure-gold-card-1g",
    "pure-gold-commemorative-medal",
    "pure-gold-gift-consulting",
    "pure-gold-baby-ring-buying",
    "18k-jewelry-buying",
    "14k-jewelry-buying",
    "platinum-silver-buying",
  ] as const) {
    const response = await page.goto(`/products/${slug}`, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(404);
    await expect(page.getByText("PRODUCT INFO")).toHaveCount(0);
  }

  const bulkGoldResponse = await page.goto("/products/bulk-gold-bar-consulting", { waitUntil: "domcontentloaded" });
  expect(bulkGoldResponse?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "대량 골드바 상담" })).toBeVisible();
  await expect(page.locator("main")).not.toContainText("대량 골드바·실버바 상담");
  const bulkGoldImageSrc = await page.locator("main img").first().evaluate((image) =>
    image instanceof HTMLImageElement ? image.currentSrc || image.src : "",
  );
  expect(decodeURIComponent(bulkGoldImageSrc)).toContain("kcg-approved-goldbar-lineup-no-reflection-20260517");

  const oldBulkGoldSilverResponse = await page.goto("/products/bulk-gold-silver-bar-consulting", {
    waitUntil: "domcontentloaded",
  });
  expect(oldBulkGoldSilverResponse?.status()).toBe(404);

  await expect(page.locator("main")).not.toContainText("구매하기");
  await expect(page.locator("main")).not.toContainText("결제하기");
  await expect(page.locator("main")).not.toContainText("장바구니");
  await expectNoHorizontalOverflow(page);
});

test("removed pure-gold and split buying products are not public detail routes", async ({ page }) => {
  for (const slug of [
    "pure-gold-baby-ring-3-75g",
    "pure-gold-card-1g",
    "pure-gold-commemorative-medal",
    "pure-gold-gift-consulting",
    "pure-gold-baby-ring-buying",
    "18k-jewelry-buying",
    "14k-jewelry-buying",
    "platinum-silver-buying",
  ] as const) {
    const response = await page.goto(`/products/${slug}`, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(404);
    await expect(page.getByText("PRODUCT INFO")).toHaveCount(0);
  }

  const response = await page.goto("/products/old-gold-jewelry-buying", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "고금 주얼리 매입" })).toBeVisible();
  await expect(page.locator("main")).not.toContainText("18K 주얼리 매입");
  await expect(page.locator("main")).not.toContainText("14K 주얼리 매입");
  await expect(page.locator("main")).not.toContainText("백금·은 제품 매입");
});

test("product image stages keep the same frame for real and pending images", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 1800 },
    { width: 1440, height: 1800 },
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto("/products", { waitUntil: "domcontentloaded" });

    const stages = page.getByTestId("product-image-stage");
    await expect(stages).toHaveCount(7);

    const metrics = await stages.evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          role: element.getAttribute("data-image-role"),
          height: Math.round(rect.height),
          width: Math.round(rect.width),
        };
      }),
    );

    expect(metrics.some((metric) => metric.role === "image_pending")).toBe(false);
    expect(metrics.some((metric) => metric.role === "verified_product")).toBe(true);

    const widths = metrics.map((metric) => metric.width);
    const heights = metrics.map((metric) => metric.height);
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(2);
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(2);
  }
});

test("core route hero media frames use one stable size system", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 900 },
    { width: 1440, height: 950 },
  ] as const) {
    const heights: number[] = [];

    for (const path of ["/products", "/services", "/about", "/company"] as const) {
      await page.setViewportSize(viewport);
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const frame = page.getByTestId("route-hero-media");
      await expect(frame).toBeVisible();
      const box = await frame.boundingBox();
      expect(box).not.toBeNull();
      heights.push(Math.round(box!.height));
    }

    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(2);
  }
});

test("mobile products route reaches catalog controls in the first viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "상품/매입" })).toBeVisible();
  await expect(page.getByRole("button", { name: "전체" })).toBeVisible();
  await expect(page.getByTestId("product-count")).toContainText(/상품 \d+개/);

  const productCountBox = await page.getByTestId("product-count").boundingBox();
  expect(productCountBox?.y ?? 9999).toBeLessThan(844);
  await expectNoHorizontalOverflow(page);
});

test("mobile about route shows map actions in the first viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "본사·매장 위치와 거래 전 준비 항목" })).toBeVisible();
  await expect(page.getByAltText("종로 귀금속 매장 방문 분위기 이미지")).toBeVisible();
  await expect(page.getByRole("heading", { name: "본사·매장", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "네이버 지도" }).first()).toBeVisible();

  const firstMapBox = await page.getByRole("link", { name: "네이버 지도" }).first().boundingBox();
  expect(firstMapBox?.y ?? 9999).toBeLessThan(844);
  await expectNoHorizontalOverflow(page);
});

test("products tabs filter locally without RSC refetch or detail prefetch", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("product-count")).toContainText(/상품 \d+개/);

  const productRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/products") && url.includes("_rsc=")) {
      productRequests.push(url);
    }
  });

  const tabs = [
    "gold-bar",
    "jewelry",
    "b2b",
    "all",
  ];

  for (const slug of tabs) {
    const tab = page.getByTestId(`product-tab-${slug}`);
    const startedAt = Date.now();
    await tab.click();
    await expect(tab).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("product-count")).toContainText(/상품 \d+개/);
    expect(Date.now() - startedAt, `${slug} tab local response`).toBeLessThan(500);
  }

  await page.waitForTimeout(300);
  expect(productRequests).toEqual([]);
});

test("product quick links sync same-route category query", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1100 });
  await page.goto("/products", { waitUntil: "domcontentloaded" });

  await page
    .getByTestId("product-quick-rail")
    .getByRole("button", { name: /고금·주얼리 매입/ })
    .click();

  await expect(page).toHaveURL(/category=jewelry/);
  await expect(page.getByTestId("product-tab-jewelry")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("product-count")).toContainText("1개");
});

test("public typography stays within the KCG route scale", async ({ page }) => {
  const collectTypographyOutliers = async (path: string, viewport: string) =>
    page.evaluate(
      ({ path, viewport }) => {
        const elements = Array.from(
          document.querySelectorAll<HTMLElement>(
            "main h1, main h2, main h3, main p, main li, main a, main button, main summary, main label, main th, main td",
          ),
        );

        return elements
          .map((element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            const text = (element.textContent || "").replace(/\s+/g, " ").trim();
            const isVisible =
              text.length > 0 &&
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              Number(style.opacity) !== 0 &&
              rect.width > 1 &&
              rect.height > 1;

            if (!isVisible) return null;

            const tag = element.tagName.toLowerCase();
            const className = element.className.toString();
            const inPriceLineup = Boolean(element.closest('[data-testid="home-price-lineup-panel"]'));
            const fontSize = Number.parseFloat(style.fontSize);
            const lineHeight = Number.parseFloat(style.lineHeight);
            const letterSpacing = Number.parseFloat(style.letterSpacing);
            const lineRatio = Number.isFinite(lineHeight) && fontSize > 0 ? lineHeight / fontSize : null;
            const allowsSmallLabel =
              className.includes("kcg-data-label") ||
              className.includes("kcg-fine-label") ||
              className.includes("kcg-caption") ||
              tag === "th";
            const numericLike = /^[0-9,]+(?:개|건|점)?$/.test(text);
            const priceLike = numericLike || /[0-9,]+원|USD\/KRW|T\.oz|[0-9]{1,3}\.[0-9]/.test(text);
            const issues: string[] = [];

            if (fontSize < 10.5 && !allowsSmallLabel) issues.push(`too-small:${fontSize.toFixed(1)}`);
            if (tag === "h1" && fontSize > 46) issues.push(`h1-too-large:${fontSize.toFixed(1)}`);
            if (tag === "h2" && fontSize > 40) issues.push(`h2-too-large:${fontSize.toFixed(1)}`);
            if (tag === "h3" && fontSize > 32) issues.push(`h3-too-large:${fontSize.toFixed(1)}`);
            if ((tag === "p" || tag === "li" || tag === "summary") && fontSize > 22 && !priceLike && !inPriceLineup) {
              issues.push(`body-too-large:${fontSize.toFixed(1)}`);
            }
            if (Number.isFinite(letterSpacing) && letterSpacing > 4.4) {
              issues.push(`letter-spacing-too-wide:${letterSpacing.toFixed(1)}`);
            }
            if (Number.isFinite(letterSpacing) && letterSpacing < -1.8) {
              issues.push(`letter-spacing-too-tight:${letterSpacing.toFixed(1)}`);
            }
            if ((tag === "p" || tag === "li" || tag === "summary") && lineRatio !== null && lineRatio < 1.25) {
              issues.push(`line-height-too-tight:${lineRatio.toFixed(2)}`);
            }

            if (issues.length === 0) return null;

            return {
              path,
              viewport,
              tag,
              text: text.slice(0, 72),
              className: className.slice(0, 100),
              issues,
            };
          })
          .filter(Boolean)
          .slice(0, 12);
      },
      { path, viewport },
    );

  const routes = ["/", "/prices", "/products", "/services", "/company", "/about", "/announcements", "/admin/login"];
  const adminRoutes = ["/admin", "/admin/prices", "/admin/products"];

  for (const path of routes) {
    await page.setViewportSize({ width: 390, height: 1200 });
    await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(await collectTypographyOutliers(path, "mobile")).toEqual([]);
    await expectNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 1440, height: 1200 });
    await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(await collectTypographyOutliers(path, "desktop")).toEqual([]);
    await expectNoHorizontalOverflow(page);
  }

  if (adminPassword) {
    await page.setViewportSize({ width: 1440, height: 1200 });
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await page.getByLabel("관리자 비밀번호").fill(adminPassword);
    await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
    await expect(page).toHaveURL(/\/admin/);

    for (const path of adminRoutes) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(await collectTypographyOutliers(path, "admin-desktop")).toEqual([]);
      await expectNoHorizontalOverflow(page);
    }
  }
});

test("company route uses approved company copy without internal strategy notes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/company", { waitUntil: "domcontentloaded" });

  const main = page.locator("main");
  await expect(page.getByRole("heading", { name: "주식회사 한국센터금거래소" })).toBeVisible();
  await expect(main).toContainText("KC주얼리 그룹 사명");
  await expect(main).toContainText("고객가치를 높이고 보다 많은 사람들이 귀금속과 다이아몬드를 즐기며 행복할수 있도록 돕는다.");
  await expect(main).toContainText("한국센터금거래소(KCG) 회사소개");
  await expect(main).toContainText("국내 다이아몬드 수입 도매유통 1위 기업");
  await expect(main).toContainText("국내최대 랩그로운 도매법인");
  await expect(main).not.toContainText("전문 품목");
  await expect(main).not.toContainText("온라인 소비자 고금 정상매입 및 골드바, 실버바 및 제품판매");
  await expect(page.getByAltText("한국센터금거래소 회사소개 상담 장면 이미지")).toBeVisible();
  await expect(main).not.toContainText("잠언");
  await expect(main).not.toContainText("할리스");
  await expect(main).not.toContainText("공식 인증센터 10군데");
  await expect(main).not.toContainText("신사옥");
  await expect(main).not.toContainText("신문광고");
  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("desktop products route keeps the quick rail flush to the viewport edge", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 1000 });
  await page.goto("/products", { waitUntil: "domcontentloaded" });

  const quickRail = page.getByTestId("product-quick-rail");
  await expect(quickRail).toBeVisible();
  await expect(quickRail).not.toContainText("TODAY VIEW");
  await expect(quickRail).not.toContainText("TODAY");
  await expect(quickRail).not.toContainText("VIEW");
  await expect(quickRail.getByText("오늘 고시 시세")).toBeVisible();
  await expect(quickRail.getByText("고금·주얼리 매입")).toBeVisible();

  const box = await quickRail.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs((box!.x + box!.width) - 1680)).toBeLessThanOrEqual(2);
});

test("mobile prices puts consultation actions before the company price columns", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.goto("/prices", { waitUntil: "domcontentloaded" });

  const mainText = await page.locator("main").innerText();
  const callIndex = mainText.indexOf("전화");
  const visitIndex = mainText.indexOf("오시는 길");
  const columnIndex = mainText.indexOf("내가 살 때 (VAT포함)");

  expect(callIndex).toBeGreaterThanOrEqual(0);
  expect(visitIndex).toBeGreaterThanOrEqual(0);
  expect(columnIndex).toBeGreaterThanOrEqual(0);
  expect(callIndex).toBeLessThan(columnIndex);
  expect(visitIndex).toBeLessThan(columnIndex);

  await expect(page.getByTestId("home-price-lineup-panel").getByText("3.75g 기준")).toBeVisible();
  await expectPublicPriceLineupHidesZeroDelta(page);
  const mainTextBeforeGuide = mainText.indexOf("한국센터금거래소 시세표");
  const guideIndex = mainText.indexOf("시세 이용 기준");
  expect(mainTextBeforeGuide).toBeGreaterThanOrEqual(0);
  expect(guideIndex).toBeGreaterThan(mainTextBeforeGuide);
  const closedDayPolicy = page.getByTestId("closed-day-price-policy");
  await expect(closedDayPolicy).toBeVisible();
  await expect(closedDayPolicy).toContainText("휴무일·영업시간 외 적용 기준");
  await expect(closedDayPolicy).toContainText("화면 금액은 거래 확정가가 아닙니다.");
  await expect(page.getByRole("heading", { name: "품목별로 볼 기준만 확인합니다." })).toBeVisible();
  await expect(page.getByText("고금·주얼리").first()).toBeVisible();
  await expect(page.getByText("법인·대량")).toBeVisible();
  await expect(page.getByText("내가 팔 때").first()).toBeVisible();
  await expect(page.getByTestId("home-price-lineup-panel")).toContainText("내가 살 때");
  await expect(page.getByTestId("home-price-lineup-panel")).toContainText("내가 팔 때");
  const priceLineupText = await page.getByTestId("home-price-lineup-panel").innerText();
  expect(priceLineupText.split("3.75g 기준").length - 1).toBe(1);
  expect(mainText.split("3.75g 기준").length - 1).toBe(1);
  expect(priceLineupText).not.toContain("24K · 3.75g 기준");
  expect(priceLineupText).not.toContain("18K · 3.75g 기준");
  expect(priceLineupText).not.toContain("14K · 3.75g 기준");
  expect(priceLineupText).not.toContain("백금 · 3.75g 기준");
  expect(priceLineupText).not.toContain("은 · 3.75g 기준");
  await expect(page.getByText("신분증, 보증서·영수증, 제품 상태")).toBeVisible();
  await expect(page.getByText("내가 살 때·내가 팔 때 분리", { exact: true })).toBeVisible();
  await expect(page.getByText("현장 확정", { exact: true })).toBeVisible();
  await expect(page.getByText("무엇을 보유했나요?")).toBeVisible();
  await expect(page.getByText("얼마나 있나요?")).toBeVisible();
  await expect(page.getByText("어떻게 오시나요?")).toBeVisible();
  expect(mainText.split("USD/KRW").length - 1).toBeGreaterThanOrEqual(1);
  expect(mainText.split("업데이트").length - 1).toBeLessThanOrEqual(1);
  expect(mainText.split("3.75g 자동 환산").length - 1).toBe(0);
  await expect(page.locator("main")).not.toContainText("단위: 3.75g");
  const postedDetailSection = page.locator("section", { hasText: "품목별 회사 고시 시세 상세" }).first();
  await expect(postedDetailSection.getByText(/기준 고시 (시각|예정)/)).toBeVisible();
  await expect(postedDetailSection).not.toContainText("3.75g 기준");
  await expect(postedDetailSection).not.toContainText("기준 시각:");
  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("prices market reference stays compact in the two-column desktop layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/prices", { waitUntil: "domcontentloaded" });

  await expectMarketDashboardCompact(page);
  await expectTradingViewWidgetRendered(page, page.getByTestId("tradingview-market-widget"));
  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("public price lineup treats zero-value history as unchanged guidance", () => {
  const priceLineupSource = readFileSync(
    path.join(repoRoot, "src/components/market/price-lineup.tsx"),
    "utf8",
  );
  const pricePresenterSource = readFileSync(
    path.join(repoRoot, "src/lib/price-presenter.ts"),
    "utf8",
  );

  expect(priceLineupSource).toContain("if (diff === 0) return null;");
  expect(priceLineupSource).toContain("lineupBasisLabel");
  expect(priceLineupSource).toContain("3.75g 기준");
  expect(priceLineupSource).toContain("내가 살 때 (VAT포함)");
  expect(priceLineupSource).toContain("내가 팔 때 (현장 기준)");
  expect(priceLineupSource).toContain("내가 팔 때 (현장기준)");
  expect(priceLineupSource).not.toContain("zeroChangeSymbol");
  expect(priceLineupSource).not.toContain("zeroSymbol");
  expect(pricePresenterSource).not.toContain("· 3.75g 기준");
});

test("inquiry assistant answers safe questions and protects personal data", async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("inquiry-assistant-widget")).toHaveAttribute("data-kcg-inquiry-ready", "true", {
    timeout: 15000,
  });
  const mobileInquiryCta = page.getByTestId("mobile-contact-bar").getByRole("link", { name: "상담" });
  await expect(mobileInquiryCta).toBeVisible();
  await expect(mobileInquiryCta).toHaveCSS("color", "rgb(255, 255, 255)");
  await mobileInquiryCta.click();

  const dialog = page.getByRole("dialog", { name: "거래 상담 도우미" });
  await expect(dialog.getByText("개인정보 저장 없이 기본 문의만 안내합니다")).toBeVisible();
  await dialog.getByRole("button", { name: "시세표" }).click();
  await expect(dialog.getByText("회사가 고시한 시세").last()).toBeVisible();
  await expect(dialog.getByRole("link", { name: "전화 상담" }).first()).toBeVisible();

  const healthResponse = await request.get("/api/health");
  expect(healthResponse.ok()).toBe(true);
  const health = await healthResponse.json();
  expect(health.inquiryAssistantStoresMessages).toBe(false);
  expect(health.inquiryAssistantCollectsPersonalData).toBe(false);
  expect(["rules", "openai", "openai-disabled"]).toContain(health.inquiryAssistantMode);
  expect(health.searchApprovalRequired).toBe(true);
  expect(health.searchApproved).toBe(false);
  expect(health.indexing).not.toBe("enabled");

  const privacyResponse = await request.post("/api/inquiry-assistant", {
    data: {
      message: "010-1234-5678로 연락 주세요",
      path: "/",
    },
  });
  expect(privacyResponse.ok()).toBe(true);
  const privacy = await privacyResponse.json();
  expect(privacy.handoffRequired).toBe(true);
  expect(privacy.answer).toContain("개인정보");

  const krxResponse = await request.post("/api/inquiry-assistant", {
    data: {
      message: "KRX 금시장 시세를 가져와서 우리 시세로 써도 되나요?",
      path: "/prices",
    },
  });
  expect(krxResponse.ok()).toBe(true);
  const krx = await krxResponse.json();
  expect(krx.intent).toBe("krx_reference");
  expect(krx.answer).toContain("승인");
  expect(krx.answer).toContain("회사 고시 시세");
});

test("mobile fixed contact bar does not cover key decision content", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const targets = [
    { path: "/", text: "상품/매입 카테고리" },
    { path: "/prices", text: "품목별 회사 고시 시세 상세" },
    { path: "/products", text: "KCG 골드바 1돈" },
    { path: "/services", text: "품목별 상품과 매입 기준은 상품/매입에서 확인하세요." },
    { path: "/about", text: "사업자등록번호" },
  ];

  for (const target of targets) {
    await page.goto(target.path, { waitUntil: "domcontentloaded" });
    await expectMobileBottomBarDoesNotCover(page.getByText(target.text).first());
    await expectNoHorizontalOverflow(page);
  }
});

test("public routes avoid repeated phone and consultation wording", async ({ page }) => {
  const thresholds = [
    { path: "/products", limit: 25 },
    { path: "/services", limit: 25 },
    { path: "/about", limit: 25 },
  ];

  for (const item of thresholds) {
    await page.goto(item.path, { waitUntil: "domcontentloaded" });
    const mainText = await page.locator("main").innerText();
    const count = (mainText.match(/전화|문의|상담/g) || []).length;
    expect(count, `${item.path} phone/contact wording count`).toBeLessThanOrEqual(item.limit);
  }
});

test("public route phone and action tokens stay atomic", async ({ page }) => {
  const routes = ["/", "/prices", "/products", "/services", "/about", "/company", "/announcements"];
  const viewports = [
    { width: 360, height: 900 },
    { width: 390, height: 900 },
    { width: 1440, height: 950 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expectAtomicPublicTokens(page);
      await expectNoHorizontalOverflow(page);
    }
  }
});

test("critical routes respond with expected content", async ({ page }) => {
  const routes = [
    { path: "/", text: "한국센터금거래소 시세표" },
    { path: "/prices", text: "품목별로 볼 기준만 확인합니다." },
    { path: "/products", text: "상품/매입" },
    { path: "/products/investment-gold-bar-consulting", text: "KCG 골드바 1돈" },
    { path: "/announcements", text: "시세 운영 및 거래 준비 공지" },
    { path: "/services", text: "돈 단위 골드바·고금 주얼리" },
    { path: "/company", text: "사업자등록번호" },
    { path: "/about", text: "본사 전화" },
    { path: "/admin/login", text: "관리자 로그인" },
    { path: "/api/health", text: "launchReadiness" },
    { path: "/robots.txt", text: "Disallow: /" },
  ];

  for (const route of routes) {
    const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), route.path).toBe(200);
    await expect(page.locator("body")).toContainText(route.text);
  }

  for (const path of ["/option-1", "/option-2"]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), path).toBe(404);
  }
});

test("admin launch dashboard separates pre-launch work from public-launch approval", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.goto("/admin/launch", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Flaunch/);
  await expect(page.getByRole("heading", { name: "관리자 로그인" })).toBeVisible();

  if (!adminPassword) return;

  await page.getByLabel("관리자 비밀번호").fill(adminPassword);
  await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
  await expect(page).toHaveURL(/\/admin\/launch/);

  await expect(page.getByRole("heading", { name: "오픈 전 점검판" })).toBeVisible();
  const releaseStageMap = page.getByTestId("admin-release-stage-map");
  await expect(releaseStageMap.getByRole("heading", { name: "운영 상태 구분" })).toBeVisible();
  await expect(releaseStageMap.getByRole("heading", { name: "소스 QA" })).toBeVisible();
  await expect(releaseStageMap.getByRole("heading", { name: "라이브 리뷰 반영" })).toBeVisible();
  await expect(releaseStageMap.getByRole("heading", { name: "공개 검색 런칭" })).toBeVisible();
  await expect(releaseStageMap.getByText("npm run check:release-state")).toBeVisible();
  await expect(releaseStageMap.getByText("robots/noindex 유지")).toBeVisible();
  await expect(page.getByRole("heading", { name: "지금 미리 가능한 준비" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "공개 직전 별도 승인 필요" })).toBeVisible();
  const userOnlyLaunchPanel = page.getByTestId("admin-user-only-launch-blockers");
  await expect(page.getByText("Production 배포 승인")).toBeVisible();
  await expect(userOnlyLaunchPanel.getByText("최종 상품 가격·공임·운영자료 확인")).toBeVisible();
  await expect(userOnlyLaunchPanel.getByText("대표 이미지·실사진 final-use 승인")).toBeVisible();
  await expect(userOnlyLaunchPanel.getByText("최종 관리자 비밀번호 rotation")).toBeVisible();
  await expect(page.getByText("KCG_PUBLIC_SEARCH_APPROVED=1 명시 승인 env 설정")).toBeVisible();
  await expect(page.getByText("robots/noindex 해제와 검색 색인 승인")).toBeVisible();
  const launchApprovalGate = page.getByRole("heading", { name: "공개 승인 게이트" }).locator("xpath=ancestor::article");
  await expect(launchApprovalGate).toBeVisible();
  await expect(launchApprovalGate).toContainText("확인 필요");
  const publicLaunchPanel = page.getByTestId("admin-public-launch-approval");
  await expectReadableTextContrast(publicLaunchPanel.getByRole("heading", { name: "공개 직전 별도 승인 필요" }));
  await expectReadableTextContrast(publicLaunchPanel.getByText("Production 배포 승인"));
  await expectReadableTextContrast(publicLaunchPanel.getByText("KCG_PUBLIC_SEARCH_APPROVED=1 명시 승인 env 설정"));
  await expectReadableTextContrast(publicLaunchPanel.getByText("robots/noindex 해제와 검색 색인 승인"));

  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("admin login keeps the login form as the first mobile task", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "관리자 로그인" })).toBeVisible();
  await expect(page.getByLabel("관리자 비밀번호")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Operations Console");
  await expect(page.locator("body")).not.toContainText("로그아웃");

  const passwordBox = await page.getByLabel("관리자 비밀번호").boundingBox();
  const submitBox = await page.getByRole("button", { name: "관리자 페이지로 이동" }).boundingBox();
  expect(passwordBox?.y ?? 9999).toBeLessThan(700);
  expect(submitBox?.y ?? 9999).toBeLessThan(844);
  await expectNoHorizontalOverflow(page);
});

test("admin dashboard prioritizes daily operator tasks", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin/);

  if (!adminPassword) return;

  await page.getByLabel("관리자 비밀번호").fill(adminPassword);
  await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
  await expect(page).toHaveURL(/\/admin/);

  await expect(page.getByRole("heading", { name: "오늘 먼저 확인할 것" })).toBeVisible();
  await expect(page.getByText("오늘 고시 시각")).toBeVisible();
  await expect(page.getByText("시세 운영", { exact: true })).toBeVisible();
  await expect(page.getByText("검토 대기")).toBeVisible();
  await expect(page.getByRole("heading", { name: "운영자가 바로 눌러야 할 메뉴" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "헷갈리면 이것만 기준" })).toBeVisible();
  await expect(page.getByRole("link", { name: "시세 관리" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "상품 관리" }).first()).toBeVisible();
  await expect(page.locator(".admin-light")).toBeVisible();

  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("admin announcements actions stay readable in the light console", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/admin/announcements", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fannouncements/);

  if (!adminPassword) return;

  await page.getByLabel("관리자 비밀번호").fill(adminPassword);
  await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
  await expect(page).toHaveURL(/\/admin\/announcements/);

  await expect(page.getByRole("heading", { name: "공지 관리" })).toBeVisible();
  await expect(page.getByTestId("admin-announcement-table")).toBeVisible();
  await expect(page.getByTestId("admin-announcement-editor")).toBeVisible();
  await expect(page.getByText("게시중").first()).toBeVisible();
  await expect(page.getByText("초안").first()).toBeVisible();
  await expect(page.getByText("Pinned").first()).toBeVisible();
  const deleteButton = page.getByRole("button", { name: "공지 삭제" });
  await expect(deleteButton).toBeVisible();
  await expectReadableTextContrast(deleteButton);
  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("admin prices exposes automatic price operation and public-lineup manual editor", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/admin/prices", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fprices/);

  if (!adminPassword) return;

  await page.getByLabel("관리자 비밀번호").fill(adminPassword);
  await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
  await expect(page).toHaveURL(/\/admin\/prices/);

  await expect(page.getByRole("heading", { name: "오늘 시세 관리" }).last()).toBeVisible();
  await expect(page.getByTestId("admin-price-mode-switch")).toBeVisible();
  const modeToggle = page.getByTestId("admin-price-mode-toggle");
  await expect(modeToggle).toBeVisible();
  await expect(modeToggle).toContainText("자동시세 OFF");
  await expect(page.getByText("대표가 직접 넣는")).toHaveCount(0);
  await expect(page.locator(".admin-light")).toBeVisible();
  await page.getByText("현재 공개 시세·고객 고지·운영 요약 보기").click();
  await expect(page.getByText("현재 공개 시세", { exact: true })).toBeVisible();
  const publicPriceStatus = page.getByTestId("admin-public-price-status");
  await expect(publicPriceStatus).toBeVisible();
  await expect(publicPriceStatus).toContainText("고객 화면 고지");
  await expect(publicPriceStatus).toContainText("화면 금액만으로 거래 확정 답변을 하지 않습니다.");
  await expect(publicPriceStatus).toContainText("휴무일·영업시간 외 고객 문의");
  await expect(page.getByText("고시 기준", { exact: true })).toBeVisible();
  await expect(page.getByText("관리자 저장", { exact: true })).toBeVisible();
  await expect(page.getByText("예약 실행", { exact: true })).toBeVisible();
  await expect(page.getByText("다음 계산 가능", { exact: true })).toBeVisible();
  await expect(page.getByTestId("admin-price-time-explainer")).toBeVisible();
  await expect(page.getByText("마지막 수동 등록")).toBeVisible();
  await expect(page.getByText("24시간 guard")).toBeVisible();

  await modeToggle.click();
  const autoPanel = page.getByTestId("admin-price-auto-panel");
  await expect(autoPanel).toBeVisible();
  await expect(modeToggle).toHaveAttribute("aria-pressed", "true");
  await expect(modeToggle).toContainText("자동시세 ON");
  await expect(page.getByRole("heading", { name: "현재 자동 운영 중" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "자동 계산 공식" })).toBeVisible();
  await expect(page.getByText("국제 금 3.75g 환산가").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "지금 계산 실행" })).toBeVisible();
  await expect(autoPanel.getByText("자동 게시 허용 변동폭").first()).toBeVisible();
  await expect(autoPanel.getByText("최소 반영 금액").first()).toBeVisible();
  await expect(autoPanel.getByText("영업시간만 반영").first()).toBeVisible();
  await expect(autoPanel.getByText("24시간 미등록 경고").first()).toBeVisible();
  await expect(autoPanel.getByText(/미등록 경고:/)).toBeVisible();
  await expect(autoPanel.getByText("자동시세 세부 설정")).toBeVisible();
  await autoPanel.getByText("자동시세 세부 설정").click();
  const autoSourceSelect = autoPanel.locator('select[name="autoSource"]');
  const krxOption = autoSourceSelect.locator('option[value="krx"]');
  await expect(autoSourceSelect).toBeVisible();
  await expect(krxOption).toHaveText("KRX Open API (승인 전 사용 불가)");
  await expect(krxOption).toHaveAttribute("disabled", "");
  await expect(autoPanel.getByText("KRX는 승인 전 선택할 수 없습니다.")).toBeVisible();
  await expect(page.getByText("선택한 모드 저장")).toHaveCount(0);
  await expect(page.getByText(/저장 상태:|미리보기 상태:/)).toBeVisible();
  await expect(page.getByRole("link", { name: "한국금거래소 참고 보기" })).toBeVisible();
  await expect(page.getByRole("link", { name: "삼성금거래소 참고 보기" })).toBeVisible();
  await expect(page.getByRole("link", { name: "GBK 참고 보기" })).toBeVisible();
  await expect(page.getByTestId("admin-price-editor")).toHaveCount(0);

  await modeToggle.click();
  const editor = page.getByTestId("admin-price-editor");
  await expect(modeToggle).toHaveAttribute("aria-pressed", "false");
  await expect(modeToggle).toContainText("자동시세 OFF");
  await expect(editor.getByText("고객 화면과 같은 품목 순서로 입력합니다.")).toBeVisible();
  await expect(editor.getByRole("columnheader", { name: "품목" })).toBeVisible();
  await expect(editor.getByRole("columnheader", { name: "내가 살 때 (VAT포함)" })).toBeVisible();
  await expect(editor.getByRole("columnheader", { name: "내가 팔 때 (현장 기준)" })).toBeVisible();
  await expect(editor.getByTestId("admin-price-lineup-row-gold-24k")).toContainText("순금시세");
  await expect(editor.getByTestId("admin-price-lineup-row-gold-24k")).toContainText("24K");
  await expect(editor.getByTestId("admin-price-lineup-row-gold-24k")).not.toContainText("3.75g 기준");
  await expect(editor.getByTestId("admin-price-cell-gold_24k_sell")).toContainText("현재");
  await expect(editor.getByTestId("admin-price-cell-gold_24k_sell").locator('input[name^="value:"]')).toHaveAttribute(
    "required",
    "",
  );
  await expect(editor.getByTestId("admin-price-cell-gold_24k_buy")).toContainText("현재");
  const gold24kBuyInput = editor.getByTestId("admin-price-cell-gold_24k_buy").locator('input[name^="value:"]');
  await expect(gold24kBuyInput).toBeVisible();
  const manualGoldPurityHelper = editor.getByTestId("manual-gold-purity-helper");
  await expect(manualGoldPurityHelper).toContainText("18K/14K 자동 계산");
  await expect(manualGoldPurityHelper).toContainText("저장 시 자동 반영");
  await expect(editor.getByTestId("manual-gold-purity-settings-form")).toContainText("환산 계수");
  await expect(editor.getByTestId("manual-gold-purity-auto-toggle")).toBeChecked();
  await expect(editor.getByTestId("admin-price-lineup-row-gold-18k")).toContainText("18K 금시세");
  await expect(editor.getByTestId("admin-price-static-sell-gold-18k")).toContainText("제품시세적용");
  const gold18kBuyInput = editor.getByTestId("admin-price-cell-gold_18k_buy").locator('input[name^="value:"]');
  const gold14kBuyInput = editor.getByTestId("admin-price-cell-gold_14k_buy").locator('input[name^="value:"]');
  await expect(gold18kBuyInput).toBeVisible();
  await expect(gold18kBuyInput).toHaveAttribute("readonly", "");
  await expect(gold14kBuyInput).toHaveAttribute("readonly", "");
  await gold24kBuyInput.fill("800000");
  await expect(gold18kBuyInput).toHaveValue("600000");
  await expect(gold14kBuyInput).toHaveValue("468000");
  await expect(editor.getByTestId("admin-price-cell-gold_18k_buy")).toContainText("순금 팔 때 입력값");
  await expect(editor.getByText("최근 시세 조정 이력")).toBeVisible();

  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("admin products mirrors the public catalog in a compact list-and-editor surface", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.context().clearCookies();
  await page.goto("/admin/products", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fproducts/);

  if (!adminPassword) return;

  await page.getByLabel("관리자 비밀번호").fill(adminPassword);
  await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
  await expect(page).toHaveURL(/\/admin\/products/);

  await expect(page.getByRole("heading", { name: "상품 관리" })).toBeVisible();
  const productTable = page.getByTestId("admin-product-table");
  const desktopProductGrid = productTable.getByTestId("admin-product-desktop-grid");
  await expect(productTable).toBeVisible();
  await expect(desktopProductGrid.getByText("공개상태")).toBeVisible();
  await expect(desktopProductGrid.getByText("카테고리")).toBeVisible();
  await expect(desktopProductGrid.getByText("가격 기준")).toBeVisible();
  await expect(desktopProductGrid.getByText("중량", { exact: true })).toBeVisible();
  await expect(desktopProductGrid.getByText("이미지 상태")).toBeVisible();
  await expect(desktopProductGrid.getByText("교체").first()).toBeVisible();
  for (const [slug, name] of [
    ["investment-gold-bar-consulting", "KCG 골드바 1돈"],
    ["kcg-gold-bar-2don", "KCG 골드바 2돈"],
    ["kcg-gold-bar-3don", "KCG 골드바 3돈"],
    ["kcg-gold-bar-5don", "KCG 골드바 5돈"],
    ["kcg-gold-bar-37-5g", "KCG 골드바 10돈"],
    ["old-gold-jewelry-buying", "고금 주얼리 매입"],
    ["bulk-gold-bar-consulting", "대량 골드바 상담"],
  ]) {
    await expect(desktopProductGrid.getByTestId(`admin-product-row-${slug}`)).toContainText(name);
  }
  for (const hiddenSlug of ["kcg-gold-bar-1g", "pure-gold-card-1g", "14k-jewelry-buying", "pure-gold-commemorative-medal"]) {
    await expect(productTable.getByTestId(`admin-product-row-${hiddenSlug}`)).toHaveCount(0);
  }
  await expect(desktopProductGrid.getByText("실물 기준").first()).toBeVisible();
  await expect(desktopProductGrid.getByText("공개 상품 화면과 동일한 KCG 기본 이미지").first()).toBeVisible();
  await expect(desktopProductGrid.getByTestId("admin-product-image-replace-button").first()).toContainText("사진 교체");
  await expect(page.getByText("이 목록은 고객 화면의 상품/매입 목록과 같은 기준입니다.")).toBeVisible();
  await expect(page.getByText("공개 `/products`와 같은 1·2·3·5·10돈 골드바")).toBeVisible();
  await expect(page.getByText("이미지 확인 필터")).toBeVisible();
  await expect(page.getByRole("link", { name: /실사진 확인/ })).toHaveAttribute(
    "href",
    /image=needs-real-photo/,
  );
  await page.getByRole("link", { name: /실사진 확인/ }).click();
  await expect(page).toHaveURL(/image=needs-real-photo/);
  await expect(page.getByText("이미지 필터: 실사진 확인")).toBeVisible();
  const filteredProductTable = page.getByTestId("admin-product-table");
  const filteredDesktopGrid = filteredProductTable.getByTestId("admin-product-desktop-grid");
  await expect(filteredDesktopGrid.getByTestId("admin-product-row-old-gold-jewelry-buying")).toContainText("고금 주얼리 매입");
  await expect(filteredDesktopGrid.getByTestId("admin-product-row-bulk-gold-bar-consulting")).toContainText("대량 골드바 상담");
  await expect(filteredDesktopGrid.getByText("상담 이미지").first()).toBeVisible();
  await expect(filteredDesktopGrid.getByText("KCG 골드바 37.5g")).not.toBeVisible();
  await page.getByRole("link", { name: /전체/ }).click();
  await expect(page).toHaveURL(/\/admin\/products(?:\?|$)/);
  const oneDonRow = desktopProductGrid.getByTestId("admin-product-row-investment-gold-bar-consulting");
  await expect(oneDonRow).toContainText("KCG 골드바 1돈");
  await expect(oneDonRow).toContainText("실물 기준");
  await expect(page.getByRole("button", { name: "사진 교체" }).first()).toBeVisible();
  await expect(page.getByTestId("admin-product-editor")).toBeVisible();
  await expect(page.getByTestId("admin-product-image-workflow")).toContainText("상품 사진 바로 교체");
  await expect(page.getByTestId("admin-product-image-workflow")).toContainText("파일 선택 후 한 번에 반영");
  await expect(page.getByRole("button", { name: "이 사진으로 바로 교체" })).toBeVisible();
  await expect(page.getByText("업로드 이미지 선택")).toBeHidden();
  await expect(page.getByText("슬러그")).toBeHidden();
  await expect(page.getByText("고급 설정 열기")).toBeVisible();
  await page.getByText("고급 설정 열기").click();
  await expect(page.getByText("업로드 이미지 선택")).toBeVisible();
  await page.getByText("3. 상품명·가격·노출 정보도 같이 수정하기").click();
  await expect(page.getByText("정렬").last()).toBeVisible();
  await expect(page.getByRole("button", { name: "고급 설정 저장" })).toBeVisible();

  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("mobile admin products keeps image follow-up status in the visible row summary", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.context().clearCookies();
  await page.goto("/admin/products", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fproducts/);

  if (!adminPassword) return;

  await page.getByLabel("관리자 비밀번호").fill(adminPassword);
  await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
  await expect(page).toHaveURL(/\/admin\/products/);

  await expect(page.getByTestId("admin-product-image-filter")).toBeVisible();
  await expect(page.getByTestId("admin-product-mobile-row-kcg-gold-bar-1g")).toHaveCount(0);
  await expect(page.getByTestId("admin-product-mobile-row-14k-jewelry-buying")).toHaveCount(0);
  const oneDonMobileRow = page.getByTestId("admin-product-mobile-row-investment-gold-bar-consulting");
  await expect(oneDonMobileRow).toContainText("순금 내가 살 때");
  const oneDonMobileNote = page.getByTestId("admin-product-mobile-image-note-investment-gold-bar-consulting");
  await expect(oneDonMobileNote).toBeVisible();
  await expect(oneDonMobileNote).toContainText("실물 기준");
  await expect(oneDonMobileNote).toContainText("공개 상품 화면과 동일한 KCG 기본 이미지");
  const mobileNoteBox = await oneDonMobileNote.boundingBox();
  const viewportWidth = page.viewportSize()?.width ?? 390;
  expect(mobileNoteBox?.x ?? 9999).toBeLessThan(120);
  expect((mobileNoteBox?.x ?? 0) + (mobileNoteBox?.width ?? 9999)).toBeLessThanOrEqual(
    viewportWidth - 16,
  );
  await page.getByTestId("admin-product-mobile-row-investment-gold-bar-consulting").click();
  await expect(page.getByTestId("admin-product-editor")).toBeInViewport({ ratio: 0.2 });
  await expect(page.getByTestId("admin-product-editor")).toContainText("KCG 골드바 1돈");

  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("admin media works as an operator-friendly image replacement center", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.context().clearCookies();
  await page.goto("/admin/media", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fmedia/);

  if (!adminPassword) return;

  await page.getByLabel("관리자 비밀번호").fill(adminPassword);
  await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
  await expect(page).toHaveURL(/\/admin\/media/);

  await expect(page.getByRole("heading", { name: "이미지 교체 센터" })).toBeVisible();
  await expect(page.getByTestId("admin-media-operator-cards")).toBeVisible();
  for (const label of ["홈 배너 이미지", "상품 이미지", "상품/매입 상단 이미지", "서비스 이미지", "매장안내 이미지", "회사소개 이미지", "공지 썸네일"]) {
    await expect(page.getByText(label).first()).toBeVisible();
  }
  await expect(page.getByTestId("admin-media-upload-form")).toBeVisible();
  await expect(page.getByTestId("admin-media-slot-manager")).toBeVisible();
  await expect(page.getByTestId("admin-media-approved-list")).toBeVisible();
  await expect(page.getByTestId("admin-media-review-list")).toBeVisible();
  await expect(page.getByRole("button", { name: "이 이미지로 바로 반영" })).toBeVisible();
  await expect(page.getByText("바꿀 위치를 고르고 파일 하나만 올리면 그 위치에 바로 반영됩니다.")).toBeVisible();
  await expect(page.getByText("이미지 이름")).toBeHidden();
  await expect(page.getByText("대체 텍스트")).toBeHidden();
  await expect(page.getByText("고급 연결 열기")).toBeVisible();
  await expect(page.getByText("방금 올린 이미지는 이 영역에 바로 반영됩니다.")).toBeVisible();
  await expect(page.getByText("현재 배너 슬라이드")).toBeVisible();
  await expect(page.getByText("최소 3장 유지").first()).toBeVisible();
  await expect(page.locator('[data-admin-save-guard="true"]').first()).toBeVisible();
  await expect(page.getByText("asset id 기준명")).toHaveCount(0);
  await expect(page.getByText("source type")).toHaveCount(0);
  await expect(page.getByText("approval_status")).toHaveCount(0);
  await expect(page.getByText("allowed_usage")).toHaveCount(0);
  await expect(page.getByText("sku_match")).toHaveCount(0);
  await expect(page.getByText("checksum")).toHaveCount(0);
  await expect(page.getByText("raw public URL")).toHaveCount(0);
  await expect(page.getByText("내부 분류 코드")).toBeHidden();
  await page.getByTestId("admin-media-advanced-details").getByText("고급 정보 보기").click();
  await expect(page.getByText("내부 분류 코드")).toBeVisible();

  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("admin save guard, media boundary, and session guards stay wired", () => {
  const adminProductsSource = readFileSync(
    path.join(repoRoot, "src/app/admin/products/admin-products-workspace.tsx"),
    "utf8",
  );
  const productActionsSource = readFileSync(path.join(repoRoot, "src/actions/product-actions.ts"), "utf8");
  const mediaActionsSource = readFileSync(path.join(repoRoot, "src/actions/media-actions.ts"), "utf8");
  const uploadClientSource = readFileSync(path.join(repoRoot, "src/lib/site-asset-upload-client.ts"), "utf8");
  const formGuardSource = readFileSync(path.join(repoRoot, "src/components/admin/admin-form-guard.tsx"), "utf8");
  const sessionSource = readFileSync(path.join(repoRoot, "src/lib/auth/session.ts"), "utf8");
  const loginActionSource = readFileSync(path.join(repoRoot, "src/actions/auth-actions.ts"), "utf8");
  const auditSource = readFileSync(
    path.join(repoRoot, "scripts/audit-site-fidelity.mjs"),
    "utf8",
  );

  const rawGuardIndex = adminProductsSource.indexOf("if (isRawKakaoTalkImagePath(imageUrl))");
  expect(rawGuardIndex).toBeGreaterThanOrEqual(0);
  expect(adminProductsSource).toContain('label: "원본 KakaoTalk"');
  expect(adminProductsSource).toContain("admin-product-editor-panel");
  expect(adminProductsSource).toContain("scrollIntoView");
  expect(productActionsSource).toContain("isApprovedOperationalProductImagePath");
  expect(productActionsSource).toContain("isGeneratedCandidateAssetPath");
  expect(productActionsSource).toContain("invalid-image");
  expect(mediaActionsSource).toContain("requireAdminActionSession");
  expect(mediaActionsSource).toContain("siteImageUploadAllowedMimeTypes");
  expect(mediaActionsSource).toContain("siteImageUploadMaxBytes");
  expect(mediaActionsSource).toContain('asset.approvalStatus !== "approved"');
  expect(mediaActionsSource).toContain("ensureSiteAssetsBucket");
  expect(mediaActionsSource).toContain("createBucket");
  expect(mediaActionsSource).toContain("createSignedUploadUrl");
  expect(mediaActionsSource).toContain("createSiteAssetSignedUploadAction");
  expect(mediaActionsSource).toContain("finalizeSiteAssetSignedUploadAction");
  expect(mediaActionsSource).toContain("applyUploadedProductImage");
  expect(mediaActionsSource).toContain("connectToSlot");
  expect(mediaActionsSource).toContain("image-saved");
  expect(mediaActionsSource).toContain("image-applied");
  expect(mediaActionsSource).toContain("media-schema-error");
  expect(uploadClientSource).toContain("applyToProduct");
  expect(uploadClientSource).toContain("connectToSlot");
  expect(uploadClientSource).toContain("productKey");
  expect(uploadClientSource).toContain("crypto.subtle.digest");
  expect(uploadClientSource).toContain("fetch(signedUrl");
  expect(uploadClientSource).toContain('method: "PUT"');
  expect(formGuardSource).toContain("beforeunload");
  expect(formGuardSource).toContain("data-admin-save-guard");
  expect(formGuardSource).toContain("locationKey");
  expect(formGuardSource).toContain("aria-live");
  expect(sessionSource).toContain("missing-required");
  expect(sessionSource).toContain('process.env.VERCEL_ENV === "preview"');
  expect(loginActionSource).toContain("sanitizeAdminNextPath");
  expect(auditSource).toContain("function expectNoRawKakaoTalkFiles");
  expect(auditSource).toContain('expectNoRawKakaoTalkFiles(["public"])');

  const rawPublicProductPaths = [
    "public/products/KakaoTalk_20260508_091553653.png",
    "public/products/KakaoTalk_20260508_091553653_01.png",
    "public/products/KakaoTalk_20260508_091553653_02.png",
    "public/products/KakaoTalk_20260508_091553653_03.png",
    "public/products/KakaoTalk_20260508_091603752.jpg",
    "public/products/KakaoTalk_20260508_091613735.jpg",
    "public/products/KakaoTalk_20260508_110154617.jpg",
    "public/products/KakaoTalk_20260508_110154617_01.jpg",
    "public/products/KakaoTalk_20260508_110154617_02.jpg",
    "public/products/KakaoTalk_20260508_110154617_03.jpg",
    "public/products/KakaoTalk_20260508_110154617_04.jpg",
    "public/products/KakaoTalk_20260508_110154617_05.jpg",
    "public/products/KakaoTalk_20260508_110154617_06.jpg",
  ];

  for (const rawPath of rawPublicProductPaths) {
    expect(auditSource).toContain(`expectMissing("${rawPath}")`);
  }
});
