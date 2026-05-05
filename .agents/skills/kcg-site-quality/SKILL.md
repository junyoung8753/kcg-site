---
name: kcg-site-quality
description: Use in the KCG site repo for either project-room environment setup/latest-guidance checks or user-requested website artifact work such as homepage/price/products/services UI, launch readiness, screenshot QA, rendered route checks, and product catalog polish.
---

# KCG Site Quality

## Overview

Apply the KCG site workflow for high-quality, consultation-first gold-exchange
site work. First decide whether the task is project-room environment upkeep or
actual site artifact work.

## Modes

- Project-room environment mode: maintain Codex-facing setup only. Check
  `AGENTS.md`, `code_review.md`, this skill, official-doc/source references,
  expert-role coverage, tool/plugin routing, QA command catalog, and handoff
  order. Do not run recurring site verification, review screenshot artifacts as
  recurring product review, hunt UI defects, edit source/content/assets,
  deploy, or change launch/search/secret state.
- Site artifact mode: use this only when junyoung asks to change or review the
  site itself. Then the rendered/browser/screenshot evidence rules below apply.

## Required Context

- Read `AGENTS.md` and `docs/setup/CURRENT_HANDOFF.md` first.
- For UI/route/product/price work, read `docs/quality/product-experience-rubric.md`, `docs/quality/design-review-checklist.md`, `docs/quality/ai-site-production-playbook.md`, and `docs/quality/data-source-compliance.md`.
- For admin, price, product/매입, API, image, launch-readiness, or workflow QA, also read `docs/quality/operations-product-audit-checklist.md`.
- For work that touches existing market/news/chart/storage/cron integrations, also read `docs/quality/existing-api-integration-audit-2026-05-05.md` before treating API behavior as known.
- For fast-moving framework, deployment, browser QA, or Codex workflow changes, use `docs/quality/official-docs-index.md` and verify against official sources.
- Use `docs/setup/OPEN_TASKS.md` to record blockers and launch-quality work that remains.

## Adaptive Expert Panel

Keep the project room ready to support a small core panel plus triggered expert
roles when site work is requested.

- Core roles for meaningful KCG work: customer, administrator,
  deployment/status owner, future worker, and rollback operator.
- Triggered roles are selected by task surface: 디자이너, UX/IA, 웹설계 전문가,
  mobile/accessibility, SEO/search, 금거래소 베테랑 직원, store consultation
  staff, price-table operator, legal/compliance, performance, data/API, and
  content/brand.
- For admin, price, product/매입, service, customer-response, or launch-readiness
  work, include the Gold Exchange Operations Product Audit Pass from
  `docs/quality/agent-quality-system.md` so operational staff needs are checked
  before visual polish is treated as complete.
- Use `docs/quality/operations-product-audit-checklist.md` when the task touches Main Price Disclosure Priority, Existing API Integration Audit, Image / Visual Asset Audit, placeholder-vs-real product photo policy, or infographic opportunities.
- Do not run every role every time. Use a Role Discovery Pass to choose the
  smallest useful set, record excluded high-risk roles when relevant, and add
  durable guidance only when it removes repeated ambiguity or a real
  verification risk.

## Workflow

1. Classify the task as project-room environment upkeep or site artifact work.
2. In environment mode, report only setup gaps and make only small reversible
   Codex-facing docs/skill/source-index corrections when clearly justified.
3. In site artifact mode, define the KCG user job: fast price check, sell-side consultation, product/bar inquiry, location visit prep, admin launch readiness, or source-safe market context.
4. Preserve KCG boundaries: company posted prices are primary, market references are secondary, and checkout/cart/payment/live-trading behavior is out of scope without explicit approval.
5. Treat already-connected APIs as current-site QA scope. New API additions, paid upgrades, advanced automation, and external data expansion are later P2 decisions.
6. Keep homepage price disclosure first: KCG posted prices or a clear price-check path must outrank campaign images, charts, and API reference surfaces.
7. Classify image assets as real photo, generated/placeholder, stock, logo, or internal document before using them for customer decision surfaces.
8. For visual work, state a compact visual thesis, content plan, and interaction/QA thesis before editing.
9. Implement the smallest complete change using existing routes, components, data contracts, and scripts first.
10. Add or update an executable guardrail when the work fixes a repeated miss or a rendered bug that source checks would not catch.
11. Verify with the narrowest reliable commands, then use `npm run qa:site` for full launch-candidate confidence.
12. Inspect screenshot artifacts before claiming visual completion, especially the viewport captures that avoid full-page sticky/fixed UI artifacts.
13. For meaningful site/admin/QA changes, update `docs/setup/CHANGELOG.md`, `docs/setup/CURRENT_HANDOFF.md`, and `docs/setup/OPEN_TASKS.md` so the version, reflection status, rollback hint, and remaining user-only work are traceable.
14. Run the Role Discovery Pass and Proactive Launch Steward Review from `docs/quality/agent-quality-system.md` before the final answer. For operational surfaces, include the selected Gold Exchange Operations Product Audit roles. Record the selected expert perspectives, at least one proactive improvement candidate, or explicitly state `추가 후보 없음` with evidence.

## Evidence Bar

- Code changes: run lint, typecheck, source audit, build, Playwright, and npm audit.
- Rendered completeness claims: run `npm run audit:rendered` or `npm run qa:site`; rendered audit must end with `0 skipped`.
- Visual changes: run `npm run screenshot:site` and inspect the changed route plus `home-mobile-viewport.png` or another relevant viewport capture.
- Review work: use `code_review.md` for KCG-specific findings and keep launch/search/credential gates explicit.
- Traceability: meaningful changes need a changelog entry, current version, local/commit/push/deploy status, rollback phrase, and user-only blocker summary before being called complete.

## Do Not Do

- Do not change production deploys, stable aliases, public search indexing, admin secrets, payment/trading/legal behavior, or credential storage without explicit approval.
- Do not copy private company notes, private document photos, customer data, competitor-owned assets/copy/prices, or raw secrets into the repo.
- Do not treat source audit, route `200`, or full-page screenshots alone as visual completeness.
- Do not edit generated `.codex/environments/environment.toml` manually.
