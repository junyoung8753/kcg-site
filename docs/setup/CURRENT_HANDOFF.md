# Current KCG Handoff

Last updated: 2026-05-09 KST.

This file is the short, durable context for a new Codex chat, another PC, or a future Codex Cloud task. Read it before continuing KCG site work.

## Beginner Start Here

- 초보자는 먼저 `docs/setup/PROJECT_STATUS_FOR_BEGINNER.md`를 보면 된다. 이 문서는 현재 버전, 작업 브랜치, 백업 기준, 실제 사이트 반영 여부, 쉬운 Codex 요청 문장을 1-2분 안에 읽을 수 있게 정리한다.
- `branch` = 작업 줄기, `HEAD` = 현재 코드 기준점, `rollback` = 이전 상태로 되돌리기, `backup branch` = 되돌리기용 책갈피, `dirty state` = 아직 정리되지 않은 변경사항.
- 이번 `v0.2.30`은 `/admin/prices` 직접 입력표를 고객 화면 메인 시세표와 같은 품목명, 순서, `내가 살 때 / 내가 팔 때` 배열로 맞춘 작업이다. 관리자가 현재 공개가, 새 입력값, 차액, 노출, 비고를 같은 행/칸에서 보며 어떤 고객-facing 가격을 바꾸는지 즉시 알 수 있게 했고, 빈 가격 저장을 막는 native 숫자 입력 guard도 추가했다. 검색 노출/noindex release, 결제/카드 입력, 결제/장바구니, 실시간 거래, SMS 발송, Kakao credential, OpenAI key/env 값, Supabase schema, 실제 제품 가격/데이터, 실제 KRX API 호출은 바꾸지 않는다.
- 이전 `v0.2.29`는 Junyoung이 준 KCG 골드바 참고 폴더를 원본 그대로 쓰지 않고, 골드바 문양·크기·라인업 느낌을 바탕으로 새 생성 WebP 3종을 만들어 홈 배너, 상품 hero/promo, 골드바 상품 대표 이미지에 연결한 작업이다. 이미지는 repo/public에 생성 대표 자산으로 들어갔지만 raw KakaoTalk 원본은 복사하지 않았고, 실제 상품사진/포장/재고/최종 제품 증거로 확정하지 않았다.
- 되돌릴 때는 "v0.2.30 전으로 되돌려줘", "v0.2.29 전으로 되돌려줘", "v0.2.28 대표 이미지 안내 전으로 되돌려줘", "v0.2.27 이미지 replacement map 전으로 되돌려줘", "v0.2.26 이미지 intake guardrail 전으로 되돌려줘", "v0.2.25 모바일 이미지 근거 전으로 되돌려줘", "v0.2.24 이미지 확인 필터 전으로 되돌려줘", "v0.2.23 운영 상태 구분 전으로 되돌려줘", "v0.2.22 이미지 성격 전으로 되돌려줘", 또는 "v0.2.18 상담 도우미 전으로 되돌려줘"라고 말하면 된다.

Junyoung's current preferred workflow is local-first. Codex Cloud is not the default right now because it has been inconvenient and unreliable for current KCG work. Keep Cloud docs as a future option and use `docs/setup/CLOUD_ONLY_WORKFLOW.md` only when junyoung explicitly asks for Codex Cloud or wants to avoid computer-specific setup.

If the old KCG project chat disappears from the Codex app UI, do not treat that as lost project state. Continue from this repo and read `docs/setup/MISSING_CHAT_RECOVERY.md` for the recovered local session file, E: backup locations, and no-secret backup path.

## Current Version Snapshot

