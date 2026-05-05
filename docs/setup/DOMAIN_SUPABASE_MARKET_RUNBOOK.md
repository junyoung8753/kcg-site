# KCG Domain, Supabase, And Market Data Runbook

Last updated: 2026-04-29 KST.

This is the practical checklist for connecting `kcgold.co.kr`, enabling real operating data, and deciding market-data sources without exposing secrets or opening search indexing too early.

Do not record passwords, API keys, recovery codes, Vercel tokens, Supabase keys, Cafe24 credentials, cookies, or protected deployment URLs in this file.

## Current Operating Position

- Public candidate branch: `codex/kcg-launch-readiness-catalog-20260427`.
- Vercel project: `kcg-confirm-preview`.
- Review URL: `https://kcg-confirm-preview.vercel.app`.
- Target domains: `kcgold.co.kr`, `www.kcgold.co.kr`.
- Domain registrar/DNS account: Cafe24 hosting/domain control panel.
- Site business scope: 순금·고금 매입, 순금/골드바 판매, B2C 전화 문의·거래 상담, B2B 대량·기업 상담.
- Product mode: 상담형 카탈로그 only. No checkout, cart, live trading, online quote guarantee, or payment flow.
- Search mode: keep `KCG_FORCE_NOINDEX=1` until legal info, operating secrets, production data, final domain, and explicit public launch approval are complete.
- Current stable deployment: `dpl_8MiBBbh3UyUe4RoKqSfLd1vkcCHQ`, aliased to `https://kcg-confirm-preview.vercel.app`, `https://kcgold.co.kr`, and `https://www.kcgold.co.kr`.
- Temporary production site-admin access has been reset for pre-launch editing. The value is set only in Vercel env; do not write it in docs or Git. Rotate it before public/search launch.
- Current storage mode on the stable URL is `supabase`. The Supabase schema/seed were applied through the dashboard SQL Editor, and Vercel production env contains the public Supabase URL plus the server-only key.

## Cafe24 And Vercel Domain Connection

Codex can prepare and verify commands, but junyoung must complete Cafe24/Vercel login, password-manager approval, MFA, and any account/security confirmation.

Preparation:

```powershell
vercel link --yes --project kcg-confirm-preview
vercel pull --yes
vercel domains add kcgold.co.kr kcg-confirm-preview
vercel domains add www.kcgold.co.kr kcg-confirm-preview
vercel domains inspect kcgold.co.kr
vercel domains inspect www.kcgold.co.kr
```

DNS entry rule:

- Use the exact records returned by `vercel domains inspect`.
- Current Vercel inspect output requires:
  - `A  kcgold.co.kr      76.76.21.21`
  - `A  www.kcgold.co.kr  76.76.21.21`
- Vercel can also be connected by changing nameservers to `ns1.vercel-dns.com` and `ns2.vercel-dns.com`, but for KCG the safer first change is the exact A records above because Cafe24 may already hold mail or ownership records.
- Preserve existing MX/TXT/SPF/DKIM records and any other non-web ownership or mail records.
- In Cafe24 DNS management, change only the web-serving A records needed for Vercel.
- Do not delete MX, TXT, SPF, DKIM, DMARC, ownership-verification, or other existing non-web records.
- Do not disable `KCG_FORCE_NOINDEX=1` during domain connection.

Post-DNS verification:

```powershell
npm run check:external
vercel domains inspect kcgold.co.kr
vercel domains inspect www.kcgold.co.kr
Resolve-DnsName kcgold.co.kr
Resolve-DnsName www.kcgold.co.kr
```

Use strict mode only after Cafe24 DNS has been entered and enough propagation time has passed:

```powershell
npm run check:external -- --strict-domain
```

Browser checks after DNS propagation:

- `https://kcgold.co.kr/`
- `https://kcgold.co.kr/products`
- `https://kcgold.co.kr/prices`
- `https://kcgold.co.kr/api/health`
- `https://kcgold.co.kr/robots.txt`
- `https://kcgold.co.kr/sitemap.xml`

Expected before launch approval:

- HTTPS works.
- `/robots.txt` still blocks crawling.
- pages still render noindex metadata if launch blockers remain.
- `/admin/launch` still shows remaining blockers for legal placeholders, operating secrets, storage, or public approval.

Current verification state:

- `vercel inspect https://kcg-confirm-preview.vercel.app/` shows production deployment `dpl_8MiBBbh3UyUe4RoKqSfLd1vkcCHQ` ready.
- `vercel domains inspect kcgold.co.kr` and `vercel domains inspect www.kcgold.co.kr` show the domains added to Vercel.
- Cafe24 DNS has been updated with `A kcgold.co.kr 76.76.21.21` and `A www.kcgold.co.kr 76.76.21.21`.
- `Resolve-DnsName kcgold.co.kr`, `Resolve-DnsName www.kcgold.co.kr`, and `npm run check:external -- --strict-domain` pass DNS checks.
- `https://kcgold.co.kr/api/health`, `https://www.kcgold.co.kr/api/health`, and both HTTPS `/robots.txt` paths route to Vercel and keep `mode: "supabase"`, `indexing: disabled`, and `Disallow: /`.

