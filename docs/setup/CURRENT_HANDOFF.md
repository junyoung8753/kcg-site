# Current KCG Handoff

Last updated: 2026-04-26 KST.

This file is the short, durable context for a new Codex chat, another PC, or Codex Cloud. Read it before continuing KCG site work.

Junyoung's preferred workflow is cloud-only when possible. Use `docs/setup/CLOUD_ONLY_WORKFLOW.md` before suggesting local PC setup.

## Current Source Of Truth

- GitHub repo: `junyoung8753/kcg-site`
- Main working branch: `main`
- Vercel project: `kcg-confirm-preview`
- Stable review domain: `https://kcg-confirm-preview.vercel.app`
- Stable review domain means the whole site under that domain, including `/`, `/prices`, `/announcements`, `/services`, `/about`, `/admin/login`, and `/api/health`.
- The user clarified that the company-PC local folder does not need separate recovery because company-PC work was automatically reflected to the stable review domain.

## Current Important Status

- This repo is ready for cross-computer work through GitHub.
- Codex local environment config is committed under `.codex/environments/environment.toml`.
- The stable review domain currently points to a production deployment from 2026-04-24.
- Current GitHub `main` is not yet source-identical to the stable review domain.
- `npm run compare:source` detects the current difference across text, H1, image list, and link list.
- Do not change the stable Vercel alias or promote a newer preview until either source parity is restored and verified, or the user explicitly accepts current `main` as the improved baseline.

## Codex Cloud Status

- Codex Cloud environment: `junyoung8753/kcg-site`.
- Current confirmed runtime: Node.js 22 in Cloud. Do not assume Node 24 unless the Cloud UI explicitly exposes it.
- Agent internet access is on with the Common dependencies preset plus the KCG source-site, Vercel, Google Fonts, npm, and Playwright domains.
- Setup script is:

  ```bash
  npm ci
  npx playwright install --with-deps chromium
  ```

- Maintenance script is:

  ```bash
  npm ci
  ```

- If a future Cloud task fails with missing Playwright Linux libraries such as `libatk-1.0.so.0`, fix the Cloud setup or run `npx playwright install --with-deps chromium`; do not remove fonts, images, routes, or source-parity code to hide the environment problem.

## Next Recommended Work

1. Restore source parity against `https://kcg-confirm-preview.vercel.app` first, unless the user explicitly chooses current `main` as the new baseline.
2. Use:

   ```powershell
   npm run build
   npm run compare:source
   ```

   In Codex Cloud, if Playwright was not installed by the environment setup, run this once before the comparison:

   ```bash
   npx playwright install --with-deps chromium
   ```

3. Inspect `output/source-parity/parity-report.json` and screenshots under `output/source-parity`.
4. Make the smallest code changes needed to close intentional parity gaps.
5. Then run the normal verification set:

   ```powershell
   npm run lint
   npm run typecheck
   npm run audit:site
   npm run build
   npm run test:site
   npm audit --audit-level=moderate
   ```

6. For visual changes, also run:

   ```powershell
   npm run screenshot:site
   ```

## New Chat Prompt

When starting a new project chat in this repo, a short prompt is enough:

```text
kcg사이트 만들던거 이어나갈수있게 준비해
```

Agents must treat that short prompt as equivalent to this fuller instruction:

```text
KCG 사이트 작업 이어가자. 이 repo의 AGENTS.md와 docs/setup/CURRENT_HANDOFF.md를 먼저 읽고, https://kcg-confirm-preview.vercel.app 전체 사이트를 원본 기준으로 현재 main과 compare:source 결과를 확인한 뒤, source parity 복구부터 진행해줘. 안정 URL alias 변경이나 production 배포는 내가 명확히 승인하기 전에는 하지 마.
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

This finds or creates `Documents\Codex\projects\kcg-site`, pulls the latest `main`, installs dependencies, and pulls Vercel project settings when the Vercel CLI is already logged in with the computer's normal CLI/keyring state. If Vercel or GitHub login is missing, complete the official browser/OAuth login once on that computer, then rerun the script.

## Do Not Lose

- Do not store `_vercel_jwt` or `_vercel_jwe` URLs.
- Do not commit `.env*`, `.vercel`, Supabase service role keys, admin passwords, cookies, tokens, or local Vercel settings.
- Keep search blocking/noindex until public launch approval.
- Keep company posted prices separate from automatic market-reference data.
