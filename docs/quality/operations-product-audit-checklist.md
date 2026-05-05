# KCG Operations Product Audit Checklist

This checklist expands KCG QA from "does the website work?" to "can a real gold-exchange team operate it every day without avoidable mistakes, repeated manual work, or customer confusion?"

It is a control-plane document. It does not authorize runtime code changes, scraping, payment, public launch, search indexing, or automatic trading/payment behavior.

## When To Use

Use this checklist before or during KCG work involving:

- homepage price disclosure
- posted company prices
- market-reference API data
- admin price entry or auto-price settings
- product/gold-bar catalog
- buying consultation flow
- store/company information
- image and campaign asset decisions
- launch readiness and handoff review

## QA Types

### Technical QA

Checks whether the software behaves correctly.

- build, type, lint, runtime, and hydration errors
- responsive layout and mobile overflow
- accessibility basics: labels, focus, contrast, keyboard access
- API request errors, timeout, empty response, stale state, and fallback behavior
- form submission, authentication, storage, and data retrieval
- screenshot evidence for customer-facing routes and admin routes

### Product / Operations QA

Checks whether KCG staff can actually run the gold-exchange workflow.

- representative/admin: can today's operating status be understood quickly?
- price staff: can company posted prices be entered, checked, previewed, and corrected without confusion?
- buying staff: can old gold/jewelry buying criteria be explained without separate notes?
- product staff: can gold-bar, silver-bar, pure-gold, and B2B items be shown, hidden, or updated without repeated manual work?
- customer response staff: can common questions be answered from the website instead of phone/Kakao repetition?
- bookkeeping/operator: are price history, change reasons, public/private state, and evidence clear enough for later review?

### Business / Conversion QA

Checks whether the site helps customers trust KCG and take the right next action.

- can customers see today's KCG posted prices quickly?
- can customers tell company posted prices from market-reference prices?
- can customers understand whether a displayed value is final or only a reference?
- can customers decide whether to call, message, or prepare for store consultation?
- does the site reduce avoidable questions about address, hours, required items, price basis, and product availability?
- does any copy imply guaranteed price, investment profit, official exchange status, or legal/tax certainty beyond KCG's scope?

## Main Price Disclosure Priority

KCG's public site has one top-level purpose: disclose 한국센터금거래소 posted prices clearly.

Company posted prices are the source of truth. API prices, international spot prices, charts, exchange rates, and auto-conversion values are supporting references only.

Checklist:

- 메인 첫 화면에서 오늘 시세표가 바로 보이는가?
- 회사 고시 시세가 API/국제 참고 시세보다 시각적으로 우선하는가?
- 업데이트 시각과 적용 기준이 보이는가?
- 고객이 확정 매입가로 오해하지 않도록 안내되는가?
- 시세 확인 후 전화/카톡/방문 상담으로 이어지는 경로가 명확한가?
- 모바일 첫 화면에서도 시세 확인이 빠른가?
- API 장애 또는 시세 미등록 상태에서도 고객에게 신뢰 가능한 안내가 보이는가?
- 이미지, 배너, 차트, 장식이 시세표보다 먼저 고객 시선을 빼앗지 않는가?
- 고객이 "오늘 금 팔면 대략 얼마인지", "골드바/제품 구매 기준이 어디인지", "확정가인지 참고가인지"를 혼동하지 않는가?

Finding trigger:

- The homepage first viewport hides or de-prioritizes the KCG price table.
- A market-reference widget appears more authoritative than company posted prices.
- Price copy is long enough that customers must scroll before understanding the current posted price basis.

## Existing API Integration Audit

Already-integrated APIs are not P2 backlog. They are part of the current site and must be audited in both Technical QA and Product / Operations QA.

Current inventory and first-pass findings are recorded in `docs/quality/existing-api-integration-audit-2026-05-05.md`. Update that document when KCG adds, removes, disables, or materially changes an API/data source.

