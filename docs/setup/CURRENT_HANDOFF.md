# Current KCG Handoff

Last updated: 2026-04-27 KST.

This file is the short, durable context for a new Codex chat, another PC, or Codex Cloud. Read it before continuing KCG site work.

Junyoung's preferred workflow is cloud-only when possible. Use `docs/setup/CLOUD_ONLY_WORKFLOW.md` before suggesting local PC setup.

## Current Source Of Truth

- GitHub repo: `junyoung8753/kcg-site`
- Main working branch: `main`
- Vercel project: `kcg-confirm-preview`
- Current repo state is the single production candidate.
- Stable review domain: `https://kcg-confirm-preview.vercel.app`
- The historical source site exists in the company Codex environment. Do not treat the stable review URL as an older source to restore unless junyoung explicitly asks.

## Current Product Direction

KCG should not be a generic mall, broad trading platform, or multi-option design playground. The final direction is:

- `/` is the only public home surface.
- Company posted prices are first; automatic market data is secondary.
- Phone and visit preparation beat checkout/cart behavior.
- Use KCG real brand/campaign assets, restrained price-desk layout, and mobile-first scanability.
- Keep KRX confusion-prevention and source attribution.
- Do not restore old option routes such as `/option-1` or `/option-2`.

## Current Important Status

- This repo is ready for cross-computer work through GitHub.
- Codex local environment config is committed under `.codex/environments/environment.toml`.
- `docs/quality/ai-site-production-playbook.md` records the KCG AI site-building workflow: context pack, product surface, KCG constraints, acceptance criteria, browser evidence, score, and durable guardrail.
- `docs/quality/data-source-compliance.md` records the source-attribution and licensing rules for Gold API, Metals.Dev, Google News RSS-style headlines, paid news API candidates, charts, calculators, forms, and competitor references.
- `docs/research/gold-exchange-deep-audit-2026-04-27.md` records the deeper competitor benchmark pass across home, subpages, price wording, forms, tables, and network/API/chart behavior. Do not treat a home-screen-only review as sufficient for benchmark-driven work.
- `/option-1` and `/option-2` have been removed from the app. The audit and Playwright tests now expect those routes to return 404.
- The old source comparison script has been removed from the default workflow because the repo is now the accepted baseline.
- `/products` is now the public consultation catalog surface. It is intentionally not a checkout/cart mall: price wording, product photos, display order, visibility, and consultation notes can be managed through the product model/admin flow, while public copy keeps phone/visit consultation as the conversion path.
- Product data now has a shared repo contract across mock data, Supabase schema/seed, public pages, and admin editing. Keep product statuses limited to `active`, `inquiry_required`, and `hidden` unless a real operational need appears.
- Public business-registration wording must not show fake or placeholder numbers. Until the verified registration document is provided, the site says the registration information will be reflected after confirmation.
- Keep search blocking/noindex until public launch approval.

## Latest Local Verification

2026-04-27 KST after product catalog/admin and launch-readiness updates:

```powershell
npm run lint
npm run typecheck
npm run audit:site
npm run build
$env:SITE_AUDIT_URL='http://127.0.0.1:3000'; npm run audit:site
npm run test:site
npm run screenshot:site
npm audit --audit-level=moderate
```

All commands passed locally. Rendered route audit passed 221 checks with 0 skipped, Playwright passed 6 tests, and screenshots were saved under `output/screenshots`.

## Codex Cloud Status

- Codex Cloud environment: `junyoung8753/kcg-site`.
- Current confirmed runtime: Node.js 22 in Cloud. Do not assume Node 24 unless the Cloud UI explicitly exposes it.
- Setup script:

  ```bash
  npm ci
  npx playwright install --with-deps chromium
  ```

- Maintenance script:

  ```bash
  npm ci
  ```

- If a future Cloud task fails with missing Playwright Linux libraries such as `libatk-1.0.so.0`, fix the Cloud setup or run `npx playwright install --with-deps chromium`; do not remove fonts, images, routes, or visual QA code to hide the environment problem.

## Next Recommended Work

1. Treat the current repo as the single production candidate.
2. Before visual or route work, read:

   ```text
   AGENTS.md
   docs/quality/product-experience-rubric.md
   docs/quality/data-source-compliance.md
   docs/quality/ai-site-production-playbook.md
   docs/research/gold-exchange-benchmark-2026-04-25.md
   docs/research/gold-exchange-deep-audit-2026-04-27.md
   ```

3. Make focused changes that improve price clarity, consultation conversion, source safety, or mobile readability.
4. Then run:

   ```powershell
   npm run lint
   npm run typecheck
   npm run audit:site
   npm run build
   npm run test:site
   npm audit --audit-level=moderate
   ```

5. For visual changes, also run:

   ```powershell
   npm run screenshot:site
   ```

6. Inspect at least one mobile screenshot of `/` before claiming visual completion.

## Backup Before Switching Or Launch

When launch-prep work is complete, preserve the finished state in GitHub before switching computers or starting a new Codex Cloud task:

```powershell
npm run lint
npm run typecheck
npm run audit:site
npm run build
npm run test:site
npm audit --audit-level=moderate
git status
git add .
git commit -m "Prepare KCG site launch readiness"
git push
```

If the work is not ready for `main`, use a `codex/` feature branch and push that branch instead. Do not commit `.env*`, `.vercel`, Supabase service role keys, admin passwords, cookies, tokens, local Vercel settings, or protected deployment URLs.

## New Chat Prompt

When starting a new project chat in this repo, a short prompt is enough:

```text
kcg사이트 만들던거 이어나갈수있게 준비해
```

Agents must treat that short prompt as equivalent to:

```text
KCG 사이트 작업 이어가자. 이 repo의 AGENTS.md, docs/setup/CURRENT_HANDOFF.md, docs/quality/product-experience-rubric.md, docs/quality/data-source-compliance.md, docs/quality/ai-site-production-playbook.md를 먼저 읽고, 현재 repo를 단일 오픈 후보 기준으로 점검해줘. API/RSS/차트/폼/경쟁사 참고는 출처와 약관 기준을 지키고, old option route 복구나 production 배포, stable alias 변경, 검색 색인 허용은 내가 명확히 승인하기 전에는 하지 마.
```

## Cloud-Only Start

For the least confusing workflow, use Codex Cloud attached to:

```text
Repository: junyoung8753/kcg-site
Branch: main
```

Then paste the New Chat Prompt above. No PowerShell is needed unless the user wants this repo cloned locally on that computer.

## New Computer Setup

Only do this if the user wants local files on that computer. It is not required for cloud-only work.

On a new local computer:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "iwr -UseBasicParsing https://raw.githubusercontent.com/junyoung8753/kcg-site/main/scripts/Start-KcgContinuation.ps1 -OutFile $env:TEMP\Start-KcgContinuation.ps1; & $env:TEMP\Start-KcgContinuation.ps1"
```

This finds or creates `Documents\Codex\projects\kcg-site`, pulls the latest `main`, installs dependencies, and pulls Vercel project settings when the Vercel CLI is already logged in with the computer's normal CLI/keyring state.

## Do Not Lose

- Do not store `_vercel_jwt` or `_vercel_jwe` URLs.
- Do not commit `.env*`, `.vercel`, Supabase service role keys, admin passwords, cookies, tokens, or local Vercel settings.
- Keep search blocking/noindex until public launch approval.
- Keep company posted prices separate from automatic market-reference data.
- Keep `/` as the single public home surface.
