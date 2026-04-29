# Current KCG Handoff

Last updated: 2026-04-29 KST.

This file is the short, durable context for a new Codex chat, another PC, or Codex Cloud. Read it before continuing KCG site work.

Junyoung's preferred workflow is cloud-only when possible. Use `docs/setup/CLOUD_ONLY_WORKFLOW.md` before suggesting local PC setup.

If the old KCG project chat disappears from the Codex app UI, do not treat that as lost project state. Continue from this repo and read `docs/setup/MISSING_CHAT_RECOVERY.md` for the recovered local session file, E: backup locations, and no-secret backup path.

## Current Source Of Truth

- GitHub repo: `junyoung8753/kcg-site`
- Current local working branch: `codex/kcg-launch-readiness-catalog-20260427`
- Base branch: `main`
- Vercel project: `kcg-confirm-preview`
- Continue KCG work on `codex/kcg-launch-readiness-catalog-20260427`. Do not switch to `main` for the current production candidate until this branch is intentionally reviewed and merged.
- Repository visibility decision as of 2026-04-27 KST: keep `junyoung8753/kcg-site` public for now. Revisit before adding private production data, confidential business copy, customer material, or admin-sensitive details.
- Stable review domain: `https://kcg-confirm-preview.vercel.app`
- The historical source site exists in the company Codex environment. Do not treat the stable review URL as an older source to restore unless junyoung explicitly asks.
- Company scope confirmed by junyoung on 2026-04-27 KST: KCG handles 순금·고금 매입, 순금/골드바 판매, B2C 전화 문의·거래 상담, and B2B 대량·기업 상담. Treat the site as a consultation-first gold exchange, not a checkout mall or securities/trading service.
- Current image source folder: `C:\Users\junyo\Documents\File-Hub\30_Media\Images`. Use only approved brand/AI assets from this folder; do not copy contract, address, signature, or other private document photos into the repo.

## Current Product Direction

KCG should not be a generic mall, broad trading platform, or multi-option design playground. The final direction is:

- `/` is the only public home surface.
- Company posted prices are first; automatic market data is secondary.
- Phone inquiry and transaction preparation beat checkout/cart behavior.
- Use KCG real brand/campaign assets, restrained price-desk layout, and mobile-first scanability. The first home slide should read as a Korean gold-exchange campaign visual, while the live price table remains the working information surface.
- Keep KRX confusion-prevention and source attribution.
- Do not restore old option routes such as `/option-1` or `/option-2`.

## Current Important Status

