# Agent Quality System

This project uses executable checks to reduce repeated AI-agent misses. The goal is not to make the prompt longer; the goal is to convert important expectations into tests that fail before shipping.

## Failure Pattern

The missed campaign slider and mobile CTA defects were not caused by a build problem. They were caused by weak acceptance criteria:

- Route checks proved that pages returned `200`, but not that the right business-critical UI was present.
- Screenshots existed, but the verification step did not define what must be present in them.
- Desktop checks happened before mobile checks, even though the defects were mostly mobile-specific.
- Visual restoration and launch-candidate cleanup work did not have a manifest of required assets, labels, and conversion controls.
- A helper named `2-preview-deploy.cmd` previously contained `--prod`, which created a naming/behavior mismatch.
- Codex Cloud readiness checks were treated like normal implementation work even though a no-diff Cloud task can be hard to inspect from the local CLI and Playwright browser failures may be caused by missing Linux system libraries rather than site code.
- Competitor benchmarking was treated too much like a home-screen visual comparison, which missed subpage structure, forms, price wording, scripts, and network/API behavior.
- The home campaign slider was allowed to become a right-side half-width surface when the price table panel was open, even though the intended design was a full-bleed exchange-site banner with the price table overlaid or separated without shrinking the image.
- Product tabs were allowed to behave like route refreshes, so category changes could wait for App Router RSC prefetch/fetch work and eager image loading even though all product data was already on the page.
- Public route typography drifted because many headings used one-off arbitrary font sizes and aggressive negative letter spacing instead of a KCG scale.
- Full-page screenshots can show sticky headers or fixed mobile CTAs in the middle of a long stitched image, which makes manual review noisy and can hide actual first-viewport composition problems.
- Product image checks can prove that assets load while still missing the higher launch-quality question: whether the catalog looks real, varied, and credible enough for a physical gold exchange.
- Source audit pass and rendered UX pass can be confused. A source audit without `SITE_AUDIT_URL` is useful, but it does not prove live route text, redirects, fixed UI, or first viewport behavior.

## Root Cause

The root cause is a verification gap: vague quality goals were not translated into deterministic acceptance checks before implementation.

The deeper root cause is process design: AI agents can produce plausible results, so the repo must define observable pass/fail gates for the exact user outcome. Human instructions like "do it perfectly" are not enough unless the important parts become code, tests, screenshots, or deployment checks.

## Controls

- `npm run audit:site` checks source files, campaign assets, CTA labels, business wording, single-site discipline, and optional rendered-route content.
- `npm run audit:rendered` starts or uses a rendered site and runs the same audit with `SITE_AUDIT_URL`, failing unless the audit completes with `0 skipped` checks.
- `npm run qa:site` is the preferred full local quality gate after meaningful KCG work: lint, typecheck, source audit, build, rendered audit, Playwright, screenshots, and npm audit.
- `npm run test:site` opens the built site in Chromium and verifies mobile/desktop conversion UI, campaign image loading, service wording, route content, horizontal overflow, and visible element protrusion beyond the mobile viewport.
- Playwright fixed-UI checks verify that sticky header and mobile bottom contact bar do not cover first-viewport decision content.
- Desktop home checks must verify that the campaign image spans the viewport width and that the visible price table does not sit over the first campaign visual in a way that makes the banner read as a partial-width column.
- `npm run screenshot:site` captures local built-site full-page and first-viewport screenshots into `output/screenshots` so manual inspection is not accidentally performed against a protected login page or a misleading stitched full-page artifact.
- `code_review.md` records the KCG-specific review stance for price hierarchy, mobile first viewport, source boundaries, launch gates, and screenshot evidence.
- `.agents/skills/kcg-site-quality/SKILL.md` packages the repeatable KCG site workflow so future work starts from current handoff, official docs, one-command QA, and rendered evidence.
- `docs/quality/official-docs-index.md` records the official documentation sources to re-check before changing Codex, Next.js, Tailwind, Playwright, Vercel, Supabase, or market-data behavior.
- `docs/quality/product-experience-rubric.md` records the KCG-specific product intent, design direction, UX priorities, and high-risk content rules that should guide future UI decisions.
- `docs/quality/ai-site-production-playbook.md` records how to prompt and run AI site-building work for KCG: context pack first, product surface and user moment second, KCG constraints always, then acceptance criteria, browser evidence, scoring, and durable guardrails.
- GitHub Actions `Site Quality` runs the same local quality gates on `main` pushes and pull requests without deploying to production.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=moderate` remain mandatory after code changes.
- Preview deployments are intentionally open for ordinary browser review while noindex/robots search-blocking remains active. If deployment protection is re-enabled, test protected previews with `vercel curl`.
- Production alias changes, search indexing, real trading/payment/admin/security changes, and destructive data operations still require explicit user approval.
- Codex Cloud diagnostics must be timeboxed. If a Cloud task returns no inspectable diff or fails because of browser/system dependencies, switch to local verification or CI, then record the exact Cloud setup issue instead of changing app UI, fonts, assets, or route logic to bypass the environment.
- Temporary Cloud diagnostic files such as `zz-*-delete-me.md` are evidence only. Do not apply, merge, or treat them as product changes.
- Benchmark-driven work must inspect more than the first screen. The minimum useful pass records site map, price labels, product/service/detail pages, branch/contact/FAQ/policy pages, forms, script/network/API sources, and explicit KCG use/do-not-use decisions.
- Product/category tabs that filter already-loaded data must be tested as local interactions. `npm run test:site` should fail if tab clicks trigger `/products?...&_rsc=` route fetches or product-detail RSC prefetches.
- Public route typography should stay inside the KCG scale. Rendered tests check representative mobile and desktop heading sizes so future copy/layout work does not reintroduce oversized hero text or unreadably tiny labels.

## Required Flow For Visual Or Launch-Candidate Work

1. Capture the target outcome as a checklist: assets, text, routes, CTAs, responsive states, and protected behaviors.
2. Load the KCG AI site production playbook so the prompt shape includes product surface, context of use, KCG constraints, acceptance criteria, and browser evidence.
3. Update or add deterministic checks before claiming completion.
4. Run static checks, build, browser checks, and route checks.
5. Run `npm run screenshot:site` and inspect at least one mobile screenshot, one desktop screenshot, and the relevant viewport capture when the UI changes.
6. If a miss is found, add the smallest durable guardrail that would have caught it.

## Required Flow For Competitor Benchmark Work

1. Crawl or manually inspect representative subpages, not just the home page.
2. Record route categories, headings, forms, tables, and network/API/chart/feed calls.
3. Separate patterns worth adapting from content/data/assets that must not be copied.
4. Update `docs/research/*` and `docs/quality/data-source-compliance.md` when the finding changes KCG decisions.
5. Add a rendered UI check or source audit check for the KCG improvement that came from the benchmark.

## What Not To Do

- Do not rely on "looks okay" without an explicit oracle.
- Do not treat route `200` as visual completeness.
- Do not treat document-level overflow checks as enough; a nested wide table can still look broken on mobile.
- Do not add broad instructions when a script or test can enforce the behavior.
- Do not weaken search-blocking, production safeguards, credential rules, or trading/payment/admin safeguards to reduce friction.
- Do not keep stale helper scripts whose names imply a safer behavior than they actually perform.
