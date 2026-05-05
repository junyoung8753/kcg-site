# KCG Changelog

This file is the public-site change ledger for KCG launch-candidate work. Use it to explain what changed, where it is reflected, how it was verified, and how to ask Codex to roll it back.

Versioning rule before public launch: `0.x.x`.

- Major: reserved for post-launch breaking product or infrastructure shifts.
- Minor: visible workflow, page structure, QA system, data model, or admin operation changes.
- Patch: small copy, style, guardrail, or bug fixes that do not change the site direction.

## v0.2.6 - Expert panel deep QA public and admin polish

- Date: `2026-05-05 KST`
- Commit: committed after final verification; exact hash is available from `git log -1 --oneline`. Work-before HEAD `c161f74`.
- Deploy Status: this version contains real public/admin UI changes and is intended for `https://kcgold.co.kr`, `https://www.kcgold.co.kr`, and `https://kcg-confirm-preview.vercel.app` production refresh after verification. Search indexing/noindex release is not included.
- 사람이 읽는 요약: 전문가 패널 QA에서 실제로 보인 화면 문제를 줄인 버전입니다. 홈 시세표가 한 화면 안에 더 안정적으로 들어오고, 국제 현재가 표 글자가 더 읽히며, 모바일 상품/서비스 첫 화면이 덜 늘어지고, 관리자 가격 화면의 현재 공개가 라벨이 `순금 살 때/팔 때`처럼 바로 구분됩니다.
- Summary: Applied focused P1 fixes from the customer/operator/admin/mobile QA pass without changing launch/search, payment, trading, competitor scraping, or secret state.
- Changed:
  - Tightened the desktop home price-lineup panel so all posted-price rows fit in the first viewport while preserving the left overlay over the campaign image.
  - Increased market-reference table readability for international current prices and domestic conversion rows.
  - Compressed the mobile `/products` hero, catalog spacing, tab controls, and sort controls so product cards appear earlier.
  - Compressed the mobile `/services` first viewport and made the three-step transaction flow visible without excessive scrolling.
  - Clarified `/admin/prices` current public price snapshot labels: `순금 살 때`, `순금 팔 때`, `18K 팔 때`, `14K 팔 때`, `백금 살 때/팔 때`, `은 살 때/팔 때`.
  - Reworded `/admin` storage status from `Demo` to `미리보기 저장` and formatted the posted-time display consistently.
  - Made the mobile home price-panel close button hydration-safe so the first tap does not get lost on the production domain.
- 실제 사이트 반영 여부:
  - 실제 사이트 화면이 바뀐 것: 홈 시세표 크기/간격과 닫기/복구 안정성, 국제 현재가 표 가독성, 모바일 상품/서비스 첫 화면, 관리자 가격/대시보드 라벨
  - 실제 사이트 화면은 아직 안 바뀌고, 문서/기준만 바뀐 것: v0.2.6 QA 점수표와 handoff/status trace
  - 배포된 것: 최종 검증 후 production deploy 대상. 실제 deployment id는 최종 보고와 `npx vercel inspect https://kcgold.co.kr/`로 확인한다.
  - 아직 배포 안 된 것: 커밋/배포 전 로컬 working tree 상태에서는 v0.2.6 변경 전체
  - 고객에게 보여줘도 되는 것: 배포 후 `kcgold.co.kr` 화면. robots/noindex는 계속 차단 유지.
  - 아직 내부 기준/계획일 뿐인 것: 실제 상품 사진/공임/최종 판매정책/검색 노출 승인
- QA Score:
  - Public site: `9340 / 10000`
  - Admin console: `9020 / 10000`
  - Operations readiness: `8880 / 10000`
  - Weighted launch candidate: `9210 / 10000`
