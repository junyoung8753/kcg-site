# KCG Design Review Checklist

Last updated: 2026-05-05 KST.

Use this checklist before and after non-trivial KCG frontend, route, product catalog, price desk, campaign image, form, chart, or visual polish work. It complements `product-experience-rubric.md` and `ai-site-production-playbook.md`; it does not replace launch, legal, pricing, data-source, or credential safeguards.

## 1. Task Brief

- Visual thesis: define the intended mood in one sentence. Default: a serious Korean gold-exchange price desk and real consultation counter, with restrained gold accents and practical visit/phone guidance.
- Product surface: name the route, component, data, actions, and states being changed.
- Context of use: choose the primary user moment: fast price check, sell-side consultation, bar/bulk inquiry, location-first visit preparation, admin launch check, or product catalog inquiry.
- Primary outcome: state what the user should decide or do after scanning the page.
- Non-goals: list what must not change, especially company posted prices, noindex behavior, admin auth, external data attribution, cart/payment/trading behavior, and old option routes.

## 2. KCG Constraints

- Company posted prices are primary; automatic market references are secondary.
- Show posted time, buy/sell distinction, and on-site final confirmation caveats near price information.
- Do not invent official prices, confirmed business registration, legal claims, reviews, partnerships, KRX affiliation, live execution, payment behavior, or investment outcomes.
- Do not scrape, proxy, cache, republish, or chart competitor data or internal endpoints.
- Keep KRX Gold Market references clearly separate from KCG private physical consultation.
- Keep public launch, production deploy, stable alias, `kcgold.co.kr` DNS, robots/noindex release, and search indexing blocked until explicit approval.

## 3. Visual And UX Checks

- First viewport: KCG brand, company posted prices or the route's main user job, and phone/visit path are visible without feeling like a generic SaaS page.
- Persistent UI: sticky header and mobile bottom CTA must not cover first-viewport decision content or keyboard-focus targets.
- Campaign imagery: use real-feeling KCG campaign/product/store signal; do not use abstract decoration as the main proof of business.
- Layout: price tables, consultation lists, and product records are dense but readable. Avoid nested cards, decorative section cards, and old comparison/option surfaces.
- Typography: headings fit the container, price numbers scan quickly, Korean copy keeps natural line breaks, and letter spacing remains neutral.
- Color and material: use white, pale green-gray, charcoal, and KCG yellow/gold with enough contrast; avoid one-note gradients or flashy palettes unrelated to a Korean gold exchange.
- CTAs: phone, price, location, visit, and inquiry actions are clear, touch-safe, and close to the decision point.
- Content: Korean UI copy is concrete and operational. Do not add design commentary, prompt language, fake urgency, or filler proof.

## 4. Responsive And Accessibility Checks

- Inspect at least mobile `390px` and desktop `1440px` for meaningful visual work.
- No horizontal overflow, clipped text, hidden CTA labels, or fixed bottom bar covering critical content.
- Pointer targets should satisfy WCAG 2.2 AA target-size expectations where practical, and core actions should be comfortable on touch screens.
- Keyboard focus must remain visible and not be hidden behind sticky/fixed UI.
- Text should resize and reflow without losing content or functionality.
- Forms and controls need visible labels, accessible names matching visible text where applicable, loading/error states, and clear recovery paths.

## 5. Evidence And Verification

- For code changes, run the KCG command set from `AGENTS.md` unless the change is truly docs-only. Use `npm run qa:site` when the task claims launch-candidate quality or rendered route completeness.
- For visual changes, run `npm run screenshot:site` and inspect at least `home-mobile.png`, `home-desktop.png`, `home-mobile-viewport.png`, and `home-desktop-viewport.png`; inspect changed route screenshots and viewport screenshots when available.
- Rendered audit claims require `npm run audit:rendered` or `npm run qa:site`, ending with `0 skipped` checks.
- Admin-only screenshots are local evidence, not public CI artifacts. Use `KCG_INCLUDE_ADMIN_SCREENSHOTS=1` only for deliberate local launch-readiness inspection, then rerun the default screenshot command before public artifact upload.
- Use `codex review --uncommitted` for meaningful working-tree changes before committing or handing off.
- Record unresolved launch blockers in `docs/setup/OPEN_TASKS.md` rather than leaving them only in chat.
- For meaningful site/admin/QA changes, update `docs/setup/CHANGELOG.md` with version, date, deploy status, verification, rollback hint, and remaining user-only work.
- Final reports must distinguish local reflection, commit, push, preview deploy, production deploy, and search-index state. Do not let "done" hide where the change actually exists.
- Before finalizing, ask: "Will a future worker know what changed, why, how to verify it, and how to ask for rollback one month later?"

## 6. Score Before Finalizing

Score out of 100 before claiming a frontend/design task is complete:

| Category | Points | Question |
| --- | ---: | --- |
| Product purpose | 20 | Does it help a visitor check prices, call, visit, or prepare a consultation? |
| Trust and compliance | 20 | Are prices, legal facts, KRX wording, data sources, and launch behavior conservative and verifiable? |
| Visual hierarchy | 15 | Are price/posting-time/CTA elements prioritized over decoration? |
| Mobile readability | 15 | Is the mobile route free of overflow, clipped text, cramped tables, and blocked CTAs? |
| KCG fit | 10 | Does it feel like a Korean physical gold exchange, not a generic mall, trading app, or SaaS template? |
| Maintainability | 10 | Does it reuse existing routes, components, data contracts, and verification helpers? |
| Evidence | 10 | Are tests, route checks, screenshots, and review results sufficient for the risk of the change? |

Target: `95+` for preview-ready work, `85-94` for locally usable work with known gaps, and below `85` means continue improving before presenting as complete.

## 7. Proactive Completion Questions

- Run the Role Discovery Pass before finalizing meaningful site, admin, QA, release, or handoff work.
- What task surface is this: visual/UI, UX/IA, content/copy, gold-exchange domain, admin ops, pricing/source/compliance, deploy/release, SEO/search, performance/mobile, data/API, or handoff/rollback?
- Which Adaptive Expert Panel roles were selected, and why? Include core roles plus triggered roles such as 디자이너, 웹설계 전문가, 금거래소 베테랑 직원, price-table operator, or legal/compliance when the task surface justifies them.
- Which high-risk roles were excluded, and why is that acceptable for this change?
- Did any selected role require fresh official, primary, or local-source evidence?
- What did junyoung not explicitly ask for that is still needed to operate, brief, deploy, or roll back this change?
- Does this change need a version bump, changelog entry, handoff note, task ledger update, screenshot evidence, or review command?
- Is there a one-line management summary for why this change improves KCG?
- Are the local/commit/push/deploy states explicit?
- Is there at least one proactive improvement candidate recorded, or a reasoned `추가 후보 없음`?