P2 applies to new API additions, paid upgrades, advanced automation, external API-driven operating decisions, and competitor/external site price collection.

Existing API audit questions:

- 어떤 API가 이미 연동되어 있는가?
- API 데이터가 고객 화면에서 어떤 역할을 하는가?
- 회사 고시 시세와 API 참고 시세의 위계가 명확한가?
- API 장애 시 고객 화면이 어떻게 보이는가?
- stale data, fetch 실패, rate limit, timeout, 빈 응답에 대한 fallback이 있는가?
- 마지막 업데이트 시각이 보이는가?
- API 데이터가 회사 고시 시세보다 앞서 보이지 않는가?
- 자동 시세와 수동 시세의 우선순위가 명확한가?
- 관리자가 API 값을 그대로 노출할지, 참고값으로만 쓸지 통제할 수 있는가?
- API 값이 확정 매입가/판매가처럼 오해되지 않게 안내되는가?
- API 관련 테스트, mock, fallback, error state가 있는가?

Current classification rule:

- P0: inventory existing API surfaces, document company/API hierarchy, verify fallback/stale/error criteria.
- P1: improve operations UX for already-connected APIs: manual/automatic policy, update state, admin review flow, public source line.
- P2: add new APIs, paid API migration, advanced automation, CRM/ERP/notification integration, or external price collection.

Do not scrape, cache, proxy, or auto-ingest competitor prices. Competitor sites may be linked for human reference only.

## Role-Based Workflow Prompts

Use these prompts when reviewing a change.

| Role | What They Try To Do | Watch For |
|---|---|---|
| 대표/관리자 | See today's site status, price state, launch risk, and urgent actions | unclear dashboard, no history, no rollback basis |
| 시세 담당자 | Register, preview, correct, or automate today's prices | wrong source priority, hidden stale state, no change reason |
| 고금 매입 직원 | Explain what can be bought and how final amount is decided | missing purity/weight/state basis, customer thinks estimate is final |
| 골드바/제품 판매 담당자 | Show available product types and price basis | no public/hidden/sold-out state, missing photo replacement plan |
| 상품/콘텐츠 관리자 | Update products, images, notices, hours, and captions | repeated form work, unclear image ownership, old notice left public |
| 고객응대 직원 | Answer phone/Kakao questions with site pages | address/phone/hours repeated or inconsistent, no linkable FAQ |
| 마케팅/전환 담당자 | Move customer from price check to inquiry | CTA clutter, no Kakao-ready path, weak trust proof |
| 일반 고객 | Check price, product, store, and next action quickly | too much explanation, price uncertainty, mobile friction |
| 세금/정산/장부 운영자 | Confirm what changed and why | missing history, no user/change timestamp, no export path |

## Image / Visual Asset Audit

Images are content, not decoration. They should improve customer understanding, trust, and consultation conversion.

Audit every key image by recording:

- current image file and route/component usage
- whether it is real photo, generated image, stock, placeholder, logo, or internal document
- whether image quality strengthens or weakens brand trust
- whether it steals attention from the price table
- whether it helps the next customer action
- whether text would be clearer as an infographic
- alt text, file name, caption, and surrounding context
- mobile crop and whether it pushes the price table down
- LCP/performance risk, large file size, width/height, lazy/priority behavior
- whether it needs WebP/AVIF or responsive sizing
- whether a placeholder must be replaced after real product photos arrive

### A. Images That Must Become Real Photos

- KCG-designed real gold-bar product photos
- real sale product photos
- real store exterior/interior photos
- real certificate, package, display, and product detail photos
- any image a customer may use to judge actual product appearance

### B. Temporary Generated Images Or Illustrations Are Acceptable

- gold price disclosure banner support
- old gold buying process explanation
- purity/weight/price-basis explanation
- consultation process support
- customer trust/inspection/safe transaction guidance
- category representative image when real product photo is not ready
- product-card placeholder for items awaiting real photos
- FAQ or caution support graphics

