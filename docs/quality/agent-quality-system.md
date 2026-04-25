# Agent Quality System

This project uses executable checks to reduce repeated AI-agent misses. The goal is not to make the prompt longer; the goal is to convert important expectations into tests that fail before shipping.

## Failure Pattern

The missed campaign slider and mobile CTA defects were not caused by a build problem. They were caused by weak acceptance criteria:

- Route checks proved that pages returned `200`, but not that the right business-critical UI was present.
- Screenshots existed, but the verification step did not define what must be present in them.
- Desktop checks happened before mobile checks, even though the defects were mostly mobile-specific.
- Source-site restoration work did not have a manifest of required assets, labels, and conversion controls.
- A helper named `2-preview-deploy.cmd` previously contained `--prod`, which created a naming/behavior mismatch.

## Root Cause

The root cause is a verification gap: vague quality goals were not translated into deterministic acceptance checks before implementation.

The deeper root cause is process design: AI agents can produce plausible results, so the repo must define observable pass/fail gates for the exact user outcome. Human instructions like "do it perfectly" are not enough unless the important parts become code, tests, screenshots, or deployment checks.

## Controls

- `npm run audit:site` checks source files, campaign assets, CTA labels, business wording, and optional rendered-route content.
- `npm run test:site` opens the built site in Chromium and verifies mobile/desktop conversion UI, campaign image loading, service wording, route content, and horizontal overflow.
- `npm run screenshot:site` captures local built-site screenshots into `output/screenshots` so manual inspection is not accidentally performed against a protected login page.
- GitHub Actions `Site Quality` runs the same local quality gates on `main` pushes and pull requests without deploying to production.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=moderate` remain mandatory after code changes.
- Preview deployments are intentionally open for ordinary browser review while noindex/robots search-blocking remains active. If deployment protection is re-enabled, test protected previews with `vercel curl`.
- Production alias changes, search indexing, real trading/payment/admin/security changes, and destructive data operations still require explicit user approval.

## Required Flow For Visual Or Source-Parity Work

1. Capture the target outcome as a checklist: assets, text, routes, CTAs, responsive states, and protected behaviors.
2. Update or add deterministic checks before claiming completion.
3. Run static checks, build, browser checks, and route checks.
4. Run `npm run screenshot:site` and inspect at least one mobile screenshot and one desktop screenshot when the UI changes.
5. If a miss is found, add the smallest durable guardrail that would have caught it.

## What Not To Do

- Do not rely on "looks okay" without an explicit oracle.
- Do not treat route `200` as visual parity.
- Do not add broad instructions when a script or test can enforce the behavior.
- Do not weaken search-blocking, production safeguards, credential rules, or trading/payment/admin safeguards to reduce friction.
- Do not keep stale helper scripts whose names imply a safer behavior than they actually perform.
