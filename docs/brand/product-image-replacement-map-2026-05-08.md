# Product Image Replacement Map 2026-05-08

This map supports `KCG-TODO-054`: replace generated/representative catalog and product images with real KCG-designed product photos only after those photos are approved.

Scope update:

- `v0.2.27`: approval-first planning only. No public image was replaced, no public route changed, no product row changed, and no Supabase seed image URL changed.
- `v0.2.29`: Codex generated new KCG-style gold-bar representative assets from the reference folder's pattern/size direction. The generated WebP files are public representative imagery only; no raw KCG/KakaoTalk photo was copied into `public/`, and no real product-photo proof was approved.

Source candidate folder:

`C:\Users\junyo\Documents\File-Hub\30_Media\Images\KCG 이미지`

Primary intake record:

`docs/brand/kcg-image-intake-2026-05-08.md`

## Non-Negotiable Boundary

- No raw KCG/KakaoTalk photo is copied into public paths.
- do not use raw KakaoTalk filenames in public paths.
- Public derivatives must use deliberate names such as `/products/kcg-generated-goldbar-lineup-20260508.webp`.
- The KCG photos still need junyoung/KCG approval before any customer-facing real-photo replacement.
- A real-looking gold-bar image is not by itself final product proof.
- Do not use the gold-bar photos to imply final inventory, price, stock, certificate policy, margin, or guaranteed transaction terms.
- Keep current company posted prices and product data in DOM/data, not baked into image pixels.

## Evidence Sources

| Source | Why it matters |
| --- | --- |
| `src/lib/product-presenter.ts` | Public product cards remap known placeholder image URLs by slug and category. |
| `src/mock/products.ts` | Local fallback product rows and image URLs. |
| `supabase/seed.sql` | Production seed/reference product image URLs. |
| `src/app/admin/products/page.tsx` | Admin provenance/filter UI for image follow-up. |
| `docs/brand/kcg-image-intake-2026-05-08.md` | Approval-required KCG logo/gold-bar candidate inventory. |
| `docs/brand/generated-goldbar-assets-2026-05-08.md` | Generated representative asset provenance and boundaries. |

## Current Public Image Roles

