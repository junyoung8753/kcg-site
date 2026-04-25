# KCG Site Working Rules

- This repository is the working source for `https://kcg-confirm-preview.vercel.app/`.
- Vercel project: `kcg-confirm-preview`.
- GitHub repo: `junyoung8753/kcg-site`.
- Use Korean UI/copy by default. Preserve exact business facts unless the user provides updated source documents.
- Treat prices, trading language, legal business information, admin authentication, and production deployment as high-risk. Do not invent official prices, business registration numbers, compliance claims, or live trading/payment behavior.
- Keep the company posted price table separate from automatic market-reference data. External APIs must not overwrite company prices.
- Keep preview/search-blocking behavior unless the user explicitly approves public launch/search indexing.
- Never commit `.env*`, `.vercel`, Supabase service role keys, admin passwords, cookies, tokens, or local Vercel settings.
- For Vercel setup on a new machine, run `vercel link --yes --project kcg-confirm-preview`, then `vercel pull --yes`.
- Before claiming completion after code changes, run:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
  - `npm audit --audit-level=moderate`
- For visual or route changes, also verify at least `/`, `/prices`, `/announcements`, `/services`, `/about`, `/admin/login`, and `/api/health` with browser screenshots or equivalent route checks.
- If a deployment is needed, prefer a preview deployment first. Use production deployment or alias changes only when the user clearly asks for the live URL to change.
