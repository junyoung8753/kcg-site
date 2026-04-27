import { expect, test, type Page } from "@playwright/test";

const campaignAlts = [
  "골드바와 순금 거래 상담 배너",
  "백금 실버바 골드바 상담 배너",
  "종로 방문 상담 안내 배너",
];

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

async function expectCampaignImagesLoaded(page: Page) {
  for (const alt of campaignAlts) {
    const image = page.getByAltText(alt);
    await expect(image).toHaveCount(1);
    await expect
      .poll(async () =>
        image.evaluate((node) => {
          if (!(node instanceof HTMLImageElement)) return false;
          return node.complete && node.naturalWidth > 0 && node.naturalHeight > 0;
        }),
      )
      .toBe(true);
  }
}

test("mobile home keeps the production conversion surface", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.goto("/");

  const header = page.locator("header");
  await expect(header.getByText("(주)한국센터")).toBeVisible();
  await expect(header.getByText("금거래소")).toBeVisible();
  await expect(header.getByRole("link", { name: "전화", exact: true })).toBeVisible();
  await expect(header.getByText("메뉴", { exact: true })).toBeVisible();

  await expect(page.getByText("KCG PRICE DESK")).toBeVisible();
  await expect(page.getByRole("heading", { name: "오늘 고시 시세와 방문 상담 기준을 한 화면에서 확인합니다." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "한국센터금거래소 시세표" })).toBeVisible();
  await expect(page.getByText("KOREA CENTER GOLD EXCHANGE")).toBeVisible();
  await expect(page.getByText("내가 살 때 (VAT포함)")).toBeVisible();
  await expect(page.getByText("내가 팔 때 (현장 기준)")).toBeVisible();
  await expect(page.getByText("시세는 고시 시각 기준이며 실제 거래 금액")).toBeVisible();
  await expect(page.getByText("출처 및 이용 안내")).toBeVisible();
  await expect(page.getByText("본문·이미지는 재게시하지 않습니다").first()).toBeVisible();

  const mobileContactBar = page.locator("div.fixed.inset-x-0.bottom-0");
  await expect(mobileContactBar.getByRole("link", { name: "전화 상담", exact: true })).toBeVisible();
  await expect(mobileContactBar.getByRole("link", { name: "시세", exact: true })).toBeVisible();
  await expect(mobileContactBar.getByRole("link", { name: "위치", exact: true })).toBeVisible();

  await expectCampaignImagesLoaded(page);
  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("desktop home keeps campaign slider and shortcut labels", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1800 });
  await page.goto("/");

  const header = page.locator("header");
  await expect(header.getByRole("link", { name: "시세조회", exact: true })).toBeVisible();
  await expect(header.getByRole("link", { name: "고금매입 상담", exact: true })).toBeVisible();
  await expect(header.getByRole("link", { name: "골드바·실버바", exact: true })).toBeVisible();
  await expect(header.getByRole("link", { name: "운영 공지", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "한국센터금거래소 시세표" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "오늘 고시 시세와 방문 상담 기준을 한 화면에서 확인합니다." })).toBeVisible();
  await expect(page.getByRole("link", { name: "오늘 시세 보기" })).toBeVisible();

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
  expect(Math.round(pricePanelBox!.y)).toBeGreaterThanOrEqual(Math.round(campaignBox!.y + campaignBox!.height) - 2);
  expect(Math.round(pricePanelBox!.width)).toBeGreaterThanOrEqual(viewportWidth - 2);

  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("services route preserves high-risk business wording", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.goto("/services");

  await expect(page.getByRole("heading", { name: "취급 품목과 상담 범위 안내" })).toBeVisible();
  await expect(page.getByText("고금·주얼리").first()).toBeVisible();
  await expect(page.getByText("고금·예물 정리 상담")).toBeVisible();
  await expect(page.getByText("18K·14K 매입 기준 문의")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "고객이 팔 때 기준을 먼저 확인하고 상담하실 수 있습니다." }),
  ).toBeVisible();
  await expect(page.getByText("백금·은 제품")).toBeVisible();
  await expect(page.getByText("순금, 18K, 14K, 백금, 은 제품은 같은 금액으로 일괄 처리하지 않습니다.")).toBeVisible();
  await expect(page.getByText("고금매입은 시세표의 어느 금액을 보면 되나요?")).toBeVisible();
  await expect(page.getByText("전화로 금액을 확정받을 수 있나요?")).toBeVisible();
  await expect(page.getByText("사전 문의 필요").first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("mobile products route exposes a consultation catalog without checkout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.goto("/products");

  await expect(page.getByRole("heading", { name: "골드바·실버바와 귀금속 상담 카탈로그" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "사진과 가격 문구를 등록해 운영할 상품 문의란" })).toBeVisible();
  await expect(page.getByText("투자용 골드바 상담")).toBeVisible();
  await expect(page.getByText("고시 시세 기준 문의")).toBeVisible();
  await expect(page.getByText("온라인 결제나 장바구니가 아닌 전화 상담형 카탈로그입니다.")).toBeVisible();
  await expect(page.locator("main")).not.toContainText("장바구니 담기");
  await expect(page.locator("main")).not.toContainText("바로 구매");
  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("mobile prices puts consultation actions before the company price columns", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.goto("/prices");

  const mainText = await page.locator("main").innerText();
  const callIndex = mainText.indexOf("전화 상담");
  const visitIndex = mainText.indexOf("방문 안내");
  const columnIndex = mainText.indexOf("내가 살 때 (VAT포함)");

  expect(callIndex).toBeGreaterThanOrEqual(0);
  expect(visitIndex).toBeGreaterThanOrEqual(0);
  expect(columnIndex).toBeGreaterThanOrEqual(0);
  expect(callIndex).toBeLessThan(columnIndex);
  expect(visitIndex).toBeLessThan(columnIndex);

  await expect(page.getByText("고시가 / 3.75g 기준").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "시세를 볼 때 먼저 확인할 기준" })).toBeVisible();
  await expect(page.getByText("고금·주얼리 매입 상담")).toBeVisible();
  await expect(page.getByText("법인·상속·대량 정리")).toBeVisible();
  await expect(page.getByText("회사 고시 시세").first()).toBeVisible();
  await expect(page.getByText("자동 국제 참고 시세")).toBeVisible();
  await expect(page.getByText("타사 내부 API·가격표·뉴스 본문은 고객 화면에 직접 사용하지 않습니다.")).toBeVisible();
  await expect(page.locator("main")).not.toContainText("단위: 3.75g");
  await expectNoHorizontalOverflow(page);
  await expectNoVisibleElementEscapesViewport(page);
});

test("critical routes respond with expected content", async ({ page }) => {
  const routes = [
    { path: "/", text: "한국센터금거래소 시세표" },
    { path: "/prices", text: "시세를 볼 때 먼저 확인할 기준" },
    { path: "/products", text: "골드바·실버바와 귀금속 상담 카탈로그" },
    { path: "/products/investment-gold-bar-consulting", text: "투자용 골드바 상담" },
    { path: "/announcements", text: "시세 운영 및 방문 안내 공지" },
    { path: "/services", text: "고금·주얼리" },
    { path: "/about", text: "사업자등록번호(임시)" },
    { path: "/admin/login", text: "관리자 로그인" },
    { path: "/api/health", text: "launchReadiness" },
    { path: "/robots.txt", text: "Disallow: /" },
  ];

  for (const route of routes) {
    const response = await page.goto(route.path);
    expect(response?.status(), route.path).toBe(200);
    await expect(page.locator("body")).toContainText(route.text);
  }

  for (const path of ["/option-1", "/option-2"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
  }
});
