import { expect, test, type Locator, type Page } from "@playwright/test";

const campaignAlts = [
  "한국센터금거래소 골드바와 실버바 상담 키비주얼",
  "한국센터금거래소 금괴 확인 상담 장면",
  "한국센터금거래소 거래 준비 상담 데스크",
  "골드바와 실버바 키비주얼 배너",
];
const explicitAdminPassword = process.env.KCG_TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
const auditUrl = process.env.SITE_AUDIT_URL;
const isExternalAuditUrl = auditUrl ? !/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?/i.test(auditUrl) : false;
const adminPassword = explicitAdminPassword || (isExternalAuditUrl ? undefined : "0000");

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
  await expect(dashboard.getByText("국내 환산").first()).toBeVisible();
  await expect(dashboard.getByText("매매기준가").first()).toBeVisible();
  await expect(dashboard.getByTestId("market-source-line")).toContainText("출처:");
  await expect(dashboard.getByTestId("market-source-line")).toContainText("USD/KRW");
  await expect(dashboard).not.toContainText("실시간 국제시세와 국내 환산 참고값");
  await expect(dashboard).not.toContainText("자동 환산표");
  await expect(dashboard).not.toContainText("차트 확장성");
  await expect(dashboard).not.toContainText("무료 모드에서는 현재가 중심");
}

