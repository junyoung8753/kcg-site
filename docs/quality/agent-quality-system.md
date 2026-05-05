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
- Change traceability was treated as a separate documentation task instead of part of completion. That left version, commit/push/deploy state, rollback wording, and management-facing change rationale to be discovered only after junyoung asked.

## Root Cause

The root cause is a verification gap: vague quality goals were not translated into deterministic acceptance checks before implementation.

The deeper root cause is process design: AI agents can produce plausible results, so the repo must define observable pass/fail gates for the exact user outcome. Human instructions like "do it perfectly" are not enough unless the important parts become code, tests, screenshots, or deployment checks.

For KCG specifically, the deepest failure was scope narrowing. A site task was treated as "finish the requested screen or feature" rather than "operate a launch candidate that a customer, administrator, boss, deployer, future worker, and rollback operator can understand." That missed operational artifacts that were not visible in screenshots, especially change history and deployment state.

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
- `docs/quality/operations-product-audit-checklist.md` separates Technical QA, Product / Operations QA, and Business / Conversion QA. It also records Main Price Disclosure Priority, Existing API Integration Audit, Image / Visual Asset Audit, placeholder policy, and a finding template for real gold-exchange workflows.
- `docs/setup/CHANGELOG.md` records version, date, commit, deploy status, verification, rollback hint, and remaining user-only work for meaningful KCG changes.
- `docs/setup/CURRENT_HANDOFF.md` must name the current KCG version, latest change, local check URL, and reflection status so local/commit/push/deploy states are not blurred.
- GitHub Actions `Site Quality` runs the same local quality gates on `main` pushes and pull requests without deploying to production.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=moderate` remain mandatory after code changes.
- Preview deployments are intentionally open for ordinary browser review while noindex/robots search-blocking remains active. If deployment protection is re-enabled, test protected previews with `vercel curl`.
- Production alias changes, search indexing, real trading/payment/admin/security changes, and destructive data operations still require explicit user approval.
- Codex Cloud diagnostics must be timeboxed. If a Cloud task returns no inspectable diff or fails because of browser/system dependencies, switch to local verification or CI, then record the exact Cloud setup issue instead of changing app UI, fonts, assets, or route logic to bypass the environment.
- Temporary Cloud diagnostic files such as `zz-*-delete-me.md` are evidence only. Do not apply, merge, or treat them as product changes.
- Benchmark-driven work must inspect more than the first screen. The minimum useful pass records site map, price labels, product/service/detail pages, branch/contact/FAQ/policy pages, forms, script/network/API sources, and explicit KCG use/do-not-use decisions.
- Product/category tabs that filter already-loaded data must be tested as local interactions. `npm run test:site` should fail if tab clicks trigger `/products?...&_rsc=` route fetches or product-detail RSC prefetches.
- Public route typography should stay inside the KCG scale. Rendered tests check representative mobile and desktop heading sizes so future copy/layout work does not reintroduce oversized hero text or unreadably tiny labels.

## Proactive Launch Steward Review

After every meaningful KCG site, admin, QA, release, or handoff task, Codex must run a short steward review before final reporting. This is not an invitation for broad refactors. It is a forced pass to catch operational needs that screenshots and tests do not reveal.

Use an Adaptive Expert Panel instead of a long fixed checklist. The goal is to
select the roles that match the task, not to perform role-play theater.

Run a Role Discovery Pass:

1. Classify the task surface: visual/UI, UX/IA, content/copy, gold-exchange domain, admin ops, pricing/source/compliance, deploy/release, SEO/search, performance/mobile, data/API, handoff/rollback.
2. Always include the core roles: customer, administrator, deployment/status owner, future worker, and rollback operator.
3. Add triggered roles when the task surface justifies them: 디자이너, UX/IA, 웹설계 전문가, mobile/accessibility, SEO/search, 금거래소 베테랑 직원, store consultation staff, price-table operator, legal/compliance, performance, data/API, and content/brand.
4. Use a role budget: small copy/style tasks use core plus 1-2 triggered roles; meaningful site/admin tasks use core plus 3-5 triggered roles; launch/deep QA may use up to 12 roles.
5. Refresh evidence only when needed. Use KCG local playbooks first; use official or primary sources for current law, platform, API, search, or deployment questions; treat community material as weak signal only.

Core review perspectives:

- Customer: can a visitor understand price, product/매입 scope, phone path, and location without reading long explanations?
- Administrator: can the operator tell what to update today and what is automatic, manual, pending, or blocked?
- 대표/상사: is there a one-line reason for the change and a score/evidence summary that can be briefed upward?
- Deployment/status owner: is it clear whether the change is local only, committed, pushed, preview-deployed, production-deployed, or search-indexed?
- Future worker: is the current version, branch, handoff, and next task obvious without reading chat history?
- Rollback operator: is there a rollback phrase, commit/version reference, or clear changed-file scope?
- Legal/operations: are price claims, source attribution, noindex/search state, and checkout/trading/payment boundaries still safe?
- Performance/mobile: does the real mobile and desktop surface stay fast, readable, and free of fixed-UI collisions?

### Gold Exchange Operations Product Audit Pass

For meaningful admin, price, product/매입, service, customer-response, or launch-readiness work, run this operational pass before deciding that visual polish or technical QA is enough. This pass is not permission to add ERP, POS, accounting, customer-data, checkout, live-trading, or payment behavior. It is a way to detect where real gold-exchange staff would fall back to Excel, KakaoTalk, phone notes, or manual ledgers.

Use `docs/quality/operations-product-audit-checklist.md` as the reusable checklist and finding template. Already-connected APIs are current-site audit scope, not deferred P2 backlog. P2 is for new APIs, paid upgrades, advanced automation, and external data expansion.

Always protect these KCG-specific product rules:

- Main Price Disclosure Priority: the homepage must make KCG company posted prices or a clear price-check path visible immediately; API/international/chart references must not outrank the company price table.
- Existing API Integration Audit: current API data must have source hierarchy, update time, stale/failure fallback, and customer wording that prevents reference values from reading as final quotes.
- Image / Visual Asset Audit: separate real product photos from placeholder/generated assets, track replacement when real KCG product photos arrive, and do not let decorative images push the price table below the customer decision surface.

Select only the roles relevant to the task:

- 대표/관리자
- 시세 등록 직원
- 고금 매입 직원
- 골드바/제품 관리 직원
- 고객 응대 직원
- 일반 고객
- 세금/정산/장부를 신경 쓰는 운영자

For each selected role, check:

- What is the role trying to do in the real daily workflow?
- Where does the current flow block, slow down, or confuse that work?
- Where would the role leave the site and use Excel, KakaoTalk, phone calls, screenshots, or a manual ledger instead?
- What repeated manual work, double entry, or copy/paste step is likely?
- What error, omission, stale-data, price misunderstanding, or customer expectation risk can happen?
- What information would reduce customer calls or repeated staff explanations?
- What must the operator check every day before trusting the site?
- What feature is not needed today but likely needed soon for real operation?

Record the result as one of: `fix now`, `track in OPEN_TASKS`, `user-only decision`, or `intentionally out of scope`. Keep the output short enough to guide the current task, not to create a full ERP specification.

Required output: record selected expert perspectives and at least one proactive improvement candidate in the final answer or in `docs/setup/OPEN_TASKS.md`. If there is no useful candidate, say `추가 후보 없음` with the evidence that supports that decision.

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