| current public image | Main role today | Replacement pressure | recommended KCG candidate group |
| --- | --- | --- | --- |
| `/campaign/kcg-generated-goldbar-banner-20260508.webp` | Generated home first-slide/social/promo banner based on KCG-style gold-bar lineup direction | Medium; keep as representative unless real hero/campaign photo is approved | Approved real KCG hero crop only if it preserves the home price table first viewport |
| `/products/kcg-generated-goldbar-lineup-20260508.webp` | Generated gold-bar category, hero, and selected product-card representative image | High before public search launch if KCG wants real product photos | Approved KCG lineup/cutout derivative, or keep as representative with `상담용 대표 이미지` |
| `/products/kcg-generated-goldbar-detail-20260508.webp` | Generated gold-bar product support/detail representative image | High before public search launch if KCG wants real product photos | Approved KCG product/detail crop after glare/background/category review |
| `/products/kcg-product-minimal-bars-20260506.webp` | Generated/representative gold-bar catalog card and fallback for small gold bars | High after approval, because customers use gold-bar images to judge product appearance | Web-size gold-bar lineup `KakaoTalk_20260508_091603752.jpg` or clean cutout `KakaoTalk_20260508_091553653.png` derivative |
| `/products/kcg-product-gold-silver-catalog-20260503.webp` | Generated mixed metal catalog image for 3.75g gold bar and 1kg silver bar fallback | High for gold-bar cards; not appropriate as a silver replacement until silver photos exist | Web-size gold-bar lineup `KakaoTalk_20260508_091613735.jpg` derivative for gold-bar cards only |
| `/campaign/kcg-home-price-desk-20260506.webp` | Price-desk campaign slide and 10g gold-bar fallback | Medium; keep home first viewport stable unless a better approved hero derivative is prepared | Clean cutout derivative only if it does not push the price table down |
| `/campaign/kcg-home-product-keyvisual-20260503.webp` | Product/support visual for high-weight gold and pure-gold medal placeholder | Medium; replace gold-bar use separately from pure-gold medal use | Clean cutout derivative for gold-bar cards; no replacement for medals without actual medal/product photo |
| `/products/kcg-product-b2b-consulting-20260503.webp` | B2B/gold-bar 100g and corporate buying representative image | Medium; current image is representative, not product proof | Phone product photos only after crop review, or keep representative image until B2B-specific photo exists |
| `/products/kcg-silver-gift-20260427-v2.jpg` | Silver/small gift representative image | Low for the current KCG gold-bar folder; do not replace with gold bars | No direct candidate in the 2026-05-08 KCG folder |
| `/campaign/kcg-hero-metal-bars.jpg` | Silver/metal fallback | Low; replacing with gold-bar photos would confuse silver inventory | No direct candidate in the 2026-05-08 KCG folder |
| `/products/kcg-product-pure-gold-gifts-20260506.webp` | Pure-gold gift/product representative image | Medium; should become real product/gift packaging later | No direct candidate unless a gold-bar photo is intentionally used only for generic pure-gold category support |
| `/products/kcg-pure-gold-products-20260427-v2.jpg` | Legacy pure-gold product placeholder remapped by presenter in many public flows | Medium; not solved by gold-bar lineup | No direct candidate in the 2026-05-08 KCG folder |
| `/campaign/kcg-old-gold-process-20260506.webp` | Old-gold buying process visual and jewelry buying fallback | Low for gold-bar replacement; keep because it explains process, not product appearance | No direct candidate in the 2026-05-08 KCG folder |
| `/products/kcg-product-jewelry-buying-20260503.webp` | Jewelry buying representative image | Low for gold-bar replacement | No direct candidate in the 2026-05-08 KCG folder |
| `/products/kcg-jewelry-buying-tray-20260430.webp` | Jewelry buying tray representative image | Low for gold-bar replacement | No direct candidate in the 2026-05-08 KCG folder |
| `/products/kcg-b2b-gift-packaging-20260430.webp` | Corporate gift/packaging representative image | Low for gold-bar replacement | No direct candidate unless a phone photo clearly shows KCG packaging after approval |
| `/products/kcg-product-corporate-consulting-20260506.webp` | Bulk/corporate consultation representative image | Low for gold-bar replacement | Phone product photos only after crop/background review |

## Product Slug Replacement Priority

| Product slug | Current public image path | Priority | Recommended next action |
| --- | --- | --- | --- |
| `kcg-gold-bar-1g` | `/products/kcg-generated-goldbar-lineup-20260508.webp` | P1 representative now; real-photo approval later | Keep as `상담용 대표 이미지` unless KCG approves a real small-bar crop. |
| `investment-gold-bar-consulting` | `/products/kcg-generated-goldbar-detail-20260508.webp` | P1 representative now; real-photo approval later | Keep as representative, or replace with approved lineup/cutout real derivative after KCG decides final-use classification. |
| `kcg-gold-bar-10g` | `/campaign/kcg-generated-goldbar-banner-20260508.webp` | P1 representative now; real-photo approval later | Use as generated support image only; replace with real product crop only if weight/product wording remains accurate. |
| `kcg-gold-bar-37-5g` | `/products/kcg-generated-goldbar-lineup-20260508.webp` | P1 representative now; real-photo approval later | Keep as representative until KCG confirms 37.5g public promotion and real crop. |
| `kcg-gold-bar-100g` | `/products/kcg-generated-goldbar-detail-20260508.webp` | P2/shared representative now | Keep inquiry-first unless KCG approves public 100g product photo/stock wording. |
| `kcg-silver-bar-100g` | `/products/kcg-silver-gift-20260427-v2.jpg` | P2 later | Needs silver-specific asset; do not use gold-bar files. |
| `kcg-silver-bar-500g` | `/campaign/kcg-hero-metal-bars.jpg` | P2 later | Needs silver-specific asset. |
| `kcg-silver-bar-1kg` | `/products/kcg-product-gold-silver-catalog-20260503.webp` | P2 later | Current mixed image is acceptable as representative; do not replace with gold-only KCG file. |
| `pure-gold-baby-ring-3-75g` | `/products/kcg-product-pure-gold-gifts-20260506.webp` | P2 later | Needs actual ring/gift image, not gold-bar file. |
| `pure-gold-card-1g` | `/products/kcg-pure-gold-products-20260427-v2.jpg` | P2 later | Needs actual card/gift image. |
| `pure-gold-commemorative-medal` | `/campaign/kcg-home-product-keyvisual-20260503.webp` | P2 later | Needs medal-specific image. |
| `pure-gold-gift-consulting` | `/products/kcg-product-pure-gold-gifts-20260506.webp` | P2 later | Needs gift/packaging photo. |
| `pure-gold-baby-ring-buying` | `/campaign/kcg-old-gold-process-20260506.webp` | P2 later | Process visual is acceptable until real buying-counter photo is approved. |
| `18k-jewelry-buying` | `/products/kcg-product-jewelry-buying-20260503.webp` | P2 later | Needs jewelry-specific buying photo; gold-bar images should not replace it. |
| `14k-jewelry-buying` | `/products/kcg-jewelry-buying-tray-20260430.webp` | P2 later | Keep current representative image until approved jewelry photo exists. |
| `platinum-silver-buying` | `/products/kcg-product-jewelry-buying-20260503.webp` | P2 later | Needs platinum/silver/jewelry-specific buying photo. |
| `corporate-gift-production` | `/products/kcg-b2b-gift-packaging-20260430.webp` | P2/shared | Phone photos may help only if packaging is visible and approved. |
| `corporate-precious-metal-buying` | `/products/kcg-product-b2b-consulting-20260503.webp` | P2/shared | Keep representative consultation image until real business-safe photo exists. |
| `bulk-gold-silver-bar-consulting` | `/products/kcg-product-corporate-consulting-20260506.webp` | P2/shared | Needs explicit bulk product photo approval and product/stock wording. |

