import { expect, test, type Locator, type Page } from "@playwright/test";

const campaignAlts = [
  "한국센터금거래소 골드바 브랜드 캠페인 이미지",
  "한국센터금거래소 금·은 상담 데스크 이미지",
  "골드바와 실버바 키비주얼 배너",
  "골드바와 순금 거래 상담 배너",
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

  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("services route preserves high-risk business wording", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.goto("/services", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "취급 품목, 당일 기준, 실물 확인 순서로 봅니다." })).toBeVisible();
  await expect(page.getByAltText("골드바와 실버바 상담 카운터")).toBeVisible();
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
  await expect(page.getByRole("button", { name: "고금·주얼리 매입" })).toBeVisible();
  await expect(page.getByTestId("product-count")).toContainText(/상품 \d+개/);
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
  expect(productImageSources.some((src) => src.includes("kcg-gold-bar-catalog-20260427"))).toBe(true);
  expect(productImageSources.some((src) => src.includes("kcg-old-gold-jewelry-20260427-v2"))).toBe(true);
  expect(productImageSources.some((src) => src.includes("kcg-silver-gift-20260427-v2"))).toBe(true);
  expect(productImageSources.some((src) => src.includes("kcg-b2b-bulk-consulting-20260427-v2"))).toBe(true);
  expect(new Set(productImageSources).size).toBeGreaterThanOrEqual(4);
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
  await expect(postedDetailSection.getByText("기준 고시 시각")).toBeVisible();
  await expect(postedDetailSection).not.toContainText("기준 시각:");
  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("prices market reference stays compact in the two-column desktop layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/prices", { waitUntil: "domcontentloaded" });

  await expectMarketDashboardCompact(page);
  await expect(page.getByTestId("tradingview-market-widget")).toBeVisible();
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
    { path: "/about", text: "성창빌딩 매장" },
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