- Verification:
  - Passed before trace update: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run screenshot:site`, `npm run screenshot:admin`.
  - Required before completion: `npm run audit:site`, `npm run tasks:dashboard`, `npm run release:trace`, `npm run test:site`, `npm run screenshot:site`, `npm run screenshot:admin`, `npm run qa:site`, `npm audit --audit-level=moderate`, `git diff --check`.
- Rollback Hint: `v0.2.6 전으로 되돌려줘`
- Remaining User-only:
  - Provide real KCG product photos and confirm real product list, weights, 공임/margin, and which items show reference price versus inquiry.
  - Rotate the final production admin password before public search launch.
  - Decide whether automatic price checks need Vercel Pro/external scheduler beyond the free daily posture.
  - Approve robots/noindex release and search indexing only when final public launch is ready.

## v0.2.5 - Existing API integration audit

- Date: `2026-05-05 KST`
- Commit: local working tree only until explicitly committed; work-before HEAD `b3e444f`
- Deploy Status: local docs/control-plane reflected only. No production deploy, no Vercel alias change, no `kcgold.co.kr` runtime change, no GitHub push.
- 사람이 읽는 요약: 실제 사이트 화면과 API 작동 방식은 바꾸지 않고, 이미 붙어 있는 Gold API, Metals.Dev 후보 경로, Google News RSS, TradingView, Supabase, Vercel Cron 자동시세 흐름을 현재 사이트 QA 범위로 정리한 버전입니다.
- Summary: Added a dedicated audit of already-connected API/data surfaces so future QA does not mistakenly treat existing data integrations as optional later work.
- Changed:
  - Added `docs/quality/existing-api-integration-audit-2026-05-05.md` with the current API/data inventory, source hierarchy, fallback behavior, and P0/P1/P2 classification.
  - Marked `KCG-TODO-053` done because existing API behavior is now inventoried and linked from the working task ledger.
  - Updated `CURRENT_HANDOFF.md` and `PROJECT_STATUS_FOR_BEGINNER.md` so the current version, actual-site reflection status, and API-audit scope are clear.
  - Updated `audit:site` guardrails so the API audit document, source-of-truth price rule, current surfaces, and blocked competitor scraping rule remain present.
  - Updated package version trace to `0.2.5` without dependency changes.
- 실제 사이트 반영 여부:
  - 실제 사이트 화면이 바뀐 것: 없음
  - 실제 사이트 화면은 아직 안 바뀌고, 문서/기준만 바뀐 것: 기존 API 연동 감사 문서, API 위계/장애/fallback 기준, handoff/status/task trace
  - 배포된 것: 없음
  - 아직 배포 안 된 것: `v0.2.5` 문서/기준 변경
  - 고객에게 보여줘도 되는 것: 기존 배포 사이트 상태
  - 아직 내부 기준/계획일 뿐인 것: `v0.2.5` API 감리 기준과 TODO 정리
- Verification:
  - Required before completion: `npm run lint`, `npm run audit:site`, `npm run release:trace`, `npm run tasks:dashboard`, `git diff --check`, `git diff --name-only`, `git status --short --branch`.
- Rollback Hint: `v0.2.5 전으로 되돌려줘`
- Remaining User-only:
  - Decide whether to pay for Metals.Dev, Vercel Pro, or an external scheduler later.
  - Confirm final product photos, operating product list, 공임/margin, and which items show reference price versus inquiry.
  - Approve robots/noindex release and search indexing only when the site is ready for public discovery.

## v0.2.4 - Operations product-audit checklist and beginner status guide

- Date: `2026-05-05 KST`
- Commit: local working tree only until explicitly committed; work-before HEAD `b3e444f`
- Deploy Status: local docs/control-plane reflected only. No production deploy, no Vercel alias change, no `kcgold.co.kr` runtime change, no GitHub push.
- 사람이 읽는 요약: 실제 사이트 화면은 바꾸지 않고, 금거래소 운영자/직원/고객 관점으로 QA하는 기준과 초보자용 현재 상태 문서를 추가한 버전입니다.
- Summary: Added reusable operations-product audit criteria, corrected existing API priority, made homepage price disclosure a first-class QA rule, documented image/placeholder policy, and added a beginner-friendly project status guide.
- Changed:
  - Added `docs/quality/operations-product-audit-checklist.md` for technical QA, product/operations QA, business/conversion QA, existing API audit, main price disclosure priority, and image/placeholder strategy.
  - Added `docs/setup/PROJECT_STATUS_FOR_BEGINNER.md` so junyoung can see the current version, branch, rollback point, actual-site reflection status, risk labels, and copy-paste Codex request phrases.
  - Updated `CURRENT_HANDOFF.md`, `OPEN_TASKS.md`, `code_review.md`, and the repo-local KCG quality skill to point future QA toward operations-product audit, not only visual/technical QA.
  - Updated `audit:site` guardrails so the new checklist, beginner status guide, v0.2.4 trace, and image/API/price-disclosure criteria remain present.
  - Updated package version trace to `0.2.4` without dependency changes.
- 실제 사이트 반영 여부:
  - 실제 사이트 화면이 바뀐 것: 없음
  - 실제 사이트 화면은 아직 안 바뀌고, 문서/기준만 바뀐 것: 운영 감리 기준, 기존 API 감사 기준, 메인 시세고지 우선 기준, 이미지/placeholder 기준, 초보자용 상태 문서
  - 배포된 것: 없음
  - 아직 배포 안 된 것: `v0.2.4` 문서/기준 변경
  - 고객에게 보여줘도 되는 것: 기존 배포 사이트 상태
  - 아직 내부 기준/계획일 뿐인 것: `v0.2.4` 감리 기준과 TODO
- Verification:
  - Required before completion: `npm run lint`, `npm run audit:site`, `npm run release:trace`, `npm run tasks:dashboard`, `git diff --check`, `git diff --name-only`, `git status --short --branch`.
- Rollback Hint: `v0.2.4 전으로 되돌려줘`
- Remaining User-only:
  - Provide real KCG-designed gold-bar/product photos when available.
  - Confirm final product weights, margins, commissions, and public sales policy.
  - Approve any public search indexing, paid API plan, payment feature, or production-risk setting change.

## v0.2.3 - Operations product-audit QA pass

- Date: `2026-05-05 KST`
- Commit: current `HEAD` after committing this version; use `npm run release:trace` for the exact branch and commit state.
- Deploy Status: local reflected only. No production deploy, stable alias change, search-indexing change, secret change, or public-launch action was performed for this docs/skill QA-system patch.
- Summary: Extended the existing KCG quality system so future QA and improvement work checks real gold-exchange operator, staff, and customer workflows instead of stopping at technical QA or visual polish.
- Changed:
  - `docs/quality/agent-quality-system.md` now includes `Gold Exchange Operations Product Audit Pass` for meaningful admin, price, product/매입, service, customer-response, and launch-readiness work.
  - The operational pass checks where 대표/관리자, 시세 등록 직원, 고금 매입 직원, 골드바/제품 관리 직원, 고객 응대 직원, 일반 고객, and 세금/정산/장부 운영자가 would hit blockers, repeated manual work, Excel/Kakao/phone/manual-ledger fallbacks, stale-data risks, or soon-needed features.
  - `.agents/skills/kcg-site-quality/SKILL.md` now routes operational surfaces through that pass before treating visual polish as complete.
  - `docs/setup/OPEN_TASKS.md` records the completed guardrail as `KCG-TODO-051`.
  - `scripts/audit-site-fidelity.mjs` now checks `CURRENT_HANDOFF.md` against the latest package/changelog version dynamically, so the handoff cannot silently point at an older release after a version bump.
- Verification:
  - Passed: `npm run release:trace` before version bump; it correctly reported the previous uncommitted state.
  - Passed: `npm run tasks:dashboard`
  - Passed: `npm run audit:site`
  - Passed: `npm run qa:site` with rendered audit `981 checks, 0 skipped`, Playwright `19 passed`, screenshots, and npm audit `0 vulnerabilities`
  - Passed: `npm run screenshot:admin`
  - Passed: `npm run check:external -- --strict-domain`
  - Passed: `git diff --check` with line-ending warnings only
- Rollback Hint: say `v0.2.3 전으로 되돌려줘`.
- Remaining User-only:
  - Confirm final real product photos, product list, 공임/margin, and which items show reference price versus inquiry.
  - Decide whether to pay for Vercel Pro or use an external scheduler if KCG needs automatic checks more than once per day.
  - Rotate the final production admin password before public search launch.
  - Approve robots/noindex release and search indexing only when the site is ready for public discovery.

## v0.2.2 - Expert panel deep QA and admin evidence hardening

- Date: `2026-05-05 KST`
- Commit: `7d23f27`; trace status commit: `636f00d`
- Deploy Status: local reflected, pushed to `origin/codex/kcg-launch-readiness-catalog-20260427`, and production domains `https://kcgold.co.kr`, `https://www.kcgold.co.kr`, and `https://kcg-confirm-preview.vercel.app` were refreshed with this version on 2026-05-05 KST after verification. Use `npx vercel inspect https://kcgold.co.kr/` for the current deployment id.
- Summary: Converted the interrupted expert-panel QA follow-up into traceable admin evidence, product-operation, and automatic-price operation guardrails so future KCG work is easier to verify, explain, and resume.
- Changed:
  - Admin screenshot evidence can now be refreshed independently with `npm run screenshot:admin` instead of mixing private admin artifacts into every public screenshot run.
  - `scripts/capture-site-screenshots.mjs` supports `KCG_ADMIN_SCREENSHOTS_ONLY=1`, so admin QA can run without re-capturing the public site.
  - `docs/setup/PRODUCT_OPERATIONS_CHECKLIST.md` now separates launch input requirements by category: 골드바, 실버바, 순금제품, 고금·주얼리 매입, and B2B·기업.
  - `docs/setup/AUTO_PRICE_OPERATIONS_BRIEF.md` explains that automatic KCG posted prices use Gold API/Metals.Dev reference data plus KCG internal formula, not competitor scraping.
  - The operations brief records the current scheduler decision: Vercel Hobby Cron is limited to once-daily automatic checks, while 30-minute or hourly automatic checks need Vercel Pro or an external scheduler.
  - The QA report now distinguishes screen-score evidence from launch blockers and records the admin screenshot command as the repeatable proof surface.
  - Source audit now fails if the version ledger, handoff version, admin screenshot command, and automatic-price operations brief fall out of sync.
