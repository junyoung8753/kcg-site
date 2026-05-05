# KCG Existing API Integration Audit - 2026-05-05

This audit is control-plane documentation only. It does not add a new API, change API logic, change Supabase schema, change Vercel settings, deploy, or push.

## Product Rule

KCG company posted prices remain the source of truth.

Existing API and external-data surfaces are already part of the current site, so they are not "later P2 ideas." They must be audited as current behavior. New paid APIs, new automation, external data expansion, competitor scraping, CRM/ERP integrations, and advanced auto-decision flows remain P2 or blocked until separately approved.

## Current API And Data Surfaces

| Surface | Code path | Current role | Customer-facing role | Admin/operation role | Failure or fallback |
| --- | --- | --- | --- | --- | --- |
| Gold API | `src/lib/market-data.ts` | Default market-reference provider when `MARKET_DATA_PROVIDER=auto` and no `METALS_DEV_API_KEY` is configured. | Shows international current prices, KRW conversion, and reference values below company posted prices. | Can feed automatic price suggestions through KCG formulas. | If fetch fails, dashboard falls back to mock/reference data. Stale display is marked through freshness metadata. |
| Metals.Dev | `src/lib/market-data.ts` | Optional provider when `METALS_DEV_API_KEY` exists and provider is `auto` or `metals-dev`. | Can provide richer spot/bid/ask/change and currency reference data. | Paid/optional upgrade candidate for more reliable auto suggestions and richer market data. | If Metals.Dev fails in `metals-dev` mode, code attempts Gold API fallback; if that fails, mock/reference fallback is used. |
| Google News RSS-style feed | `src/lib/market-data.ts` | Fetches headline links for domestic/global gold-market news context. | Shows link-style title, source, and date context only. It does not republish article bodies or images. | Helps keep the home market section active without manual content entry. | If RSS fetch, parse, or volume is insufficient, seed headlines are used. |
| TradingView official widget | `src/components/market/trading-view-widget.tsx` | Official embedded chart widget with visible attribution. | Provides chart context after company posted prices and reference tables. | No storage or extraction. It is a visual reference only. | If external script does not load within the timeout, fallback text and a TradingView link are shown. |
| Supabase storage | `src/lib/supabase/server.ts`, `src/lib/data/index.ts`, `src/lib/data/supabase-repository.ts` | Production data repository when Supabase env vars are configured. | Public prices, products, and announcements can be served from persisted data. | Admin edits persist across reloads; auto-price settings and suggestions can be stored. | If env vars are missing, code uses `MockRepository`; `/api/health` reports `mode: "mock"`. |
| Vercel Cron / auto-price refresh | `vercel.json`, `src/app/api/admin/price-auto-refresh/route.ts`, `src/lib/price-auto-runner.ts` | Scheduled/current endpoint for automatic price checks. | It can update company posted prices only after KCG formula and safety checks. | Uses `CRON_SECRET`; records suggestions and history; respects enabled state, due interval, business hours, source safety, minimum change, and max auto-publish threshold. | If disabled, not due, outside hours, schema not ready, unsafe data, small change, or large movement, public prices are not changed or are held for review. |
| External service check script | `scripts/check-external-services.mjs` | Verification-only status check. | No direct customer surface. | Checks stable/custom domain, robots/noindex, sitemap, health, and DNS posture. | Fails the command instead of changing the site. |

## P0 Audit Findings

- Existing API integration is a current-site QA scope, not a deferred P2 feature.
- Company posted prices must remain visually and operationally above API reference prices.
- API values must not appear as confirmed sale/buy prices.
- API failure, stale data, rate limits, empty responses, or mock fallback must not silently overwrite company posted prices.
- `/api/health` exposes market provider, source, stale status, Supabase/mock mode, indexing posture, and headline source for operators.
- Automatic price posting uses KCG formulas and safety gates, not raw external values.
- Competitor sites must remain human-reference/benchmark sources only. KCG must not fetch, scrape, cache, proxy, or apply competitor prices.

## P1 Operational QA Checks For Existing APIs

- Admin prices screen should clearly show whether automatic price operation is ON or OFF.
- Admin should show whether the current market provider is Gold API, Metals.Dev, or fallback/mock.
- Automatic price updates should clearly separate:
  - current public company posted price
  - calculated reference value
  - difference
  - reason for auto-apply, hold, skip, or review
- Public pages should show update time and source attribution as small data/source lines, not as the main product promise.
- If API data is stale or fallback, public UI should stay trustworthy and should not imply live precision.
- If Metals.Dev is enabled later, run provider-mode QA before relying on bid/ask/change values.

## P2 Or Blocked Items

- New API provider integration.
- Paid Metals.Dev plan upgrade.
- KRX/Koscom market-data display or distribution.
- CRM/ERP/customer-notification integration.
- More frequent scheduler through Vercel Pro or external scheduler.
- Competitor-price automatic collection, scraping, or "slightly changed" derivative pricing. This remains blocked.

## Product Impact Checklist

- Main page still needs immediate company price disclosure above market-reference widgets.
- Gold API/Metals.Dev/TradingView must not draw attention ahead of the company price table.
- News links should support trust and context, not become a replacement for company announcements.
- If a data provider fails, the customer should still see company posted prices, source/fallback posture, and a safe inquiry path.
- Automatic price operation must preserve history and operator accountability.

## Next Follow-Ups

- Keep `KCG-TODO-053` closed after this audit is linked from `OPEN_TASKS.md`, `CURRENT_HANDOFF.md`, and audit guardrails.
- Add a future rendered QA pass if public market-reference UI or admin auto-price UI changes.
- Do not switch to paid Metals.Dev until company approval and provider-mode verification are done.
- Do not enable search indexing or final public launch from this API audit.
