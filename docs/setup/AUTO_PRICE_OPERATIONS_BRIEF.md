# KCG Automatic Price Operations Brief

Last updated: 2026-05-05 KST.

This brief explains the automatic-price setup in plain language for company reporting. Do not record API keys, cron secrets, admin passwords, payment cards, or account credentials here.

## What Automatic Price Means

KCG public prices are still **company posted prices**. The automatic system does not copy another exchange's price and does not scrape competitors.

The intended flow is:

1. Read allowed market-reference data from `Gold API` by default, or `Metals.Dev` if KCG later adds an API key.
2. Convert the reference spot value into a 3.75g Korean-won basis.
3. Apply the KCG internal formula: premium, discount, purity factor, spread, and rounding.
4. Check safety rules: minimum change, allowed change percentage, business hours, and data freshness.
5. If all rules pass and automatic mode is ON, update the KCG posted-price table and write a history record.

## Current Free-Plan Reality: Vercel Hobby

Vercel Cron is the scheduler currently built into this site. Official Vercel docs state that Cron Jobs are available on all plans, but Hobby accounts are limited to jobs that run **once per day**. Hourly or 30-minute cron expressions fail deployment on Hobby. Vercel's pricing page currently lists Pro at `$20/mo + additional usage`.

Practical result for KCG:

- Free/Hobby: one automatic check per day is the safe maximum inside Vercel Cron.
- Manual admin edits: unlimited from the KCG admin screen, because a person is saving the price.
- More frequent automatic checks: use Vercel Pro or an external scheduler.

Official references:

- Vercel Cron usage and pricing: `https://vercel.com/docs/cron-jobs/usage-and-pricing`
- Vercel pricing: `https://vercel.com/pricing`

## Options

| Option | Cost/Setup | What KCG Gets | When To Use |
| --- | --- | --- | --- |
| Keep current Hobby cron | No new Vercel payment | Daily automatic check plus manual admin updates | Pre-launch or low-change operation |
| Upgrade Vercel Pro | Vercel Pro payment, currently listed as `$20/mo + additional usage` | Cron can run much more frequently and stays inside the same Vercel project | KCG wants 30-minute or hourly automatic checks with less external setup |
| External scheduler | Depends on provider; must store only the `CRON_SECRET` in that provider | A third-party service calls `/api/admin/price-auto-refresh` on a schedule | KCG wants frequent checks without Vercel Pro |
| Supabase Cron later | More database-side setup and operational responsibility | Scheduler lives near DB, can call HTTP or SQL functions | Use only if DB-centered automation becomes easier than Vercel |

## Recommendation

For now, keep the current setup:

- `vercel.json` daily cron stays deployable on Hobby.
- Admin manual input remains the main operating method.
- Automatic mode can be tested with manual "지금 자동 확인" and one daily check.
- If KCG later says "hourly automatic price checks are worth paying for", choose Vercel Pro first because it is the simplest path for the current codebase.

## What Codex Can Do After Payment Or Scheduler Approval

- Update `vercel.json` to hourly or 30-minute cron after Vercel Pro is active.
- Configure an external scheduler to call `/api/admin/price-auto-refresh` with `CRON_SECRET` if KCG chooses that route.
- Verify `price_auto_suggestions`, `price_history`, `/`, `/prices`, and `/products` after automatic updates.
- Keep robots/noindex blocked until public search launch approval.

## What Junyoung Or Company Must Decide

- Whether daily automatic checks are enough during pre-launch.
- Whether company operation needs hourly/30-minute automatic checks.
- Whether Vercel Pro payment is acceptable, or whether an external scheduler should be used.
- Final KCG premium, discount, spread, rounding, and maximum auto-publish threshold values.
- Any paid scheduler, paid API, or plan upgrade requires company approval before Codex connects it.

## Boundaries

- No competitor scraping.
- no competitor scraping is also the audit rule: competitor websites may be opened by a person for manual reference, but KCG code must not fetch, scrape, cache, proxy, or repackage those prices.
- No random 10-won or 500-won offset to make copied prices look different.
- No automatic price change without history and suggestion records.
- No search indexing release as part of automatic-price work.
