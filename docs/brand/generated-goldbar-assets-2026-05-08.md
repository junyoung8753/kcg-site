# Generated Gold-Bar Assets 2026-05-08

This record documents the Codex-generated KCG-style gold-bar assets requested by junyoung on 2026-05-08 KST.

2026-05-11 status: these generated assets are retained for rollback/reference, but the current public home first slide, social image, `/products` hero, and gold-bar product images now use the real KCG-derived derivatives recorded in `docs/brand/kcg-real-image-assets-2026-05-11.md`.

Reference-only source folder:

`C:\Users\junyo\Documents\File-Hub\80_보관\사진_영상\Images\KCG 이미지`

The source folder was used only for visual direction: gold-bar proportions, size lineup, clean white product-background grammar, and restrained counter/banner composition. The raw KakaoTalk files were not copied into `public/`, and the generated files below are not real KCG product photos.

## Public Assets Added

| Public asset | Role | Boundary |
| --- | --- | --- |
| `/campaign/kcg-generated-goldbar-banner-20260508.webp` | Home first-slide campaign image, social preview image, and product promo banner | Generated representative banner only; price, stock, and final product proof stay in DOM/data and consultation |
| `/products/kcg-generated-goldbar-lineup-20260508.webp` | Gold-bar category/product lineup image and `/products` hero | Generated representative catalog image only |
| `/products/kcg-generated-goldbar-detail-20260508.webp` | Gold-bar product detail/card support image | Generated representative catalog image only |

## Use Rules

- Keep public labels as `상담용 대표 이미지`.
- Do not describe these assets as real photos, approved inventory, certificate proof, stock proof, or final product proof.
- Do not use these assets for silver bars, jewelry buying, pure-gold rings/cards/medals, or B2B packaging unless a later KCG review explicitly approves that category use.
- Do not embed prices, real-time market values, legal claims, or transaction guarantees into image pixels.
- Treat the embossed geometric marks as non-brand decorative engravings only. Do not call them the official KCG logo, a hallmark, a certificate mark, or product-authentication proof; replace the asset before public search launch if KCG wants only logo-free bars or official-logo bars.
- Keep raw KakaoTalk-style filenames blocked from the served `public` tree.
- Actual real-photo replacement remains under `KCG-TODO-054` and needs KCG approval for file, crop, category, and final-use classification.

## Current Application

- `/` home carousel first slide now uses `/campaign/kcg-generated-goldbar-banner-20260508.webp`.
- `src/app/layout.tsx` uses the generated banner for social/structured-data image references.
- `/products` hero uses `/products/kcg-generated-goldbar-lineup-20260508.webp`.
- Gold-bar product rows in `src/mock/products.ts` and `supabase/seed.sql` use the generated banner, lineup, and detail assets as representative images.
- `src/lib/product-presenter.ts` remaps known placeholder gold-bar image URLs by slug, so older stored placeholder paths still render through the generated representative assets while custom non-placeholder admin URLs remain preserved.
- `/admin/products` classifies the generated paths as `대표/생성` with `실사진 확인 필요`.

## Remaining Approval Boundary

This pass satisfies the Codex-doable request to generate KCG-style representative imagery from the visual reference. It does not approve or replace actual KCG product photos. Before public search launch, KCG still needs to approve final product photos or explicitly accept these generated assets as representative-only catalog imagery.
