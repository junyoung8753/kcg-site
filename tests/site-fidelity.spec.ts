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

test("mobile home keeps source-site conversion surface", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.goto("/");

  const header = page.locator("header");
  await expect(header.getByText("(주)한국센터")).toBeVisible();
  await expect(header.getByText("금거래소")).toBeVisible();
  await expect(header.getByRole("link", { name: "전화", exact: true })).toBeVisible();
  await expect(header.getByText("메뉴", { exact: true })).toBeVisible();

  await expect(page.getByRole("heading", { name: "한국센터금거래소 시세표" })).toBeVisible();
  await expect(page.getByText("KOREA CENTER GOLD EXCHANGE")).toBeVisible();
  await expect(page.getByText("내가 살 때 (VAT포함)")).toBeVisible();
  await expect(page.getByText("내가 팔 때 (현장기준)")).toBeVisible();
  await expect(page.getByText("시세는 고시 시각 기준이며 실제 거래 금액")).toBeVisible();

  const mobileContactBar = page.locator("div.fixed.inset-x-0.bottom-0");
  await expect(mobileContactBar.getByRole("link", { name: "전화상담", exact: true })).toBeVisible();
  await expect(mobileContactBar.getByRole("link", { name: "시세", exact: true })).toBeVisible();
  await expect(mobileContactBar.getByRole("link", { name: "위치", exact: true })).toBeVisible();

  await expectCampaignImagesLoaded(page);
  await expectNoHorizontalOverflow(page);
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
  await expect(page.getByRole("link", { name: "전체 시세 보기" })).toBeVisible();

  await expectCampaignImagesLoaded(page);
  await expectNoHorizontalOverflow(page);
});

test("services route preserves high-risk business wording", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.goto("/services");

  await expect(page.getByRole("heading", { name: "취급 품목과 상담 범위 안내" })).toBeVisible();
  await expect(page.getByText("고금·주얼리").first()).toBeVisible();
  await expect(page.getByText("고금·예물 정리 상담")).toBeVisible();
  await expect(page.getByText("18K·14K 매입 기준 문의")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("critical routes respond with expected content", async ({ page }) => {
  const routes = [
    { path: "/", text: "한국센터금거래소 시세표" },
    { path: "/prices", text: "품목별 회사 고시 시세 상세" },
    { path: "/announcements", text: "시세 운영 및 방문 안내 공지" },
    { path: "/services", text: "고금·주얼리" },
    { path: "/about", text: "전화 연결" },
    { path: "/admin/login", text: "관리자 로그인" },
    { path: "/api/health", text: '"ok":true' },
  ];

  for (const route of routes) {
    const response = await page.goto(route.path);
    expect(response?.status(), route.path).toBe(200);
    await expect(page.locator("body")).toContainText(route.text);
  }
});
