# KCG Product Operations Checklist

Last updated: 2026-05-08 KST.

This checklist is for preparing the public `상품/매입` catalog before launch. Do not record passwords, Supabase keys, customer data, or unapproved internal price rules here.

## Purpose

The KCG product catalog is not a checkout mall. It is a consultation-first catalog that lets customers see product/merchandise categories, current posted-price reference values, and the next inquiry step.

## Admin Input Fields

Use `/admin/products` to prepare each item.

| Field | What To Enter | Launch Check |
| --- | --- | --- |
| 상품명 | Customer-facing item name, e.g. `KCG 골드바 3.75g` | Clear enough without a sales call |
| 카테고리 | `골드바`, `실버바`, `순금제품`, `고금·주얼리 매입`, `B2B·기업` | Matches the public tab |
| 서브카테고리 | Optional grouping such as `1돈 골드바`, `18K 매입`, `기업 기념품` | Useful for sorting and scanning |
| 중량(g) | Exact gram weight when the item is weight-based | Required for automatic reference price |
| 연동 시세 | Posted price basis such as `순금 살 때`, `순금 팔 때`, `은 살 때` | Must match actual business logic |
| 상담 기준 공임 | Temporary making fee or margin estimate used only as a consultation reference | Replace with confirmed operating rule |
| 수동 가격 | Use only when automatic posted-price calculation is not appropriate | Must be labeled as reference/inquiry if not final |
| 이미지 URL | Approved product image under `/products`, `/campaign`, or `/company` | No private documents, competitor images, or fake certificates |
| 공개 상태 | `상담 가능`, `사전 문의 필요`, or `비공개` | Hide items not ready for public review |
| 표시 순서 | Low number appears first | Best-selling/high-priority items first |
| 고객용 설명 | One short line only | Avoid internal operating notes |
| 안내 문구 | Public note shown near price/details | Must not promise fixed transaction value |

## Real Photo Replacement Priority

Use `docs/brand/product-image-replacement-map-2026-05-08.md` before changing public product image URLs. It maps the current public image paths to approval-required KCG candidate groups and keeps actual real-photo replacement blocked until KCG approves the file, crop, and final-use classification. The generated KCG-style gold-bar assets from `v0.2.29` are recorded in `docs/brand/generated-goldbar-assets-2026-05-08.md` and remain representative-only.

Until that approval happens, keep the public catalog clarification from v0.2.28: product list/detail images are `상담용 대표 이미지`, and actual product photo, packaging, stock, color, crop, and final-use classification are confirmed by phone/on-site consultation.

For admin follow-up, use the `/admin/products` image filters and mobile row summaries before replacing anything: `실사진 확인` surfaces representative/generated images, `교체 대상` surfaces legacy placeholders, and raw KakaoTalk-style paths must stay `원본 KakaoTalk`/`권한 확인` until the file, source, crop, and final-use classification are approved.

1. 골드바: actual KCG gold bars by weight, packaging, certificate envelope.
2. 실버바: actual silver bar inventory or approved KCG-generated asset.
3. 순금제품: 돌반지, 순금 카드, 기념 메달, packaging.
4. 고금·주얼리 매입: tray with old gold/jewelry, scale, neutral counter.
5. B2B·기업: bulk packaging, gift boxes, blank folder, no customer/company names.

## Category Launch Inputs

Use this table before replacing the current generated/product placeholder assets. These are operating inputs, not passwords or private rules.

| Category | Required Before Launch | Price Basis | Image Priority | Public Wording |
| --- | --- | --- | --- | --- |
| 골드바 | Confirm exact weights sold first, packaging, certificate envelope policy, and 공임/margin by weight. | `순금 살 때` plus weight and 공임. | Actual KCG gold bars by size; avoid generic desk-only photos. | `현재 고시가 기준 참고가`, high-weight items may say `사전 문의 필요`. |
| 실버바 | Confirm inventory sizes such as 100g, 500g, 1kg and supply check flow. | `은 살 때` plus weight and 공임. | Silver bars must look visually different from gold-bar cards. | Make supply confirmation clear; do not promise same-day stock unless confirmed. |
| 순금제품 | Confirm 돌반지, 순금 카드, 기념 메달, gift packaging, and 공임 display rule. | `순금 살 때` plus weight and item 공임. | Product/gift packaging photo, not a generic gold-bar pile. | Mention gift/product category, not investment promise. |
| 고금·주얼리 매입 | Confirm handled purity basis: 순금, 18K, 14K, 백금, 은, and any excluded item types. | `내가 팔 때` basis by purity. | Jewelry tray, rings/necklaces, simple scale; no personal documents. | Use `실물 확인 후 확정`; do not show a fixed quote for every item. |
| B2B·기업 | Confirm minimum quantity, corporate gift scope, packaging, lead time, and 담당 flow. | `사전 문의 필요` unless a clear weight item exists. | Packaging, blank folder, samples; no client names. | Emphasize quantity/spec review and separate consultation. |

## Admin Update Flow

1. Edit the item in `/admin/products`.
2. Save only customer-facing fields needed for the public catalog.
3. Open `/products` and confirm the correct tab, image, reference price, and wording.
4. Check mobile `/products` so tabs, count/sort, and the card image are visible without awkward empty space.
5. If a real image is not ready, keep the item `사전 문의 필요` or `비공개` rather than publishing a weak placeholder.

## Price Wording Rules

- Use `현재 고시가 기준 참고가` for calculated catalog values.
- Use `사전 문의 필요` for B2B, large quantity, high-weight, or uncertain supply items.
- Do not use `구매하기`, `결제하기`, `주문하기`, `장바구니`.
- Do not imply the screen price is a guaranteed final transaction amount.
- Company posted prices remain separate from Gold API, TradingView, Metals.Dev, or KRX market reference data.

## Image Rules

- Prefer optimized `.webp` files in public UI when available.
- Keep original `.png` generated images only as source-preserving originals.
- Do not upload business cards, contracts, IDs, account numbers, signatures, or private documents as public catalog images.
- Do not use competitor product photos, competitor logos, copied model/staff photos, or scraped images.
- If using AI-generated people, use only non-identifiable partial hands/silhouette and never present them as real KCG staff or customers.

## Pre-Launch Acceptance

- Every public item has a distinct enough image or is intentionally hidden.
- Every displayed price has a clear basis: posted-price reference, manual reference, or inquiry.
- Product tabs show a reasonable item count and do not feel empty.
- Mobile `/products` shows tabs, count/sort, and product cards before promotional banners.
- `/admin/products` changes persist after refresh through Supabase.
