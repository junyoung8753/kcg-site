# KCG Data Source Compliance Notes

This file records how KCG should use external APIs, RSS-style feeds, scraped references, charts, calculators, and forms without turning reference data into an unlicensed or misleading product claim.

It is not legal advice. It is an operating checklist for product and engineering work. For paid contracts, redistribution rights, financial-data licensing, or production legal review, get the provider terms and a qualified legal/business decision before launch.

## Current External Data Map

| Use | Current source | Current status | KCG rule |
| --- | --- | --- | --- |
| International spot reference prices | Gold API | Free endpoint, no auth for current prices, no rate limits stated for real-time prices | Allowed as a free reference source while attribution and "reference only" copy remain visible. Do not describe it as KCG's transaction price. |
| Premium metals data candidate | Metals.Dev | Free plan exists but only 100 requests/month; paid plans include spot, bid/ask, LBMA, LME, MCX/IBJA, currency conversion, and higher quotas | Use only with a KCG-owned API key. Worth considering when we need production-grade bid/ask, authority prices, and time-series chart data. |
| News headlines | Google News RSS-style URLs | Useful but not a stable official commercial news API; Google Terms also restrict abusive automated access and IP/content misuse | Treat as a temporary link-only headline reference. Show article title, publisher/source, date, and outbound link only. Do not republish full article body, article images, or summaries copied from publishers. |
| News API candidate | GNews API | Free plan is for non-commercial/dev use; paid plans permit production/commercial usage by plan | Consider paid plan if news becomes a real production feature. Still preserve publisher source and links. |
| News API candidate | NewsAPI.org | Developer plan is development/testing only; paid subscription required outside development; terms prohibit republishing copyrighted material | Consider only paid plan for production. Do not scrape article bodies from returned URLs unless separately licensed or clearly permitted. |
| Competitor/reference sites | Other gold exchange sites | Reference-only competitive analysis | Use feature patterns only. Do not copy copywriting, images, price data, charts, article text, code, or brand assets. |

## Competitor API Observation Rule

The 2026-04-27 deep benchmark pass observed internal or embedded data calls on competitor sites, including 한국금거래소 `/api/*` and `/franchise/list/ajax` endpoints, TradingView widget/scanner calls, 삼성금거래소 `chart.gold-you.com` chart calls, Cafe24 product APIs, Channel.io, Google Maps, 한국공인금거래소 local ajax/chart libraries, and 한국표준금거래소 Cafe24/custom product or index-price endpoints.

These are research observations only. KCG must not call, scrape, proxy, cache, republish, or chart competitor internal endpoints, ecommerce APIs, price tables, chart responses, product images, or news bodies unless a separate public license or written permission explicitly allows the intended production use.

KCG may learn from the product patterns:

- Price-first hierarchy.
- Buy/sell distinction.
- Posted date and unit labels.
- Branch, map, and phone paths.
- Product/service category breadth.
- FAQ and visit-preparation structure.
- Source-attributed market context.

KCG must implement those patterns with KCG-owned data and licensed/public data sources only.

## Attribution Rules

Every externally sourced data block must show:

- Source name.
- Source link or documentation link.
- Last updated time when available.
- Whether the source is free, paid, fallback, or internal.
- A clear "reference only" note when the data is not the company posted transaction price.

For market data, use Korean labels such as:

- `출처: Gold API`
- `출처: Metals.Dev`
- `자동 참고 시세`
- `회사 고시 시세와 실제 거래 금액은 별도입니다.`

For news, use:

- Publisher/source name per item.
- Outbound article link.
- Date.
- A local note: `기사 제목·출처·날짜만 링크로 제공하며, 본문·이미지는 재게시하지 않습니다.`

## No-Scraping Rule

Do not add scraping of third-party sites unless all of the following are true:

- The source's terms allow the intended use.
- `robots.txt` and machine-readable restrictions do not block the access pattern.
- We only request at a low, cached rate.
- We do not bypass anti-bot, login, paywall, captcha, or technical access controls.
- We do not store or republish copyrighted article bodies, images, charts, or proprietary price tables.

If a source offers an official API, use the official API instead of scraping.

## Charts

Charts are useful for KCG only when they clarify the difference between:

- KCG company posted prices.
- Automatic international reference prices.
- Automatic KRW conversion reference values.

Recommended chart types:

- Company posted price history by item for KCG-owned prices.
- International spot reference trend with provider attribution.
- USD/KRW conversion trend if the provider license allows display.
- Gold/silver/platinum comparison chart with clear source and time range.

Do not show charts that imply live execution, investment advice, guaranteed returns, official KRX pricing, or company transaction prices unless the data is KCG-owned and verified.

For production chart data:

- Gold API is useful for simple current price references.
- Metals.Dev is the better candidate when bid/ask, authority prices, and timeseries are needed.
- A paid plan is likely required once public traffic or history charts exceed free quotas.

## Tools, Forms, And Calculators

Useful KCG features inspired by gold exchange sites and visitor needs:

- 금/은/백금 단위 변환: g, 돈, kg, T.oz.
- 예상 참고가 계산기: item type, purity, weight, and reference price, with a strong "현장 확인 후 최종 안내" disclaimer.
- 방문 상담 준비 form: phone, item type, estimated weight, quantity, visit date, photo upload only after explicit privacy/retention rules are approved.
- 매입 상담 checklist: 신분증, 보증서, 영수증, 제품 상태, 케이스, 수량.
- Chart time-range controls: 1개월, 5개월, 1년, 3년 when licensed data exists.
- Source switch/status panel: company posted price, automatic reference price, fallback mode.

Implementation constraints:

- Do not add online payment, cart, live trading, quote guarantee, admin write behavior, or personal-data collection without explicit approval.
- Do not add file/photo upload until privacy copy, retention behavior, storage, and admin access control are designed.
- For forms before backend approval, use phone-first CTA or local-only UI mockups without collecting data.

## Competitor Reference Rules

Competitor sites can inform feature selection, not content copying. Current observed patterns worth considering:

- 한국금거래소 exposes a price lineup, international spot prices, domestic/international chart ranges, news, products, branch finder, and 상담 phone paths.
- 삼성금거래소 exposes brand story, store guidance, Q&A/member/order paths, product detail pages, and an embedded chart service.
- GBK금거래소 shows an app-first pitch, simple service strengths, policy pages, and large campaign visual usage.
- 한국공인금거래소 exposes detailed price tables, branch finder, shop categories, boards, and chart-library usage.
- 한국표준금거래소 exposes ecommerce taxonomy, FAQ/customer center, product categories, and Cafe24 product option APIs.
- Local branch-style sites emphasize store introduction, services, directions, and direct phone contact.

KCG should selectively use:

- A clearer source-attributed reference market section.
- A KCG-owned company posted price table first.
- Consultation-oriented calculators and forms only when disclaimers and privacy rules are in place.
- Visit preparation and phone actions above dense data on mobile.
- A purpose-based price guide that tells visitors which price line to read before calling.
- A visible data-use rule that distinguishes company posted prices, automatic market references, and link-only external context.

## Acceptance Checks

Before shipping a new API/RSS/chart/form feature:

- `npm run audit:site` must check the source or compliance copy.
- Playwright should verify that source attribution is visible on rendered pages.
- The feature must degrade to fallback content without hiding source status.
- The UI must distinguish company posted prices from automatic reference data.
- Any paid API key must stay in environment variables and never be committed.
- Any provider terms that limit commercial use must be recorded in this file or a task-specific handoff.
