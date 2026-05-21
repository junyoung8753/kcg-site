# KCG Real-Photo Goldbar Assets - 2026-05-14

## Status

These assets were created for the `v0.2.45` product image cleanup pass. As of `v0.2.46`, the product/card/detail assets remain active where they match the product role, but the three campaign banner variants are retired from active public UI because Junyoung rejected their rendered main-banner quality.

They are based on KCG real goldbar source photos and logo references from:

`C:\Users\junyo\Documents\File-Hub\80_보관\사진_영상\Images\KCG 이미지`

Raw `KakaoTalk_*`, `IMG_*`, and original logo files were not copied into `public`. Only optimized site derivatives are used.

## Retired Campaign Banner Assets

The following files must not be served from `public/campaign`, used in home main banners, `/products` hero/promo, social images, admin recommendations, fallback images, seed/mock data, or audit allowlists without explicit approval:

- `/campaign/kcg-real-photo-goldbar-products-banner-20260514.jpg`
- `/campaign/kcg-real-photo-goldbar-price-banner-20260514.jpg`
- `/campaign/kcg-real-photo-goldbar-opening-banner-20260514.jpg`

They are isolated for rollback/reference under:

`docs/brand/retired-public-assets/2026-05-14/public/campaign/`

## Active Product Assets

- `/products/kcg-real-photo-goldbar-lineup-20260514.jpg`
- `/products/kcg-real-photo-goldbar-1don-20260514.jpg`
- `/products/kcg-real-photo-goldbar-2don-20260514.jpg`
- `/products/kcg-real-photo-goldbar-3don-20260514.jpg`
- `/products/kcg-real-photo-goldbar-5don-20260514.jpg`
- `/products/kcg-real-photo-goldbar-10don-20260514.jpg`
- `/products/kcg-real-photo-goldbar-product-1g-20260514.jpg`
- `/products/kcg-real-photo-goldbar-product-3-75g-20260514.jpg`
- `/products/kcg-real-photo-goldbar-product-10g-20260514.jpg`
- `/products/kcg-real-photo-goldbar-product-37-5g-20260514.jpg`
- `/products/kcg-real-photo-goldbar-product-100g-20260514.jpg`

## Use Rules

- Use the active product assets only as public site product representative imagery.
- Do not use the retired campaign banner assets in active public UI, fallback images, admin recommendation lists, seed/mock data, or audit allowlists without separate approval.
- Do not treat the images as final proof of price, stock, packaging, certificate, or guaranteed product availability.
- Keep exact price, supply, packaging, certificate, and final sale conditions in product data, company posted prices, and phone/on-site consultation.
- Do not reintroduce gold-silver mock banners, silverbar mock images, AI goldbar mock product images, or raw source filenames into active UI, fallback images, admin recommendation lists, seed/mock data, or audit allowlists without separate approval.

## Silverbar Boundary

Public silverbar product cards, guide images, and detail routes are hidden until KCG separately approves silverbar operating policy and real product imagery. The 은 시세표 itself remains separate and unchanged.

## Rollback

Ask: `v0.2.46 메인 배너 목업 이미지 제거 전으로 되돌려줘`