async function expectTradingViewWidgetRendered(page: Page, widget: Locator) {
  await expect(widget).toBeVisible();
  await expect(widget.locator("iframe")).toHaveCount(1, { timeout: 10000 });
  const widgetHeight = await widget.evaluate((element) => Math.round(element.getBoundingClientRect().height));
  expect(widgetHeight).toBeGreaterThanOrEqual(390);

  await expect
    .poll(
      async () => {
        const frame = page.frames().find((candidate) => candidate.url().includes("tradingview-widget.com/embed-widget"));
        if (!frame) return false;

        const bodyText = await frame.locator("body").innerText({ timeout: 1_000 }).catch(() => "");
        const canvasCount = await frame.locator("canvas").count().catch(() => 0);
        return canvasCount > 0 && bodyText.includes("Gold") && bodyText.includes("Silver");
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
  await expect(page.getByText("시세는 고시 시각 기준이며 실제 거래 금액")).toBeVisible();
  await page.getByLabel("시세표 닫기").click();
  await expect(page.getByTestId("home-price-lineup-restore")).toBeVisible();
  await page.getByTestId("home-price-lineup-restore").click();
  await expect(page.getByRole("heading", { name: "한국센터금거래소 시세표" })).toBeVisible();
  await expect(page.getByTestId("market-source-line").first()).toBeVisible();
  await expect(page.getByText("국제 금속 차트 열기").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "국내 뉴스" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "국제 뉴스" })).toBeVisible();

  const mobileContactBar = page.locator("div.fixed.inset-x-0.bottom-0");
  await expect(mobileContactBar.getByRole("link", { name: "전화", exact: true })).toBeVisible();
  await expect(mobileContactBar.getByRole("link", { name: "시세", exact: true })).toBeVisible();
  await expect(mobileContactBar.getByRole("link", { name: "위치", exact: true })).toBeVisible();

  await expectCampaignImagesLoaded(page);
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
  await expect(header).not.toContainText("운영 공지");
  await expect(page.getByRole("heading", { name: "한국센터금거래소 시세표" })).toBeVisible();
  const campaignVisual = page.getByTestId("home-campaign-visual");
  await expect(campaignVisual.getByRole("heading")).toHaveCount(0);
  await expect(campaignVisual).not.toContainText("방문 상담");
  await expect(page.getByTestId("tradingview-market-widget")).toHaveCount(0);
  await page.getByText("국제 금속 차트 열기").first().click();
  await expectTradingViewWidgetRendered(page, page.getByTestId("tradingview-market-widget"));

  await expectCampaignImagesLoaded(page);
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

  await page.getByLabel("시세표 닫기").click();
  await expect(page.getByTestId("home-price-lineup-panel")).toBeHidden();
  await expect(page.getByTestId("home-price-lineup-restore")).toBeVisible();
  await page.getByTestId("home-price-lineup-restore").click();
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
  await expect(page.getByAltText("장갑을 착용한 금거래소 상담 데스크")).toBeVisible();
  await expect(page.getByText("취급 품목", { exact: true })).toBeVisible();
  await expect(page.getByText("당일 기준", { exact: true })).toBeVisible();
  await expect(page.getByText("실물 확인", { exact: true })).toBeVisible();
  await expect(page.getByText("거래 기준")).toBeVisible();
  await expect(page.getByText("매입 가능 품목")).toBeVisible();
  await expect(page.getByText("판매·수급 품목")).toBeVisible();
  await expect(page.getByText("고금매입은 시세표의 어느 금액을 보면 되나요?")).toBeVisible();
  await expect(page.getByText("전화로 금액을 확정받을 수 있나요?")).toBeVisible();
  await expect(page.getByRole("link", { name: "상품/매입 보기" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("mobile products route exposes a consultation catalog without checkout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.goto("/products", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "상품/매입" })).toBeVisible();
  await expect(page.getByRole("button", { name: "전체" })).toBeVisible();
  await expect(page.getByRole("button", { name: "골드바" })).toBeVisible();
  await expect(page.getByRole("button", { name: "순금제품" })).toBeVisible();
  await expect(page.getByTestId("product-tab-jewelry")).toBeVisible();
  await expect(page.getByTestId("product-count")).toContainText(/상품 \d+개/);
  const productCountBox = await page.getByTestId("product-count").boundingBox();
  expect(productCountBox?.y ?? 9999).toBeLessThan(900);
  await expect(page.getByText("추천순")).toBeVisible();
  await expect(page.getByText("낮은가격순")).toBeVisible();
  await expect(page.getByText("높은가격순")).toBeVisible();
  await expect(page.getByText("등록일순")).toBeVisible();
  const pageSizeSelect = page.getByLabel("목록 개수");
  await expect(pageSizeSelect).toBeVisible();
  await expect(pageSizeSelect).toHaveValue("20");
  await expect(page.getByText("KCG 골드바 3.75g")).toBeVisible();
  await expect(page.getByText("현재 고시가 기준 참고가").first()).toBeVisible();
  await expect(page.locator("main")).not.toContainText("장바구니");
  const productImageSources = await page.locator("main img[alt$='이미지']").evaluateAll((images) =>
    images.map((image) => (image instanceof HTMLImageElement ? image.currentSrc || image.src : "")),
  );
  expect(productImageSources.some((src) => src.includes("kcg-product-gold-silver-catalog-20260503"))).toBe(true);
  expect(productImageSources.some((src) => src.includes("kcg-product-jewelry-buying-20260503"))).toBe(true);
  expect(productImageSources.some((src) => src.includes("kcg-product-b2b-consulting-20260503"))).toBe(true);
  expect(productImageSources.some((src) => src.includes("kcg-home-product-keyvisual-20260503"))).toBe(true);
  expect(new Set(productImageSources).size).toBeGreaterThanOrEqual(6);
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
    "silver-bar",
    "pure-gold",
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
  await expect(page.getByTestId("product-count")).toContainText("4개");
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
  await expect(page.getByAltText("한국센터금거래소 회사소개 상담 데스크 이미지")).toBeVisible();
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

  await expect(page.getByText("고시가 / 3.75g 기준").first()).toBeVisible();
  const mainTextBeforeGuide = mainText.indexOf("한국센터금거래소 시세표");
  const guideIndex = mainText.indexOf("시세 이용 기준");
  expect(mainTextBeforeGuide).toBeGreaterThanOrEqual(0);
  expect(guideIndex).toBeGreaterThan(mainTextBeforeGuide);
  await expect(page.getByRole("heading", { name: "품목별로 볼 기준만 확인합니다." })).toBeVisible();
  await expect(page.getByText("고금·주얼리").first()).toBeVisible();
  await expect(page.getByText("법인·대량")).toBeVisible();
  await expect(page.getByText("내가 팔 때").first()).toBeVisible();
  await expect(page.getByText("신분증, 보증서·영수증, 제품 상태")).toBeVisible();
  expect(mainText.split("USD/KRW").length - 1).toBeGreaterThanOrEqual(1);
  expect(mainText.split("업데이트").length - 1).toBeLessThanOrEqual(1);
  expect(mainText.split("3.75g 자동 환산").length - 1).toBe(0);
  await expect(page.locator("main")).not.toContainText("단위: 3.75g");
  const postedDetailSection = page.locator("section", { hasText: "품목별 회사 고시 시세 상세" }).first();
  await expect(postedDetailSection.getByText(/기준 고시 (시각|예정)/)).toBeVisible();
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

test("mobile fixed contact bar does not cover key decision content", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const targets = [
    { path: "/", text: "상품/매입 카테고리" },
    { path: "/prices", text: "품목별 회사 고시 시세 상세" },
    { path: "/products", text: "KCG 골드바 3.75g" },
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

test("critical routes respond with expected content", async ({ page }) => {
  const routes = [
    { path: "/", text: "한국센터금거래소 시세표" },
    { path: "/prices", text: "품목별로 볼 기준만 확인합니다." },
    { path: "/products", text: "상품/매입" },
    { path: "/products/investment-gold-bar-consulting", text: "KCG 골드바 3.75g" },
    { path: "/announcements", text: "시세 운영 및 거래 준비 공지" },
    { path: "/services", text: "고금·주얼리" },
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
  await expect(page.getByRole("heading", { name: "지금 미리 가능한 준비" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "공개 직전 별도 승인 필요" })).toBeVisible();
  await expect(page.getByText("Production 배포 승인")).toBeVisible();
  await expect(page.getByText("robots/noindex 해제와 검색 색인 승인")).toBeVisible();

  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("admin prices exposes automatic price operation and compact manual editor", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/admin/prices", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fprices/);

  if (!adminPassword) return;

  await page.getByLabel("관리자 비밀번호").fill(adminPassword);
  await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
  await expect(page).toHaveURL(/\/admin\/prices/);

  await expect(page.getByRole("heading", { name: "오늘 시세 관리" })).toBeVisible();
  await expect(page.getByTestId("admin-price-mode-switch")).toBeVisible();
  const modeToggle = page.getByTestId("admin-price-mode-toggle");
  await expect(modeToggle).toBeVisible();
  await expect(modeToggle).toContainText("자동시세 OFF");
  await expect(page.getByText("대표가 직접 넣는")).toHaveCount(0);
  await expect(page.locator(".admin-light")).toBeVisible();
  await expect(page.getByText("현재 공개 시세")).toBeVisible();
  await expect(page.getByText("다음 확인 예정")).toBeVisible();

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
  await expect(autoPanel.getByText("자동 계산 기준 자세히 보기")).toBeVisible();
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
  await expect(editor.getByRole("columnheader", { name: "품목" })).toBeVisible();
  await expect(editor.getByRole("columnheader", { name: "현재 공개가" })).toBeVisible();
  await expect(editor.getByRole("columnheader", { name: "새 입력값" })).toBeVisible();
  await expect(editor.getByRole("columnheader", { name: "차액" })).toBeVisible();
  await expect(editor.getByRole("columnheader", { name: "노출" })).toBeVisible();
  await expect(editor.getByRole("columnheader", { name: "비고" })).toBeVisible();

  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("admin products uses a compact list-and-editor management surface", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/admin/products", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fproducts/);

  if (!adminPassword) return;

  await page.getByLabel("관리자 비밀번호").fill(adminPassword);
  await page.getByRole("button", { name: "관리자 페이지로 이동" }).click();
  await expect(page).toHaveURL(/\/admin\/products/);

  await expect(page.getByRole("heading", { name: "상품 관리" })).toBeVisible();
  const productTable = page.getByTestId("admin-product-table");
  await expect(productTable).toBeVisible();
  await expect(productTable.getByText("공개상태")).toBeVisible();
  await expect(productTable.getByText("카테고리")).toBeVisible();
  await expect(productTable.getByText("가격 기준")).toBeVisible();
  await expect(productTable.getByText("중량")).toBeVisible();
  await expect(productTable.getByText("이미지")).toBeVisible();
  await expect(productTable.getByText("정렬")).toBeVisible();
  await expect(page.getByText("편집 열기").first()).toBeVisible();

  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});
