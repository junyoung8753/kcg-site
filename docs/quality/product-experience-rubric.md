# KCG Product Experience Rubric

This document is the product and design source of truth for judging whether the KCG site is moving in the right direction. It exists so future work does not rely on a long prompt, a memory of a previous chat, or a subjective "looks good" claim.

## Site Purpose

The KCG site is a trust-and-consultation site for a real gold exchange office in Jongno. The primary visitor intent is practical, not decorative:

- Check the company-posted gold, silver, platinum, 18K, and 14K prices.
- Understand the difference between "I buy" and "I sell" 기준.
- Confirm the posted time and the fact that final amounts are confirmed on site.
- Call before visiting, especially for large quantities, legal-entity holdings, inheritance cleanup, bars, or mixed jewelry.
- Find the address, operating hours, and visit preparation checklist quickly.

The site should feel like a serious price desk and consultation counter, not a generic ecommerce mall, a financial trading platform, or a broad marketing landing page.

## Product Thesis

회사 고시 시세가 주인공이다. The first screen should make the company price table, posted time, and buy/sell distinction immediately clear, then give a fast path to 전화/방문 상담.

Everything else supports that path:

- Campaign imagery establishes that this is a physical gold/silver consultation business.
- 자동 참고 시세는 보조 정보 for market context only.
- Service and trade guidance reduce uncertainty before a phone call or visit.
- Legal and safety copy prevents false confidence, KRX confusion, or invented claims.
- `/` is the single public home surface; old option or temporary comparison routes should not exist unless a new comparison workflow is explicitly requested.

## Audience And Use Cases

### Fast Price Checker

This visitor arrives to check today's displayed price. They need the price table, 기준 시각, buy/sell columns, and the phone number without scrolling through unrelated news first.

### Sell-Side Consultation Visitor

This visitor has old gold, jewelry, 돌반지, 18K, 14K, platinum, silver, or bars. They need to know that products are not all priced the same, that 순도 and 중량 matter, and that the site does not promise a final amount before 현장 확인.

### Bar And Bulk Inquiry Visitor

This visitor asks about 골드바, 실버바, corporate holdings, gifts, or bulk quantities. They need to see that quantity, weight, brand, and availability affect 상담 가능 여부.

### Location-First Visitor

This visitor already intends to visit. They need the phone number, address, operating hours, map links, parking/building note, and visit checklist.

## Design Direction

The design should be restrained, dense enough for price scanning, and visibly tied to a real exchange office.

- Use white, pale green-gray, charcoal, and KCG yellow/gold as the core palette.
- Use real brand and campaign assets instead of abstract decoration.
- The home first surface should include a large campaign image or image-led banner, but it must support the price desk and consultation path rather than becoming a generic app advertisement or ecommerce promotion.
- Prefer table, list, section, and divider layouts for operational information.
- Use cards only when they frame repeated records, route groups, or bounded tools.
- Keep rounded corners restrained. Avoid decorative blobs, generic SaaS card mosaics, and oversized marketing panels that push the price table down.
- Typography should help scanning: clear headings, compact labels, strong price numbers, and stable table widths.
- Mobile is a primary review surface. No horizontal overflow, cramped columns, hidden CTA labels, or text clipped by the fixed bottom bar.

## UX Priorities

1. Company posted price table: Must show the posted date/time, buy/sell distinction, important item names, and caution that final transaction amount is confirmed after on-site checks.
2. Consultation path: Phone and visit actions should be visible near the price table and repeated after high-intent sections.
3. Service clarity: Services should explain what KCG can consult on and what information the customer should prepare.
4. Safety and trust: 가격·거래·법적 사실은 검증 없이 만들지 않는다. Temporary legal placeholders are allowed only when visibly labeled as temporary and blocked by launch-readiness checks before public search exposure.
5. Market context hierarchy: Automatic market data, conversion estimates, and news must not override or visually compete with the company posted prices.
6. Single-site discipline: The public candidate is one site, one home, one set of production copy. Old option pages, temporary comparison hubs, and source-recovery scripts should stay removed unless junyoung explicitly requests a new experiment.
7. Source and licensing safety: External APIs, RSS-style feeds, charts, calculators, and competitor references must follow `docs/quality/data-source-compliance.md`; show source attribution and never republish unlicensed third-party article bodies, images, charts, or proprietary price tables.
8. Benchmark depth: Competitor reference work must study subpages, product/service structure, forms, wording, and data/API behavior before changing KCG. A home-screen-only visual match is not enough.

## Content Rules

Use Korean UI/copy by default.

Do:

- Say "회사 고시 시세", "자동 참고 시세", and "현장 확인 후 최종 안내" where the distinction matters.
- Keep buy/sell labels precise.
- Make phone and visit actions explicit.
- Explain that 순도, 중량, 부속, 보증서, 제품 상태, 수량, and brand can affect 상담.
- Keep KRX Gold Market content clearly separate from private physical consultation.

Do not:

- Invent official prices, discounts, certifications, reviews, partnerships, KRX affiliation, confirmed legal registrations, live execution, payment behavior, or investment outcomes.
- Let external APIs overwrite company posted prices.
- Describe automatic market data as the transaction price.
- Scrape or republish third-party news, images, charts, or price tables without checking terms and attribution.
- Add cart, online payment, trading, or admin write behavior without explicit approval.
- Remove noindex/search blocking before public launch approval.
- Recreate `/option-1`, `/option-2`, or comparison entry pages as a shortcut for design uncertainty.

## Route Expectations

### Home

The home route should work as the main consultation desk: price table first, campaign/brand presence in a large visual surface, reference market data below, then visit/service/notice guidance. A user should understand the business by scanning only the first screen and the section headings.

### Prices

The prices route should be the clearest route for detailed posted prices. On mobile, consultation actions should appear before the dense company price columns so a user can call or open visit guidance without parsing the whole table first.

It should also explain which price line to read by purpose, what to prepare before visiting, and how KCG separates company posted prices from automatic market references and external research sources.

### Services

The services route should combine item scope with sell-side purchase guidance. It must not only list products; it should explain what happens when the customer is selling gold/jewelry and what needs on-site confirmation.

### Products

The products route should be a consultation catalog, not a checkout mall. It may show approved product images, category, inquiry status, price display text, and preparation specs, but must avoid cart, instant payment, guaranteed inventory, or final price promises until explicit business approval exists.

### About

The about route should prioritize address, phone, operating hours, map links, visit preparation, and transaction flow.

### Admin

Admin routes are conservative until real authentication and production data rules are explicitly approved. Do not make admin behavior broader or weaker for convenience.

## Verification Rules

Before claiming a visual or route change is complete:

- Run `npm run lint`.
- Run `npm run typecheck`.
- Run `npm run audit:site`.
- Run `npm run build`.
- Run `npm run test:site`.
- Run `npm audit --audit-level=moderate`.
- For visual changes, run `npm run screenshot:site` and inspect at least one mobile screenshot and one desktop screenshot.

The preferred guardrail is executable: if a critical product expectation is missed once, add or update the narrowest audit or Playwright check that would have caught it.
