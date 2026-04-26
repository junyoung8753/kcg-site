# Continue Anywhere Setup

This repo is the source of truth for the KCG site. Chat threads are useful context, but code continuity across computers must come from GitHub, Vercel, and repeatable setup commands.

For the latest short handoff context, read `docs/setup/CURRENT_HANDOFF.md` first.
For the simplest "one cloud place only" workflow, read `docs/setup/CLOUD_ONLY_WORKFLOW.md`.

## What Syncs

- Code, docs, tests, public assets, and project rules sync through GitHub: `junyoung8753/kcg-site`.
- Preview and production hosting sync through Vercel project: `kcg-confirm-preview`.
- Codex behavior for this project is guided by `AGENTS.md` and this setup document.
- CI verification runs through GitHub Actions workflow: `Site Quality`.

## What Does Not Sync

- `node_modules`, `.next`, Playwright browser downloads, caches, and screenshots are recreated per computer.
- `.env*`, `.vercel`, Supabase service role keys, admin passwords, cookies, tokens, and local Vercel settings must not be committed.
- Codex chat history is not the reliable project state. Important decisions should be committed as docs, TODOs, issues, or PR descriptions.
- OAuth sessions for Codex, GitHub, Vercel, Google, Figma, and Notion may need one-time login per computer.

## Why Vercel URLs Look Complicated

Vercel creates a unique deployment URL every time the site is deployed, for example:

```text
https://kcg-confirm-preview-<random-id>-junyoung8753-2361s-projects.vercel.app
```

Those URLs are normal deployment snapshots. They are useful for comparing a specific build, but they are not the main working source.

The stable review URL is:

```text
https://kcg-confirm-preview.vercel.app/
```

That stable URL is an alias. If the alias points to an older production deployment while newer preview deployments exist, the site can look "split" even though the code is not split. Before important visual review, inspect the alias and the latest preview deployment and make sure they point to the intended version.

Do not store or share URLs containing `_vercel_jwt` or `_vercel_jwe` query parameters. They are temporary deployment-protection session URLs, not durable project links.

Current handoff rule:

- Treat `https://kcg-confirm-preview.vercel.app/` as the source reference for the company-facing site.
- The user clarified on 2026-04-26 that separate company-PC local recovery is not required because the company-PC work was automatically reflected to the stable URL.
- Do not promote a newer preview to the stable URL just because it is newer. Promote only after `main` has been intentionally accepted as the review baseline or after source parity against the stable URL has been restored and verified.
- To measure parity, run `npm run build` and then `npm run compare:source`. The report is written under `output/source-parity`, which is intentionally not committed.

## First Setup On A New Computer

If you want cloud-only work, skip this section. A new computer only needs the same Codex account signed in, then start a Codex Cloud task on `junyoung8753/kcg-site` and follow `docs/setup/CLOUD_ONLY_WORKFLOW.md`.

Install or verify these tools:

```powershell
git --version
node --version
npm --version
gh --version
vercel --version
codex --version
```

Easiest one-command setup:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "iwr -UseBasicParsing https://raw.githubusercontent.com/junyoung8753/kcg-site/main/scripts/Start-KcgContinuation.ps1 -OutFile $env:TEMP\Start-KcgContinuation.ps1; & $env:TEMP\Start-KcgContinuation.ps1"
```

This handles the normal cases:

- If the repo already exists at `Documents\Codex\projects\kcg-site`, it pulls the latest `main`.
- If it does not exist, it clones `junyoung8753/kcg-site`.
- If `vercel` is installed and logged in, it links/pulls the Vercel project using the computer's normal Vercel CLI login state.
- If a required tool or login is missing, it tells you exactly what to install or log into.

Manual clone flow:

```powershell
git clone https://github.com/junyoung8753/kcg-site.git
cd kcg-site
```

Run the project continuation check:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-continuation.ps1 -Install -PullVercel
```

If the computer is ready for full verification, run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-continuation.ps1 -RunChecks
```

Use `-PullVercel` only after Vercel CLI login has been completed on that computer. The command links this folder to `kcg-confirm-preview` and pulls project settings/env values through the official Vercel CLI without committing them.

By default, `scripts/check-continuation.ps1` uses the computer's normal CLI login/keyring state. Use `-UseProjectLocalCliState` only for temporary sandboxes where you intentionally want tool login/cache files isolated under the project folder.

## Source URL Recovery

If the old Codex thread is missing, use the stable deployed site as the observable source reference:

```powershell
npm run build
npm run compare:source
```

This compares the local build against `https://kcg-confirm-preview.vercel.app/` across the critical routes and records screenshots plus `output/source-parity/parity-report.json`. A non-zero exit means the local repo is not yet source-identical. Decide whether to restore parity first or intentionally accept the local repo as the improved baseline before changing the stable Vercel alias.