- Current KCG site version: `v0.2.30`
- Latest change: `Admin price input lineup parity`
- Previous snapshot text retained for source-audit continuity: Current KCG site version: `v0.2.29`; Latest change: `Generated KCG gold-bar representative assets`.
- Previous snapshot text retained for source-audit continuity: Current KCG site version: `v0.2.28`; Latest change: `Public catalog representative-image clarity`.
- Previous snapshot text retained for source-audit continuity: Current KCG site version: `v0.2.27`; Latest change: `Product image replacement map QA`.
- Previous snapshot text retained for source-audit continuity: Current KCG site version: `v0.2.26`; Latest change: `KCG image intake guardrail QA`.
- Local check URL: `http://127.0.0.1:3300`
- Reflection status: `v0.2.30` makes `/admin/prices` safer for price operators by rebuilding the direct-entry table with the same row names/order and `내가 살 때 / 내가 팔 때` columns as the public price lineup. `KCG-TODO-082` records the done admin price input parity pass, and `docs/setup/QA_LAUNCH_REVIEW_2026-05-08.md` records the rendered launch-candidate findings. Earlier Reflection status: `v0.2.29` applies generated KCG-style gold-bar representative assets to the home banner/social image, `/products` hero/promo, and gold-bar product images while keeping `상담용 대표 이미지`, raw KakaoTalk filename blocking, and real-photo approval boundaries. Earlier Reflection status: `v0.2.28` makes the public catalog safer before real-photo approval: `/products` and `/products/[slug]` now clarify `상담용 대표 이미지` and keep actual product photo, packaging, stock, crop, and final-use decisions blocked. Earlier Reflection status: `v0.2.27` maps current public product image usage to approval-required KCG gold-bar candidate groups in `docs/brand/product-image-replacement-map-2026-05-08.md`, while still making raw filename safety executable audit requirements. Earlier Reflection status: `v0.2.26` makes KCG image replacement safer before public use: `docs/brand/kcg-image-intake-2026-05-08.md` classifies the new KCG logo/gold-bar files as candidates, and `npm run audit:site` blocks raw KakaoTalk filenames from being dropped anywhere under the served `public` tree. `v0.2.25` makes `/admin/products` safer on mobile: image follow-up status is visible inside each product-name row summary, and `npm run screenshot:admin` now captures `admin-products-mobile.png` in addition to the desktop product screenshot. `v0.2.24` makes `/admin/products` safer for image follow-up work: operators can filter the product list by `실사진 확인`, `교체 대상`, `권한 검증`, and `이미지 없음` before replacing representative/generated or placeholder assets. `v0.2.23` makes `/admin/launch` safer for release/status ownership by separating `소스 QA`, `라이브 리뷰 반영`, and `공개 검색 런칭` under `운영 상태 구분`. `v0.2.22` makes `/admin/products` show image provenance as `이미지 성격` with `대표/생성` plus `실사진 확인 필요`. By explicit junyoung instruction on 2026-05-08 KST, the existing personal Vercel Hobby project `junyoung8753-2361s-projects/kcg-confirm-preview` is restored as the temporary free deployment path until company transfer is practical. Company Vercel/Supabase transfer remains a separate ownership task.
- 실제 사이트 화면이 바뀌는 것: 이번 `v0.2.30`에서는 source 기준 `/admin/prices` 직접 입력표가 고객 화면의 시세표와 같은 품목명, 순서, 살 때/팔 때 배열로 보인다. 각 입력 칸은 현재 공개가, 새 입력값, 차액, 노출, 비고를 같은 칸에서 보여주고, 가격 입력칸은 `required/min=1/step=1` native guard로 빈 값 저장을 막는다. 이전 `v0.2.29`에서는 source 기준 홈 첫 배너, `/products` hero/promo, 골드바 상품 카드/상세 대표 이미지가 새 생성 골드바 WebP로 보인다. 이미지는 계속 `상담용 대표 이미지`이고 실제 상품사진·포장·재고 증거가 아니다. 이전 source 기준으로는 `/products` 목록과 상품 상세에 `상담용 대표 이미지` 안내가 보이고, KCG 이미지 폴더는 `metadata and visual review only`로 기록된다. `/admin/products` 모바일 행에는 이미지 후속 확인 상태가 보이고, `npm run screenshot:admin`은 `admin-products-mobile.png`도 남긴다. `/admin/products`에는 `이미지 확인 필터`가 추가되어 `실사진 확인`, `교체 대상`, `권한 검증`, `이미지 없음` 상품을 좁혀 볼 수 있다. `/admin/launch`에는 `운영 상태 구분` 패널이 추가되어 source QA, live review 반영, public search launch를 분리해서 볼 수 있다. `/admin/products` 상품 목록의 `이미지` 컬럼은 `이미지 성격`으로 바뀌고, 현재 대표/생성 이미지와 교체 필요 상태를 직원이 구분할 수 있다. `/admin/launch`의 세부 항목 `공개 승인`은 `v0.2.21`부터 `공개 승인 게이트`로 바뀌고, 공개 검색 승인 env가 없을 때 `확인 필요`로 표시된다. `v0.2.20` source에는 공개 승인 checklist의 `KCG_PUBLIC_SEARCH_APPROVED=1` 단계와 admin product form label `상담 기준 공임`도 포함된다. `v0.2.18` source에는 데스크톱 오른쪽 하단 `상담 도우미` 버튼, 모바일 하단 고정 CTA의 `상담` 버튼, and the dialog they open도 포함되어 있다.
- 실제 사이트 화면은 아직 안 바뀌고, source 기준만 바뀐 것: `/api/health` search approval fields, `npm run check:release-state`, OpenAI API key, SMS staff alert provider, official Kakao channel URL, and KRX/Koscom approval/contract steps are prepared only as later user-only/provider steps.
- 배포된 것: `v0.2.30`이 기존 personal Hobby Vercel project `kcg-confirm-preview`로 production review deployed 됐다. Current deployment id: `dpl_8hTZ3f1pLu3nnoN4W48F2KMA8Lyb`; aliases include `https://kcgold.co.kr`, `https://www.kcgold.co.kr`, and `https://kcg-confirm-preview.vercel.app`. 이 deploy는 noindex-protected review publication이며 search launch가 아니다. 이전 `v0.2.29`도 같은 temporary free deploy path로 배포됐었다.
- 아직 배포 안 된 것: 기존 Vercel project transfer, 기존 Supabase project transfer, final admin secret rotation, 검색 노출/noindex 해제, 실제 상품 운영자료 확정, 유료 서버/API 결제, KRX approval/API key/env entry.
- 고객에게 보여줘도 되는 것: noindex-protected live `kcgold.co.kr` review site. Search exposure remains blocked.
- 아직 내부 기준/계획일 뿐인 것: OpenAI API key/billing, Kakao official channel URL, SMS provider contract/key, KRX/Koscom approval result, final KRX attribution wording, KRX public/commercial display scope, KCG image intake approval/crop/final-use decision, product image replacement map approval decisions, real product/store/staff photography replacement, final product prices/공임/판매정책, final admin secret rotation, search launch approval, actual Vercel/Supabase/GitHub/Cafe24 ownership transfer completion, company card entry only when paid server/API billing is needed, optional Workspace/custom-domain mail purchase.
- Latest QA: `v0.2.30` local QA passed (`lint`, `typecheck`, `audit:site`, `build`, `test:site`, `screenshot:site`, `screenshot:admin`, `qa:site`, `npm audit`, and `git diff --check` with Windows line-ending warnings only). Source-only `npm run audit:site` passed with `1590 checks, 1 skipped`; `npm run qa:site` passed with rendered audit `1650 checks, 0 skipped` and Playwright `25 passed`; admin rendered proof shows `/admin/prices` direct-entry headers as `품목 / 내가 살 때 (VAT포함) / 내가 팔 때 (현장 기준)` with no document-level horizontal overflow. Production deploy verification also passed on the restored personal Vercel free path: `npx vercel whoami` reports `junyoung8753-2361`, `npx vercel project inspect kcg-confirm-preview` finds project `prj_lqsFijkBcN7BAadaGygNlWy416W0`, `npx vercel inspect https://kcgold.co.kr/` reports deployment `dpl_8hTZ3f1pLu3nnoN4W48F2KMA8Lyb` ready and aliased, `npm run check:release-state` passes with search exposure guarded, `npm run check:external -- --strict-domain` passes, live `SITE_AUDIT_URL=https://kcgold.co.kr npm run audit:site` passes with `1650 checks, 0 skipped`, and live `SITE_AUDIT_URL=https://kcgold.co.kr npm run test:site` passes with `25 passed`. Previous `v0.2.29` local QA passed (`lint`, `typecheck`, `audit:site`, `build`, `test:site`, `npm audit`, `screenshot:site`, `screenshot:admin`, and `qa:site` with rendered audit `1603 checks, 0 skipped`).
- Change ledger: `docs/setup/CHANGELOG.md`
- Broader rollback bookmark: `backup/pre-v0.2.4-operations-product-audit`
- Rollback phrase: `v0.2.30 전으로 되돌려줘`