- This repo is ready for cross-computer work through GitHub.
- Codex local environment config is committed under `.codex/environments/environment.toml`.
- `docs/quality/ai-site-production-playbook.md` records the KCG AI site-building workflow: context pack, product surface, KCG constraints, acceptance criteria, browser evidence, score, and durable guardrail.
- `docs/quality/design-review-checklist.md` is the task-level design QA checklist for visual thesis, product surface, responsive/accessibility checks, evidence, and scoring.
- `docs/quality/data-source-compliance.md` records the source-attribution and licensing rules for Gold API, Metals.Dev, Google News RSS-style headlines, paid news API candidates, charts, calculators, forms, and competitor references.
- `docs/setup/OPEN_TASKS.md` is the active KCG task ledger. Use it to separate Codex-doable work, blocked work, and junyoung-only public-launch actions. Run `npm run tasks:dashboard` to render the local browser dashboard at `output/kcg-open-tasks.html`.
- `npm run check:external` is the quick reconnect/status check for the stable URL, robots/noindex posture, empty pre-launch sitemap, and Cafe24 DNS A-record state. It does not read or store secrets.
- `docs/research/gold-exchange-deep-audit-2026-04-27.md` records the deeper competitor benchmark pass across home, subpages, price wording, forms, tables, and network/API/chart behavior. Do not treat a home-screen-only review as sufficient for benchmark-driven work.
- `/option-1` and `/option-2` have been removed from the app. The audit and Playwright tests now expect those routes to return 404.
- The old source comparison script has been removed from the default workflow because the repo is now the accepted baseline.
- The home campaign slider must remain a full-bleed visual surface. On desktop, the company price table belongs as a left-side overlay on top of the full-width campaign image, with a visible left image margin and a narrower dark lineup-panel ratio inspired by major Korean gold-exchange sites. The image must still span the viewport and must not shrink into a right-side half-width banner. On mobile/tablet, preserve price readability over strict overlay behavior.
- The current public image set uses 2026-04-27 assets under `public/campaign`, `public/products`, and `public/services`. The home carousel now starts with `kcg-brand-gold-bars-20260427-v4.png`, copied from KCG's File-Hub `AI generated\1.png`, because it has stronger campaign/product energy than the plain consultation-room image. `kcg-main-desk-photo-20260427-v3.png` remains a supporting slide. The retired `kcg-main-commerce-banner-20260427-v2.jpg` direction stays out because it looked like a generated poster rather than a controlled KCG campaign surface.
- Competitor sites may be used for structure, hierarchy, category grouping, CTA placement, and visual grammar. Do not copy competitor-owned images, prices, slogans, detailed copy, logos, staff/model photos, internal API endpoints, or scraped data into KCG.
- `/products` is now the public consultation catalog surface. It is intentionally not a checkout/cart mall: price wording, product photos, display order, visibility, and consultation notes can be managed through the product model/admin flow, while public copy keeps phone inquiry and trade consultation as the conversion path.
- The baseline product catalog now uses a tabbed `상품/매입` structure: `전체`, `골드바`, `실버바`, `순금제품`, `고금·주얼리 매입`, and `B2B·기업`. Product cards may show current posted-price reference calculations, but they must remain inquiry-first and must not behave like checkout, payment, live trading, or guaranteed quote flow.
- Product data now has a shared repo contract across mock data, Supabase schema/seed, public pages, and admin editing. Keep product statuses limited to `active`, `inquiry_required`, and `hidden` unless a real operational need appears.
- Public business-registration wording now uses the supplied business registration document: `505-88-03567`, `주식회사 한국센터금거래소`, representative `홍연호`, and the registered address at `서울특별시 종로구 서순라길 17, 1층 6호 (봉익동, 성창빌딩)`. Search indexing remains blocked until a separate public-launch approval.
- `/admin/launch` is the launch-readiness dashboard. It checks legal placeholders, domain, search exposure, admin auth, storage, and launch approval status. Keep this route updated when adding launch-critical behavior.
- Search exposure must use `canExposeToSearch()` rather than raw production/noindex state, so legal placeholders and non-final domains keep robots/sitemap blocked.
- Keep search blocking/noindex until public launch approval.
- Current launch-prep boundary: Cafe24 DNS, Vercel custom domains, HTTPS, and Supabase production storage are connected. Do not remove robots/noindex, enable search indexing, publish launch announcements, or treat this as final public launch approval until junyoung explicitly approves after final legal display, product prices/photos, operating copy, and final admin secret rotation are confirmed.
- Safe pre-launch work is limited to preview deployments, route/UI/content polish, admin launch-readiness checks, product/catalog preparation, source-attribution/data-safety work, and documentation.

## Public Launch Terms

- Production deploy: a Vercel production deployment that can affect production URLs or custom domains.
- Stable alias change: changing a fixed review/live URL to point at a specific deployment rather than an ephemeral preview URL.
- `kcgold.co.kr` domain cutover: `kcgold.co.kr` and `www.kcgold.co.kr` are added to Vercel, Cafe24 DNS A records point both domains to `76.76.21.21`, and HTTPS works for both domains. Preserve existing MX/TXT/SPF/DKIM records and change no other DNS records unless a later provider requires it. Keep robots/noindex blocked.
- Robots/noindex removal: allowing search engines to index the site. Current code keeps this blocked unless production, final domain, confirmed legal information, and no forced noindex all pass.