## Daily Local Flow

Before starting work:

```powershell
git status
git pull
npm install
```

Before moving to another computer or asking Codex Cloud to continue:

```powershell
npm run lint
npm run typecheck
npm run audit:site
npm run build
npm run compare:source
npm run test:site
git status
git add .
git commit -m "Describe the completed change"
git push
```

If there is unfinished work that should not be pushed to `main`, create a branch:

```powershell
git switch -c feature/short-description
git add .
git commit -m "Describe the work in progress"
git push -u origin feature/short-description
```

## Codex Desktop Flow

- Open this folder as the Codex project: `C:\Users\junyo\Documents\Codex\projects\kcg-site`.
- Use a project thread attached to this folder for KCG work. Avoid continuing substantial KCG implementation from a generic chat with no project attached.
- Use Local when you want Codex to edit the active folder on this computer.
- Use Worktree when you want Codex to work in the background or try a branch without disturbing the main local checkout.
- Use Handoff to move a thread between Local and Worktree instead of manually checking out the same branch in two places.

Recommended local environment actions to configure in the Codex app for this project:

- `Install`: `npm ci`
- `Dev`: `npm run dev`
- `Build`: `npm run build`
- `Validate`: `npm run lint && npm run typecheck && npm run audit:site && npm run build && npm run test:site`
- `Screenshots`: `npm run screenshot:site`

Codex local environment settings are stored in a project `.codex` folder when generated by the app. Do not hand-write an unknown `.codex` schema; generate it from the Codex app settings and commit only the non-secret config it creates.

## Codex Cloud Flow

Use Codex Cloud when you want work to continue without relying on this computer being on. This is the preferred low-confusion workflow for junyoung.

Cloud environment target:

- Repository: `junyoung8753/kcg-site`
- Branch: usually `main` for inspection, a feature branch for implementation
- Runtime: Node.js `22` unless Codex Cloud later exposes a higher supported version
- Setup script: `npm ci` followed by `npx playwright install --with-deps chromium`
- Maintenance script: `npm ci`
- Network: on with the Common dependencies preset plus the KCG source-site, Vercel, Google Fonts, npm, and Playwright domains for source-parity work
- Secrets: configure in Codex Cloud settings, not in chat and not in git

Typical cloud task flow:

1. Start a Codex Cloud task against `junyoung8753/kcg-site` on branch `main` or a feature branch.
2. Paste the prompt from `docs/setup/CLOUD_ONLY_WORKFLOW.md` or `docs/setup/CURRENT_HANDOFF.md`.
3. Review the diff, CI result, screenshots, or PR before merging.
4. Merge or apply the cloud result.
5. If you later use a local computer, run `git pull`; otherwise keep working in Cloud.

The Cloud environment must be checked after product updates because runtime versions, setup scripts, and network controls are per-environment settings.

If `npm run compare:source` or `npm run test:site` fails in Cloud with missing Linux browser libraries such as `libatk-1.0.so.0`, the fix is Cloud dependency setup, not source-code simplification:

```bash
npx playwright install --with-deps chromium
```

## Vercel Flow

Use Vercel for preview and hosting, not as the code source of truth.

Link and pull on a new computer:

```powershell
vercel link --yes --project kcg-confirm-preview --scope junyoung8753-2361s-projects
vercel pull --yes --scope junyoung8753-2361s-projects
```

Deploy preview only after local checks pass:

```powershell
vercel --scope junyoung8753-2361s-projects
```

Production deployment or alias changes require explicit approval. Keep noindex/search blocking until public launch approval.

To see what the stable URL currently points to:

```powershell
vercel inspect https://kcg-confirm-preview.vercel.app --scope junyoung8753-2361s-projects
```

To list recent preview/production snapshots:

```powershell
vercel ls kcg-confirm-preview --scope junyoung8753-2361s-projects
```

## GitHub Flow

Use GitHub as the shared source of truth:

- `main` should represent the latest reviewed baseline.
- Use pull requests or short feature branches for larger changes.
- Use GitHub Actions `Site Quality` to re-run full checks from any computer.
- If work happens on another PC or Codex Cloud, return here with `git pull` before editing locally.

Current repo visibility is public. If the site work should be private, change visibility deliberately after confirming deployment, access, and collaboration impact.

## Quick Decision Guide

- Need fast local edit on this PC: use Codex Desktop Local on this folder.
- Need background experiment: use Codex Desktop Worktree.
- Need work to continue while this PC is off: use Codex Cloud task on GitHub repo.
- Need another physical computer: clone GitHub repo, log in once to GitHub/Vercel/Codex, then run the continuation script.
- Need to show the site to someone: use Vercel preview URL, not GitHub.
- Need to preserve work before switching machines: commit and push.
