---
name: kcg-site-quality
description: Use when working in the KCG site repo on website quality, homepage/price/products/services UI, launch readiness, screenshot QA, rendered route checks, product catalog polish, or prompts like "KCG 사이트 품질", "상품/시세/홈/서비스 화면 개선", "launch readiness", or "screenshot QA".
---

# KCG Site Quality

## Overview

Apply the KCG site workflow for high-quality, consultation-first gold-exchange site work. Keep the output public-safe, price-first, mobile-readable, and backed by rendered evidence.

## Required Context

- Read `AGENTS.md` and `docs/setup/CURRENT_HANDOFF.md` first.
- For UI/route/product/price work, read `docs/quality/product-experience-rubric.md`, `docs/quality/design-review-checklist.md`, `docs/quality/ai-site-production-playbook.md`, and `docs/quality/data-source-compliance.md`.
- For fast-moving framework, deployment, browser QA, or Codex workflow changes, use `docs/quality/official-docs-index.md` and verify against official sources.
- Use `docs/setup/OPEN_TASKS.md` to record blockers and launch-quality work that remains.

## Workflow

1. Define the KCG user job: fast price check, sell-side consultation, product/bar inquiry, location visit prep, admin launch readiness, or source-safe market context.
2. Preserve KCG boundaries: company posted prices are primary, market references are secondary, and checkout/cart/payment/live-trading behavior is out of scope without explicit approval.
3. For visual work, state a compact visual thesis, content plan, and interaction/QA thesis before editing.
4. Implement the smallest complete change using existing routes, components, data contracts, and scripts first.
5. Add or update an executable guardrail when the work fixes a repeated miss or a rendered bug that source checks would not catch.
6. Verify with the narrowest reliable commands, then use `npm run qa:site` for full launch-candidate confidence.
7. Inspect screenshot artifacts before claiming visual completion, especially the viewport captures that avoid full-page sticky/fixed UI artifacts.

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
