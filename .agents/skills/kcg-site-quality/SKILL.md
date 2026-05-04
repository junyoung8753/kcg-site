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
- For fast-moving framework, deployment, browser QA, or Codex workflow changes, use `docs/quality/official-docs-index.md` and verify against official sources.
- Use `docs/setup/OPEN_TASKS.md` to record blockers and launch-quality work that remains.

## Expert Role Model

Keep the project room ready to support these perspectives when site work is
requested: frontend engineering, UX/UI, design system, Korean content and
marketing, SEO/search-launch gates, performance, accessibility,
deployment/analytics, source attribution, and minimal essential safety
boundaries. Add durable guidance only when it removes repeated ambiguity or a
real verification risk.

## Workflow

1. Classify the task as project-room environment upkeep or site artifact work.
2. In environment mode, report only setup gaps and make only small reversible
   Codex-facing docs/skill/source-index corrections when clearly justified.
3. In site artifact mode, define the KCG user job: fast price check, sell-side consultation, product/bar inquiry, location visit prep, admin launch readiness, or source-safe market context.
4. Preserve KCG boundaries: company posted prices are primary, market references are secondary, and checkout/cart/payment/live-trading behavior is out of scope without explicit approval.
5. For visual work, state a compact visual thesis, content plan, and interaction/QA thesis before editing.
6. Implement the smallest complete change using existing routes, components, data contracts, and scripts first.
7. Add or update an executable guardrail when the work fixes a repeated miss or a rendered bug that source checks would not catch.
8. Verify with the narrowest reliable commands, then use `npm run qa:site` for full launch-candidate confidence.
9. Inspect screenshot artifacts before claiming visual completion, especially the viewport captures that avoid full-page sticky/fixed UI artifacts.

## Evidence Bar

- Code changes: run lint, typecheck, source audit, build, Playwright, and npm audit.
- Rendered completeness claims: run `npm run audit:rendered` or `npm run qa:site`; rendered audit must end with `0 skipped`.
- Visual changes: run `npm run screenshot:site` and inspect the changed route plus `home-mobile-viewport.png` or another relevant viewport capture.
- Review work: use `code_review.md` for KCG-specific findings and keep launch/search/credential gates explicit.

## Do Not Do

- Do not change production deploys, stable aliases, public search indexing, admin secrets, payment/trading/legal behavior, or credential storage without explicit approval.
- Do not copy private company notes, private document photos, customer data, competitor-owned assets/copy/prices, or raw secrets into the repo.
- Do not treat source audit, route `200`, or full-page screenshots alone as visual completeness.
- Do not edit generated `.codex/environments/environment.toml` manually.
