# KCG Code Review Checklist

Use this file when reviewing KCG site changes. Findings come first, ordered by user-visible risk. Keep summaries short and do not treat this checklist as a replacement for tests, screenshots, or explicit launch approval.

## Priority Review Areas

- Project-room environment changes: if the diff touches `AGENTS.md`, repo-local skills, review checklists, official-doc indexes, or QA command docs, verify that it improves Codex working setup without turning automation into scheduled site QA or artifact polishing.
- Price-first hierarchy: company posted prices must remain the primary surface, with buy/sell labels, posted time, and on-site confirmation caveats close to the numbers.
- Consultation conversion: phone, visit, product inquiry, and location actions should be visible near the user decision point. Do not add checkout, cart, online payment, live trading, guaranteed quote, or investment behavior.
- Mobile first viewport: the KCG brand, route purpose, and next action must be visible at 390px without sticky header or mobile bottom CTA covering key content.
- Visual evidence: meaningful route or visual work needs current screenshots, including viewport screenshots where fixed UI may distort full-page captures.
- Source boundaries: automatic market references, charts, calculators, and news must keep source attribution visible and must not overwrite company posted prices.
- Launch gates: noindex/robots blocking, production deploys, stable alias changes, public search exposure, admin secrets, credentials, and legal/trading/payment changes remain ask-gated.
- Public-safe content: do not copy internal company notes, private documents, customer data, secret values, competitor-owned copy/assets/prices, or unapproved legal claims into the public-style repo.

## Required Review Questions

- Does the change preserve `/` as the single public home and keep old `/option-1` and `/option-2` routes absent?
- Does the route still feel like a Korean physical gold exchange rather than a generic mall, trading app, SaaS dashboard, or decorative landing page?
- Are product images and catalog copy credible enough for launch-prep, or is a real-photo/product-data task still recorded in `docs/setup/OPEN_TASKS.md`?
- Did the reviewer inspect both source diff and rendered behavior for affected UI?
- Are the commands run proportional to the changed surface and reported exactly?

## Expected Evidence

- Code changes: `npm run lint`, `npm run typecheck`, `npm run audit:site`, `npm run build`, `npm run test:site`, `npm audit --audit-level=moderate`.
- Visual or route changes: also `npm run screenshot:site`, plus manual inspection of the affected route screenshots and the first-viewport images.
- Full KCG quality pass: `npm run qa:site`.
- Rendered audit must complete with `0 skipped` checks when a task claims route/rendered completeness.

## Finding Style

- Lead with concrete bugs and regressions, not praise.
- Include exact file and line references where possible.
- Mark residual risk when verification was skipped or blocked.
- Do not request broad refactors unless they directly reduce a concrete launch, UX, data, or verification risk.
