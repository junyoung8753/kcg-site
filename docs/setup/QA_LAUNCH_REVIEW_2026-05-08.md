# KCG Launch-Candidate Rendered QA - 2026-05-08

This note records the task-local launch-candidate review for the KCG public site and admin price-entry workflow.

## Scope

- Customer surfaces: `/`, `/prices`, `/products`, `/services`, `/about`, `/announcements`
- Mobile surfaces: home, prices, products, services viewport captures
- Admin surfaces: `/admin/prices`, `/admin/launch`, `/admin/products`
- Data/source surfaces: company posted prices, automatic market references, image provenance, noindex/search posture

## Design Direction

Serious Korean gold-exchange price desk: company posted prices stay first, imagery supports trust without looking like proof of final product inventory, and admin price entry mirrors the public price lineup so staff can see exactly which customer-facing value they are changing.

## Rendered Findings By Category

| Category | Current finding | Action in v0.2.30 |
| --- | --- | --- |
| Customer | Home and `/prices` render the KCG posted price table before market-reference content. Phone/visit paths remain close to price decisions. | Preserve public price hierarchy and no checkout/cart behavior. |
| Staff | Before this pass, `/admin/prices` direct entry listed eight flat rows with `품목 / 현재 공개가 / 새 입력값`, so the two public columns `내가 살 때` and `내가 팔 때` were not visually mapped. | Rebuilt direct price entry as `품목 / 내가 살 때 (VAT포함) / 내가 팔 때 (현장 기준)` using the same row names/order as the public lineup. |
| Mobile | Rendered checks showed no document-level horizontal overflow on home, `/prices`, `/products`, or `/admin/prices`. Public mobile price rows remain dense but readable. | Kept the public mobile layout unchanged; admin input table stays inside horizontal table containment without page overflow. |
| Admin | Auto mode, time-basis explanation, and price history are already visible. The direct input table needed stronger mistake-prevention. | Added per-cell current public price, controlled new input, live 차액 label, 노출 checkbox, note field, and native numeric `required/min=1/step=1` guards inside the matching public price cell. |
| Visual quality | Current gold-bar assets are generated representative images based on KCG visual direction, not real product proof. They avoid raw KakaoTalk filenames and keep `상담용 대표 이미지` copy. | No new image was added. Existing image intake/replacement boundaries remain in force. |
| Data source | Gold API, TradingView, Google News RSS-style headlines, Supabase/mock repository mode, and KRX blocked state are documented. Company posted prices remain the source of truth. | No API/provider/schema change. No external data overwrites company posted prices. |
| Launch readiness | `robots/noindex` and explicit search-approval gate remain. Real product photos, final prices/공임, final admin secret rotation, and ownership transfer are still user-only/shared blockers. | Recorded the remaining blockers; no search, secret, DNS, payment, live trading, KRX production data, or ownership-transfer behavior changed. |

## Current Evidence

- Pre-fix rendered extraction showed public home/mobile and `/prices` mobile include `한국센터금거래소 시세표`, `내가 살 때 (VAT포함)`, and `내가 팔 때`.
- Pre-fix rendered extraction showed `/admin/prices` manual editor headers were `품목 / 현재 공개가 / 새 입력값 / 차액 / 노출 / 비고`, and `hasPublicLineupLabels=false`.
- TDD RED: `npm run test:site -- --grep "admin prices exposes automatic price operation"` failed because the public-lineup manual editor guidance was absent.
- TDD GREEN after implementation: the targeted Playwright admin regression passed against the rebuilt editor.

## Verification Log

- Passed: `npm run lint`
- Passed: `npm run typecheck`
- Passed: `npm run audit:site` with source-only audit `1587 checks, 1 skipped`
- Passed: `npm run build`
- Passed: `npm run test:site` with Playwright `25 passed`
- Passed: `npm run screenshot:site`
- Passed: `npm run screenshot:admin`
- Passed: `npm run qa:site` with rendered audit `1647 checks, 0 skipped`, Playwright `25 passed`, screenshot refresh, and npm audit `0 vulnerabilities`
- Passed: `npm audit --audit-level=moderate` with `0 vulnerabilities`
- Passed: `git diff --check` with Windows line-ending warnings only
- Rendered admin evidence after final screenshot refresh: `admin-prices-manual-desktop.png`, `admin-prices-auto-desktop.png`, and `admin-prices-auto-mobile.png` exist under `output/screenshots`; Playwright extraction confirmed the direct editor headers `품목 / 내가 살 때 (VAT포함) / 내가 팔 때 (현장 기준)`.

## Remaining User-Only Or Shared Work

- Approve final real product photos or explicitly accept representative-only generated gold-bar images before public search launch.
- Confirm final product prices, 공임/margin rules, product visibility, and public operating policy.
- Rotate final production admin secrets before public search launch without putting values in Git/docs/chat.
- Keep `KCG_PUBLIC_SEARCH_APPROVED=1`, robots/noindex release, payment/trading behavior, DNS policy changes, and KRX production data blocked until explicit approval.