## External Services Runbook

- `docs/setup/DOMAIN_SUPABASE_MARKET_RUNBOOK.md` is the current runbook for Cafe24/Vercel domain connection, Supabase setup, Gold API/Metals.Dev/KRX decisions, TradingView widget boundaries, and post-connection verification.
- Default market data remains `MARKET_DATA_PROVIDER=auto` with no `METALS_DEV_API_KEY`, which means Gold API free current reference prices are used before fallback data. Do not pay for Metals.Dev until bid/ask, history charts, quota, or reliability justify it. TradingView is used only through its official embeddable widget for chart context; keep attribution visible and do not extract the widget data into KCG tables or storage.
- KRX Open API has 금시장 일별매매정보, but KRX usage terms and market-data distribution rules must be confirmed before public commercial display. Do not mix KRX values into KCG posted prices or "실시간 참고시세" until approval/contract scope is clear.
- Supabase production data now uses the checked-in `supabase/schema.sql` and `supabase/seed.sql`. Vercel production env has the public Supabase URL and server-only key set only through dashboard/CLI secret flows. Do not commit or paste service-role/secret keys.
- `docs/brand/campaign-image-prompts.md` holds the KCG image policy, current candidate notes, and ChatGPT/Gemini prompt set for campaign, product, service, B2B, and visit-guide images. It now rejects generic beige consultation-room hero images, heavy white haze over the hero image, and large HTML marketing copy on top of the image; it prefers a large product-scale commercial key visual. It intentionally avoids instructions about price-table placement, empty space, black boxes, or UI overlays.

## Stable Review Deploy Boundary

- Junyoung has approved refreshing `https://kcg-confirm-preview.vercel.app` with the validated image/UI work in this task.
- This is not approval for robots/noindex release or search indexing. Cafe24 DNS changes require junyoung to complete the registrar login/MFA step directly.
- Do not perform production deploys beyond an explicitly approved stable review refresh, and do not treat a Vercel deploy as public launch approval.
- Last stable review refresh: 2026-04-29 16:38 KST, Vercel deployment `dpl_8MiBBbh3UyUe4RoKqSfLd1vkcCHQ`, aliased to `https://kcg-confirm-preview.vercel.app`, `https://kcgold.co.kr`, and `https://www.kcgold.co.kr`.
- Production admin access was reset on 2026-04-28 KST for pre-launch editing. `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are set only in Vercel production env; no secret value is stored in this repo. Rotate the admin password to a stronger final value before public launch/search exposure.
- Previous post-deploy verification passed on `https://kcg-confirm-preview.vercel.app`: rendered audit, Playwright tests, `/robots.txt` `Disallow: /`, empty pre-launch sitemap, noindex, and `/api/health` launch-readiness blockers all behaved as expected. Re-verify after each stable refresh.

## Latest Local And Stable Verification

2026-04-28 KST after the final structure pass, real legal information, streamlined navigation, the `/company` route, `상품/매입` naming, 4-slide home carousel, no visible carousel pause button, image-led product catalog, KCG-style market-reference sections, and Cafe24/Vercel domain preparation were applied, then the stable review URL was refreshed. A later comment-response pass on the same date moved `/prices` guidance below the price table, lifted the `/services` image-led block, refocused `/company` on legal/company facts, and rebuilt `/products` as a tabbed catalog with current posted-price reference values and a desktop sticky promo rail:

```powershell
npm run lint
npm run typecheck
npm run audit:site
npm run tasks:dashboard
npm run build
$env:SITE_AUDIT_URL='http://127.0.0.1:3200'; npm run audit:site
$env:SITE_AUDIT_URL='http://127.0.0.1:3200'; npm run test:site
$env:SITE_AUDIT_URL='http://127.0.0.1:3200'; npm run screenshot:site
npm audit --audit-level=moderate
git diff --check
npx vercel --prod --yes
npx vercel inspect https://kcg-confirm-preview.vercel.app/
$env:SITE_AUDIT_URL='https://kcg-confirm-preview.vercel.app'; npm run audit:site
$env:SITE_AUDIT_URL='https://kcg-confirm-preview.vercel.app'; npm run test:site
$env:SITE_AUDIT_URL='https://kcg-confirm-preview.vercel.app'; npm run screenshot:site
```