### C. Infographic Opportunity Review

Text may be better as image/infographic when explaining:

- 고금 매입 절차: 상담 -> 실물 확인 -> 중량/순도 확인 -> 가격 안내 -> 결제
- 시세표 보는 법
- 매입가가 확정되는 기준
- 자동/API 참고시세와 회사 고시 시세의 차이
- 방문 전 준비물
- 골드바 구매 흐름
- 매장 방문/전화/카톡 상담 경로
- 실제 거래가는 실물 확인 후 확정된다는 안내

### D. Images To Avoid Or Treat Carefully

- fake gold bars that look like actual KCG products
- images implying legal validity, certification, official partnership, or guarantee not actually held
- profit, price-rise, or investment-return guarantee graphics
- customer personal information, ID, transaction records, bank/account examples
- AI-generated store/product photos that customers could mistake for real KCG-owned photos
- competitor marks, product photos, models, slogans, or price screens

## Placeholder Vs Real Product Photo Policy

Until KCG-designed gold bars and products are photographed, temporary images may keep the site complete and polished.

Rules:

- placeholder images may support page mood, category recognition, and mobile readability
- internal file names, comments, docs, alt text, or asset manifests should make placeholder status clear
- customer-facing pages do not need a loud "AI image" label, but must not falsely imply the image is the actual product photo
- actual KCG product photos should replace placeholders as soon as available
- placeholder replacement targets must be tracked in `docs/setup/OPEN_TASKS.md` or an asset audit document
- placeholder images must not push the homepage price table below the first important viewport
- actual product images are `shared` or `user-only` follow-up because Codex cannot invent real KCG product photography

## Forbidden / Blocked

Do not implement or recommend as an automatic action:

- legal/tax final judgment
- personal data over-collection
- copy implying final purchase/buying price before physical inspection
- competitor price scraping, caching, proxying, or hidden collection
- random price offsets to disguise copied values
- online payment, live trading, or checkout behavior without explicit approval
- investment return, guaranteed profit, or official-market status claims
- public search indexing or launch behavior without explicit approval

## Priority Classification

| Priority | Meaning |
|---|---|
| FORBIDDEN / BLOCKED | Do not implement without explicit legal/operational approval, and usually do not implement at all |
| P0 | Required before next serious QA/final launch-readiness claim |
| P1 | Strong operations improvement for near-term launch or daily work |
| P2 | Useful later after baseline operations are stable |

P0 examples:

- audit current API surfaces and fallback behavior
- document company posted price as source of truth
- verify homepage price-table first-view priority
- separate technical QA from operations/product QA
- classify real-photo vs placeholder image needs

P1 examples:

- admin price preview, history, and manual/auto policy clarity
- customer inquiry path clarity for phone/Kakao/store
- product public/hidden/sold-out and photo replacement workflow
- image asset audit and performance review

P2 examples:

- paid API conversion
- advanced auto-price automation
- CRM/ERP/notification integration
- analytics dashboards and long-term content automation

## Finding Template

Use this template for product-audit findings.

```markdown
### Finding ID

- Date:
- Route / Surface:
- Role affected:
- Workflow affected:
- QA type: Technical / Product-Operations / Business-Conversion
- Priority: FORBIDDEN / P0 / P1 / P2
- Symptom:
- Evidence:
- Why it matters:
- Likely fallback to Excel/Kakao/phone/manual note:
- Customer confusion risk:
- Operator mistake risk:
- 고객이 보는 첫 화면 영향:
- 시세표 노출 영향:
- API/회사 고시 시세 위계 영향:
- 이미지/비주얼 자산 영향:
- 실제 사진 필요 여부:
- placeholder 교체 필요 여부:
- 실제 제품 사진 도착 후 follow-up:
- Proposed smallest next action:
- What not to change:
```
