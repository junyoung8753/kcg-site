# Missing Chat Recovery

Last checked: 2026-05-11 KST.

Use this file when the Codex project chat/thread for KCG disappears from the app UI. The missing chat is useful context, but it is not the source of truth. Continue from this repository, the handoff docs, GitHub, and Vercel.

## Current Continuation Target

- Local repo: `C:\Users\junyo\Documents\Codex\projects\kcg-site`
- Codex local config: this folder is explicitly registered as a trusted project in `C:\Users\junyo\.codex\config.toml`
- GitHub repo: `junyoung8753/kcg-site`
- Working branch: `codex/kcg-launch-readiness-catalog-20260427`
- Stable review URL: `https://kcg-confirm-preview.vercel.app`
- Vercel project: `kcg-confirm-preview`
- Primary handoff: `docs/setup/CURRENT_HANDOFF.md`
- Task ledger: `docs/setup/OPEN_TASKS.md`

## Recovered Local Chat Records

- Session index: `C:\Users\junyo\.codex\session_index.jsonl`
- Main KCG continuation thread listed in the index:
  - Thread name: `KCG 사이트 작업 이어가기 준비`
  - Thread id: `019dca32-770b-7290-86f5-11eb7daab29e`
  - Local session file: `C:\Users\junyo\.codex\sessions\2026\04\26\rollout-2026-04-26T23-29-58-019dca32-770b-7290-86f5-11eb7daab29e.jsonl`
  - Last file update observed: 2026-04-28 21:26 KST
- Related local/archived records found by id search:
  - `C:\Users\junyo\.codex\archived_sessions\rollout-2026-04-29T01-23-43-019dd4e7-5279-7a62-972e-3cabc4f4d003.jsonl`
  - `C:\Users\junyo\.codex\sessions\2026\04\27\rollout-2026-04-27T17-53-17-019dce24-9485-7170-b44b-24d563e5c078.jsonl`
  - `C:\Users\junyo\.codex\sessions\2026\04\27\rollout-2026-04-27T01-51-22-019dcab3-ee8f-7bb3-87c6-eb08b98958b9.jsonl`
  - `C:\Users\junyo\.codex\sessions\2026\04\27\rollout-2026-04-27T01-51-17-019dcab3-d743-78d3-94fb-26623a17b655.jsonl`

Do not edit Codex SQLite databases or token files to force this chat back into the sidebar. If the app no longer shows the thread, start a new project chat attached to this folder and use the prompt below.

## Prompt To Continue

```text
kcg사이트 만들던거 이어나갈수있게 준비해
```

The repo instructions expand that short request. A new Codex chat should read, in order:

1. `AGENTS.md`
2. `docs/setup/CURRENT_HANDOFF.md`
3. `docs/setup/OPEN_TASKS.md`
4. `docs/setup/MISSING_CHAT_RECOVERY.md`
5. Relevant quality docs listed in `CURRENT_HANDOFF.md`

## E Drive Backup Search Result

The E: drive was searched on 2026-04-29 KST. KCG material was found there too:

- Backup repo copy: `E:\Codex\projects\kcg-site`
- Old KCG work room: `E:\Codex\2026-04-26\kcg-site-work`
- Old start file: `E:\Codex\2026-04-26\kcg-site-work\START_HERE.md`
- Old status file: `E:\Codex\2026-04-26\kcg-site-work\CURRENT_REPO_STATUS.md`

The C: repo has the newer current handoff and is the working target. Treat E: as backup/context unless junyoung explicitly asks to recover from it.

## No-Secret Backup

- Local no-secret working-tree zip: `C:\Users\junyo\Documents\File-Hub\80_보관함/백업/Backups\kcg-site\kcg-site-workingtree-20260428-210137.zip`
- This zip excludes `.git`, `.env*`, `.vercel`, `.next`, `node_modules`, `output`, and Supabase CLI temp metadata.

## Safe Recovery Rules

- Do not commit `.env*`, `.vercel`, Supabase service-role keys, admin passwords, cookies, tokens, or local Vercel settings.
- Do not change production deploys, stable aliases, Cafe24 DNS, robots/noindex, or public search indexing without explicit junyoung approval.
- If a chat is missing, recover continuity from this repo and handoff docs instead of relying on old chat UI state.
- Before switching computers or relying on Codex Cloud, commit and push intentional work or create a no-secret backup.

## 2026-05-11 Verification

- `scripts/check-continuation.ps1` found Git, Node.js, npm, GitHub CLI, Vercel CLI, and Codex CLI.
- Current local branch: `codex/kcg-launch-readiness-catalog-20260427`.
- `npm run check:release-state` passed on `https://kcgold.co.kr` with search exposure guarded.
- `npm run check:external -- --strict-domain` passed stable `/api/health`, `robots.txt`, empty pre-launch `sitemap.xml`, and DNS checks for `kcgold.co.kr` and `www.kcgold.co.kr`.
- The current production review deployment is `dpl_6gnD1Cv7DHuL4AqcGEfgQ8DAt7ya`, aliased to `https://kcgold.co.kr`, `https://www.kcgold.co.kr`, and `https://kcg-confirm-preview.vercel.app`. This is still a noindex-protected review deployment, not public search launch approval.
