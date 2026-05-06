# KCG Company Account Migration Runbook

Last updated: 2026-05-06 KST.

This is the no-secret runbook for moving KCG site operations, ownership, and future billing away from junyoung's personal accounts and into company-controlled accounts. Do not record passwords, card numbers, payment details, recovery codes, OAuth tokens, service-role keys, cookies, MFA codes, passkeys, or password-manager exports in this file.

## Current Decision

- Permanent representative company account: `kcgoldx@gmail.com`
- Personal account role after migration: backup owner / co-admin only; do not use the previous personal Vercel/Supabase CLI sessions as the routine operating path
- Optional future domain mailbox: `admin@kcgold.co.kr` or other `@kcgold.co.kr` addresses if KCG later chooses Google Workspace or another paid mail service
- Minimal required mode: use the company account/session path for new setup, checks, docs, and transfer preparation wherever the service UI/CLI allows it
- Paid services mode: pay only when a server/API/billing dependency actually requires it, not just because an account checklist exists
- Public site behavior: no change
- Search posture: robots/noindex stays blocked until separate public-search approval
- Payment/trading posture: no checkout, cart, live trading, or online payment behavior is added by this plan
- Secret posture: Vercel env vars, Supabase service-role keys, admin password, recovery codes, and card details stay outside Git/docs/chat

## Current Progress - 2026-05-06 KST

Completed without payment or secrets, refreshed in `v0.2.19`:

- Removed the previous personal Vercel CLI session from the routine operating path.
- Vercel CLI now reports company account `kcgoldx-7259`.
- Created/verified Vercel team `KCG` with slug `kcgoldx`.
- Added existing source-owner Vercel account `junyoung8753-2361` to team `KCG` as `MEMBER`.
- Confirmed team membership: `junyoung8753-2361 MEMBER`, `kcgoldx-7259 OWNER`.
- Attempted source-owner transfer flow for `kcg-confirm-preview`; the modal still returns `No results` for `KCG`/`kcgoldx`.
- Attempted to promote `junyoung8753-2361` to a second `OWNER`; Vercel blocked it because the free team allows only one Owner unless upgraded to Pro.
- Confirmed no Vercel projects exist yet under `kcgoldx` or `kcgoldx-7259s-projects`.
- Confirmed the existing live deployment cannot be inspected under `kcgoldx` because `kcg-confirm-preview` has not been transferred.
- Confirmed `npx vercel project inspect kcg-confirm-preview --scope kcgoldx` is expected blocked because the company account does not own the project yet.
- Removed the previous personal Supabase CLI token from the routine operating path.
- Supabase CLI now sees company-side organizations.
- Created/verified Supabase organization `Korea Center Gold Exchange` with org id `raqltqjuqcrusylilnqs`.
- Confirmed the company Supabase context has no projects yet.
- Confirmed `npx supabase link --project-ref ehmsqlfxxydnebzjfarr` is expected blocked because the company account lacks privileges on the existing production project.
- Re-ran live external QA on `https://kcgold.co.kr`: source/rendered audit, Playwright, `/api/health`, robots, sitemap, and strict-domain checks passed while indexing stayed disabled.
- Rechecked public source legal consistency: the public source uses the approved 법인명, 대표이사, business-registration number, and 본사/매장 phone numbers; old public phone `02-747-1802` does not appear in public source.

Still not changed:

- Existing Vercel project `kcg-confirm-preview` still owns the live domains and is not in the company Vercel team yet.
- Existing Supabase project `ehmsqlfxxydnebzjfarr` still backs the production site and is not in the company Supabase organization yet.
- No Vercel env values, Supabase service-role keys, DNS records, robots/noindex, checkout/cart/payment, or live trading behavior changed.
- Do not restore the old personal CLI sessions just to deploy; first transfer or authorize the company account.

Confirmed official transfer boundary:

- Vercel transfer must be started by an owner of the source team and the account must be a member of the target team. Vercel can require a valid payment method on the target team before transfer. In the current KCG free-team state, the source owner is a target-team member but the transfer UI still does not expose `KCG`, and making the source owner a second target-team Owner requires Pro.
- Supabase transfer requires source organization owner rights and membership in the target organization. GitHub integrations, project-scoped roles, log drains, plan compatibility, and Free Plan limits can block or change the transfer flow.
- Therefore, Codex has completed the target setup, source-owner membership, and non-secret checks. The actual existing-project transfer remains blocked on Vercel transfer eligibility/payment/Owner constraints and Supabase source-owner transfer prompts.

## Minimal Required Mode

Junyoung's current instruction is simple: after `kcgoldx@gmail.com` is logged in, Codex should create, connect, verify, and document as much as possible without making junyoung repeat service-by-service setup work.

### Junyoung Only

Only these remain human-only:

1. Complete MFA, passkey, CAPTCHA, phone/email verification, terms acceptance, and transfer-approval prompts when they appear.
2. Approve or decline payment-method requirements if Vercel/Supabase blocks project transfer without one.
3. Enter a company card only when KCG actually chooses a paid server/API/billing plan.
4. Approve public search indexing/noindex release separately later, if and when launch is ready.

Do not paste passwords, MFA codes, recovery codes, cookies, OAuth tokens, service-role keys, card details, or password-manager exports into Codex.

### Codex Handles After Login

Codex should handle the following without asking junyoung to repeat the plan:

1. Open and prepare the relevant Google, Vercel, Supabase, GitHub, and Cafe24 pages or official CLI flows.
2. Fill safe non-secret organization/team/project names when the UI allows it.
3. Create or verify the company Vercel team/workspace and Supabase organization if they are available without paid commitment. This is complete for Vercel `KCG` and Supabase `Korea Center Gold Exchange`.
4. Prepare project transfer checks and run post-transfer verification commands after the existing project access is granted or transferred.
5. Keep the no-secret ownership checklist updated with status, owners, billing posture, and verification notes.
6. Keep `kcgold.co.kr`, `www.kcgold.co.kr`, `kcg-confirm-preview.vercel.app`, Supabase data, Vercel env-secret boundaries, and robots/noindex blocking intact.

### Pay Only When Needed

For later server/API paid billing, the minimal necessary set is:

- Vercel billing/team ownership only if project transfer, production operations, higher cron frequency, or platform limits require it.
- Supabase organization/project billing only if database/storage/API usage or transfer requirements require it.
- External market-data API billing only if KCG chooses a paid provider for quota, history, bid/ask, reliability, or contractual display needs.

Not required for server/API billing right now:

- Google Workspace or `admin@kcgold.co.kr` custom-domain mail.
- GitHub Team paid plan for the current public repo.
- Vercel Pro while once-daily Hobby cron is enough.
- Metals.Dev or another paid market API while the current reference-data posture is enough.

## Goal

Use `kcgoldx@gmail.com` as the durable KCG operating identity for SaaS ownership, billing, and account recovery:

1. Secure `kcgoldx@gmail.com` with strong Google account recovery and MFA.
2. Create a no-secret ownership checklist for KCG operating services.
3. Prepare company-controlled Vercel, Supabase, and GitHub ownership.
4. Transfer or reconnect the current KCG site project/repo only after the target account/team/org is ready.
5. Preserve `kcgold.co.kr`, `www.kcgold.co.kr`, `kcg-confirm-preview.vercel.app`, Supabase data, Vercel env secrets, and robots/noindex blocking throughout the transfer.
6. Leave Google Workspace as an optional later paid domain-mail decision, not a launch blocker.

## Optional Later Items To Create Or Verify

Codex can maintain the no-secret repo checklist after login. Vault, payment, and recovery materials are optional later operational-hardening items unless a service forces them. Junyoung/company should touch them directly if KCG decides to formalize them:

1. Optional password-manager item for `kcgoldx@gmail.com`
   - Suggested vault item title: `KCG - 대표 운영 Gmail - kcgoldx@gmail.com`
   - Store Google password, passkey/MFA notes, recovery method notes, and offline recovery-code location.
   - Do not paste the password, backup codes, TOTP seed, cookies, or card details into Codex.
2. Optional password-manager entries for service ownership
   - `KCG - Vercel`
   - `KCG - Supabase`
   - `KCG - GitHub`
   - `KCG - Cafe24 / Domain DNS`
   - `KCG - Billing / Company card notes`
3. No-secret checklist in this repo
   - File: `docs/setup/KCG_ACCOUNT_OWNERSHIP_CHECKLIST.md`
   - It records service name, account/team/org name, owner, recovery method type, billing status, and transfer status only.
   - It never records passwords, keys, recovery codes, card numbers, or MFA values.

## Human-Only Steps

Only junyoung or an authorized company person should complete these. Everything else in this runbook is Codex-doable after login unless the service blocks automation or requests a legal/payment/security confirmation:

1. Sign in to `kcgoldx@gmail.com` and confirm the account is company-controlled.
2. Set or verify Google 2-Step Verification, passkey, recovery phone, and recovery email.
3. Save Google backup/recovery codes only in the password manager and offline backup.
4. Accept service terms only when a service asks for human acceptance.
5. Enter company card/payment details only when KCG actually chooses a paid server/API/billing plan.
6. Approve organization creation, project transfer, billing transfer, and ownership prompts when the service requires human confirmation.
7. Complete email/phone/MFA/CAPTCHA/passkey challenges.
8. Decide later whether to buy Google Workspace or another custom-domain mailbox for `@kcgold.co.kr`.
9. Decide later whether to approve public search indexing/noindex release.

Codex can prepare pages, fill safe non-secret fields, run official CLIs, verify status after login, compare settings, and update no-secret documentation.

## Migration Order

Use this sequence to reduce service lockout and broken deployments.

### Phase 0 - Baseline Verification

Before any account transfer:

```powershell
git status --short --branch
npm run release:trace
npx vercel inspect https://kcgold.co.kr/
npm run check:external -- --strict-domain
```

Expected pre-transfer posture:

- `kcgold.co.kr` is live through the existing Vercel project.
- `/api/health` reports `mode=supabase`.
- `/api/health` reports `indexing=disabled`.
- `/robots.txt` includes `Disallow: /`.
- `/sitemap.xml` remains empty or non-indexing before public launch.

### Phase 1 - Google Account Security

Target account: `kcgoldx@gmail.com`

Minimal required mode:

- Skip 2-Step Verification, recovery phone/email, Bitwarden/password-manager setup, and backup-code generation unless Google or another service forces the step in the current flow.
- If a service forces MFA/passkey/CAPTCHA/phone/email/terms, junyoung/company completes only that prompt directly.
- Never paste passwords, MFA codes, recovery codes, cookies, passkeys, or card details into Codex.

Recommended later, not a blocker in this pass:

- 2-Step Verification enabled
- Passkey or security-key recovery path enabled where practical
- Recovery phone set
- Recovery email set
- Backup codes generated and stored outside Codex/Git/chat
- Password-manager item created

Codex boundary:

- Codex may open the Google account security page and verify visible non-secret status after junyoung completes login.
- Codex must not ask for or enter passwords, MFA codes, recovery codes, cookies, or vault exports.

### Phase 2 - Vercel

Current state:

- Vercel project: `kcg-confirm-preview`
- Current production aliases: `https://kcgold.co.kr`, `https://www.kcgold.co.kr`, `https://kcg-confirm-preview.vercel.app`
- Current owner context: existing personal Vercel account/team for the live project; local CLI operating context is now company account `kcgoldx-7259`
- Company team created: `KCG` (`kcgoldx`)
- Company team project list: empty
- Production env vars are encrypted in Vercel and must not be exported into docs/chat/Git.

Recommended target:

- Vercel team/workspace display name: `KCG` or `Korea Center Gold Exchange`
- Login/owner basis: `kcgoldx@gmail.com`
- Add junyoung personal Vercel account as Owner/Admin for continuity.

Plan:

1. Company Vercel team/workspace exists as `KCG` (`kcgoldx`).
2. Add company billing only if Vercel requires it for the transfer/operation or if KCG chooses Pro later.
3. Keep Vercel Pro optional for now. The current Hobby cron posture is acceptable while automatic checks are at most once per day.
4. Transfer project `kcg-confirm-preview` to the company team after verifying the target team is ready and Vercel no longer hides `KCG` from the transfer target list.
5. Confirm transferred items:
   - domains
   - aliases
   - env vars
   - deployments
   - cron jobs
   - Git link
6. Reconnect GitHub integration if the transfer breaks it.
7. Enable usage/spend alerts where Vercel exposes them for the selected plan.

Validation after Vercel transfer:

```powershell
npx vercel whoami
npx vercel project ls
npx vercel inspect https://kcgold.co.kr/
npx vercel env ls production
npm run check:external -- --strict-domain
```

Secret rule:

- `npx vercel env ls production` may list variable names and scopes only. Do not print secret values.
- If env values must be rotated, use Vercel dashboard/CLI secret flow only.
- Until `kcg-confirm-preview` is transferred or company access is granted, `npx vercel inspect https://kcgold.co.kr/ --scope kcgoldx` is expected to fail because the live deployment is not in the company context.
- Current free-team blocker: `junyoung8753-2361` is already a `MEMBER` of `KCG`, but Vercel still does not show `KCG` as a transfer target and blocks adding a second Owner without Pro.
- Until project access exists, final admin secret rotation cannot be verified from the company CLI. Codex can prepare the variable names and flow; junyoung/company must enter `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` values directly when rotation is approved.

### Phase 3 - Supabase

Current state:

- Project ref: `ehmsqlfxxydnebzjfarr`
- Current org context: existing production project is still in the previous personal Supabase org; local CLI operating context is now company-side and sees `Korea Center Gold Exchange`
- Company organization created: `Korea Center Gold Exchange` (`raqltqjuqcrusylilnqs`)
- Company project list: empty
- Production app already uses Supabase and `/api/health` reports `mode=supabase` on live verification.

Recommended target:

- Supabase organization display name: `Korea Center Gold Exchange`
- Owner login basis: `kcgoldx@gmail.com`
- Add junyoung personal Supabase account as Owner/Admin for continuity.

Pre-transfer checks:

- Current account has owner permission on the source org/project.
- Target company org exists and can receive a project transfer.
- Billing/plan compatibility is understood before accepting transfer.
- Project roles, integrations, log drains, and any organization-scoped add-ons are reviewed.
- Company CLI currently cannot link `ehmsqlfxxydnebzjfarr`; this is expected until the project is transferred or company access is granted.

Plan:

1. Company Supabase login exists in the CLI.
2. Target organization `Korea Center Gold Exchange` exists.
3. Invite junyoung personal Supabase account as Owner/Admin.
4. From the current source org, start transfer of project `ehmsqlfxxydnebzjfarr` to the company org.
5. Complete human approval prompts.
6. Confirm the project ref, API URL, DB, auth/storage posture, and tables still work.
7. If service-role keys change, update Vercel env only through Vercel dashboard/CLI secret flow. Never commit keys.

Validation after Supabase transfer:

```powershell
npx supabase projects list
npx supabase link --project-ref ehmsqlfxxydnebzjfarr
Invoke-WebRequest https://kcgold.co.kr/api/health | Select-Object -ExpandProperty Content
```

Expected `/api/health` values:

- `mode=supabase`
- `deployment=production`
- `indexing=disabled`

### Phase 4 - GitHub

Current state:

- Repo: `junyoung8753/kcg-site`
- Visibility: public for now
- Current branch: `codex/kcg-launch-readiness-catalog-20260427`

Recommended target:

- GitHub organization slug candidates, in order:
  1. `kcgold`
  2. `korea-center-gold`
  3. `kcgold-exchange`
- Owner basis: `kcgoldx@gmail.com`
- Add junyoung personal GitHub account as Owner.

Plan:

1. Create or verify the company GitHub user/org only when repo ownership or Vercel Git integration needs it.
2. Add junyoung personal GitHub account as Owner before transferring the repo.
3. Keep GitHub Team paid plan optional for now. A public repo does not require paid Team features unless KCG needs private repos, advanced governance, or extra seats/features.
4. Transfer `junyoung8753/kcg-site` only after Vercel/Supabase transfer has settled.
5. Re-check Vercel Git integration after transfer.
6. Re-check GitHub Actions, repository settings, branch protection, and remote URL.

Validation after GitHub transfer:

```powershell
gh auth status
gh repo view <company-org>/kcg-site
git remote -v
git fetch --all --prune
```

If GitHub changes the canonical remote:

```powershell
git remote set-url origin https://github.com/<company-org>/kcg-site.git
git fetch --all --prune
```

Do not move private company knowledge, private documents, customer data, secrets, or unapproved internal material into this public-style site repo.

### Phase 5 - Domain And Mail

Current decision:

- Keep `kcgoldx@gmail.com` as the company representative email for now.
- Do not force Google Workspace before launch.
- Do not touch current Vercel website A records for mail setup.

Optional later domain-mail path:

1. If KCG wants `@kcgold.co.kr` mail, choose Google Workspace Business Starter or another mail provider.
2. Create the first domain mailbox such as `admin@kcgold.co.kr`.
3. Add only provider-supplied DNS records in Cafe24.
4. Preserve website records:
   - `kcgold.co.kr -> 76.76.21.21`
   - `www.kcgold.co.kr -> 76.76.21.21`
5. Add SPF/DKIM/DMARC only with provider-provided values.
6. Start DMARC in monitor mode before enforcing.

Google Workspace note:

- A previous Google Workspace signup flow reached checkout for `admin@kcgold.co.kr`.
- That flow is no longer the default path.
- Google Workspace / `admin@kcgold.co.kr` is optional later domain-mail work.
- Continue it only if junyoung says to buy Workspace/custom-domain mail.

DNS verification commands after mail changes:

```powershell
Resolve-DnsName kcgold.co.kr -Type MX
Resolve-DnsName kcgold.co.kr -Type TXT
npm run check:external -- --strict-domain
```

## Full Post-Migration Site Verification

Run after any Vercel/Supabase/GitHub transfer that could affect production:

```powershell
$env:SITE_AUDIT_URL='https://kcgold.co.kr'; npm run audit:site
$env:SITE_AUDIT_URL='https://kcgold.co.kr'; npm run test:site
npm run check:external -- --strict-domain
```

Confirm:

- `https://kcgold.co.kr/robots.txt` still includes `Disallow: /`
- `https://kcgold.co.kr/sitemap.xml` remains empty or non-indexing before launch
- `https://kcgold.co.kr/api/health` reports `mode=supabase` and `indexing=disabled`
- Admin secret values were not printed, copied, exported into docs, or committed

## Do Not Do Without Separate Approval

- Do not enter card data.
- Do not buy Vercel Pro, Supabase paid plans, GitHub Team, Google Workspace, or any paid provider plan unless junyoung explicitly says that server/API billing time has arrived and completes the human-only card/payment step.
- Do not remove robots/noindex/search blocking.
- Do not rotate or expose production secrets in chat/docs/Git.
- Do not delete DNS records unless their purpose is confirmed and junyoung approves the replacement.
- Do not add checkout/cart/payment/live trading behavior.
- Do not scrape competitor prices, images, copy, or APIs.

## Official Reference Links

- Google Workspace pricing: https://workspace.google.com/pricing?hl=ko
- Google Workspace edition guide: https://support.google.com/a/answer/6043576
- Vercel cron usage and pricing: https://vercel.com/docs/cron-jobs/usage-and-pricing
- Vercel pricing: https://vercel.com/pricing
- Vercel project transfer: https://vercel.com/docs/projects/transferring-projects
- Supabase project transfer: https://supabase.com/docs/guides/platform/project-transfer
- Supabase billing: https://supabase.com/docs/guides/platform/billing-on-supabase
- GitHub moving work to an organization: https://docs.github.com/en/account-and-profile/how-tos/account-management/moving-your-work-to-an-organization
- GitHub repository transfer: https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository
- GitHub billing roles: https://docs.github.com/en/billing/reference/billing-roles
