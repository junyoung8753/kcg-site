# KCG AI Site Production Playbook

This playbook turns current AI site-building guidance into a KCG-specific workflow. It is not a longer prompt to paste every time. It is the context and verification system future Codex sessions should load before changing the site.

## Why This Exists

KCG is not a generic marketing site. It is a Korean trust-and-consultation site for a physical gold exchange office. AI-generated websites often fail by making a polished but generic layout, inventing business claims, pushing the real user task below decorative sections, or stopping after a green build without checking the browser.

The durable fix is context engineering plus harness engineering:

- Put stable product intent, design direction, business constraints, and verification rules inside the repository.
- Keep `AGENTS.md` as a map to source-of-truth docs, not as a giant instruction dump.
- Give AI a precise product surface, user moment, constraints, and taste before asking for UI.
- Require browser evidence, route checks, screenshots, and executable acceptance criteria before claiming completion.
- When a miss repeats, add the narrowest script or Playwright check that would have caught it.

## Current Product Baseline

The current repository is the single production candidate for KCG. The historical company-PC source is preserved outside this repo, so normal work should improve this site instead of restoring old comparison routes or source-recovery flows.

Default assumptions:

- `/` is the only public home surface.
- `/option-1` and `/option-2` are intentionally removed and should return `404`.
- The stable Vercel URL is a review/hosting target, not a design source to copy back into this repo unless junyoung explicitly asks for historical recovery.
- `noindex` and robots blocking remain until public launch/search-indexing approval.
- Production deployment, alias changes, real trading/payment behavior, credential changes, and real customer-data collection require explicit approval.

## Research Inputs

These external references informed the workflow:

- Vercel v0 prompting guidance: strong UI prompts describe product surface, context of use, and constraints/taste.
- Recent AI coding-agent research: effective terminal agents rely on scaffolding, harnesses, context management, tool use, and verification rather than one perfect prompt.
- Community AI website-building workflows: practical builders front-load information architecture, audience objections, references, exclusions, and structure/style separation to avoid generic output.
- Korean gold exchange benchmark review: leading sites put price lineups, buy/sell distinctions, posted dates, consultation phone paths, branches, product categories, and trust details close to the first user decision.
- Deep competitor audit: benchmark work must inspect subpages, forms, tables, policy/contact paths, scripts, and network/API behavior, then decide what KCG should adopt or reject.
- KRX official gold-market guidance: private gold-exchange websites and KRX Gold Market trading are distinct; KCG must avoid implying KRX affiliation or exchange-traded execution.

## KCG Context Pack

Before visual, route, copy, API, chart, or form work, load or verify this context pack:

- `AGENTS.md`
- `docs/setup/CURRENT_HANDOFF.md`
- `docs/setup/CLOUD_ONLY_WORKFLOW.md`
- `docs/setup/continue-anywhere.md`
- `docs/quality/agent-quality-system.md`
- `docs/quality/product-experience-rubric.md`
- `docs/quality/data-source-compliance.md`
- `docs/quality/ai-site-production-playbook.md`
- `docs/research/gold-exchange-benchmark-2026-04-25.md`
- `docs/research/gold-exchange-deep-audit-2026-04-27.md`
- Local browser evidence from `npm run test:site` and, for visual changes, `npm run screenshot:site`.

If these sources disagree, project safety rules win over taste. Never use AI-generated copy to invent prices, legal facts, certifications, live trading, payments, reviews, admin behavior, or search-indexing launch decisions.

## KCG Prompt Shape

Use this structure when asking Codex or another agent to work on KCG:

```text
Outcome:
Improve [route/component] for the KCG gold exchange site.

Product surface:
Change [specific sections, data, actions, states]. Preserve [specific existing behavior].

Context of use:
Used by [fast price checker / sell-side consultation visitor / bar and bulk inquiry visitor / location-first visitor],
in [mobile/desktop moment],
to [check company posted prices / decide whether to call / prepare a visit / understand service scope].

KCG constraints:
- Korean copy by default.
- `/` is the single public site home; do not restore option routes unless explicitly requested.
- Company posted prices are primary; automatic market references are secondary.
- Do not invent official prices, business registration, legal claims, reviews, partnerships, KRX affiliation, live execution, payment behavior, or admin write behavior.
- Do not scrape, republish, or chart third-party data unless the source terms allow it; show source attribution for every API, RSS-style feed, chart, calculator, or external headline block.
- Keep noindex/robots preview behavior until public launch approval.
- Do not deploy, promote aliases, or change production settings unless explicitly requested.

Design direction:
- Serious price desk and consultation counter, not ecommerce mall or generic SaaS.
- Dense but readable tables/lists, KCG yellow/gold accents, charcoal text, pale green-gray support surfaces.
- Real KCG brand/campaign assets over abstract decoration.
- Mobile-first: no horizontal overflow, readable price columns, touch-safe phone/location actions, fixed bottom bar not blocking content.

Acceptance criteria:
- Route-specific content and CTA checks pass.
- Mobile and desktop screenshots show the intended hierarchy.
- Price table/posting time/buy-sell distinction remain visible and understandable.
- High-risk copy remains conservative and verifiable.
- Required commands pass or unresolved failures are reported with exact cause.
```

## Agent Execution Loop

For substantial KCG work, use this loop:

1. Inspect: read the nearest instructions, handoff, product rubric, route/component files, and existing tests before editing.
2. Decide: define the route job, user moment, risk areas, and what "done" means.
3. Guard: add or update the smallest deterministic check first when changing behavior that has been missed before.
4. Patch: make focused edits in the existing style. Avoid broad redesigns, new production dependencies, and unrelated refactors.
5. Verify: run the narrowest check during iteration, then the required full KCG command set before completion.
6. See: for visual changes, inspect real browser screenshots at mobile and desktop widths.
7. Score: grade product fit, trust/safety, mobile readability, single-surface discipline, code health, and verification completeness.
8. Record: update the handoff or quality docs only when a durable process change or unresolved decision should survive the chat.

## KCG Quality Rubric

Use this scorecard before finalizing:

- Product purpose: Does the page help a visitor check company posted prices, call, visit, or understand sell-side consultation?
- Trust and compliance: Did we avoid invented facts and keep company prices separate from automatic market references?
- Visual hierarchy: Are price/posting-time/CTA elements higher priority than decoration?
- Mobile usability: Is there no overflow, no clipped CTA text, and no fixed element covering key content?
- Single-surface discipline: Does the site keep `/` as the public home and avoid old option/temporary routes?
- Maintainability: Did we follow existing components and avoid new dependencies unless approved?
- Browser evidence: Did Playwright/route checks/screenshots prove the change in a real rendered page?

Target scores:

- 95+ means ready for preview review, with only approved launch/business confirmations remaining.
- 85-94 means usable locally, but there are known polish, data, or approval gaps.
- Below 85 means continue improving before presenting as complete.

## Route-Specific AI Instructions

Home:
Keep the first screen focused on `한국센터금거래소 시세표`, company posted prices, posted time, buy/sell distinction, and phone/visit actions. Campaign assets should prove this is a real physical consultation business, not replace the price desk.

Prices:
Make this the clearest detailed price route. On mobile, put consultation actions before dense price columns. Keep final-amount caveats near tables, not hidden in distant FAQ copy.

Services:
Explain what KCG can consult on when customers sell gold, jewelry, 18K/14K, platinum, silver, bars, corporate holdings, inheritance holdings, or bulk quantities. Do not turn it into a product catalog without sell-side guidance.

About:
Prioritize address, phone, operating hours, map links, visit preparation, and transaction flow. Trust comes from practical visit clarity, not inflated claims.

Admin:
Keep admin conservative until real authentication, credential handling, and production data rules are explicitly approved. Do not broaden admin write behavior for convenience.

## Prompt Templates

Continuation:

```text
KCG 사이트 이어서 작업해. 먼저 AGENTS.md, CURRENT_HANDOFF.md, product-experience-rubric.md, ai-site-production-playbook.md를 읽고 현재 로컬 상태를 확인해. 현재 repo를 단일 오픈 후보로 보고, /option-1·/option-2 같은 예전 비교 라우트는 복구하지 마. 배포나 production alias 변경은 하지 말고, 할 수 있는 로컬 개선과 검증을 끝까지 진행해.
```

Visual route improvement:

```text
[route]를 KCG 제품 목적에 맞게 개선해. 가격 확인/전화 상담/방문 준비 중 어떤 사용자 순간을 해결하는지 먼저 정의하고, 모바일과 데스크톱에서 위계가 보이게 수정해. 수정 전후에 필요한 감사 또는 Playwright 체크를 보강하고, screenshot:site 결과를 확인해.
```

Benchmark-driven improvement:

```text
국내 대표 금거래소 사이트와 KRX 공식 안내를 참고해 KCG에 맞는 장점만 선별해. 메인 화면뿐 아니라 하위 페이지, 가격표, 상품/서비스 구조, 지점/방문 정보, FAQ/정책, 폼, 네트워크/API/차트 호출까지 확인하고, 가격표, 상담 CTA, 출처 표기, KRX 혼동 방지 중 필요한 개선을 적용하되, 경쟁사 문구·이미지·가격표·차트·뉴스 본문·내부 API는 복사하거나 직접 사용하지 마.
```

Review:

```text
KCG 사이트를 코드리뷰/제품리뷰 관점으로 점검해. findings first로 실제 버그, 신뢰 리스크, 모바일 가독성, 단일 오픈 후보 원칙 위반, 누락된 테스트를 파일/라인과 함께 제시하고, 수정 가능한 것은 로컬에서 고친 뒤 필수 검증을 실행해.
```

## What Not To Ask

Avoid prompts like:

- "사이트 더 예쁘게 해줘."
- "금거래소답게 알아서 고급스럽게 만들어줘."
- "가격/후기/사업자정보도 그럴듯하게 넣어줘."
- "테스트는 됐고 빨리 배포해줘."
- "여러 버전 만들어서 비교하게 해줘." unless a new comparison workflow is explicitly needed.

Better prompts specify the route, user moment, facts that must not change, screenshots/reference URLs, acceptance criteria, and verification command set.

## Applied KCG Method

The optimized method for this repository is:

Context Pack -> Product Surface -> User Moment -> KCG Constraints -> Acceptance Criteria -> Minimal Patch -> Browser Evidence -> Score -> Durable Guardrail.

This is the project default for AI-assisted site work unless a future `AGENTS.md` or handoff file gives stricter instructions.
