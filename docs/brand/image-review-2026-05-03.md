# KCG Image Review 2026-05-03

This pass responds to junyoung's request to stop leaving image quality as a weak spot: review the banner and other image-replaceable surfaces, apply better assets where Codex can, and leave only human-only real-photo decisions unresolved.

## Visual Thesis

KCG should read as a practical Korean gold-exchange counter with large real-feeling metal products, clear inspection workflow, and restrained retail trust. The image system should not look like one repeated beige desk scene or a generic AI luxury poster.

## What Was Reviewed

- Home campaign carousel and social preview image.
- Product catalog hero, promo rail, and mobile promo banners.
- Product fallback images across mock data, Supabase seed, and `product-presenter`.
- Services, company, and about route supporting images.
- Existing public assets from the 2026-04-27 and 2026-04-30 rounds.

## Existing Image Assessment

- `kcg-brand-gold-bars-20260427-v4.webp`: strong campaign energy, but darker and more generated-poster-like than the new text-free hero.
- `kcg-main-desk-photo-20260427-v3.webp`: usable as comparison, but repeats the beige consultation desk mood and weakens the first screen.
- `kcg-advisor-counter-20260430.webp`: useful for service/process, but overuse makes the site feel like one white-glove stock scene.
- `kcg-jewelry-buying-tray-20260430.webp`: acceptable fallback, but less clean than the new jewelry tray/scale asset.
- `kcg-b2b-gift-packaging-20260430.webp`: acceptable fallback, but the new B2B candidate separates corporate consultation more clearly.
- `kcg-hero-metal-bars.jpg`: retained as the fourth home slide because it gives a clean metal-bar contrast against the new generated set.

## New Applied Assets

| Role | Applied Asset | Why |
| --- | --- | --- |
| Home first slide and social image | `public/campaign/kcg-home-product-keyvisual-20260503.webp` | Stronger product scale, no fake text, calm space for the price panel. |
| Home/service support | `public/campaign/kcg-home-inspection-action-20260503.webp` | Adds a real-feeling inspection moment without faces, private documents, or fake signage. |
| Company/about/visit support | `public/campaign/kcg-visit-transaction-guide-20260503.webp` | Cleaner transaction-preparation scene for store and company context. |
| Gold/silver catalog | `public/products/kcg-product-gold-silver-catalog-20260503.webp` | Gives product cards a sharper category image than the repeated desk photos. |
| Silver-bar category variation | `public/products/kcg-silver-gift-20260427-v2.jpg` | Retained specifically to prevent the home category grid from showing identical gold/silver images. |
| Jewelry buying and diamond-family promo | `public/products/kcg-product-jewelry-buying-20260503.webp` | Cleaner tray/scale image for jewelry and adjacent diamond inquiry contexts. |
| B2B/corporate consultation | `public/products/kcg-product-b2b-consulting-20260503.webp` | Distinguishes bulk/corporate consultation from general jewelry and gold-bar images. |

## 2026-05-06 v0.2.10 Follow-up

Junyoung approved a broader visual lane for the final pre-launch pass: Korean text, the real KCG logo, temporary price text, and AI-generated non-real people/faces are allowed, while competitor material, fake logos, fake certificates, fake appraisal/guarantee documents, and real-person likenesses remain banned. The implementation keeps exact logo, CTA, and business-critical price/guidance copy in HTML/UI layers where possible so generated images do not become the source of truth.

The chosen direction is `Graphite Desk + Seoul Retail + Human Consultation`: charcoal/silver/white surfaces with gold accents, stronger product scale, more retail context, and selective human consultation scenes.

| Role | Applied Asset | Why |
| --- | --- | --- |
| Home first slide and social image | `public/campaign/kcg-home-price-desk-20260506.webp` | Moves the first impression toward a darker price desk with metal products and a screen-like price context without making the image itself a price source. |
| Home consultation slide | `public/campaign/kcg-home-human-consultation-20260506.webp` | Adds a human 상담 flow without using identifiable staff/customer photography or fake logo signage. |
| Seoul retail / visit mood | `public/campaign/kcg-home-seoul-retail-20260506.webp` | Adds Jongno-inspired retail presence without competitor signs or invented KCG storefront branding. |
| Price-table guide visual | `public/campaign/kcg-price-guide-visual-20260506.webp` | Supports the `/prices` 시세표 보는 법 guide while the actual instructional text remains DOM copy. |
| Old-gold process | `public/campaign/kcg-old-gold-process-20260506.webp` | Replaces repetitive white-glove imagery with a clearer sorting/tray 상담 scene and no certificate/appraisal-document claim. |
| Gold/silver product surface | `public/products/kcg-product-minimal-bars-20260506.webp` | Provides a sharper graphite/ceramic product table for gold-bar and main catalog surfaces. |
| Pure-gold gifts | `public/products/kcg-product-pure-gold-gifts-20260506.webp` | Separates 순금제품 from generic bullion imagery without turning it into a holiday ad. |
| Corporate consulting | `public/products/kcg-product-corporate-consulting-20260506.webp` | Gives B2B consultation its own meeting-table visual without fake contracts, seals, or certificates. |

New source and review storage:

