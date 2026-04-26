# Cloud-Only Workflow

Use this when the goal is simple: do KCG work in one cloud-backed place and avoid per-computer local setup.

## The Simple Rule

Use **Codex Cloud + GitHub** as the working source.

- Codex Cloud does the work.
- GitHub `junyoung8753/kcg-site` stores the code and history.
- Vercel `kcg-confirm-preview` shows the site.
- Local computers are only terminals/viewers unless you intentionally choose local work.

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