- Verification:
  - Passed: `npm run release:trace`
  - Passed: `npm run audit:site`
  - Passed: `npm run lint`
  - Passed: `npm run typecheck`
  - Passed: `npm run tasks:dashboard`
  - Passed: `npm run build`
  - Passed: `npm run test:site` with Playwright `19 passed`
  - Passed: `npm run screenshot:site`
  - Passed: `npm run screenshot:admin`
  - Passed: `npm run qa:site` with rendered audit `981 checks, 0 skipped`, Playwright `19 passed`, screenshots, and npm audit `0 vulnerabilities`
  - Passed: `npm audit --audit-level=moderate`
  - Passed: `git diff --check` with line-ending warnings only
- Rollback Hint: say `v0.2.2 전으로 되돌려줘`.
- Remaining User-only:
  - Confirm final real product photos, product list, 공임/margin, and which items show reference price versus inquiry.
  - Decide whether to pay for Vercel Pro or use an external scheduler if KCG needs automatic checks more than once per day.
  - Rotate the final production admin password before public search launch.
  - Approve robots/noindex release and search indexing only when the site is ready for public discovery.

## v0.2.1 - Release trace, market readability, and contact readiness

- Date: `2026-05-05 KST`
- Commit: `84caefe`; production QA refresh commit: `757d29d`
- Deploy Status: local reflected on `http://127.0.0.1:3300`; production domains `https://kcgold.co.kr`, `https://www.kcgold.co.kr`, and `https://kcg-confirm-preview.vercel.app` were refreshed with this version on 2026-05-05 KST after QA.
- Summary: Added a release trace report command, improved market-reference table readability, made `/company` align with the compact image-left route pattern, fixed the TradingView widget height collapse, and prepared optional `카카오톡 문의`/Naver inquiry links without showing unfinished public buttons.
- Changed:
  - `npm run release:trace` reports current version, branch, HEAD, working-tree state, deploy status, and rollback hint.
  - `국제 현재가` and domestic conversion rows use larger price/body text and calmer label spacing.
  - `/company` now follows the same compact image-left / information-right first-screen grammar as `/products`, `/services`, and `/about`.
  - TradingView widget container now has a real fixed height for autosize embedding; Playwright checks that the iframe exists, the widget is not collapsed, and the cross-origin frame contains rendered chart text/canvas content.
  - Screenshot capture now waits for the TradingView widget state before full-page captures, so QA artifacts do not record a blank chart area while the external widget is still loading.
  - `siteConfig.contact.kakaoChannelUrl`, `kakaoChatUrl`, and `naverTalkTalkUrl` are prepared as nullable fields. `카카오톡 문의` and footer/about contact links appear only after real URLs are configured.
  - `docs/setup/CONTACT_CHANNELS_RUNBOOK.md` records the 카카오톡 문의 setup path, KakaoTalk Channel source links, and the rule that unfinished chat links stay hidden.