- Source originals: `C:\Users\junyo\Documents\File-Hub\30_Media\Images\AI generated\KCG\2026-05-06-visual-guidance-refresh`
- Repo review folder: `public/image-options/2026-05-06/generated`
- Review contact sheet: `public/image-options/2026-05-06/generated/contact-sheet.jpg`
- Machine-readable manifest: `public/image-options/2026-05-06/generated/manifest.json`

## 2026-05-06 v0.2.12 Follow-up

This pass did not generate additional AI images. The issue found in the final customer/staff flow QA was not a lack of source assets; it was that product data could still carry older placeholder image URLs, making the live catalog feel repetitive even after the v0.2.10 visual refresh.

The fix keeps custom admin-provided image URLs intact, but remaps known placeholder URLs by product slug on the public site. That means Supabase rows that still point to a generic category placeholder can render with a more appropriate approved KCG asset without mutating production product data.

Applied catalog distribution:

| Product Surface | Preferred Asset Direction |
| --- | --- |
| Investment/gold-bar consultation | graphite gold/silver catalog or product key visual |
| Silver-bar cards | silver-focused or mixed gold/silver catalog image |
| Pure-gold gifts | pure-gold gift/product image rather than generic bullion |
| Old-gold and jewelry buying | jewelry tray, process, or inspection image |
| B2B/corporate consultation | corporate consulting table or B2B packaging image |

Operational note: real KCG product/store/staff photos should still replace generated placeholders before search launch if the company wants the site to show actual inventory and store conditions. Until then, image variety is treated as a public-safe visual aid, not proof of exact inventory, certification, or final price.

## Selection Folder

Use this folder when junyoung wants to choose a different visual direction:

- Existing-current copies: `public/image-options/2026-05-03/existing-current`
- New source PNGs: preserved outside the repo under `C:\Users\junyo\Documents\File-Hub\30_Media\Images\AI generated\KCG\2026-05-03-image-refresh`
- New optimized WebPs: `public/image-options/2026-05-03/new/webp`
- Existing contact sheet: `public/image-options/2026-05-03/existing-current-contact-sheet.jpg`
- New contact sheet: `public/image-options/2026-05-03/new-candidates-contact-sheet.jpg`
- Diverse banner second pass: `public/image-options/2026-05-03/diverse-banner-directions`
- Machine-readable manifest: `public/image-options/2026-05-03/new-candidates-manifest.json`

## 2026-05-03 Diverse Banner Second Pass

Junyoung correctly pointed out that the first refresh still overused a narrow visual vocabulary: gold bars, gloves, envelopes, scales, and similar tabletop staging. The second pass was created for actual choice diversity and is not applied by default.

| Code | Direction | Intended Use |
| --- | --- | --- |
| A | 제품 미니멀 | 장갑, 봉투, 저울 없이 제품 자체로 가는 배너. |
| B | 매장 분위기 | 제품 테이블 대신 방문/매장 신뢰감을 주는 방향. |
| C | 금고/보관 신뢰감 | 자산 보관, 안전, 신뢰를 강조하는 방향. |
| D | 종로형 매장 외부 | 가짜 간판 없이 지역 매장 존재감을 주는 방향. |
| E | 금속 매크로 | 판매 장면보다 소재감과 프리미엄 질감을 주는 방향. |
| F | 그래픽 포스터형 | 실사 매장이 아니라 디자인된 캠페인 비주얼 방향. |
| G | 상담 테이블 | 장갑/저울/봉투 없이 차분한 상담 맥락을 주는 방향. |
| H | 실버 중심 대비 | 골드 과다 이미지를 끊는 차가운 실버 중심 방향. |

Use `contact-sheet.jpg` in that folder for quick comparison. Source PNGs are preserved outside the repo in `C:\Users\junyo\Documents\File-Hub\30_Media\Images\AI generated\KCG\2026-05-03-diverse-banner-directions`; the repo should keep optimized WebPs and review sheets, not every large source PNG.

## Guardrails

- Do not use AI-generated fake KCG logo text, fake certificates, fake appraisal/guarantee documents, personal documents, competitor marks, or recognizable real-person faces.
- AI-generated generic 상담원/고객 faces and hands are allowed only when they do not resemble a real person, employee, celebrity, or customer testimonial.
- Keep exact copy, price labels, legal facts, and brand marks in HTML/CSS or real uploaded assets, not inside generated images.
- Keep source PNGs and review copies for later choice, but public UI should use optimized `.webp` variants.
- Prefer real KCG-approved photography once junyoung supplies store/product photos; AI images are still concept/commercial assets, not verified real inventory photos.

## Remaining Human-Only Risk

- Final real product/store photography still needs junyoung/KCG approval if the site must show actual inventory, packaging, store interiors, or staff.
- Search/public launch approval remains separate from this image pass.
- Production Supabase auto-fill tables still require a logged-in Supabase SQL Editor or authenticated CLI if `/admin/prices` reports schema-not-ready.

## Verification

- Passed: `npm run audit:site`
- Passed: `npm run lint`
- Passed: `npm run typecheck`
- Passed: `npm run tasks:dashboard`
- Passed: `npm run build`
- Passed: `npm run test:site`
- Passed: `npm run screenshot:site`
- Passed: `npm audit --audit-level=moderate`
- Passed: `git diff --check` with line-ending warnings only.
- Visually inspected: `home-mobile.png`, `home-desktop.png`, `products-mobile.png`, `products-desktop.png`, `services-mobile.png`, and `company-mobile.png`.
