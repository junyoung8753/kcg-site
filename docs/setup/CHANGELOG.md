# KCG Changelog

This file is the public-site change ledger for KCG launch-candidate work. Use it to explain what changed, where it is reflected, how it was verified, and how to ask Codex to roll it back.

Versioning rule before public launch: `0.x.x`.

- Major: reserved for post-launch breaking product or infrastructure shifts.
- Minor: visible workflow, page structure, QA system, data model, or admin operation changes.
- Patch: small copy, style, guardrail, or bug fixes that do not change the site direction.

## v0.2.2 - Expert panel deep QA and admin evidence hardening

- Date: `2026-05-05 KST`
- Commit: `pending`
- Deploy Status: local reflected in the working tree; production domains are not refreshed with this version until the final verification and deploy step completes.
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
