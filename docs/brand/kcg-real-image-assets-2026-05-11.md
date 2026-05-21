# KCG Real-Derived Image Assets 2026-05-11

This record documents the real KCG logo/gold-bar derivative image pass requested by junyoung on 2026-05-11 KST.

2026-05-11 later product-card note: a human-eye review found that the first real KCG-derived product assets could contain baked weight text such as `18.75g` on mismatched cards, so v0.2.34 temporarily preferred text-free AI representative assets. Junyoung then clarified that the supplied goldbar photos are actual KCG physical goldbars and should be used directly as source material. v0.2.35 used optimized real KCG goldbar derivatives for the home banner, hand-held consultation image, `/products` hero, and 1/2/3/5/10돈 guide. v0.2.36 then removed the hand-held/palm photo from active home/company/1g product surfaces because it reads like an informal proof shot rather than a polished KCG site visual. v0.2.42 replaces the active goldbar product-card/detail rows with KCG real-derived front/back product-shot assets and removes public representative-image wording from customer-facing product surfaces. See `docs/brand/kcg-real-goldbar-product-assets-2026-05-11.md`.

Source folder:

`C:\Users\junyo\Documents\File-Hub\80_보관\사진_영상\Images\KCG 이미지`

## Competitor Benchmark

Checked at least six Korean gold-exchange sites before implementation:

| Site | Observed image pattern | KCG decision |
| --- | --- | --- |
| 한국금거래소 | Wide product/campaign banners, visible product categories, price table remains prominent. | Adopt wide product-led first slide, but keep KCG posted prices as the working surface. |
| 삼성금거래소 | Large brand/product hero and trust-led gold visual language. | Adopt restrained trust mood and clear product signal, not their copy or claims. |
| 한국표준금거래소 | Product grid, mall-like thumbnails, promotional strips. | Adopt product clarity only; avoid checkout/cart mall behavior. |
| KGS 안전자산 한국표준금거래소 | Product-list imagery and clear product/category separation. | Adopt explicit gold-bar category imagery; keep source and price disclaimers separate. |
| 한국감정금거래소 | Price table near the top with gold product/category visuals. | Adopt price-first hierarchy and physical exchange tone. |
| GBK | App/investment-style visual with live-price panels and product CTA. | Reject trading/app feel; KCG remains consultation-first. |

No competitor image, logo, price, slogan, staff/model photo, product photo, endpoint, or detailed copy was copied into KCG.

## Public Assets Added

| Public asset | Source | Role | Boundary |
| --- | --- | --- | --- |
| `/campaign/kcg-real-goldbar-price-desk-20260511.webp` | KCG lockup `KakaoTalk_20260427_125126082_01.png` + real KCG gold-bar lineup `KakaoTalk_20260508_091613735.jpg` | Home first-slide campaign image, social preview image, products promo banner | Real KCG-derived visual, but still not final price, stock, certificate, or inventory proof. |
| `/campaign/kcg-korean-consultation-hands-20260511.webp` | New AI-generated Korean consultation-hands scene with no face, logo, text, price, certificate, or document | Home and company consultation support image | Representative human-context image only; not a real staff/customer photo. |
| `/campaign/kcg-real-opening-campaign-20260511.webp` | KCG opening card `KakaoTalk_20260508_164514053.jpg` + KCG lockup + real KCG lineup | Secondary home campaign slide | Embedded opening text should stay intentional; avoid using it as evergreen product proof. |
| `/products/kcg-real-goldbar-lineup-20260511.webp` | `KakaoTalk_20260508_091603752.jpg` + KCG lockup | Previous `/products` hero and selected product-card representative image | Real KCG-derived lineup visual; current product cards prefer text-free AI representatives to avoid baked-weight confusion. |
| `/products/kcg-real-goldbar-detail-20260511.webp` | `KakaoTalk_20260508_091553653_02.png` + KCG lockup | Previous 3.75g and 100g representative detail image | Retained for reference/rollback; avoid on mismatched product cards because source text can imply a specific weight. |
| `/products/kcg-real-goldbar-single-20260511.webp` | Cropped derivative from `KakaoTalk_20260508_091553653_02.png` + KCG lockup | Previous 1g representative image | Retained for reference/rollback; exact weight and availability must stay in DOM/data/consultation. |

## Current v0.2.35/v0.2.36 Real KCG Goldbar Derivatives

