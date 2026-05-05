# KCG Site Working Rules

- This repository is the working source for `https://kcg-confirm-preview.vercel.app/`.
- Vercel project: `kcg-confirm-preview`.
- GitHub repo: `junyoung8753/kcg-site`.
- Private company knowledge source: `junyoung8753/kcg-company-knowledge` when the current workspace has access. Use it for broader KCG company context, but do not copy internal notes, sensitive originals, customer data, credentials, or unapproved private material into this public-style site repo.
- Treat short Korean continuation requests such as "kcg사이트 만들던거 이어나갈수있게 준비해", "KCG 사이트 이어가자", "금거래소 사이트 이어가자", or "작업 이어가자" as a request to continue this KCG site from the current handoff. Do not make junyoung paste a long bootstrap prompt.
- For those short continuation requests, immediately read `docs/setup/CURRENT_HANDOFF.md`, then prepare the task using the source-of-truth status below. Treat the current repository as the single production candidate unless the user explicitly asks to recover an older source.
- If the task needs broader KCG company knowledge, read the private knowledge repo's `README.md`, `ops/local-first-workflow.md`, `company/identity.md`, `company/business-rules.md`, `pricing/posted-price-policy.md`, and `projects/kcg-site.md` when available. Keep this repo limited to approved public-safe summaries and implementation handoff notes.
- Before continuing KCG work in a new chat, read `docs/setup/CURRENT_HANDOFF.md` for the latest source-of-truth status and next action.
- Current default continuation is local-first. Read `docs/setup/CLOUD_ONLY_WORKFLOW.md` only when the user explicitly asks to use Codex Cloud or wants to avoid computer-specific setup.
- For local, cloud, or cross-computer continuation, follow `docs/setup/continue-anywhere.md` and use `scripts/check-continuation.ps1` for repeatable setup checks.
- For Codex Cloud Playwright work, ensure the environment setup has run `npx playwright install --with-deps chromium`. A missing Linux library error such as `libatk-1.0.so.0` is an environment/setup issue, not a reason to remove fonts, images, routes, or visual QA logic.
- For KCG site project-room environment work, keep the focus on Codex-facing setup: `AGENTS.md`, `code_review.md`, repo-local skills, official-doc/source references, expert-role model, tool/plugin routing, QA command catalog, and handoff/read order. Do not treat this as permission to edit site source, content, assets, deploy settings, or public copy.
- The KCG site project-room expert model should cover frontend engineering, UX/UI, design system, Korean content/marketing, SEO/search-launch gates, performance, accessibility, deployment/analytics, source attribution, and minimal essential safety boundaries.
- For actual KCG site artifact work requested by junyoung, follow this operating path: read `docs/setup/CURRENT_HANDOFF.md`, use the repo-local `kcg-site-quality` skill when available, consult `docs/quality/official-docs-index.md` for fast-moving official docs, run `npm run qa:site` for the full local quality gate, then inspect the generated full-page and viewport screenshots.
- Scheduled project-environment automation must not run recurring site verification, review screenshot artifacts as a recurring product review, hunt UI defects, edit `src`/`public`/content, deploy, or change launch/search/secret state unless junyoung explicitly asks for site work in this project room.
- For KCG code reviews, use `code_review.md` so findings stay focused on price hierarchy, mobile first viewport, consultation conversion, source boundaries, launch gates, and screenshot evidence.
- Use Korean UI/copy by default. Preserve exact business facts unless the user provides updated source documents.
- Treat prices, trading language, legal business information, admin authentication, search-index release, secrets/env changes, and hard-to-reverse infrastructure changes as high-risk. Do not invent official prices, business registration numbers, compliance claims, or live trading/payment behavior.
- Keep the company posted price table separate from automatic market-reference data. External APIs must not overwrite company prices.
- Keep `/` as the single public site entry. Do not restore old option routes such as `/option-1` or `/option-2` unless the user explicitly asks for a new comparison workflow.
- Keep preview-mode and search-blocking behavior unless the user explicitly approves public launch/search indexing. Vercel SSO Deployment Protection may stay disabled for ordinary browser review, but noindex/robots blocking must remain until public launch approval.
- Never commit `.env*`, `.vercel`, Supabase service role keys, admin passwords, cookies, tokens, or local Vercel settings.
- For Vercel setup on a new machine, run `vercel link --yes --project kcg-confirm-preview`, then `vercel pull --yes`.
- Before claiming completion after code changes, run:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run audit:site`
  - `npm run build`
  - `npm run test:site`
  - `npm audit --audit-level=moderate`
- For visual or route changes, also verify at least `/`, `/prices`, `/announcements`, `/services`, `/about`, `/admin/login`, and `/api/health` with browser screenshots or equivalent route checks. `npm run test:site` covers the default local browser path after `npm run build`.
- For visual route work, explicitly verify campaign assets, mobile header CTA/menu, mobile bottom CTA, service wording, and mobile price-table readability. Use `npm run audit:site`, `npm run test:site`, `npm run screenshot:site`, and at least one manually inspected mobile screenshot of `/`.
- For final launch-candidate confidence, prefer `npm run qa:site`; it includes rendered audit with `0 skipped` route checks and refreshed screenshots.
- Do not make visual QA code changes just to bypass a Cloud environment restriction. If Google Fonts, Playwright browser downloads, npm audit endpoints, or external fetches are blocked, report the environment/network issue and fix the Cloud setup or run the verification locally instead of removing design assets, fonts, images, or routes.
- When a user points out a miss, update the smallest relevant executable guardrail first, then fix similar cases. Keep `docs/quality/agent-quality-system.md` aligned with meaningful process changes.
- Junyoung's 2026-05-06 standing instruction is to deploy completed, verified KCG site changes to the existing live review domains by default so he can review and request rollback. This does not approve robots/noindex release, search indexing, payment/trading behavior, secret/env changes, new DNS/domain policy changes, or hard-to-reverse infrastructure changes.

<!-- BEGIN: FRONTEND_DESIGN_QUALITY_ADDON -->

# Frontend / Website / UI Design Quality Add-on

## Purpose

For KCG website, homepage, route, product catalog, price desk, responsive UI, visual polish, Figma-to-code, screenshot-to-code, browser QA, or design-critical tasks, do not jump straight into code unless the change is a tiny obvious fix.

First build a task-local design brief, then implement in the existing KCG system, then verify the rendered result.

## Existing rules remain higher priority

- This add-on does not override the KCG rules above, global Codex safety rules, security boundaries, code style, test policy, data-source compliance, or launch/search-indexing constraints.
- KCG-specific product facts, posted prices, legal/business information, admin auth, public launch, payments, trading, and production deployment remain high-risk. Stop and ask when a wrong assumption could create legal, financial, credential, or production risk.
- Company posted prices stay separate from automatic market-reference data. External APIs must not overwrite company prices.

## Required context before design work

For non-trivial frontend or design work, read the relevant current context before deciding:

- `docs/setup/CURRENT_HANDOFF.md`
- `docs/quality/product-experience-rubric.md`
- `docs/quality/design-review-checklist.md`
- `docs/quality/ai-site-production-playbook.md`
- `docs/quality/data-source-compliance.md`
- `docs/research/gold-exchange-deep-audit-2026-04-27.md`
- Existing route/component/style files touched by the task

Use official/current docs for fast-moving framework, Codex, API, browser, deployment, or data-source questions.

## Required design workflow

For frontend/design tasks:

1. Restate the KCG product goal in one sentence.
2. Identify target user, business goal, primary CTA, brand tone, required page/section, and technical constraints.
3. Create a concise design brief before coding.
4. If no visual direction is provided, compare 2-3 feasible directions and choose one based on KCG fit, clarity, conversion, maintainability, and verification cost.
5. Define task-local design tokens before implementation: color, type scale, spacing rhythm, layout grid, radius, border/shadow, image treatment, and motion principles.
6. Implement one coherent KCG composition, not a generic template or alternate option playground.
7. Reuse existing KCG routes, components, data presenters, design tokens, and verification helpers before adding new abstractions.
8. Implement desktop and mobile states together.
9. Start or reuse the local dev/build server when practical.
10. Inspect the rendered UI with Browser Use or Playwright/screenshots when available.
11. Check and fix visual hierarchy, first viewport composition, CTA clarity, price-table readability, spacing rhythm, alignment, text overflow, horizontal overflow, contrast, hover/focus states, loading/error states, console errors, and mobile header/bottom CTA behavior.
12. Run the relevant repo validation commands. For code changes, follow the full command list above unless the change is docs-only.
13. Review the final diff for unrelated changes, secret exposure, route regressions, and accidental preview/launch behavior changes.

## KCG design quality bar

A strong KCG UI must have:

- price-first hierarchy with company posted prices as the primary surface
- clear phone/visit consultation path rather than checkout/cart behavior
- restrained gold-exchange visual language: professional, readable, trustworthy, not flashy
- a dominant first viewport with real campaign/product/store signal
- mobile-first scanability for prices, CTAs, location, and consultation steps
- precise source attribution for market-reference data, headlines, charts, and calculators
- real-feeling Korean copy that avoids unsupported legal, price, or trading claims
- accessible contrast, focus states, and readable tables on mobile

Avoid:

- generic SaaS or shopping-mall templates
- random card grids, meaningless badges, filler stat strips, or placeholder copy
- purple-gradient defaults or one-note decorative palettes unrelated to KCG
- visual experiments that make the site feel less like a Korean gold exchange
- scraping, republishing, or charting competitor data
- adding online payment, cart, live trading, or public launch behavior without explicit approval

## Model, skill, and subagent routing

- The lead Codex session remains responsible for final design, implementation, verification, and reporting.
- Use existing skills and tools deliberately: `frontend-skill` for frontend product work, `recursive-improvement` for repeated quality misses, `openai-docs` for current Codex/OpenAI guidance, and Playwright/screenshots for repeatable visual QA.
- Use actual subagents only when the user explicitly permits delegated agent work and the task is low-risk, parallelizable, and independently reviewable.
- Spark or smaller helpers may only provide read-only, bounded advice or tiny independently verifiable notes. They must not be final authority for edits, architecture, security, auth, payments, trading, legal/compliance, production deployment, dependency selection, or launch decisions.
- Do not create or change project `.codex/config.toml`, model, reasoning, sandbox, approval, MCP, hook, skill, or custom-agent settings unless the support path is verified and the change is clearly safer than AGENTS-based guidance.

## Required final report for frontend/design tasks

End every frontend/design task with:

- Design direction chosen
- Files changed
- Components/pages added or modified
- Browser/Playwright/screenshot checks performed
- Desktop/mobile status
- Commands run and validation result
- Remaining risks or user-only steps
- Suggested next improvement when it materially advances launch quality

<!-- END: FRONTEND_DESIGN_QUALITY_ADDON -->
