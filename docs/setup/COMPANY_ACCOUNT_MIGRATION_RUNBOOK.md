# KCG Company Account Migration Runbook

Last updated: 2026-05-03 KST.

This runbook is the no-secret handoff for moving KCG site operations from junyoung's personal accounts to company-owned accounts. Do not record passwords, payment details, recovery codes, OAuth tokens, service-role keys, cookies, or MFA codes in this file.

## Goal

This work is paused pending the company's email/account decision. When junyoung later says `Google Workspace 결제했어` or `Zoho로 하자`, Codex should be able to continue without rediscovering the setup:

1. Verify Google Workspace and company email are active.
2. Finish Google Workspace domain DNS records in Cafe24.
3. Create or verify company-owned Supabase, Vercel, and GitHub organization/workspace/account access.
4. Transfer or reconnect the KCG production project/repo with no secret leakage.
5. Re-verify `kcgold.co.kr`, admin access, Supabase storage, noindex/robots, and build/deploy readiness.

## Current Signup Status

Google Workspace signup is prepared in the persistent Codex login browser.

- Business name: `주식회사 한국센터금거래소`
- Employee range: `2~9명`
- Country/region: `대한민국`
- Existing domain: `kcgold.co.kr`
- First admin email username: `admin`
- Intended admin mailbox: `admin@kcgold.co.kr`
- Current blocker: company decision on paid Google Workspace vs. a free/low-cost mail option.
- Selected plan on the Google checkout screen: `Business Starter`
- Visible checkout amount on 2026-05-03 KST: `US$7.56 / user / month + applicable tax`, shown as monthly recurring.
- Payment blocker: junyoung or the company must complete payment. Codex should not enter card details or click the final paid confirmation.
- Free/low-cost alternatives noted for company decision:
  - Zoho Mail Free: real custom-domain mailbox for one domain and up to 5 users, but limited compared with Google Workspace.
  - Cloudflare Email Routing: free receive-only forwarding, but not a full send/receive mailbox unless combined with another SMTP/mail provider and usually requires Cloudflare-managed DNS.
  - Google Workspace Business Starter: paid, but cleanest for Gmail/Admin/OAuth and long-term company operations.

## User-Only Steps

Only junyoung or the company should do these:

1. Enter and keep the `admin@kcgold.co.kr` password in a password manager.
2. Confirm Google Workspace terms and trial/subscription terms.
3. Complete phone/email/passkey/MFA/CAPTCHA/security verification.
4. Enter payment method or approve paid subscription.
5. Approve company ownership, billing, and transfer prompts for Google Workspace, Supabase, Vercel, and GitHub.
6. Decide whether to expose the public site to search engines. Until then, keep robots/noindex blocked.

Codex should do everything else: navigate setup screens, fill non-secret fields, inspect required DNS values, prepare Cafe24 records, run CLI checks, verify app health, and document results.

## Google Workspace After Payment

### Domain Verification

Google may ask for one or more DNS records. Use the values shown in Google Admin, not guessed values.

Likely record types:

- `TXT` verification record at root `kcgold.co.kr`
- Sometimes `CNAME` verification record

Cafe24 DNS rule:

- Preserve existing `A` records for website:
  - `kcgold.co.kr -> 76.76.21.21`
  - `www.kcgold.co.kr -> 76.76.21.21`
- Do not delete Vercel domain records.
- Do not delete existing mail/security records unless Google explicitly requires replacement and junyoung approves.

Verification commands after adding records:

```powershell
Resolve-DnsName kcgold.co.kr -Type TXT
Resolve-DnsName kcgold.co.kr -Type MX
npm run check:external -- --strict-domain
```

### Gmail Activation

Google's current Workspace MX setup uses:

```text
Type: MX
Host/Name: @ or kcgold.co.kr
Priority: 1
Value: smtp.google.com
```

After MX is active, Google Admin should be used to activate Gmail for the domain.

Optional mail-auth records after Gmail works:

- SPF:
  - Host: `@`
  - TXT value: `v=spf1 include:_spf.google.com ~all`
- DKIM:
  - Generate inside Google Admin > Gmail authentication.
  - Add the exact TXT record Google provides.
- DMARC:
  - Start with monitor mode only:
  - Host: `_dmarc`
  - TXT value: `v=DMARC1; p=none; rua=mailto:admin@kcgold.co.kr`
  - Tighten later only after mail flow is stable.

## Recommended Company Accounts

### Google Workspace

Use one paid Google Workspace user first:

- `admin@kcgold.co.kr`

Create aliases or groups later if needed:

- `info@kcgold.co.kr`
- `contact@kcgold.co.kr`
- `billing@kcgold.co.kr`
- `no-reply@kcgold.co.kr`

Aliases/groups are preferred over extra paid users unless a real separate inbox/person is needed.

### Supabase

Current state:

- Project ref: `ehmsqlfxxydnebzjfarr`
- Current personal org: `junyoung8753's Project`
- Production app already uses Supabase and `/api/health` has reported `mode=supabase`.

