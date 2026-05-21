# KCG AI Goldbar Product Assets - 2026-05-11

## Why this pass exists

Human-eye product review found that the previous real KCG-derived product card assets looked strong, but some contained baked weight text such as `18.75g`. That is acceptable as brand/product reference imagery only when clearly labeled, but it can mislead when reused on `1g`, `3.75g`, `10g`, `37.5g`, or `100g` product cards.

This pass uses the KCG goldbar photos and logo direction as visual reference. The v0.2.34 assets avoided embedded weight text when exact photos were missing. The v0.2.37 follow-up added generated exact-weight representative images for `1g`, `10g`, and `100g` so the product card image no longer borrowed a different 돈-unit lineup or promo banner. As of v0.2.42, these generated exact-weight product-card images are inactive/reference only because the active goldbar rows use KCG real-derived front/back product-shot assets. The accurate price, stock, package, and final availability information still stays in HTML/product data and 상담.

## Public derivatives

| Public path | Intended use | Boundary |
| --- | --- | --- |
| `/products/kcg-ai-goldbar-don-lineup-20260511.webp` | `/products` hero, 1/2/3/5/10돈 consultation guide, 37.5g/10돈 representative image | AI-generated representative lineup only; labels and grams are rendered in HTML. |
| `/products/kcg-ai-goldbar-hand-consultation-20260511.webp` | 1g/small-bar consultation image | AI-generated no-face consultation scene; not staff/customer identity, final stock, or certificate proof. |
| `/products/kcg-ai-goldbar-tray-20260511.webp` | 3.75g and 10g product-card support image | AI-generated catalog tray; exact product weight remains the product name/spec text. |
| `/products/kcg-ai-goldbar-large-inquiry-20260511.webp` | 100g/high-weight inquiry image | AI-generated large-bar visual; does not prove actual 100g inventory or final supply conditions. |
| `/products/kcg-ai-goldbar-1g-representative-20260512.webp` | Previous `kcg-gold-bar-1g` product card/detail, inactive after v0.2.42 | Generated exact-weight representative image; not actual stock, package, certificate, or fixed quote proof. |
| `/products/kcg-ai-goldbar-10g-representative-20260512.webp` | Previous `kcg-gold-bar-10g` product card/detail, inactive after v0.2.42 | Generated exact-weight representative image; avoids using 5돈/10돈/lineup imagery for a 10g row. |
| `/products/kcg-ai-goldbar-100g-representative-20260512.webp` | Previous `kcg-gold-bar-100g` product card/detail, inactive after v0.2.42 | Generated exact-weight representative image; not proof that a 100g bar is currently in stock. |

## Source custody

- Built-in generated originals remain under `C:\Users\junyo\.codex\generated_images\019e06d3-e1bf-7742-98d7-ad423646c6dd`.
- Preserved named originals are stored outside the repo at `C:\Users\junyo\Documents\File-Hub\80_보관\사진_영상\Images\AI generated\KCG\2026-05-11-goldbar-product-guide`.
- Only optimized WebP derivatives are used in `public/products`.
- No raw KakaoTalk original filename was copied into `public`.

## Applied surfaces

- `/products` hero now uses the text-free 돈 단위 lineup visual.
- `/products` catalog now shows a dedicated `1돈`, `2돈`, `3돈`, `5돈`, `10돈` guide with HTML labels:
  - `1돈 = 3.75g`
  - `2돈 = 7.5g`
  - `3돈 = 11.25g`
  - `5돈 = 18.75g`
  - `10돈 = 37.5g`
- Goldbar product slugs used to default to generated representative images without baked weight text. After v0.2.42, the active product rows use KCG real-derived front/back product-shot assets:
  - `kcg-gold-bar-1g` -> `/products/kcg-real-goldbar-frontback-1g-20260513.webp`
  - `investment-gold-bar-consulting` -> `/products/kcg-real-goldbar-frontback-3-75g-20260513.webp`
  - `kcg-gold-bar-10g` -> `/products/kcg-real-goldbar-frontback-10g-20260513.webp`
  - `kcg-gold-bar-37-5g` -> `/products/kcg-real-goldbar-frontback-37-5g-20260513.webp`
  - `kcg-gold-bar-100g` -> `/products/kcg-real-goldbar-frontback-100g-20260513.webp`

## Do not use these images as

- final stock or inventory proof
- certificate, hallmark, serial-number, or warranty proof
- exact price or final quote proof
- evidence that every shown bar size is currently available
- replacement for final KCG-approved real product photography

## Rollback hint

Use `v0.2.34 골드바 상품 이미지 가이드 전으로 되돌려줘` to revert this product-image guide pass.

Use `v0.2.37 골드바 중량별 상품 이미지 매핑 전으로 되돌려줘` to revert only the 1g/10g/100g exact-weight representative-image follow-up.