All required local commands passed. Static/rendered audit passed 582 checks with 0 skipped on port 3200, local Playwright passed 9 tests, `npm audit --audit-level=moderate` found 0 vulnerabilities, and `git diff --check` passed with only Git line-ending warnings. `npm run tasks:dashboard` rendered 28 tasks before the comment-response task was recorded.

After deployment, `vercel inspect` showed production deployment `dpl_4Zv1VNPYsyA7aEbrMvL1PKbur8xU` ready and aliased to the stable review URL. The admin login was verified against the stable URL and redirected to `/admin/launch`. The stable URL now includes the official TradingView chart widget with visible attribution; a Playwright iframe check confirmed one TradingView widget iframe on `/prices`. `/robots.txt` still returned `Disallow: /`, `/api/health` reported `indexing: disabled`, `adminAuth: env-password`, `marketProvider: gold-api`, and launch readiness warnings for representative domain, search exposure, and production storage only. Verification passed: `npm run lint`, `npm run typecheck`, `npm run audit:site`, `npm run build`, `npm run test:site`, `npm run screenshot:site`, `npm audit --audit-level=moderate`, `git diff --check`, stable rendered audit 591 checks, stable Playwright 9 tests, and `npm run check:external`.

2026-04-29 KST domain and Supabase status: `kcgold.co.kr` and `www.kcgold.co.kr` are added to project `kcg-confirm-preview`, Cafe24 DNS contains `A kcgold.co.kr 76.76.21.21` and `A www.kcgold.co.kr 76.76.21.21`, and HTTPS works for both custom domains. `https://kcgold.co.kr/api/health`, `https://www.kcgold.co.kr/api/health`, and the stable review URL all report `mode: "supabase"`, `indexing: "disabled"`, and `adminAuth: "env-password"`. Both custom-domain `/robots.txt` paths return `Disallow: /`, and the pre-launch sitemap remains empty. Do not remove noindex/search blocking. Do not treat domain/Supabase readiness as public search-launch approval.

Supabase production data status as of 2026-04-29 KST: project `ehmsqlfxxydnebzjfarr` has `prices=8`, `price_history=0`, `announcements=2`, and `products=20` after applying the checked-in schema/seed through the Supabase SQL Editor. Admin login with the temporary site-admin password reaches `/admin/products`, and the product manager renders 20 Supabase-backed products.

Local no-secret transfer backup: `C:\Users\junyo\Documents\File-Hub\90_Backups\kcg-site\kcg-site-workingtree-20260428-210137.zip`. It was created from the current working tree and excludes `.git`, `.env*`, `.vercel`, `.next`, `node_modules`, `output`, and Supabase CLI temp metadata.

## Codex Cloud Status

- Codex Cloud environment: `junyoung8753/kcg-site`.
- Current confirmed runtime: Node.js 22 in Cloud. Do not assume Node 24 unless the Cloud UI explicitly exposes it.
- Setup script:

  ```bash
  npm ci
  npx playwright install --with-deps chromium
  ```

- Maintenance script:

  ```bash
  npm ci
  ```

- If a future Cloud task fails with missing Playwright Linux libraries such as `libatk-1.0.so.0`, fix the Cloud setup or run `npx playwright install --with-deps chromium`; do not remove fonts, images, routes, or visual QA code to hide the environment problem.

## Next Recommended Work

1. Treat the current repo as the single production candidate.
2. Before visual or route work, read:

   ```text
   AGENTS.md
   docs/quality/product-experience-rubric.md
   docs/quality/design-review-checklist.md
   docs/quality/data-source-compliance.md
   docs/quality/ai-site-production-playbook.md
   docs/setup/OPEN_TASKS.md
   docs/research/gold-exchange-benchmark-2026-04-25.md
   docs/research/gold-exchange-deep-audit-2026-04-27.md
   ```