## Candidate Use Decision

| Candidate file/group | Best possible use | Do not use for |
| --- | --- | --- |
| `/campaign/kcg-generated-goldbar-banner-20260508.webp` | Generated home/banner/promo representative image | Real product proof, price proof, inventory proof |
| `/products/kcg-generated-goldbar-lineup-20260508.webp` | Generated gold-bar category and lineup representative image | Silver, jewelry buying, pure-gold ring/card/medal proof |
| `/products/kcg-generated-goldbar-detail-20260508.webp` | Generated gold-bar card/detail representative image | Final product proof or stock/certificate proof |
| `KakaoTalk_20260508_091603752.jpg` | First approved gold-bar lineup derivative for catalog card review | Silver, jewelry buying, pure-gold ring/card/medal proof |
| `KakaoTalk_20260508_091613735.jpg` | Alternate lineup crop for catalog card or product detail | Final inventory/stock proof without approval |
| `KakaoTalk_20260508_091553653.png` and `_01/_02/_03` | High-quality product cutout derivative after WebP optimization | Raw public file path or oversized public PNG |
| `KakaoTalk_20260508_110154617*.jpg` | Supporting crop after visual review, possibly packaging/counter context | Primary product proof before crop/glare/background review |
| `KakaoTalk_20260427_125126082*.png` | Brand/logo comparison only | Product image replacement |

## Next Safe Implementation Path

1. Keep the generated representative assets labeled as `상담용 대표 이미지`.
2. Junyoung/KCG approves one real gold-bar lineup or cutout and states whether it is real product proof or representative catalog imagery.
3. Codex creates an optimized WebP derivative with a deliberate public filename.
4. Codex updates only the approved gold-bar product slugs in `src/lib/product-presenter.ts`, `src/mock/products.ts`, and `supabase/seed.sql` as needed.
5. Codex verifies `/products` desktop/mobile, `/products/investment-gold-bar-consulting`, and home first viewport so the company price table is not pushed down.
6. Codex runs `npm run audit:site`, `npm run test:site`, `npm run screenshot:site`, and `npm run qa:site`.

## Current Status

- `KCG-TODO-054` remains shared/user-approval blocked for actual public replacement.
- Codex has completed the safe pre-replacement map and the generated representative gold-bar asset refresh.
- Actual real product-photo replacement remains blocked until approval, crop choice, and final-use classification are clear.
