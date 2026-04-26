# Cloud-Only Workflow

Use this when the goal is simple: do KCG work in one cloud-backed place and avoid per-computer local setup.

## The Simple Rule

Use **Codex Cloud + GitHub** as the working source.

- Codex Cloud does the work.
- GitHub `junyoung8753/kcg-site` stores the code and history.
- Vercel `kcg-confirm-preview` shows the site.
- Local computers are only terminals/viewers unless you intentionally choose local work.

## Cloud vs Local

Cloud and local work are different operating modes:

- Cloud work runs in an OpenAI-managed container. It checks out the GitHub repo, runs the configured setup script, edits files there, and returns a diff, branch, or PR. It does not use files from the home or company computer.
- Local work runs on the physical Windows computer. It can access local files, local browser sessions, desktop apps, and PC-specific tools, but every computer needs its own clone, installs, and logins.
- For cross-computer continuation, Cloud is the default. The durable state is GitHub plus this repo's handoff docs, not an old chat thread or a local folder.
- For desktop-specific work such as cleaning local folders, using local-only files, or checking a user's installed app state, use local Codex on that computer.

## Cloud Environment Settings

Recommended Codex Cloud environment for ordinary KCG work:

```text
Repository: junyoung8753/kcg-site
Branch: main
Node.js: 24
Setup script: npm ci && npx playwright install chromium
Maintenance script: npm ci
```

For source-parity work against `https://kcg-confirm-preview.vercel.app`, the agent phase needs internet access. Prefer limited access:

```text
Network: On, limited
Allowed domains: kcg-confirm-preview.vercel.app, vercel.app
Allowed methods: GET, HEAD, OPTIONS
```

Keep network off for tasks that only inspect or edit local repo files. Enable broader internet only when the task explicitly needs official docs, competitor/reference-site research, package registry checks, or external service verification.

## Model, Speed, And Quality

For Cloud tasks, do not assume the local app's model selector or `config.toml` model setting controls the cloud model. If a cloud model selector is visible, choose the strongest available model for KCG work. If no selector is visible, rely on the current Codex Cloud default and enforce quality through repo context, tests, parity scripts, screenshots, and review.

Do not use a fast or quick mode for KCG visual parity, trading/pricing language, admin/auth, deployment, or source restoration tasks unless junyoung explicitly asks for a quick draft. Speed is secondary to correctness.

Quality controls that matter more than a UI toggle:

- Read `AGENTS.md` and `docs/setup/CURRENT_HANDOFF.md`.
- Run `npm run compare:source` when the stable URL is the reference.
- Run the required lint, typecheck, audit, build, site test, and screenshot checks before claiming completion.
- Report what was verified and what was not.

## Cloud Permissions And Safety

Windows administrator permissions, UAC, and local folder permissions do not apply inside Codex Cloud. Cloud permissions are repo access, environment settings, internet access, and service authorizations.

Never put secrets in chat or git. Use Codex Cloud environment variables/secrets, Vercel project settings, or official OAuth/login flows.

The agent may prepare deployment commands, but production deployment, stable URL alias changes, public launch/search indexing, account deletion, credential changes, payment/trading behavior, and real customer data changes require explicit user approval.

## What You Do On Any Computer

1. Sign in to the same Codex/ChatGPT account.
2. Start a Codex Cloud task attached to:

   ```text
   Repository: junyoung8753/kcg-site
   Branch: main
   ```

3. Paste this:

   ```text
   KCG 사이트 작업 이어가자. AGENTS.md와 docs/setup/CURRENT_HANDOFF.md를 먼저 읽어라. 현재 기준 원본은 https://kcg-confirm-preview.vercel.app 전체 사이트다. npm run build 후 npm run compare:source로 현재 main과 원본 URL 차이를 확인하고, source parity 복구부터 진행해라. 안정 URL alias 변경이나 production 배포는 사용자 명시 승인 전에는 하지 마라.
   ```

That is the default workflow. No PowerShell is needed for cloud-only work.

If the task needs to compare against the stable URL and cloud internet is off, ask junyoung to enable limited cloud internet for the allowed domains above, then retry. Do not replace the stable URL or use temporary `_vercel_jwt` / `_vercel_jwe` URLs as the source of truth.

## What Still Has To Be Done Once Per Computer

Only login/session state may be per computer:

- Codex/ChatGPT account sign-in
- GitHub authorization if the app asks for it
- Vercel authorization only when a task needs Vercel account actions

Do not paste passwords or tokens into Codex. Use the official login/OAuth screens.

## When PowerShell Is Needed

Use the PowerShell bootstrap only if you want the project cloned locally on that physical computer:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "iwr -UseBasicParsing https://raw.githubusercontent.com/junyoung8753/kcg-site/main/scripts/Start-KcgContinuation.ps1 -OutFile $env:TEMP\Start-KcgContinuation.ps1; & $env:TEMP\Start-KcgContinuation.ps1"
```

This is optional for cloud-only work.

## Do Not Mix Modes Accidentally

- If you work in Codex Cloud: review/apply/merge the Cloud result, then the state is in GitHub.
- If you work locally: commit and push before switching computers.
- If you are unsure, use Cloud and avoid local edits.