## Current Source Of Truth

- GitHub repo: `junyoung8753/kcg-site`
- Private company knowledge repo: `junyoung8753/kcg-company-knowledge` (private). Use it for broader KCG company context when the current workspace is authorized, but keep internal notes, sensitive originals, customer data, credentials, and unapproved private material out of this public-style site repo.
- Current local working branch: `codex/kcg-launch-readiness-catalog-20260427`
- Base branch: `main`
- Vercel project: `kcg-confirm-preview`
- Continue KCG work on `codex/kcg-launch-readiness-catalog-20260427`. Do not switch to `main` for the current production candidate until this branch is intentionally reviewed and merged.
- Repository visibility decision as of 2026-04-27 KST: keep `junyoung8753/kcg-site` public for now. Revisit before adding private production data, confidential business copy, customer material, or admin-sensitive details.
- Stable review domain: `https://kcg-confirm-preview.vercel.app`
- Junyoung stated on 2026-05-06 KST that KCG site changes should be deployed by default so he can review live and roll back if needed. On 2026-05-08 KST he explicitly restored the existing personal Vercel Hobby project as the temporary free deploy path. Continue to push/deploy completed, verified KCG site changes through `kcg-confirm-preview` unless a higher-risk boundary applies. This does not approve robots/noindex release, search indexing, payments, checkout/cart, live trading, secret changes, or irreversible infrastructure changes.
- The historical source site exists in the company Codex environment. Do not treat the stable review URL as an older source to restore unless junyoung explicitly asks.
- Company scope confirmed by junyoung on 2026-04-27 KST: KCG handles 순금·고금 매입, 순금/골드바 판매, B2C 전화 문의·거래 상담, and B2B 대량·기업 상담. Treat the site as a consultation-first gold exchange, not a checkout mall or securities/trading service.
- Current image source folder: `C:\Users\junyo\Documents\File-Hub\30_Media\Images`. Junyoung also noted gold-bar images and the KCG logo under `C:\Users\junyo\Documents\File-Hub\30_Media\Images\KCG 이미지` for future approved use. The current intake record is `docs/brand/kcg-image-intake-2026-05-08.md`; it is metadata and visual review only, says no raw source files were copied into public, and requires approval before any real-photo public replacement. `v0.2.29` generated separate representative WebP assets from that visual direction; see `docs/brand/generated-goldbar-assets-2026-05-08.md`. Use only approved brand/product assets from these folders; do not copy contract, address, signature, or other private document photos into the repo.

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
- `docs/quality/existing-api-integration-audit-2026-05-05.md` records the current API/data inventory: Gold API, optional Metals.Dev path, Google News RSS-style headlines, TradingView official widget, Supabase storage, Vercel Cron auto-price endpoint, and external status-check scripts. It classifies already-connected API behavior as P0/P1 current-site QA and keeps new/paid/advanced external integrations in P2 or blocked scope.
- `docs/quality/official-docs-index.md` records the official OpenAI/Codex, Next.js, Tailwind, Playwright, Vercel, Supabase, and market-data docs to re-check before changing fast-moving site-production behavior.
- `code_review.md` is the KCG-specific Codex review checklist for price hierarchy, mobile first viewport, consultation conversion, source boundaries, launch gates, and screenshot evidence.
- `.agents/skills/kcg-site-quality/SKILL.md` is the repo-local skill for both KCG site project-room environment upkeep and user-requested site artifact work. It must first distinguish setup/latest-guidance work from actual rendered site work.
- `npm run qa:site` is the full local KCG quality gate. It runs source audit and rendered audit; rendered audit must finish with `0 skipped` checks before claiming rendered-route completeness.
- `npm run screenshot:admin` is the dedicated admin evidence command. It captures `/admin`, `/admin/launch`, `/admin/prices`, `/admin/announcements`, and `/admin/products` only, using the same screenshot helper as the public site without refreshing public screenshots.
- `docs/setup/OPEN_TASKS.md` is the active KCG task ledger. Use it to separate Codex-doable work, blocked work, and junyoung-only public-launch actions. Run `npm run tasks:dashboard` to render the local browser dashboard at `output/kcg-open-tasks.html`.
- `npm run check:external` is the quick reconnect/status check for the stable URL, robots/noindex posture, empty pre-launch sitemap, and Cafe24 DNS A-record state. It does not read or store secrets.
- `docs/research/gold-exchange-deep-audit-2026-04-27.md` records the deeper competitor benchmark pass across home, subpages, price wording, forms, tables, and network/API/chart behavior. Do not treat a home-screen-only review as sufficient for benchmark-driven work.
- `/option-1` and `/option-2` have been removed from the app. The audit and Playwright tests now expect those routes to return 404.
- The old source comparison script has been removed from the default workflow because the repo is now the accepted baseline.
- The home campaign slider must remain a full-bleed visual surface. On desktop, the company price table belongs as a left-side overlay on top of the full-width campaign image, with a visible left image margin and a narrower dark lineup-panel ratio inspired by major Korean gold-exchange sites. The image must still span the viewport and must not shrink into a right-side half-width banner. On mobile/tablet, preserve price readability over strict overlay behavior.
- The current public image set uses 2026-04-27, 2026-04-30, 2026-05-03, 2026-05-06, and 2026-05-08 generated assets under `public/campaign`, `public/products`, `public/company`, and `public/services`. Public UI references optimized `.webp` versions for generated assets while source originals stay in File-Hub and repo review folders keep candidates/contact sheets. The home carousel now starts with `kcg-generated-goldbar-banner-20260508.webp`, then uses `kcg-home-human-consultation-20260506.webp`, `kcg-home-seoul-retail-20260506.webp`, and `kcg-old-gold-process-20260506.webp`. Gold-bar product/catalog surfaces use `kcg-generated-goldbar-lineup-20260508.webp`, `kcg-generated-goldbar-detail-20260508.webp`, and `kcg-generated-goldbar-banner-20260508.webp` as representative imagery. Other category surfaces still distribute approved placeholders by slug across `kcg-product-gold-silver-catalog-20260503.webp`, `kcg-home-product-keyvisual-20260503.webp`, `kcg-silver-gift-20260427-v2.jpg`, `kcg-product-pure-gold-gifts-20260506.webp`, `kcg-pure-gold-products-20260427-v2.jpg`, `kcg-old-gold-process-20260506.webp`, `kcg-product-jewelry-buying-20260503.webp`, `kcg-jewelry-buying-tray-20260430.webp`, `kcg-b2b-gift-packaging-20260430.webp`, `kcg-product-b2b-consulting-20260503.webp`, and `kcg-product-corporate-consulting-20260506.webp`. Known placeholder image URLs stored in product data are remapped by slug on the public site so existing Supabase rows do not force repeated catalog cards; custom non-placeholder admin image URLs are still preserved. Existing 2026-04-27/2026-04-30/2026-05-03 images remain available for comparison under `public/image-options/2026-05-03`; the v0.2.10 originals, optimized WebPs, contact sheet, and manifest are under `public/image-options/2026-05-06/generated`. File-Hub preserved source originals are under `C:\Users\junyo\Documents\File-Hub\30_Media\Images\AI generated\KCG\2026-05-06-visual-guidance-refresh`, and the v0.2.29 generated-asset provenance is in `docs/brand/generated-goldbar-assets-2026-05-08.md`.
- Competitor sites may be used for structure, hierarchy, category grouping, CTA placement, and visual grammar. Do not copy competitor-owned images, prices, slogans, detailed copy, logos, staff/model photos, internal API endpoints, or scraped data into KCG.
- `/products` is now the public consultation catalog surface. It is intentionally not a checkout/cart mall: price wording, product photos, display order, visibility, and consultation notes can be managed through the product model/admin flow, while public copy keeps phone inquiry and trade consultation as the conversion path.
- The baseline product catalog now uses a tabbed `상품/매입` structure: `전체`, `골드바`, `실버바`, `순금제품`, `고금·주얼리 매입`, and `B2B·기업`. Product cards may show current posted-price reference calculations, but they must remain inquiry-first and must not behave like checkout, payment, live trading, or guaranteed quote flow.
- Product data now has a shared repo contract across mock data, Supabase schema/seed, public pages, and admin editing. Keep product statuses limited to `active`, `inquiry_required`, and `hidden` unless a real operational need appears.
- Public business-registration wording now uses the supplied business registration document: `505-88-03567`, `주식회사 한국센터금거래소`, `대표이사 홍연호`, and the registered address at `서울특별시 종로구 서순라길 17, 1층 6호 (봉익동, 성창빌딩)`. Public labels should say `대표이사`, not `대표` or `대표자`, when referring to the person. Search indexing remains blocked until a separate public-launch approval.
- Public contact labels and family links were normalized on 2026-04-30 KST: the site uses 본사 전화 `02-747-1807` and 매장 전화 `02-747-1806`; old public phone `02-747-1802` must not reappear; location cards are titled `본사` and `매장` while keeping full building names only inside the detailed addresses. Family links include KC Lab Grown Diamond, 다비스 다이아몬드, 다이아민족, KCG 네이버 블로그, and 다비스 다이아몬드 블로그.
- Company mission and `한국센터금거래소(KCG) 회사소개` copy came from the boss-written text supplied by junyoung. When using that content publicly, do not polish, rewrite, or normalize the boss-written wording. The current public company page uses the latest KCG company-introduction text verbatim, including the provided KC Group ranking phrases, while still excluding unrelated internal notes, Bible verse text, future opening targets, newspaper/YouTube plans, private document images, and other non-public material.
- `/admin/launch` is the launch-readiness dashboard. It checks legal placeholders, domain, search exposure, admin auth, storage, and launch approval status. Keep this route updated when adding launch-critical behavior.
- Search exposure must use `canExposeToSearch()` rather than raw production/noindex state. As of `v0.2.21`, it requires explicit `KCG_PUBLIC_SEARCH_APPROVED=1` in addition to final domain, confirmed legal information, production deployment, and no forced noindex, so missing approval keeps robots/sitemap blocked; `/admin/launch` shows the approval detail as `공개 승인 게이트` and keeps it review-needed until the full search exposure state is enabled.
- Keep search blocking/noindex until public launch approval.
- Current launch-prep boundary: Cafe24 DNS, Vercel custom domains, HTTPS, and Supabase production storage are connected. Do not remove robots/noindex, enable search indexing, publish launch announcements, or treat this as final public launch approval until junyoung explicitly approves after final legal display, product prices/photos, operating copy, and final admin secret rotation are confirmed.
- Safe pre-launch work includes verified deploys to the existing live review domains, route/UI/content polish, admin launch-readiness checks, product/catalog preparation, source-attribution/data-safety work, and documentation. It still excludes search/noindex release, payment/trading behavior, secret/env changes, new DNS/domain policy changes, and hard-to-reverse infrastructure changes unless junyoung explicitly approves them.

## Public Launch Terms

- Production deploy: a Vercel production deployment that can affect production URLs or custom domains.
- Stable alias change: changing a fixed review/live URL to point at a specific deployment rather than an ephemeral preview URL.
- `kcgold.co.kr` domain cutover: `kcgold.co.kr` and `www.kcgold.co.kr` are added to Vercel, Cafe24 DNS A records point both domains to `76.76.21.21`, and HTTPS works for both domains. Preserve existing MX/TXT/SPF/DKIM records and change no other DNS records unless a later provider requires it. Keep robots/noindex blocked.
- Robots/noindex removal: allowing search engines to index the site. Current code keeps this blocked unless production, final domain, confirmed legal information, and no forced noindex all pass.

## External Services Runbook

- `docs/setup/DOMAIN_SUPABASE_MARKET_RUNBOOK.md` is the current runbook for Cafe24/Vercel domain connection, Supabase setup, Gold API/Metals.Dev/KRX decisions, TradingView widget boundaries, and post-connection verification.
- `docs/setup/AUTO_PRICE_OPERATIONS_BRIEF.md` is the plain-language operations brief for explaining automatic KCG posted-price checks, Gold API/Metals.Dev reference data, Vercel Hobby Cron limits, Vercel Pro/external scheduler options, and why competitor scraping is not part of the implementation.
- `docs/setup/KRX_API_APPROVAL_RUNBOOK.md` is the no-secret approval-first runbook for KRX/Koscom gold-market data. It records official source links, `kcgoldx@gmail.com` application guidance, safe use-purpose wording, user-only approval steps, and the rule that KRX stays guarded to fallback until approval scope is known.
- `docs/setup/COMPANY_ACCOUNT_MIGRATION_RUNBOOK.md` is the no-secret runbook for moving KCG operations from junyoung's personal accounts to company-owned accounts using `kcgoldx@gmail.com` as the permanent representative Gmail. Current practical deploy mode is temporary personal-Hobby deployment through `junyoung8753-2361s-projects/kcg-confirm-preview` for free review deploys; company Vercel/Supabase ownership transfer remains a later blocked/shared task. `docs/setup/KCG_ACCOUNT_OWNERSHIP_CHECKLIST.md` tracks service ownership, recovery method type, billing status, transfer readiness, and paid-service deferrals without secrets. Google Workspace / `admin@kcgold.co.kr` is optional later domain-mail work, not the default migration path.
- Default market data remains `MARKET_DATA_PROVIDER=auto` with no `METALS_DEV_API_KEY`, which means Gold API free current reference prices are used before fallback data. Do not pay for Metals.Dev until bid/ask, history charts, quota, or reliability justify it. TradingView is used only through its official embeddable widget for chart context; keep attribution visible and do not extract the widget data into KCG tables or storage.
- KRX Open API has 금시장 일별매매정보, but KRX usage terms and market-data distribution rules must be confirmed before public commercial display. Do not mix KRX values into KCG posted prices or "실시간 참고시세" until approval/contract scope is clear. `MARKET_DATA_PROVIDER=krx`, `krx-open-api`, `krx-openapi`, and `koscom` are guarded to fallback before approval.
- Supabase production data now uses the checked-in `supabase/schema.sql` and `supabase/seed.sql`. Vercel production env has the public Supabase URL and server-only key set only through dashboard/CLI secret flows. Do not commit or paste service-role/secret keys.
- `docs/brand/campaign-image-prompts.md` holds the KCG image policy, current candidate notes, and ChatGPT/Gemini prompt set for campaign, product, service, B2B, and visit-guide images. It now rejects generic beige consultation-room hero images, heavy white haze over the hero image, and large HTML marketing copy on top of the image; it prefers a large product-scale commercial key visual. It intentionally avoids instructions about price-table placement, empty space, black boxes, or UI overlays.

## Stable Review Deploy Boundary

- Junyoung has approved deploying completed, verified KCG site changes by default so he can review live and request rollback if needed.
- This is not approval for robots/noindex release, search indexing, payment/trading behavior, secret/env changes, or hard-to-reverse infrastructure changes. Cafe24 DNS/account login/MFA steps remain human-only.
- Treat a Vercel deploy as review publication only; do not treat it as public search-launch approval.
- Last stable review refresh: 2026-05-05 KST, refreshed after `v0.2.2` expert-panel QA/admin evidence hardening and aliased to `https://kcg-confirm-preview.vercel.app`, `https://kcgold.co.kr`, and `https://www.kcgold.co.kr`. Use `npx vercel inspect https://kcgold.co.kr/` for the current deployment id.
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

2026-05-03 KST admin auto-fill/UX pass: `/admin/prices` was rebuilt as a price-desk workflow with a compact posted-price table, auto-fill settings, draft comparison, apply/reject actions, and source links for human reference only. Auto-fill uses allowed market-reference providers plus deterministic KCG formulas; it does not scrape competitor prices and does not use random offsets. New Supabase schema tables `price_auto_settings` and `price_auto_suggestions` are checked in, plus API routes `/api/admin/price-auto-refresh` and `/api/admin/price-auto-apply`. Vercel production now has a `CRON_SECRET` env var for cron authorization; the value is not stored in the repo. Because the current Vercel account is on Hobby, the checked-in Vercel Cron schedule is the deployable once-daily `0 0 * * *` schedule, which runs around 09:00 KST; the admin UI can still store 1-hour/2-hour operating preferences, but actual 2-hour cron requires Vercel Pro or an external scheduler. `/admin`, `/admin/products`, and `/admin/announcements` were tightened into more practical operation screens. The production Supabase schema was then applied through the logged-in Supabase SQL Editor in project `ehmsqlfxxydnebzjfarr`: `supabase/schema.sql` returned `Success. No rows returned`, `price_auto_settings` has the default row `default / false / gold-api / 2 / draft / 100 / 관리자`, and `price_auto_suggestions` exists. Search/noindex blocking remains active.

