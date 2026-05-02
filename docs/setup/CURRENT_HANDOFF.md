# Current KCG Handoff

Last updated: 2026-04-30 KST.

This file is the short, durable context for a new Codex chat, another PC, or a future Codex Cloud task. Read it before continuing KCG site work.

Junyoung's current preferred workflow is local-first. Codex Cloud is not the default right now because it has been inconvenient and unreliable for current KCG work. Keep Cloud docs as a future option and use `docs/setup/CLOUD_ONLY_WORKFLOW.md` only when junyoung explicitly asks for Codex Cloud or wants to avoid computer-specific setup.

If the old KCG project chat disappears from the Codex app UI, do not treat that as lost project state. Continue from this repo and read `docs/setup/MISSING_CHAT_RECOVERY.md` for the recovered local session file, E: backup locations, and no-secret backup path.

## Current Source Of Truth

- GitHub repo: `junyoung8753/kcg-site`
- Private company knowledge repo: `junyoung8753/kcg-company-knowledge` (private). Use it for broader KCG company context when the current workspace is authorized, but keep internal notes, sensitive originals, customer data, credentials, and unapproved private material out of this public-style site repo.
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
- The current public image set uses 2026-04-27 and 2026-04-30 assets under `public/campaign`, `public/products`, `public/company`, and `public/services`. Public UI references optimized `.webp` versions for the large generated assets while keeping the original `.png` files as source-preserving originals. The home carousel now starts with `kcg-brand-gold-bars-20260427-v4.webp`, keeps product-led campaign images in the hero, uses `kcg-main-desk-photo-20260427-v3.webp` as a supporting slide, and uses `kcg-hero-gold-bars.jpg` as the fourth slide instead of the white-glove advisor image. Use the advisor/white-glove visual only for service or inspection-process context, not as a generic home/product image. The retired `kcg-main-commerce-banner-20260427-v2.jpg` direction stays out because it looked like a generated poster rather than a controlled KCG campaign surface.
- Competitor sites may be used for structure, hierarchy, category grouping, CTA placement, and visual grammar. Do not copy competitor-owned images, prices, slogans, detailed copy, logos, staff/model photos, internal API endpoints, or scraped data into KCG.
- `/products` is now the public consultation catalog surface. It is intentionally not a checkout/cart mall: price wording, product photos, display order, visibility, and consultation notes can be managed through the product model/admin flow, while public copy keeps phone inquiry and trade consultation as the conversion path.
- The baseline product catalog now uses a tabbed `상품/매입` structure: `전체`, `골드바`, `실버바`, `순금제품`, `고금·주얼리 매입`, and `B2B·기업`. Product cards may show current posted-price reference calculations, but they must remain inquiry-first and must not behave like checkout, payment, live trading, or guaranteed quote flow.
- Product data now has a shared repo contract across mock data, Supabase schema/seed, public pages, and admin editing. Keep product statuses limited to `active`, `inquiry_required`, and `hidden` unless a real operational need appears.
- Public business-registration wording now uses the supplied business registration document: `505-88-03567`, `주식회사 한국센터금거래소`, `대표이사 홍연호`, and the registered address at `서울특별시 종로구 서순라길 17, 1층 6호 (봉익동, 성창빌딩)`. Public labels should say `대표이사`, not `대표` or `대표자`, when referring to the person. Search indexing remains blocked until a separate public-launch approval.
- Public contact labels and family links were normalized on 2026-04-30 KST: the site uses 본사 전화 `02-747-1807` and 매장 전화 `02-747-1806`; old public phone `02-747-1802` must not reappear; location cards are titled `본사` and `매장` while keeping full building names only inside the detailed addresses. Family links include KC Lab Grown Diamond, 다비스 다이아몬드, 다이아민족, KCG 네이버 블로그, and 다비스 다이아몬드 블로그.
- Company mission and `한국센터금거래소(KCG) 회사소개` copy came from the boss-written text supplied by junyoung. When using that content publicly, do not polish, rewrite, or normalize the boss-written wording. The current public company page uses the latest KCG company-introduction text verbatim, including the provided KC Group ranking phrases, while still excluding unrelated internal notes, Bible verse text, future opening targets, newspaper/YouTube plans, private document images, and other non-public material.
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
- Last stable review refresh: 2026-04-30 22:49 KST, Vercel deployment `dpl_CCZFgUuN8LK5xbHynJ8gSLH8w1AX`, aliased to `https://kcg-confirm-preview.vercel.app`, `https://kcgold.co.kr`, and `https://www.kcgold.co.kr`.
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

2026-04-30 KST polish/status: the public company page now includes the latest boss-written KCG company-intro text verbatim, including the provided KC Group ranking phrases, without Codex rewriting or adding new claims. New generated KCG-compatible images were added for company credibility, service/advisor counter context, jewelry buying, and B2B gift consultation; private business-card/registration images remain outside `public/`. The company page no longer renders the separate service/specialty card grid; product/service content stays under `/products` and `/services`. The temporary KCG posted price table was manually aligned once to the 2026-04-30 Korean Gold Exchange visible benchmark values for pre-operation similarity: 순금 살 때 `954,000`, 순금 팔 때 `799,000`, 18K 팔 때 `587,300`, 14K 팔 때 `455,500`, 백금 살 때 `397,000`, 백금 팔 때 `322,000`, 은 살 때 `14,650`, 은 팔 때 `12,020`. Product mobile flow was tightened so tabs, product count, sorting, and product cards appear before mobile promo banners; product-card fallback images are varied by slug to reduce repetition; the mobile home campaign image no longer uses an over-tall crop. Production deployment `dpl_A6PcFnLwgVMw8g7FiCM5qZFDUHXe` was deployed and aliased to the stable/custom domains. Verification passed: `npm run lint`, `npm run typecheck`, `npm run audit:site`, `npm run tasks:dashboard`, `npm run build`, `npm run test:site`, `npm run screenshot:site`, `npm audit --audit-level=moderate`, `git diff --check`, stable rendered audit on `https://kcgold.co.kr`, stable Playwright tests on `https://kcgold.co.kr`, stable screenshots, and `npm run check:external -- --strict-domain`. `https://kcgold.co.kr/robots.txt` and `https://www.kcgold.co.kr/robots.txt` still return `Disallow: /`; `/api/health` reports `mode=supabase`, `indexing=disabled`, and launch-readiness score `95`. Search blocking remains active.

2026-04-30 KST late typography/performance pass: public route typography was normalized through shared KCG type utilities instead of route-by-route arbitrary sizes, with rendered checks covering `/`, `/prices`, `/products`, `/services`, `/company`, `/about`, and `/announcements`. `/products` tab changes now filter already-loaded product data locally: the initial URL query is still honored, `window.history.replaceState` keeps shareable URLs, browser back/forward syncs through `popstate`, and tab clicks no longer trigger App Router `_rsc` fetches or product-detail prefetch bursts. Product images now use stable aspect-ratio placeholders, constrained eager/lazy loading, and Next image optimization rather than all-eager unoptimized loads. Screenshot capture now includes both mobile and desktop `/products`. Production deployment `dpl_CCZFgUuN8LK5xbHynJ8gSLH8w1AX` was deployed and aliased to `https://kcgold.co.kr`, `https://www.kcgold.co.kr`, and `https://kcg-confirm-preview.vercel.app`. Verification passed: `npm run lint`, `npm run typecheck`, `npm run audit:site`, `npm run tasks:dashboard`, `npm run build`, targeted Playwright for product tabs and typography, full `npm run test:site`, `npm run screenshot:site`, `npm audit --audit-level=moderate`, `git diff --check`, `npx vercel inspect https://kcgold.co.kr/`, stable rendered audit on `https://kcgold.co.kr`, stable Playwright tests on `https://kcgold.co.kr`, and `npm run check:external -- --strict-domain`. `https://kcgold.co.kr/api/health` still reports `mode=supabase`, `deployment=production`, `indexing=disabled`, and `adminAuth=env-password`; `/robots.txt` still returns `Disallow: /` and `/sitemap.xml` remains empty before public launch approval.