| Public asset | Source | Role | Boundary |
| --- | --- | --- | --- |
| `/campaign/kcg-real-goldbar-promo-banner-20260511-v2.webp` | `IMG_4283.PNG` KCG goldbar lineup | Current home first slide, social image, products promo, high-weight inquiry support | Promotional KCG 실물 골드바 visual; not price, stock, certificate, or inventory proof. |
| `/campaign/kcg-real-goldbar-hand-consultation-20260511-v2.webp` | `KakaoTalk_20260508_150411746_04.jpg` | Inactive/reference only after v0.2.36 | Shows a real KCG goldbar in hand, but the palm/proof-shot feel is not appropriate for current active core surfaces. |
| `/products/kcg-real-goldbar-don-lineup-20260511-v2.webp` | `IMG_4283.PNG` | Current `/products` hero and goldbar fallback | Lineup context only; exact product data stays in HTML and company posted-price logic. |
| `/products/kcg-real-goldbar-1don-20260511.webp` | `KakaoTalk_20260508_091553653.png` | Current 1돈 guide and 3.75g product image | Exact 1돈 visual, not price/stock/certificate proof. |
| `/products/kcg-real-goldbar-2don-20260511.webp` | `IMG_4282.PNG` crop | Current 2돈 guide image | Exact 2돈 visual, not price/stock/certificate proof. |
| `/products/kcg-real-goldbar-3don-20260511.webp` | `KakaoTalk_20260508_091553653_01.png` | Current 3돈 guide image | Exact 3돈 visual, not price/stock/certificate proof. |
| `/products/kcg-real-goldbar-5don-20260511.webp` | `KakaoTalk_20260508_091553653_02.png` | Current 5돈 guide image | Exact 5돈 visual, not price/stock/certificate proof. |
| `/products/kcg-real-goldbar-10don-20260511.webp` | `KakaoTalk_20260508_091553653_03.png` | Current 10돈 guide and 37.5g product image | Exact 10돈 visual, not price/stock/certificate proof. |

## Applied Surfaces

- `/` home carousel now starts with the v0.2.35 real KCG goldbar lineup banner.
- The second home slide uses `kcg-real-goldbar-price-desk-20260511.webp`, not the hand-held/palm image.
- The third home slide uses the KCG opening campaign card derivative.
- `src/app/layout.tsx` uses the v0.2.35 real KCG goldbar lineup banner as the social/structured-data image.
- `/products` hero and the 1/2/3/5/10돈 guide use the v0.2.35 real KCG goldbar derivatives.
- `/products` 1g, 3.75g, 10g, 37.5g, and 100g cards now use KCG real-derived front/back product-shot images (`kcg-real-goldbar-frontback-1g-20260513.webp`, `kcg-real-goldbar-frontback-3-75g-20260513.webp`, `kcg-real-goldbar-frontback-10g-20260513.webp`, `kcg-real-goldbar-frontback-37-5g-20260513.webp`, `kcg-real-goldbar-frontback-100g-20260513.webp`). The older generated exact-weight representatives remain inactive/reference after v0.2.42.
- Active public product-shot paths: `/products/kcg-real-goldbar-frontback-1g-20260513.webp`, `/products/kcg-real-goldbar-frontback-3-75g-20260513.webp`, `/products/kcg-real-goldbar-frontback-10g-20260513.webp`, `/products/kcg-real-goldbar-frontback-37-5g-20260513.webp`, and `/products/kcg-real-goldbar-frontback-100g-20260513.webp`.
- `/company` uses `kcg-real-goldbar-price-desk-20260511.webp` after the v0.2.36 no-hand correction.
- `/admin/products` classifies these public paths as `KCG 파생` with a File-Hub source note so operators do not mistake raw filenames for approved public paths.

## Safety Boundaries

- Raw KakaoTalk filenames are still not used in public URLs.
- Source originals remain in File-Hub; only optimized `.webp` derivatives are served.
- Public product pages should not show `상담용 대표 이미지` or the derivative-image explanation on customer-facing goldbar product imagery after v0.2.42.
- Images must not replace company posted prices, product data, public legal facts, or 상담 confirmation.
- These assets do not approve stock, packaging, certificate, product availability, margin, guaranteed quote, payment, checkout, or trading behavior.
- The v0.2.35 hand image is sourced from the supplied KCG physical goldbar hand photo. After v0.2.36 it must not be used as an active home/company/product representative visual unless junyoung explicitly re-approves that exact role.

## Rollback

Rollback phrase: `v0.2.32 실제 KCG 이미지 파생 적용 전으로 되돌려줘`