After company email/payment:

1. Sign in to Supabase as `admin@kcgold.co.kr` using the company Google account if available.
2. Create a company organization, recommended display name:
   - `Korea Center Gold Exchange`
   - or `한국센터금거래소`
3. Invite junyoung's personal Supabase user as Owner/Admin for continuity.
4. From the current personal org, transfer project `ehmsqlfxxydnebzjfarr` to the company org.
5. Confirm project ref, database URL, storage, and API keys did not unexpectedly change.
6. If service-role keys rotate during transfer, update Vercel env only through Vercel dashboard/CLI secret flow. Never commit keys.

Validation:

```powershell
npx supabase projects list
npx supabase link --project-ref ehmsqlfxxydnebzjfarr
npx supabase db query --linked -f supabase/schema.sql
Invoke-WebRequest https://kcgold.co.kr/api/health | Select-Object -ExpandProperty Content
```

### Vercel

Current state:

- Personal Vercel user: `junyoung8753-2361`
- Project: `kcg-confirm-preview`
- Custom domains: `kcgold.co.kr`, `www.kcgold.co.kr`
- Env vars are set in production, encrypted in Vercel.

After company billing/team:

1. Create a company Vercel team/workspace under the company account.
2. Add junyoung personal account as Owner/Admin.
3. Transfer project `kcg-confirm-preview` to the company team.
4. Confirm transferred items:
   - domains
   - aliases
   - env vars
   - deployments
   - cron jobs
   - Git link
5. Reconnect GitHub integration if the project transfer breaks it.

Validation:

```powershell
npx vercel whoami
npx vercel project ls
npx vercel inspect https://kcgold.co.kr/
npx vercel env ls production
npm run check:external -- --strict-domain
```

### GitHub

Current state:

- Repo: `junyoung8753/kcg-site`
- Visibility: public for now.

Recommended company structure:

1. Create a GitHub organization after company email is active.
2. Suggested org slugs, choose the first available:
   - `kcgold`
   - `korea-center-gold`
   - `kcgold-exchange`
3. Add junyoung personal GitHub account as Owner.
4. Transfer repo `junyoung8753/kcg-site` into the organization.
5. Re-check Vercel Git integration after transfer.

Validation:

```powershell
gh auth status
gh repo view junyoung8753/kcg-site
git remote -v
git fetch --all --prune
```

After repo transfer, update `origin` only if GitHub changes the canonical remote:

```powershell
git remote set-url origin https://github.com/<company-org>/kcg-site.git
git fetch --all --prune
```

Do not move private company knowledge into this public-style site repo.

## What Codex Should Do When Junyoung Says `플랜 결제 했어`

1. Open the persistent login browser and verify `admin@kcgold.co.kr` Google Admin is signed in.
2. Continue Google Admin setup.
3. Capture exact Google-provided DNS verification/MX/DKIM records.
4. Open Cafe24 DNS and add only required DNS records.
5. Verify DNS propagation with `Resolve-DnsName`.
6. Activate Gmail in Google Admin when Google confirms DNS.
7. Create or verify company Supabase organization; transfer project if approved.
8. Create or verify company Vercel team; transfer project if approved.
9. Create or verify GitHub org; transfer repo if approved.
10. Re-run external and app checks:

```powershell
npm run check:external -- --strict-domain
$env:SITE_AUDIT_URL='https://kcgold.co.kr'; npm run audit:site
$env:SITE_AUDIT_URL='https://kcgold.co.kr'; npm run test:site
```

11. Confirm search remains blocked:

```powershell
Invoke-WebRequest https://kcgold.co.kr/robots.txt | Select-Object -ExpandProperty Content
Invoke-WebRequest https://kcgold.co.kr/sitemap.xml | Select-Object -ExpandProperty Content
Invoke-WebRequest https://kcgold.co.kr/api/health | Select-Object -ExpandProperty Content
```

Expected pre-launch posture:

- `/robots.txt` includes `Disallow: /`
- `/sitemap.xml` remains empty or non-indexing
- `/api/health` reports `indexing: disabled`

## Do Not Do Without Separate Approval

- Do not enter payment card data.
- Do not buy a paid Workspace/Vercel/Supabase/GitHub plan without explicit approval.
- Do not remove robots/noindex/search blocking.
- Do not rotate or expose production secrets in chat/docs/Git.
- Do not delete DNS records unless their purpose is confirmed and junyoung approves the replacement.
- Do not scrape competitor sites for automatic KCG prices.

## Official Reference Links

- Google Workspace pricing: https://workspace.google.com/pricing?hl=ko
- Google Workspace MX records: https://support.google.com/a/answer/9047148
- Google Workspace payment plans: https://support.google.com/a/answer/1247360
- Supabase project transfer: https://supabase.com/docs/guides/platform/project-transfer
- Vercel project transfer: https://vercel.com/docs/projects/transferring-projects
- GitHub repository transfer: https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository
