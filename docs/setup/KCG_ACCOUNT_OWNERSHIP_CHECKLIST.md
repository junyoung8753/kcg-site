# KCG Account Ownership Checklist

Last updated: 2026-05-06 KST.

This checklist records ownership and migration status only. Do not write passwords, MFA values, recovery codes, card numbers, OAuth tokens, cookies, service-role keys, API keys, or password-manager exports here.

## Operating Decision

- Permanent representative company account: `kcgoldx@gmail.com`
- Personal account role after migration: backup owner / co-admin
- Optional future domain mailbox: `admin@kcgold.co.kr` only if KCG later chooses Google Workspace or another custom-domain mail provider
- Minimal required mode: use the company CLI/session path only; do not restore the previous personal Vercel/Supabase CLI sessions for routine KCG operations
- Paid services mode: company card/payment is entered only when a paid server/API/billing plan is actually needed
- Public site effect: none
- Search effect: none; robots/noindex remains blocked until separate approval

## Current Company CLI State

Verified on 2026-05-06 KST:

- Vercel CLI account: `kcgoldx-7259`
- Vercel company team: `KCG` (`vercel.com/kcgoldx`)
- Vercel company projects: none under `kcgoldx` or `kcgoldx-7259s-projects`
- Existing live Vercel project: `kcg-confirm-preview` is still not transferred into the company context, so company CLI cannot inspect or deploy it yet
- Supabase company organizations:
  - `kcgoldx@gmail.com's Org` (`mjcqkzfmrfmwmrbpyapx`)
  - `Korea Center Gold Exchange` (`raqltqjuqcrusylilnqs`)
- Supabase company projects: none
- Existing production Supabase project: `ehmsqlfxxydnebzjfarr` is still not transferred into the company organization
- Production site behavior: unchanged; live external checks should continue to use public URLs without secrets

## Do Now / Defer

| Category | Status | Owner | Rule |
| --- | --- | --- | --- |
| `kcgoldx@gmail.com` browser login | done | junyoung/company | Junyoung reported Chrome login complete; do not paste password, MFA, cookies, or recovery codes into Codex. |
| Human security prompts | user-only as-needed | junyoung/company | Complete MFA/passkey/CAPTCHA/phone/email/terms/transfer confirmations only if a service requires them. |
| Vercel company workspace | done | codex | Created/verified team `KCG` with slug `kcgoldx`; CLI reports `kcgoldx-7259`. |
| Vercel project transfer | blocked | shared | Existing project `kcg-confirm-preview` is still outside the company context. Do not use the previous personal CLI session; transfer requires owner/payment/approval handling outside secret-sharing. |
| Supabase company organization | done | codex | Created/verified organization `Korea Center Gold Exchange` under the company Supabase login. |
| Supabase project transfer | blocked | shared | Existing project `ehmsqlfxxydnebzjfarr` is still outside the company organization. Do not paste access tokens or service-role keys into Codex. |
| Company card/payment entry | user-only later | junyoung/company | Only when Vercel/Supabase/API billing is actually selected or required. |
| Google Workspace / `@kcgold.co.kr` mail | deferred | shared | Not required for current server/API billing or public-site operation. |
| GitHub paid Team | deferred | shared | Not required for the current public repo unless governance/private-repo needs change. |

## Account Security Checklist

| Item | Status | Owner | Notes Without Secret Values |
| --- | --- | --- | --- |
| Password-manager entry for `kcgoldx@gmail.com` | optional later | junyoung/company | Not required in this pass unless KCG decides to formalize vault use. Never store secret values here. |
| Google 2-Step Verification | optional unless forced | junyoung/company | Skip in this pass unless Google or another service requires it; do not record codes. |
| Google passkey/security key | optional unless forced | junyoung/company | Recommended long term, not a blocker for this pass. |
| Recovery phone | optional unless forced | junyoung/company | Skip unless Google/service flow requires it. |
| Recovery email | optional unless forced | junyoung/company | Skip unless Google/service flow requires it. |
| Offline recovery-code backup | optional unless forced | junyoung/company | If generated later, store outside Git/docs/chat. |

