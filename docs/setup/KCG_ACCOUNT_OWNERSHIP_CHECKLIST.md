# KCG Account Ownership Checklist

Last updated: 2026-05-06 KST.

This checklist records ownership and migration status only. Do not write passwords, MFA values, recovery codes, card numbers, OAuth tokens, cookies, service-role keys, API keys, or password-manager exports here.

## Operating Decision

- Permanent representative company account: `kcgoldx@gmail.com`
- Personal account role after migration: backup owner / co-admin
- Optional future domain mailbox: `admin@kcgold.co.kr` only if KCG later chooses Google Workspace or another custom-domain mail provider
- Minimal required mode: junyoung logs in to `kcgoldx@gmail.com`; Codex handles non-secret org/team/project setup, verification, and checklist updates after login
- Paid services mode: company card/payment is entered only when a paid server/API/billing plan is actually needed
- Public site effect: none
- Search effect: none; robots/noindex remains blocked until separate approval

## Do Now / Defer

| Category | Status | Owner | Rule |
| --- | --- | --- | --- |
| `kcgoldx@gmail.com` browser login | user-only | junyoung/company | Log in directly; do not paste password, MFA, cookies, or recovery codes into Codex. |
| Human security prompts | user-only | junyoung/company | Complete MFA/passkey/CAPTCHA/phone/email/terms/transfer confirmations when they appear. |
| Vercel company workspace/project transfer prep | codex-doable after login | codex | Create/verify safe non-secret team/project setup and run validation without exposing env values. |
| Supabase company organization/project transfer prep | codex-doable after login | codex | Create/verify safe non-secret org setup and run health checks without exposing service keys. |
| Company card/payment entry | user-only later | junyoung/company | Only when Vercel/Supabase/API billing is actually selected or required. |
| Google Workspace / `@kcgold.co.kr` mail | deferred | shared | Not required for current server/API billing or public-site operation. |
| GitHub paid Team | deferred | shared | Not required for the current public repo unless governance/private-repo needs change. |

## Account Security Checklist

| Item | Status | Owner | Notes Without Secret Values |
| --- | --- | --- | --- |
| Password-manager entry for `kcgoldx@gmail.com` | user-only | junyoung/company | Store password, MFA method notes, and offline recovery-code location only in the vault/offline backup. |
| Google 2-Step Verification | user-only | junyoung/company | Verify enabled; do not record codes. |
| Google passkey/security key | user-only | junyoung/company | Recommended for long-term ownership. |
| Recovery phone | user-only | junyoung/company | Record only that a recovery phone exists, not the number, if privacy is preferred. |
| Recovery email | user-only | junyoung/company | Record only the recovery-email owner/type, not secret access details. |
| Offline recovery-code backup | user-only | junyoung/company | Store outside Git/docs/chat. |

## Service Ownership Matrix

| Service | Target Account / Org / Team | Current Known State | Billing Status | Recovery Method Type | Transfer Status | Next Step |
| --- | --- | --- | --- | --- | --- | --- |
| Google representative account | `kcgoldx@gmail.com` | Chosen as permanent KCG representative Gmail | Company decision/user-only | Password manager + 2SV + passkey + recovery phone/email | Login/security prompts user-only | Junyoung logs in and completes security prompts; Codex verifies visible non-secret status after login. |
| Vercel | `KCG` or `Korea Center Gold Exchange` team under `kcgoldx@gmail.com` | Project `kcg-confirm-preview` currently runs production domains | Company card only if transfer/operation requires it or Pro is chosen later | Team owner + backup owner | Codex-doable after login | Codex creates/verifies team, invites backup owner where possible, prepares transfer, and runs post-transfer checks. |
| Supabase | `Korea Center Gold Exchange` organization under `kcgoldx@gmail.com` | Project ref `ehmsqlfxxydnebzjfarr` currently backs production data | Pay only if plan/usage/transfer requirements require it | Org owner + backup owner | Codex-doable after login | Codex creates/verifies org, invites backup owner where possible, prepares project transfer, and checks `/api/health`. |
| GitHub | Org slug candidate `kcgold`, `korea-center-gold`, or `kcgold-exchange` | Repo `junyoung8753/kcg-site` is public | Paid Team not required for current public repo unless governance needs change | Org owner + backup owner | Deferred unless ownership/Git integration requires it | Codex prepares org/repo transfer only after Vercel/Supabase are stable or when it becomes necessary. |
| Cafe24 / domain DNS | Company-owned Cafe24/domain account | `kcgold.co.kr` and `www.kcgold.co.kr` point to Vercel | Existing domain/DNS billing must stay active | Account recovery + backup owner | Planned | Keep DNS stable; do not delete Vercel A records. |
| Google Workspace / custom domain mail | Optional later `admin@kcgold.co.kr` | Previous checkout path exists but is no longer default | Paid optional | Workspace admin + recovery owner | Deferred | Buy only if KCG wants `@kcgold.co.kr` mail. |

## Transfer Readiness Checklist

Before any transfer:

- [ ] `git status --short --branch` is clean or expected.
- [ ] `npm run release:trace` reports the current version and branch.
- [ ] `npx vercel inspect https://kcgold.co.kr/` shows the current live deployment.
- [ ] `npm run check:external -- --strict-domain` confirms production health, custom domains, robots/noindex, and sitemap posture.
- [ ] The target service org/team exists.
- [ ] junyoung personal account is invited as backup Owner/Admin where the service supports it.
- [ ] Company payment method is entered only by junyoung/company, not Codex.
- [ ] No secret values are copied into docs/chat/Git.

After Vercel transfer:

- [ ] `npx vercel whoami`
- [ ] `npx vercel project ls`
- [ ] `npx vercel inspect https://kcgold.co.kr/`
- [ ] `npx vercel env ls production` shows expected variable names/scopes without values.
- [ ] `npm run check:external -- --strict-domain`

After Supabase transfer:

- [ ] `npx supabase projects list`
- [ ] `npx supabase link --project-ref ehmsqlfxxydnebzjfarr`
- [ ] `Invoke-WebRequest https://kcgold.co.kr/api/health` reports `mode=supabase` and `indexing=disabled`.

After GitHub transfer:

- [ ] `gh auth status`
- [ ] `gh repo view <company-org>/kcg-site`
- [ ] `git remote -v`
- [ ] `git fetch --all --prune`
- [ ] Vercel Git integration is still connected or has been reconnected.

Final external verification:

- [ ] `$env:SITE_AUDIT_URL='https://kcgold.co.kr'; npm run audit:site`
- [ ] `$env:SITE_AUDIT_URL='https://kcgold.co.kr'; npm run test:site`
- [ ] `npm run check:external -- --strict-domain`
- [ ] `/robots.txt` still blocks indexing.
- [ ] `/sitemap.xml` remains pre-launch empty/non-indexing.

## User-Only Decisions Still Required

- Log in to `kcgoldx@gmail.com`.
- Complete MFA/passkey/CAPTCHA/phone/email/terms/transfer prompts personally.
- Enter company card/payment details only when KCG actually chooses or needs a paid server/API/billing plan.
- Approve public search indexing/noindex release separately when the site is ready.

## Codex-Doable After Login

- Create/verify company Vercel workspace and Supabase organization if the signed-in service flow allows it without paid commitment.
- Prepare Vercel/Supabase transfer checks and run post-transfer validation.
- Verify live site health, robots/noindex, sitemap posture, and `/api/health`.
- Update this checklist with non-secret status only.
- Defer Google Workspace, GitHub paid Team, Vercel Pro, Supabase paid plan, and paid market-data API until they are specifically needed.