- Verification:
  - Passed: `npm run release:trace`
  - Passed: `npm run audit:site`
  - Passed: `npm run lint`
  - Passed: `npm run typecheck`
  - Passed: `npm run build`
  - Passed: `npm run test:site` with Playwright `19 passed`
  - Passed: `npm run screenshot:site`
  - Passed: `npm run qa:site` with rendered audit `957 checks, 0 skipped`, Playwright `19 passed`, screenshots, and npm audit `0 vulnerabilities`
  - Passed: `npm run tasks:dashboard`
  - Passed: `npm audit --audit-level=moderate`
  - Passed: `git diff --check` with line-ending warnings only
- Rollback Hint: say `v0.2.1 전으로 되돌려줘`.
- Remaining User-only:
  - Create/verify the official KCG KakaoTalk Channel if KCG wants Kakao inquiry buttons.
  - Provide the real Kakao Channel URL or chat URL before public UI links are enabled.
  - Decide whether to keep TradingView on the detailed `/prices` page only or also encourage chart use from the home section.

## v0.2.0 - QA scorecard and mobile/admin polish

- Date: `2026-05-05 KST`
- Commit: `pending`
- Deploy Status: local reflected on `http://127.0.0.1:3300`; production domains `https://kcgold.co.kr`, `https://www.kcgold.co.kr`, and `https://kcg-confirm-preview.vercel.app` are not refreshed with this version yet.
- Summary: Added a 10000-point QA scorecard, tightened the mobile product first viewport, clarified the admin price-mode state, and made admin screenshot evidence opt-in.
- Changed:
  - Public site score: `9180/10000`
  - Admin console score: `8720/10000`
  - Weighted launch-candidate score: `9012/10000`
  - `/products` mobile first viewport now reaches catalog controls faster.
  - `/admin/prices` separates saved automatic-price status from the current screen preview.
  - Admin dashboard and product screenshots can be captured with `KCG_INCLUDE_ADMIN_SCREENSHOTS=1`.
  - QA report and 10000-point scorecard were added under `docs/setup` and `docs/quality`.
  - Proactive launch steward review and change-traceability guardrails were added so future work records version, deploy state, verification, rollback, and user-only blockers.
- Verification:
  - Passed: `npm run audit:site`
  - Passed: `npm run qa:site` with rendered audit `927 checks, 0 skipped`, Playwright `19 passed`, screenshot capture, and `0 vulnerabilities`
  - Passed: `npm run lint`
  - Passed: `npm run typecheck`
  - Passed: `npm run build`
  - Passed: `npm run test:site`
  - Passed: `npm run tasks:dashboard`
  - Passed: `npm audit --audit-level=moderate`
  - Passed: `git diff --check` with line-ending warnings only
- Rollback Hint: say `v0.2.0 전으로 되돌려줘`.
- Remaining User-only:
  - Confirm final product photos, operating product list, 공임/margin, and which items show reference price versus inquiry.
  - Rotate final production admin password before search/public launch.
  - Approve robots/noindex release and search indexing only when the site is ready for public discovery.
  - Decide whether a paid scheduler/API plan is worth it for automatic price checks beyond the current free/pre-launch posture.