## Service Ownership Matrix

| Service | Target Account / Org / Team | Current Known State | Billing Status | Recovery Method Type | Transfer Status | Next Step |
| --- | --- | --- | --- | --- | --- | --- |
| Google representative account | `kcgoldx@gmail.com` | Chosen as permanent KCG representative Gmail; Chrome login reported complete | Company decision/user-only | Optional security prompts only when required | Active | Keep using this as the company operating identity. |
| Vercel | `KCG` team under `kcgoldx@gmail.com` (`kcgoldx`) | Company CLI reports `kcgoldx-7259`; team `KCG` exists; no projects under company scopes | Company card only if transfer/operation requires it or Pro is chosen later | Team owner + backup owner later | Team created; project transfer blocked | Transfer `kcg-confirm-preview` only through an approved owner/payment-safe flow. Until then, company CLI cannot deploy the existing live project. |
| Supabase | `Korea Center Gold Exchange` organization under `kcgoldx@gmail.com` | Company CLI sees org `raqltqjuqcrusylilnqs`; no company projects | Pay only if plan/usage/transfer requirements require it | Org owner + backup owner later | Org created; project transfer blocked | Transfer project `ehmsqlfxxydnebzjfarr` only through an approved owner/payment-safe flow. Do not paste tokens or service keys. |
| GitHub | Org slug candidate `kcgold`, `korea-center-gold`, or `kcgold-exchange` | Repo `junyoung8753/kcg-site` is public | Paid Team not required for current public repo unless governance needs change | Org owner + backup owner | Deferred unless ownership/Git integration requires it | Codex prepares org/repo transfer only after Vercel/Supabase are stable or when it becomes necessary. |
| Cafe24 / domain DNS | Company-owned Cafe24/domain account | `kcgold.co.kr` and `www.kcgold.co.kr` point to Vercel | Existing domain/DNS billing must stay active | Account recovery + backup owner | Planned | Keep DNS stable; do not delete Vercel A records. |
| Google Workspace / custom domain mail | Optional later `admin@kcgold.co.kr` | Previous checkout path exists but is no longer default | Paid optional | Workspace admin + recovery owner | Deferred | Buy only if KCG wants `@kcgold.co.kr` mail. |

## Transfer Readiness Checklist

Before any transfer:

- [ ] `git status --short --branch` is clean or expected.
- [ ] `npm run release:trace` reports the current version and branch.
- [ ] `npx vercel inspect https://kcgold.co.kr/` shows the current live deployment.
- [ ] `npm run check:external -- --strict-domain` confirms production health, custom domains, robots/noindex, and sitemap posture.
- [x] The target Vercel team exists: `KCG` (`kcgoldx`).
- [x] The target Supabase organization exists: `Korea Center Gold Exchange` (`raqltqjuqcrusylilnqs`).
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

- Complete MFA/passkey/CAPTCHA/phone/email/terms/transfer prompts personally only when they appear.
- Approve or decline Vercel project transfer if Vercel asks for owner confirmation, payment method, or paid plan compatibility.
- Approve or decline Supabase project transfer if Supabase asks for owner confirmation, billing compatibility, or payment method.
- Enter company card/payment details only when KCG actually chooses or needs a paid server/API/billing plan.
- Approve public search indexing/noindex release separately when the site is ready.

## Codex-Doable After Login

- Keep using the company Vercel/Supabase CLI context for status checks.
- Prepare Vercel/Supabase transfer checks and run post-transfer validation after the projects are transferred or the company account is granted access.
- Verify live site health, robots/noindex, sitemap posture, and `/api/health`.
- Update this checklist with non-secret status only.
- Defer Google Workspace, GitHub paid Team, Vercel Pro, Supabase paid plan, and paid market-data API until they are specifically needed.