2026-05-03 KST admin automatic-publish refinement: `/admin/prices` no longer presents "자동시세 ON" as a draft-only workflow. ON now means the cron/manual check runs KCG formulas and, when source data is usable, the configured interval is due, the change is at least the minimum apply amount, and every item stays under the auto-publish change threshold, it writes the company posted prices automatically with a saved suggestion and `price_history` record. OFF shows the manual price table immediately, and the ON/OFF switch changes the screen immediately while persistence is saved separately when needed. The confusing `최대 자동 변동률` label was replaced by `자동 게시 허용 변동폭`, plus `최소 반영 금액`, `확인 주기`, and `영업시간만 반영`. The schema now includes `check_interval_minutes`, `min_apply_change_won`, `max_auto_publish_change_percent`, `business_hours_only`, `last_checked_at`, and `last_auto_applied_at`. Junyoung completed Supabase CLI login on this PC, `npx supabase link --project-ref ehmsqlfxxydnebzjfarr` succeeded, and `npx supabase db query --linked -f supabase/schema.sql` applied the updated schema. A follow-up information-schema query confirmed all six new `price_auto_settings` columns exist. Subsequent detail queries temporarily hit Supabase pooler `ECIRCUITBREAKER` after repeated CLI authentication attempts, so wait before re-running row-level checks or use the dashboard SQL Editor if immediate verification is needed. The existing Hobby-plan Vercel Cron schedule in `vercel.json` remains daily to avoid deployment failure; 30-minute/1-hour automation requires Vercel Pro or an external scheduler calling `/api/admin/price-auto-refresh` with `CRON_SECRET`. Verification passed after this refinement: `npm run lint`, `npm run typecheck`, `npm run audit:site`, `npm run tasks:dashboard`, `npm run build`, `npm run test:site`, `npm run screenshot:site`, `npm audit --audit-level=moderate`, and `git diff --check`; admin auto-mode evidence is `output/screenshots/admin-prices-auto-desktop.png`.

