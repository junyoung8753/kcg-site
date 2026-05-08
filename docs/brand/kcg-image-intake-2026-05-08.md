# KCG Image Intake 2026-05-08

This intake records the KCG logo and gold-bar files that junyoung placed in:

`C:\Users\junyo\Documents\File-Hub\30_Media\Images\KCG 이미지`

Scope of this pass: metadata and visual review only. No raw source files were copied into `public/`, no raw public UI references were changed, and no image was approved as final real product proof. The later `v0.2.29` refresh generated separate representative WebP assets from this visual direction; those generated files are recorded in `docs/brand/generated-goldbar-assets-2026-05-08.md` and are not real KCG product photos.

## Launch Boundary

- `approval required`: Every file in this folder still needs junyoung/KCG approval before it is used on a public customer decision surface.
- Do not use as final product proof: the photos may show KCG-branded gold bars, but they do not by themselves confirm final inventory, product lineup, price, margin, certificate policy, stock status, or legal selling terms.
- Public use requires an optimized derivative file with an intentional name, not a raw KakaoTalk filename.
- Keep exact prices, product facts, legal facts, and transaction conditions in DOM/data, not inside images.
- Do not publish private documents, customer information, account data, signatures, or unapproved document photos from adjacent File-Hub folders.

## Visual Intake Summary

| Group | Files | Observed Role | Intake Decision |
| --- | --- | --- | --- |
| Logo marks | `KakaoTalk_20260427_125126082.png`, `KakaoTalk_20260427_125126082_01.png` | Gold KCG icon and Korean/English lockup on white background | logo candidate; usable only after confirming it should replace or supplement current `public/brand/kcg-logo.png` and `public/brand/kcg-lockup.png` |
| Clean gold-bar cutouts | `KakaoTalk_20260508_091553653.png`, `_01.png`, `_02.png`, `_03.png` | High-resolution KCG gold-bar product images with readable 999.9 / 3.75g engraving and white background | gold-bar product-photo candidate; strong future product/catalog candidate after approval, crop choice, and WebP optimization |
| Web-size gold-bar lineup | `KakaoTalk_20260508_091603752.jpg`, `KakaoTalk_20260508_091613735.jpg` | Four KCG gold bars by weight on white background | gold-bar product-photo candidate; likely easier public candidate because the file is already modest in size, but still approval required |
| Phone product photos | `KakaoTalk_20260508_110154617.jpg`, `_01.jpg`, `_02.jpg`, `_03.jpg`, `_04.jpg`, `_05.jpg`, `_06.jpg` | 4000x3000 phone photos of KCG gold bars / packaging / counter context | approval required; treat as operating reference until each crop is reviewed because framing, angle, glare, and background may not be launch-quality |

## File Metadata

| File | Size | Dimensions | Classification | Notes |
| --- | ---: | ---: | --- | --- |
| `KakaoTalk_20260427_125126082.png` | 0.02 MB | 842 x 596 | logo candidate | KCG icon mark, white background. |
| `KakaoTalk_20260427_125126082_01.png` | 0.04 MB | 2577 x 596 | logo candidate | KCG lockup with Korean and English text. |
| `KakaoTalk_20260508_091553653.png` | 7.73 MB | 3252 x 2567 | gold-bar product-photo candidate | High-resolution clean cutout; optimize before any public use. |
| `KakaoTalk_20260508_091553653_01.png` | 7.75 MB | 3252 x 2567 | gold-bar product-photo candidate | Same high-resolution cutout set; compare crop and brightness before use. |
| `KakaoTalk_20260508_091553653_02.png` | 7.26 MB | 3252 x 2567 | gold-bar product-photo candidate | Same high-resolution cutout set; approval required. |
| `KakaoTalk_20260508_091553653_03.png` | 7.90 MB | 3252 x 2567 | gold-bar product-photo candidate | Same high-resolution cutout set; approval required. |
| `KakaoTalk_20260508_091603752.jpg` | 0.16 MB | 1246 x 732 | gold-bar product-photo candidate | Four-bar lineup, white background, likely useful for catalog review. |
| `KakaoTalk_20260508_091613735.jpg` | 0.14 MB | 1264 x 628 | gold-bar product-photo candidate | Four-bar lineup, tighter crop, likely useful for catalog review. |
| `KakaoTalk_20260508_110154617.jpg` | 1.27 MB | 4000 x 3000 | approval required | Phone photo; visual sample showed partial bar/counter framing that needs crop review. |
| `KakaoTalk_20260508_110154617_01.jpg` | 1.20 MB | 4000 x 3000 | approval required | Phone photo; inspect before use. |
| `KakaoTalk_20260508_110154617_02.jpg` | 1.36 MB | 4000 x 3000 | approval required | Phone photo; inspect before use. |
| `KakaoTalk_20260508_110154617_03.jpg` | 2.04 MB | 4000 x 3000 | approval required | Phone photo; inspect before use. |
| `KakaoTalk_20260508_110154617_04.jpg` | 1.66 MB | 4000 x 3000 | approval required | Phone photo; inspect before use. |
| `KakaoTalk_20260508_110154617_05.jpg` | 1.82 MB | 4000 x 3000 | approval required | Phone photo; inspect before use. |
| `KakaoTalk_20260508_110154617_06.jpg` | 2.01 MB | 4000 x 3000 | approval required | Phone photo; inspect before use. |

## Candidate Use Order

1. Logo replacement or reinforcement: compare the two logo candidates against existing public brand files and only then create optimized public assets.
2. Product catalog replacement: start with the web-size lineup JPGs or one approved high-resolution cutout derivative for `골드바` surfaces.
3. Product detail/support images: use phone photos only after crop review, background cleanup decision, and explicit approval.

## Required Before Public Use

- Decide whether the image represents real KCG-operated inventory or only a brand/product visual.
- Confirm which weights and products KCG actually wants to advertise publicly.
- Export optimized `.webp` derivatives with descriptive names under the correct `public/brand` or `public/products` folder.
- Update `/admin/products` image URLs deliberately rather than relying on raw folder filenames.
- Re-run `npm run audit:site`, `npm run test:site`, `npm run screenshot:site`, and `npm run qa:site` after any public image replacement.

## Explicit Non-Changes In This Intake

- No public image file was added.
- No public route, product row, Supabase seed, or admin product image URL was changed.
- No price, product, margin, inventory, certificate, payment, checkout, trading, DNS, secret, search exposure, or KRX behavior was changed.
