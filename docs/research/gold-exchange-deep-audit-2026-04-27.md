# Korean Gold Exchange Deep Audit - 2026-04-27

This document is the deeper benchmark pass requested after the first-screen-only review proved too shallow. It records the site-wide patterns that should inform KCG without copying competitor content, assets, proprietary price tables, charts, article bodies, or internal APIs.

Raw local evidence:

- Crawl JSON: `output/research/competitor-deep-audit/competitor-deep-audit.json`
- Screenshots: `output/research/competitor-deep-audit/*.png`
- Method: Playwright page traversal, heading/link/form/table extraction, script and network URL capture, and representative screenshots.

## External Method Inputs

The KCG AI-site workflow should use context and verification, not just a longer prompt:

- OpenAI prompt guidance: put instructions before context, separate context clearly, and be specific about outcome, format, and style.
- Anthropic prompt engineering guidance: define success criteria and empirical tests before trying to optimize prompts.
- Anthropic evaluation guidance: task-specific automated checks are preferred when they can catch concrete failure modes.
- Vercel v0 guidance: good UI prompts name the product surface, context of use, and constraints/taste; complex apps should be built incrementally.

KCG application:

- Product surface: price desk, detailed prices route, visit guide, services, trust/safety notes.
- Context of use: Korean visitor checking today prices, deciding whether to call, and preparing a visit.
- Constraints/taste: company posted prices first, automatic references second, no invented legal/trading facts, restrained operational UI.
- Verification: route text checks, no-overflow checks, rendered screenshots, source/data compliance checks, and mandatory build/lint/type/test commands.

## Sites And Depth Covered

| Site | URL | Pages inspected | Useful benchmark area | KCG takeaway |
| --- | --- | ---: | --- | --- |
| 한국금거래소 | `https://www.koreagoldx.co.kr/` | 14 | Price-first home, domestic/international prices, branch pages, product categories, chart/news depth | Keep a strong price desk, branch/visit clarity, market context, and buy/sell distinction. Do not copy their charts, APIs, prices, news, product names, or imagery. |
| 삼성금거래소 | `https://ssgold.co.kr/` | 14 | Brand story, store page, product detail, Q&A, member/order structure, embedded chart | Good for brand trust and detailed product flow, but KCG should not become a Cafe24 ecommerce mall before real inventory/payment approval. |
| GBK금거래소 | `https://gbkmall.com/` | 3 | App-first pitch, simple advantages, legal/policy pages | Useful for simple service promise and large campaign visual energy, not for app promotion because KCG has no confirmed app. |
| 한국공인금거래소 | `https://kaggold.com/` | 14 | Price tables, item categories, branch finder, login/shop/news boards, ApexCharts/Vue stack | Reinforces the need for detailed price labels, branch/visit clarity, and chart restraint. |
| 한국표준금거래소 | `https://goldgold.co.kr/` | 14 | Ecommerce taxonomy, FAQ, customer center, product categories, Cafe24 option APIs | Useful for category breadth and FAQ/customer center, but KCG should stay consultation-first. |
| 한국금은거래소 | `https://www.kgse.org/shop` | 1 | Not useful in this pass because the visited shop URL returned a confirmation/error page | Do not infer product structure from this result. Revisit only with a better official URL. |

There is still no defensible public "top 10" ranking source to use as a product oracle. The practical benchmark set is the known visible Korean gold-exchange surface plus KRX official safety guidance.

## Site-Structure Patterns

Observed structures across the stronger sites:

- Home: price summary, campaign banner, product/category shortcuts, phone/contact, notices or news.
- Price route: today's price, date/time, buy/sell columns, 24K/18K/14K/platinum/silver, sometimes diamond, domestic/international split.
- Product routes: gold bars, silver bars, gift bars, jewelry, product detail pages, related items, ecommerce cart/order flows.
- Store/branch routes: head office, branch finder, map, phone, address, parking or visit guidance.
- Board routes: FAQ/Q&A, announcements, news/magazine, price information posts.
- Member/order routes on mall sites: login, join, order lookup, non-member order, agreement forms.
- Policy routes: terms, privacy, service policy.

KCG decision:

- Preserve a compact site map: `/`, `/prices`, `/products`, `/services`, `/about`, `/announcements`, `/admin`.
- Do not add login, cart, order, payment, app-download, or member flows until business and legal requirements exist.
- Strengthen `/prices` with a consultation and data-use guide because that route is where a serious visitor decides what number matters.

## Price And Wording Patterns

Useful repeated labels and concepts:

- `내가 살 때`, `내가 팔 때`
- `VAT 포함` on sell-to-customer lines where applicable.
- `현장 기준` or equivalent caution for customer-sell lines.
- `고시 시각`, date, and unit near prices.
- `3.75g`, `USD/T.oz`, and KRW conversion context.
- Product checks: purity, weight, certificate, packaging, brand, condition, quantity.

KCG applied wording direction:

- Keep `고시가 / 3.75g 기준` as a combined price-table header when every visible company price uses the same unit.
- Keep `회사 고시 시세` separate from `자동 참고 시세`.
- Keep final-amount copy close to price tables: final transaction amount is confirmed after on-site checks.
- Add purpose-based consultation guidance so users know which price line to look at before calling.

## Forms And Interaction Patterns

Observed forms:

- Product search, board search, product option selections.
- Login, join, non-member order lookup.
- Branch finder/search.
- Q&A or board forms.
- Hidden product/order fields from ecommerce platforms.

KCG decision:

- Use phone-first CTAs and static preparation guides for now.
- Do not add personal-data forms, photo upload, account signup, order lookup, or quote submission until privacy, retention, storage, admin access, and customer consent copy are approved.
- If a future form is needed, start with a narrow consultation request form and record data-handling rules first.

## API, Chart, And Data Findings

Observed competitor/internal or third-party data calls included:

- 한국금거래소 internal endpoints such as `/api/main`, `/api/main/chart`, `/api/price/chart/list`, `/api/price/diamond/list`, `/franchise/list/ajax`, and `/api/price/market/period/list`.
- 한국금거래소 TradingView widget calls, including TradingView widget bundles and scanner endpoints.
- 삼성금거래소 chart service calls such as `https://chart.gold-you.com/chart.php` and `https://chart.gold-you.com/curl.php`, plus Cafe24 API/product calls and Channel.io/Google Maps integrations.
- 한국공인금거래소 chart libraries such as ApexCharts/Vue and a local ajax endpoint.
- 한국표준금거래소 Cafe24/custom product and index price endpoints such as `irena111.cafe24.com/api/custom/product.php` and `irena111.cafe24.com/api/goldgold/mapper.indexPrice.php`.

KCG rule:

- Treat competitor endpoints as private/internal unless a public license says otherwise.
- Do not call or scrape competitor APIs, chart feeds, price tables, article bodies, product images, or hidden ecommerce endpoints.
- For KCG market references, continue with source-attributed Gold API for free current references.
- Consider Metals.Dev only with a KCG-owned API key when bid/ask, LBMA/LME authority prices, timeseries, or production quota are needed.
- Any chart must show source, time, data role, and the difference between company posted prices and automatic reference values.

## KRX Safety Baseline

KRX official guidance says KRX Gold Market is a Korea Exchange-operated spot gold market accessed through securities-company accounts. KRX also warns that transactions outside securities-company direct trading, such as homepage pre-deposit transactions, reading-room trades, or OTC physical trades, are unrelated to KRX Gold Market.

KCG decision:

- Keep KRX content as safety education only.
- Do not imply KCG is a KRX trading venue, securities account provider, or live exchange execution service.
- Keep private physical consultation, company posted prices, and KRX market education visually and textually separate.

## Immediate KCG Changes From This Audit

- Add a `/prices` consultation guide that maps visitor purpose to the relevant price line, preparation items, and final on-site checks.
- Add a `/prices` data-use matrix that explains company posted prices, automatic international references, and chart/news/competitor reference rules.
- Add source-compliance and audit-script checks so future agents cannot claim competitor benchmarking from only first-screen screenshots.
- Keep the current large campaign hero direction, but judge it against price-desk usefulness rather than competitor banner size alone.

## Deferred Opportunities

These may improve KCG later, but they require business facts or explicit approval:

- Real branch/store detail expansion if KCG has additional verified locations.
- Licensed time-series chart with bid/ask and 1M/5M/1Y controls.
- Consultation form with consent, retention, and admin access rules.
- Product inventory pages for real confirmed bars or gifts.
- Kakao Channel deep-link or chat integration after official channel ownership is verified.
- Paid API subscription if public traffic needs reliable bid/ask, authority prices, and historical chart data.

## Guardrail

A benchmark-driven KCG task is not complete if it only checks competitor home screens. The minimum benchmark pack is:

- Site map and route categories.
- Price labels and unit/date/buy-sell wording.
- Product/service/detail pages.
- Contact, branch, map, FAQ, and policy pages.
- Forms and data-collection behavior.
- Scripts/network/API/chart/feed sources.
- Explicit copy/use/do-not-use decisions for KCG.
