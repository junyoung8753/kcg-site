# Continue Anywhere Setup

This repo is the source of truth for the KCG site. Chat threads are useful context, but code continuity across computers must come from GitHub, Vercel, and repeatable setup commands.

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

## First Setup On A New Computer

Install or verify these tools:

```powershell
git --version
node --version
npm --version
gh --version
vercel --version
codex --version
```

Clone and enter the project:

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

## Recover The Original Company-PC Work

If the original Codex thread was local-only on another computer, the thread itself may not appear here. The work is recoverable only if the original files still exist on that computer or were pushed to GitHub.

On the company computer, use this repo as the baseline and scan for older/local KCG copies:

```powershell
git clone https://github.com/junyoung8753/kcg-site.git
cd kcg-site
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\find-kcg-workspaces.ps1
```

For any candidate folder that looks newer than this repo, check:

```powershell
cd "C:\path\to\candidate"
git status
git remote -v
git log --oneline -5
```

If the candidate has useful unpushed work, push it to a branch instead of overwriting `main`:

```powershell
git switch -c company-pc-recovery
git add .
git commit -m "Recover company PC KCG work"
git push -u origin company-pc-recovery
```

Then review and merge from GitHub or ask Codex to compare `company-pc-recovery` against `main`.

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

Use Codex Cloud when you want work to continue without relying on this computer being on.

Cloud environment target:

- Repository: `junyoung8753/kcg-site`
- Branch: usually `main` for inspection, a feature branch for implementation
- Runtime: Node.js `24`, matching GitHub Actions and Vercel
- Setup script: `npm ci`
- Maintenance script: `npm ci`
- Network: off by default; enable limited internet only for tasks that need official docs, source-site inspection, or external API checks
- Secrets: configure in Codex Cloud settings, not in chat and not in git

Typical cloud task flow:

1. Push the latest local work to GitHub.
2. Start a Codex Cloud task against `junyoung8753/kcg-site`.
3. Review the diff, CI result, screenshots, or PR before merging.
4. Merge or apply the cloud result.
5. On any local computer, run `git pull`.

The Cloud environment must be checked after product updates because runtime versions, setup scripts, and network controls are per-environment settings.

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