2026-05-04 KST admin auto-switch follow-up: the `/admin/prices` mode control was changed from two side-by-side buttons to one explicit ON/OFF switch so the visible state cannot read as both active and inactive. The screenshot helper now asserts that the switch has `aria-pressed="true"` before capturing `admin-prices-auto-desktop.png`, and the Playwright test checks both ON and OFF state text. Supabase row-level verification now succeeds through the CLI. The default `price_auto_settings` row exists with `source=gold-api`, `mode=manual_review`, `is_enabled=false`, `check_interval_minutes=60`, `min_apply_change_won=500`, `max_auto_publish_change_percent=0.05`, and `business_hours_only=true`; there are existing `price_auto_suggestions` rows. This keeps automatic posting off until an operator deliberately turns it on in admin.

2026-05-03 KST image refresh pass: six new text-free generated assets were created with the built-in image tool, source originals were copied from `C:\Users\junyo\.codex\generated_images` to File-Hub, and optimized public `.webp` assets were committed for site use. Home, social preview, services, about/company, product promo rail, product fallbacks, mock products, and Supabase seed references were updated. `kcg-silver-gift-20260427-v2.jpg` is intentionally retained for silver-bar cards to avoid showing the same gold/silver image twice in the home category grid. After junyoung pointed out that this still repeated too much of the gold-bar/gloves/envelope/scale formula, a second non-applied selection set was created under `public/image-options/2026-05-03/diverse-banner-directions` with eight genuinely different banner directions: 제품 미니멀, 매장 분위기, 금고/보관 신뢰감, 종로형 매장 외부, 금속 매크로, 그래픽 포스터형, 상담 테이블, and 실버 중심 대비. Review notes are in `docs/brand/image-review-2026-05-03.md`; source PNGs are preserved outside the repo at `C:\Users\junyo\Documents\File-Hub\30_Media\Images\AI generated\KCG\2026-05-03-image-refresh` and `C:\Users\junyo\Documents\File-Hub\30_Media\Images\AI generated\KCG\2026-05-03-diverse-banner-directions`. Verification passed: `npm run audit:site`, `npm run lint`, `npm run typecheck`, `npm run tasks:dashboard`, `npm run build`, `npm run test:site`, `npm run screenshot:site`, `npm audit --audit-level=moderate`, and `git diff --check` with line-ending warnings only. Mobile and desktop screenshots were visually inspected for home, products, services, and company.