3. Make focused changes that improve price clarity, consultation conversion, source safety, launch readiness, or mobile readability.
4. Then run:

   ```powershell
   npm run lint
   npm run typecheck
   npm run audit:site
   npm run build
   npm run test:site
   npm audit --audit-level=moderate
   ```

5. For visual changes, also run:

   ```powershell
   npm run screenshot:site
   ```

6. Inspect at least one mobile screenshot of `/` before claiming visual completion.

## Backup Before Switching Or Launch

When launch-prep work is complete, preserve the finished state in GitHub before switching computers or starting a new Codex Cloud task:

```powershell
npm run lint
npm run typecheck
npm run audit:site
npm run tasks:dashboard
npm run build
npm run test:site
npm audit --audit-level=moderate
git status
git add .
git commit -m "Prepare KCG site launch readiness"
git push
```

If the work is not ready for `main`, use a `codex/` feature branch and push that branch instead. Do not commit `.env*`, `.vercel`, Supabase service role keys, admin passwords, cookies, tokens, local Vercel settings, or protected deployment URLs.

## New Chat Prompt

When starting a new project chat in this repo, a short prompt is enough:

```text
kcg사이트 만들던거 이어나갈수있게 준비해
```

Agents must treat that short prompt as equivalent to:

```text
KCG 사이트 작업 이어가자. 이 repo의 AGENTS.md, docs/setup/CURRENT_HANDOFF.md, docs/quality/product-experience-rubric.md, docs/quality/data-source-compliance.md, docs/quality/ai-site-production-playbook.md를 먼저 읽고, 현재 repo를 단일 오픈 후보 기준으로 점검해줘. API/RSS/차트/폼/경쟁사 참고는 출처와 약관 기준을 지키고, old option route 복구나 production 배포, stable alias 변경, 검색 색인 허용은 내가 명확히 승인하기 전에는 하지 마.
```

For task tracking, also read `docs/setup/OPEN_TASKS.md`. For visual or route work, also read `docs/quality/design-review-checklist.md`.

If this prompt is being used because the old project chat disappeared, also read `docs/setup/MISSING_CHAT_RECOVERY.md` before deciding whether any old session context is still needed.

## Cloud-Only Start

For the least confusing workflow, use Codex Cloud attached to:

```text
Repository: junyoung8753/kcg-site
Branch: codex/kcg-launch-readiness-catalog-20260427
```

Then paste the New Chat Prompt above. No PowerShell is needed unless the user wants this repo cloned locally on that computer.

## New Computer Setup

Only do this if the user wants local files on that computer. It is not required for cloud-only work.

On a new local computer:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "iwr -UseBasicParsing https://raw.githubusercontent.com/junyoung8753/kcg-site/main/scripts/Start-KcgContinuation.ps1 -OutFile $env:TEMP\Start-KcgContinuation.ps1; & $env:TEMP\Start-KcgContinuation.ps1"
```

This finds or creates `Documents\Codex\projects\kcg-site`, pulls the latest `main`, installs dependencies, and pulls Vercel project settings when the Vercel CLI is already logged in with the computer's normal CLI/keyring state.

## Do Not Lose

- Do not store `_vercel_jwt` or `_vercel_jwe` URLs.
- Do not commit `.env*`, `.vercel`, Supabase service role keys, admin passwords, cookies, tokens, or local Vercel settings.
- Keep search blocking/noindex until public launch approval.
- Do not perform production deploys beyond an explicitly approved stable review refresh, stable alias changes outside `https://kcg-confirm-preview.vercel.app`, `kcgold.co.kr` DNS cutover, or robots/noindex removal until explicit public-launch approval.
- Keep company posted prices separate from automatic market-reference data.
- Keep `/` as the single public home surface.