Important deployment note:

DNS connection can make the Vercel production deployment reachable at `kcgold.co.kr`. Before changing Cafe24 DNS, verify which deployment Vercel production currently points to. Completed, verified KCG site source/UI changes may be deployed to the existing live review domains by default for junyoung's review. Do not change DNS/domain policy or release robots/noindex until explicit public launch approval.

## Supabase Operating Data Setup

Current local fallback works without Supabase. Production is now connected to Supabase for prices, announcements, and product catalog edits.

Use the existing schema and seed:

```powershell
supabase db push
supabase db execute --file supabase/seed.sql
```

If using the Supabase dashboard instead of CLI:

- Create or open the KCG Supabase project. Current project ref: `ehmsqlfxxydnebzjfarr`.
- Run `supabase/schema.sql` in SQL Editor.
- Run `supabase/seed.sql` in SQL Editor.
- Confirm tables exist: `prices`, `price_history`, `announcements`, `products`.
- Confirm counts after the current seed: `prices=8`, `price_history=0`, `announcements=2`, `products=20`.

CLI note:

- The local Supabase CLI cannot use the web dashboard login session directly.
- In a non-interactive Codex shell, `supabase login` requires a token or `SUPABASE_ACCESS_TOKEN`, and that token must not be pasted into chat or committed.
- Preferred path for this project: use the Supabase dashboard SQL Editor for schema/seed, then add the two Supabase env values in the Vercel dashboard or Vercel Marketplace integration.
- Marketplace integration may set public URL/anon-style variables, but KCG server-side writes also require a server-only service role or secret key under the exact env name below.

Vercel environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only secret>
ADMIN_PASSWORD=<real admin password>
ADMIN_SESSION_SECRET=<long random secret>
```

Security rule:

- `NEXT_PUBLIC_SUPABASE_URL` may be public.
- `SUPABASE_SERVICE_ROLE_KEY`, Supabase secret keys, admin passwords, and session secrets are server-only.
- Do not prefix service-role or secret keys with `NEXT_PUBLIC_`.
- Do not paste these values into chat or commit them to Git.
- Prefer dashboard/keyring/password-manager entry over copying values into local files.

Verification:

```powershell
npm run build
npm run test:site
```

Current verification:

- `/api/health` reports `mode: "supabase"` on the stable URL and both custom domains.
- `/admin/products` renders 20 Supabase-backed products after login.
- `/products` reflects the Supabase product data after the production deploy.
- `/robots.txt` still blocks crawling, and `/sitemap.xml` remains empty before public search approval.

What Codex can still do after future Supabase data edits:

- Redeploy or revalidate the stable URL when needed.
- Check `/api/health` for `mode: "supabase"`.
- Log into `/admin/login` with the temporary site-admin password and test price/product/announcement admin flows.
- Re-run rendered audit, Playwright tests, screenshots, and noindex checks.

## Market Data Decision

Default now:

```text
MARKET_DATA_PROVIDER=auto
METALS_DEV_API_KEY=
MARKET_DATA_REVALIDATE_SECONDS=60
```

Behavior:

- If `METALS_DEV_API_KEY` is empty, the site tries Gold API free current prices.
- If Gold API fails, the site falls back to checked-in seed market data.
- Automatic public market data must always show source attribution and reference-only wording.
- External market data must not overwrite KCG company posted prices except through the authenticated admin auto-publish workflow, which records a suggestion and price-history entry.

TradingView chart widget:

- KCG now uses the official TradingView embeddable widget for chart context.
- Keep the visible `TradingView 제공` attribution/link.
- Do not extract TradingView widget data into KCG tables, cache, Supabase, or screenshots as if it were KCG-owned data.
- This means TradingView is useful for visual market context, while KCG posted prices and Gold API/Metals.Dev data remain the structured data sources.

Metals.Dev upgrade:

- Enable only with a KCG-owned API key.
- Worth revisiting when bid/ask, change percentage, history/timeseries charts, authority prices, or production quota justify the cost.
- Configure through Vercel env only:

```text
METALS_DEV_API_KEY=<server-side provider key>
MARKET_DATA_PROVIDER=auto
```

KRX boundary:

- KRX OPEN API lists 금시장 일별매매정보, but public commercial display must wait for authentication key approval, utilization approval, terms confirmation, and any Koscom/market-data contract decision.
- Until that is confirmed, KRX stays out of KCG production market-data widgets and charts.
- KRX references may be used only as static safety education that distinguishes KRX Gold Market from KCG private physical consultation.

Verification:

- `/api/health` shows `marketProvider`, `marketSourceName`, `marketSourceUrl`, `marketSourceTermsUrl`, `marketSourceTier`, and `metalsDevConfigured`.
- `/prices` and `/` still show KCG company posted prices first and automatic reference data second.
- Source attribution remains visible.
- `/prices` contains a TradingView iframe and a visible `TradingView 제공` link.
