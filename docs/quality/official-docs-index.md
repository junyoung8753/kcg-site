# KCG Official Docs Index

Last updated: 2026-05-06 KST.

Use this index before changing fast-moving Codex, frontend framework, browser automation, deployment, or market-data behavior. Prefer official or primary sources. Community posts can suggest questions, but they do not override local verification or KCG launch safeguards.

## Codex And Agent Workflow

- OpenAI Codex AGENTS.md guidance: https://developers.openai.com/codex/guides/agents-md
  - Use for instruction discovery, global vs project guidance, fallback filenames, and project-local override decisions.
- OpenAI Codex best practices: https://developers.openai.com/codex/learn/best-practices
  - Use for testing/review habits, MCP/tool scope, skills, and automation candidates.
- OpenAI Codex skills: https://developers.openai.com/codex/skills
  - Use when creating or updating `.agents/skills/**/SKILL.md`.
- OpenAI prompt engineering coding/frontend guidance: https://developers.openai.com/api/docs/guides/prompt-engineering#coding
  - Use for large-codebase frontend instructions, rubric use, testing, and agentic progress tracking.

## KCG Frontend Stack

- Next.js App Router: https://nextjs.org/docs/app
  - Use for route/layout/server-client component behavior.
- Next.js installation and system requirements: https://nextjs.org/docs/app/getting-started/installation
  - KCG currently uses Next.js `16.2.4`; keep Node at `20.9+` or a newer supported runtime.
- Next.js Image component: https://nextjs.org/docs/app/api-reference/components/image
  - Use for campaign/product image optimization, sizing, alt text, and priority/lazy loading behavior.
- Next.js Metadata and OG images: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
  - Use for SEO/social metadata while preserving noindex until public launch approval.
- React docs: https://react.dev/
  - Use when changing React 19 component, form, hook, or rendering behavior.
- Tailwind CSS v4 theme variables: https://tailwindcss.com/docs/theme
  - Use for CSS-first design tokens and KCG typography/color scale decisions.
- Tailwind CSS v4 upgrade guide: https://tailwindcss.com/docs/upgrade-guide
  - Use before framework-level Tailwind config or browser support changes.

## Browser QA And Visual Evidence

- Playwright screenshots and visual comparisons: https://playwright.dev/docs/test-snapshots
  - Use for deterministic screenshot checks and style filtering when visual regressions become repeatable.
- Playwright Trace Viewer: https://playwright.dev/docs/trace-viewer
  - Use for debugging CI/local browser failures with trace artifacts.
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
  - Use for target size, focus, contrast, and accessible interaction expectations.

## Deployment And Operations

- Vercel Next.js deployment docs: https://vercel.com/docs/frameworks/full-stack/nextjs
  - Use for Next.js on Vercel, Web Analytics, Speed Insights, image/font behavior, and deployment-specific checks.
- Vercel environment variables: https://vercel.com/docs/environment-variables
  - Use for no-secret env setup and production/preview/development variable scope.
- Vercel cron jobs: https://vercel.com/docs/cron-jobs
  - Use before changing Vercel Cron schedule, plan limits, or `CRON_SECRET` behavior.
- Supabase docs: https://supabase.com/docs
  - Use before changing database schema, auth/session behavior, storage, or CLI workflows.

## Market Data And Public Content

- Gold API docs: https://www.goldapi.io/
  - Use for current free reference-price behavior and attribution.
- Metals.Dev docs: https://metals.dev/
  - Use only when revisiting the paid upgrade decision.
- KRX Open API: https://openapi.krx.co.kr/
  - Use before any KRX display, but do not publish KRX-derived commercial display until usage terms and market-data distribution scope are confirmed.
- KRX Open API service method: https://openapi.krx.co.kr/contents/OPP/INFO/OPPINFO003.jsp
  - Use to confirm 법인/개인 가입 flow, authentication-key approval, and API utilization approval.
- KRX Open API terms: https://openapi.krx.co.kr/contents/OPP/INFO/OPPINFO002.jsp
  - Use to confirm non-commercial use, third-party provision, statistical-information display wording, quota, and key-deletion constraints.
- KRX Open API service list: https://openapi.krx.co.kr/contents/OPP/INFO/service/OPPINFO004.cmd
  - Use to confirm whether `금시장 일별매매정보` is available and what exact service identifier/response shape applies.
- KRX market-data products: https://openapi.krx.co.kr/contents/OPP/DATA/OPPDATA002.jsp
  - Use before treating KRX market information as redistributable public data.
- KRX data purchase guidance: https://openapi.krx.co.kr/contents/OPP/DATA/OPPDATA001.jsp
  - Use when a paid/statistical data path appears; payment remains user-only.
- Koscom market data service: https://english.koscom.co.kr/eng/main/contents.do?menuNo=300102
  - Use to confirm whether KRX-generated market data distribution requires a Koscom contract.
- TradingView widgets: https://www.tradingview.com/widget/
  - Use only for official embed behavior. Do not extract widget data into KCG tables or storage.

## Refresh Rule

- Re-check this index when changing framework versions, deployment behavior, browser QA, official metadata/SEO behavior, market-data providers, or Codex workflow surfaces.
- Record meaningful source-driven workflow changes in `docs/quality/agent-quality-system.md` or `docs/setup/CURRENT_HANDOFF.md`; do not expand `AGENTS.md` unless a short routing rule is enough.
