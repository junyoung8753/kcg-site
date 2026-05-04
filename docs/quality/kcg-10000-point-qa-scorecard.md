# KCG 10000-Point QA Scorecard

Last updated: 2026-05-05 KST.

This scorecard is for KCG public site and admin-console QA. It converts product fit, usability, accessibility, performance, compliance, and operating-readiness checks into a 10000-point scale so quality conversations are less subjective.

## Sources Used

- W3C WCAG 2.2 (`https://www.w3.org/TR/wcag/`): testable success criteria, perceivable/operable/understandable/robust principles, target-size and focus-obscured checks.
- Google Web Vitals (`https://web.dev/articles/vitals`) and Chrome Lighthouse scoring (`https://developer.chrome.com/docs/lighthouse/performance/performance-scoring`): LCP, INP, CLS, performance evidence, accessibility, best practices, and SEO-style evidence categories.
- Nielsen Norman Group 10 usability heuristics (`https://www.nngroup.com/articles/ten-usability-heuristics/`): visibility of system status, match with the real world, user control, consistency, error prevention, recognition over recall, flexibility, minimalist design, recovery, and help/documentation.
- KCG internal quality sources: `product-experience-rubric.md`, `design-review-checklist.md`, `data-source-compliance.md`, and `ai-site-production-playbook.md`.

## Public Site: 10000 Points

| Category | Points | What To Judge |
| --- | ---: | --- |
| Price-first product purpose | 1600 | Company posted prices, buy/sell distinction, posted time, phone/location path, and price-table visibility. |
| Trust, legal, and data-source safety | 1500 | Business facts, no KRX confusion, no competitor scraping, source attribution, no checkout/trading claims, noindex until launch approval. |
| Information architecture and navigation | 1100 | GNB clarity, route purpose separation, product tabs, location/company split, footer scanability. |
| Visual hierarchy and KCG brand fit | 1200 | Korean gold-exchange feel, campaign/product imagery, typography, spacing, CTA restraint, no generic SaaS/mall feel. |
| Mobile usability | 1400 | 390px readability, price cards, product tabs, CTA bar, no horizontal overflow, no clipped core content. |
| Accessibility and interaction quality | 900 | WCAG-oriented labels, focus, target size, keyboard-safe controls, readable contrast, no blocked focus. |
| Performance and asset discipline | 800 | Optimized images, stable layout, no unnecessary route refetches, no large visible jank. |
| Content quality and conversion | 800 | Concrete Korean copy, minimal repetition, direct consultation path, useful product/service copy. |
| Evidence and maintainability | 700 | Playwright/audit/screenshots, reusable components, guardrails, clean data contracts. |

## Admin Console: 10000 Points

| Category | Points | What To Judge |
| --- | ---: | --- |
| Operational clarity | 1700 | Admin immediately knows current state, what is public, what needs action, and where to edit. |
| Price-management UX | 1800 | Posted-price snapshot, automatic/manual mode clarity, formula visibility, safe auto-publish status, direct input table usability. |
| Product/notice management UX | 1200 | List/edit workflow, category fields, image URL flow, visibility status, minimal repeated long forms. |
| Safety, audit trail, and data integrity | 1500 | No external overwrite, price history, suggestion records, no secrets printed, protected admin routes. |
| Error prevention and recovery | 900 | Clear held states, no ambiguous labels, manual fallback, warnings for unavailable storage/source data. |
| Mobile and responsive admin use | 800 | Admin can inspect and make urgent edits on smaller screens without broken controls. |
| Accessibility and keyboard operation | 700 | Labeled controls, visible focus, usable toggles/forms, consistent control names. |
| Performance and loading | 500 | Admin pages load without heavy imagery or unnecessary route churn. |
| Evidence and maintainability | 900 | Tests/screenshots cover key admin flows, schema/docs match UI, no-secret procedures are documented. |

## Overall Launch Candidate Score

Use a weighted final score when reporting one number:

- Public site: 60%
- Admin console: 30%
- Launch/operation blockers: 10%

Subtract blocker penalties even when screens look good:

- Search/noindex not approved: up to -250
- Temporary admin password not rotated: up to -200
- Actual product photos/prices/margins not confirmed: up to -350
- Paid scheduler/API decision unresolved when automatic operation is required: up to -150