2026-04-30 KST launch-prep asset/review pass: large generated campaign, product, company, and service images now have optimized `.webp` public variants, while source `.png` files remain in `public/` for preservation. Public UI and product seed/mock references use the optimized variants. `audit:site` now fails if the core optimized generated assets exceed the size guardrail. A no-secret product-operations checklist was added at `docs/setup/PRODUCT_OPERATIONS_CHECKLIST.md`, and a management briefing was added at `docs/setup/LAUNCH_BRIEFING.md`. Branch-level review `codex review --base main` completed with exit 0 and no actionable output after earlier review findings were fixed. This pass has not performed a new production deployment; keep noindex/robots blocking active until separate public-launch approval.

2026-05-03 KST admin auto-fill/UX pass: `/admin/prices` was rebuilt as a price-desk workflow with a compact posted-price table, auto-fill settings, draft comparison, apply/reject actions, and source links for human reference only. Auto-fill uses allowed market-reference providers plus deterministic KCG formulas; it does not scrape competitor prices and does not use random offsets. New Supabase schema tables `price_auto_settings` and `price_auto_suggestions` are checked in, plus API routes `/api/admin/price-auto-refresh` and `/api/admin/price-auto-apply`. Vercel production now has a `CRON_SECRET` env var for cron authorization; the value is not stored in the repo. `/admin`, `/admin/products`, and `/admin/announcements` were tightened into more practical operation screens. If production `/admin/prices` shows the schema warning, apply the new `supabase/schema.sql` through Supabase SQL Editor after login; Codex could not apply it in this pass because Supabase CLI was not logged in and the shared browser session had returned to sign-in. Search/noindex blocking remains active.

Local no-secret transfer backup: `C:\Users\junyo\Documents\File-Hub\90_Backups\kcg-site\kcg-site-workingtree-20260428-210137.zip`. It was created from the current working tree and excludes `.git`, `.env*`, `.vercel`, `.next`, `node_modules`, `output`, and Supabase CLI temp metadata.

## Future Codex Cloud Status

- Codex Cloud is not the current default workflow. The known future environment is `junyoung8753/kcg-site`.
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

When launch-prep work is complete, preserve the finished state in GitHub before switching computers or starting a future Codex Cloud task:

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
KCG 사이트 작업 이어가자. 이 repo의 AGENTS.md, docs/setup/CURRENT_HANDOFF.md, docs/quality/product-experience-rubric.md, docs/quality/data-source-compliance.md, docs/quality/ai-site-production-playbook.md를 먼저 읽고, 접근 권한이 있으면 private repo junyoung8753/kcg-company-knowledge의 README.md, ops/local-first-workflow.md, company/identity.md, company/business-rules.md, pricing/posted-price-policy.md, projects/kcg-site.md도 회사 맥락으로 참고해줘. 현재 repo를 단일 오픈 후보 기준으로 점검하고, 내부자료는 public-safe subset만 site repo에 반영해. API/RSS/차트/폼/경쟁사 참고는 출처와 약관 기준을 지키고, old option route 복구나 production 배포, stable alias 변경, 검색 색인 허용은 내가 명확히 승인하기 전에는 하지 마.
```

For task tracking, also read `docs/setup/OPEN_TASKS.md`. For visual or route work, also read `docs/quality/design-review-checklist.md`.

If this prompt is being used because the old project chat disappeared, also read `docs/setup/MISSING_CHAT_RECOVERY.md` before deciding whether any old session context is still needed.

## Future Cloud-Only Start

This is not the current default. If junyoung later asks to use Codex Cloud, use Codex Cloud attached to:

```text
Repository: junyoung8753/kcg-site
Branch: codex/kcg-launch-readiness-catalog-20260427
```

Then paste the New Chat Prompt above. No PowerShell is needed unless the user wants this repo cloned locally on that computer.

## New Computer Setup

Use this when the user wants local files on a new computer. It is separate from the future Cloud-only option.

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