2026-05-04 KST Codex quality-environment pass: KCG site work now has a repo-local `kcg-site-quality` skill, KCG-specific `code_review.md`, official-docs index, `npm run audit:rendered`, `npm run qa:site`, rendered-audit helper, one-command QA helper, viewport screenshots, and a fixed-header/mobile bottom CTA first-viewport guard. `scripts/capture-site-screenshots.mjs` now writes `home-mobile-viewport.png`, `home-desktop-viewport.png`, `prices-mobile-viewport.png`, `products-mobile-viewport.png`, and `services-mobile-viewport.png` in addition to the existing full-page artifacts. Verification passed: parser checks, skill validation with UTF-8 mode, `npm run audit:site`, `npm run qa:site` with rendered audit `896 checks, 0 skipped`, Playwright `18 passed`, screenshot regeneration, and `npm audit --audit-level=moderate`. Viewport screenshots for home mobile/desktop, prices mobile, products mobile, and services mobile were visually inspected; the first-viewport chrome guard showed no sticky header or mobile bottom CTA coverage of key decision content.

2026-05-04 KST project-room environment realignment: the weekly Codex app automation is now named `KCG 사이트 작업환경 토요일 최신화 점검`. It is not a scheduled artifact review or UI-polish job. It should keep this room's Codex-facing setup current: `AGENTS.md`, `code_review.md`, repo-local skill, official-doc references, expert-role model, tool/plugin routing, QA command catalog, and handoff/read order. It must not run recurring site verification, review screenshot artifacts as product review, edit source/content/assets, deploy, remove noindex, read secrets, change admin credentials, or enable search exposure unless junyoung explicitly asks for site work in this project room.

2026-05-03 KST local Claude/VS Code cleanup: the untracked project helper files `.claude/settings.json`, `.vscode/settings.json`, and `kcg-site.code-workspace` were backed up to `C:\Users\junyo\Documents\Codex\system-setup-backups\2026-05-03-035755-kcg-project-claude-vscode-cleanup` and cleaned so this repo no longer recommends the VS Code Claude extension or sets `claudeCode.preferredLocation`. Claude CLI project permissions are kept for occasional use but are read/test-heavy by default; git writes, Supabase, Vercel env/deploy/alias/logs, and publishing commands are ask-gated. The JSON files parse successfully. `CLAUDE.md` remains as a thin `@AGENTS.md` bridge for CLI use.

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
4. For full launch-candidate confidence, run:

   ```powershell
   npm run qa:site
   ```

5. For narrower code changes, run:

   ```powershell
   npm run lint
   npm run typecheck
   npm run audit:site
   npm run build
   npm run test:site
   npm audit --audit-level=moderate
   ```

6. For visual changes, also run:

   ```powershell
   npm run screenshot:site
   ```

7. Inspect at least one mobile screenshot of `/` and the relevant `*-viewport.png` first-viewport screenshot before claiming visual completion.

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
KCG 사이트 작업 이어가자. 이 repo의 AGENTS.md, docs/setup/CURRENT_HANDOFF.md, docs/quality/product-experience-rubric.md, docs/quality/data-source-compliance.md, docs/quality/ai-site-production-playbook.md를 먼저 읽고, 접근 권한이 있으면 private repo junyoung8753/kcg-company-knowledge의 README.md, ops/local-first-workflow.md, company/identity.md, company/business-rules.md, pricing/posted-price-policy.md, projects/kcg-site.md도 회사 맥락으로 참고해줘. 현재 repo를 단일 오픈 후보 기준으로 점검하고, 내부자료는 public-safe subset만 site repo에 반영해. API/RSS/차트/폼/경쟁사 참고는 출처와 약관 기준을 지켜. 검증된 KCG 사이트 변경은 live review를 위해 배포까지 진행하되, old option route 복구, 검색 색인 허용/noindex 해제, 결제/거래, secret/env 변경, 새 DNS/도메인 정책 변경은 내가 명확히 승인하기 전에는 하지 마.
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
- Deploy completed, verified KCG site changes by default for live review, but do not change search/noindex, payment/trading behavior, secrets/env, or hard-to-reverse infrastructure without explicit approval.
- Keep company posted prices separate from automatic market-reference data.
- Keep `/` as the single public home surface.
