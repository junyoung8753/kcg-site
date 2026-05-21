# Product Image Replacement Map 2026-05-08

This map supports `KCG-TODO-054`: replace generated/representative catalog and product images with real KCG-designed product photos only after those photos are approved.

Scope update:

- `v0.2.27`: approval-first planning only. No public image was replaced, no public route changed, no product row changed, and no Supabase seed image URL changed.
- `v0.2.29`: Codex generated new KCG-style gold-bar representative assets from the reference folder's pattern/size direction. The generated WebP files are public representative imagery only; no raw KCG/KakaoTalk photo was copied into `public/`, and no real product-photo proof was approved.
- `v0.2.32`: Codex benchmarked six Korean gold-exchange sites, created optimized real KCG-derived WebP assets from the File-Hub logo/gold-bar sources, and applied them to home, social, `/products`, product rows, and company support imagery. These are approved public derivatives for the site direction, but still remain representative images rather than final stock/price/certificate proof.
- `v0.2.35`: junyoung clarified the supplied goldbar images are actual KCG physical goldbars. Codex replaced the AI product-guide surfaces with optimized real KCG goldbar derivatives for the home banner, hand-held consultation image, `/products` hero, and 1/2/3/5/10돈 guide cards. The files remain public WebP derivatives, not raw originals.
- `v0.2.36`: after human-eye QA and junyoung feedback, Codex removed the hand-held/palm goldbar photo from active home/company/1g product surfaces. Current core UI uses the KCG price-desk derivative and hand-free tray representative instead.
- `v0.2.39`: Codex restaged the 1/2/3/5/10돈 money-unit images and promo banner from the clean real KCG five-bar lineup (`IMG_4282.PNG` and `IMG_4283.PNG`) so the current guide/product images read as one consistent studio product set instead of mixed mockups.
- `v0.2.42`: Codex replaced the active 1g/3.75g/10g/37.5g/100g goldbar product-card/detail rows with KCG real-derived front/back product-shot WebPs and removed customer-facing representative-image/derivative-image wording from `/products`.

Source candidate folder:

`C:\Users\junyo\Documents\File-Hub\80_보관\사진_영상\Images\KCG 이미지`

Primary intake record:

`docs/brand/kcg-image-intake-2026-05-08.md`

## Non-Negotiable Boundary

- No raw KCG/KakaoTalk photo is copied into public paths.
- do not use raw KakaoTalk filenames in public paths.
- Public derivatives must use deliberate names such as `/products/kcg-generated-goldbar-lineup-20260508.webp`.
- Current real KCG-derived public derivatives use deliberate names such as `/products/kcg-real-goldbar-don-lineup-studio-v2-20260513.webp`.
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
| `docs/brand/kcg-real-image-assets-2026-05-11.md` | Competitor benchmark, real KCG-derived public asset provenance, and boundaries. |
| `docs/brand/kcg-real-goldbar-product-assets-2026-05-11.md` | v0.2.35 real KCG goldbar banner and 1/2/3/5/10돈 product-guide provenance plus v0.2.36 no-hand core visual correction. |
| `docs/brand/kcg-silverbar-banner-assets-2026-05-13.md` | v0.2.43 silverbar 1/2/3/5/10돈 guide and complete home/product banner correction. |

## Current Public Image Roles

| current public image | Main role today | Replacement pressure | recommended KCG candidate group |
| --- | --- | --- | --- |
| `/campaign/kcg-gold-silver-premium-banner-20260513.webp` | Current home first-slide/social image | Low for current launch candidate; still not price/stock/certificate proof | Keep as complete KCG 금·은 바 banner; exact pricing and 수급 stay in DOM/data/상담 |
| `/campaign/kcg-price-desk-gold-silver-banner-20260513.webp` | Current home secondary support image | Low for current launch candidate; still not price/stock/certificate proof | Keep as KCG 금·은 상담 banner support image |
| `/campaign/kcg-opening-premium-banner-20260513.webp` | Current home third slide | Low; removes stale/pasted opening text risk | Keep as complete campaign banner; do not reintroduce pasted opening copy |
| `/campaign/kcg-products-gold-silver-consult-banner-20260513.webp` | Current `/products` hero and products quick-link banner | Low; category 상담 visual only | Keep as product/buying category visual |
| `/campaign/kcg-real-goldbar-promo-banner-20260513.webp` | Previous home first-slide/social/promo banner and high-weight inquiry support | Low for rollback/reference; still not price/stock/certificate proof | Retain as previous KCG 실물 골드바 라인업 홍보 이미지 |
| `/campaign/kcg-real-goldbar-price-desk-20260511.webp` | Current `/company` hero image and previous home secondary support | Low for current launch candidate; still not price/stock/certificate proof | Keep for company page or rollback reference |
| `/campaign/kcg-real-goldbar-hand-consultation-20260511-v2.webp` | Inactive/reference only after v0.2.36 | High for active core UI because the palm/proof-shot composition does not fit the site tone | Do not use in current home/company/product representative surfaces unless junyoung explicitly re-approves this exact role |
| `/products/kcg-real-goldbar-don-lineup-studio-v2-20260513.webp` | Current goldbar guide and goldbar fallback | Low; lineup context can show money units while product specifics remain text | Keep as 1/2/3/5/10돈 guide support; not inventory proof |
| `/products/kcg-real-goldbar-1don-studio-20260513.webp` | Current 1돈 guide and 3.75g product card/detail | Low for 1돈 surfaces | Keep for 3.75g/1돈; not price or stock proof |
| `/products/kcg-real-goldbar-2don-studio-20260513.webp` | Current 2돈 guide image | Low for 2돈 guide only | Keep in guide; add product row only if KCG offers a 7.5g row |
| `/products/kcg-real-goldbar-3don-studio-20260513.webp` | Current 3돈 guide image | Low for 3돈 guide only | Keep in guide; add product row only if KCG offers an 11.25g row |
| `/products/kcg-real-goldbar-5don-studio-20260513.webp` | Current 5돈 guide image | Low for 5돈 guide only | Keep in guide; add product row only if KCG offers an 18.75g row |
| `/products/kcg-real-goldbar-10don-studio-20260513.webp` | Current 10돈 guide and 37.5g product card/detail | Low for 10돈 surfaces | Keep for 37.5g/10돈; not price or stock proof |
| `/products/kcg-real-goldbar-frontback-1g-20260513.webp` | Current 1g product card/detail | Low for current launch candidate; still not stock/certificate proof | Keep as the active 1g KCG front/back product-shot derivative; price and 수급 stay in DOM/data/상담 |
| `/products/kcg-real-goldbar-frontback-3-75g-20260513.webp` | Current 3.75g product card/detail | Low for current launch candidate; still not stock/certificate proof | Keep as the active 1돈 KCG front/back product-shot derivative; price and 수급 stay in DOM/data/상담 |
| `/products/kcg-real-goldbar-frontback-10g-20260513.webp` | Current 10g product card/detail | Low for current launch candidate; still not stock/certificate proof | Keep as the active 10g KCG front/back product-shot derivative; price and 수급 stay in DOM/data/상담 |
| `/products/kcg-real-goldbar-frontback-37-5g-20260513.webp` | Current 37.5g product card/detail | Low for current launch candidate; still not stock/certificate proof | Keep as the active 10돈 KCG front/back product-shot derivative; price and 수급 stay in DOM/data/상담 |
| `/products/kcg-real-goldbar-frontback-100g-20260513.webp` | Current 100g product card/detail | Low for current launch candidate; still not stock/certificate proof | Keep as the active 100g KCG front/back product-shot derivative; price and 수급 stay in DOM/data/상담 |
| `/products/kcg-silverbar-don-lineup-studio-v2-20260513.webp` | Current silverbar 1/2/3/5/10돈 guide | Low; 상담 단위 visual only | Keep as silverbar guide support; do not treat as final SKU proof |
| `/products/kcg-silverbar-1don-studio-20260513.webp` | Current silverbar 1돈 guide image | Low for guide | Keep in guide; add product row only if KCG offers a 3.75g silverbar row |
| `/products/kcg-silverbar-2don-studio-20260513.webp` | Current silverbar 2돈 guide image | Low for guide | Keep in guide; add product row only if KCG offers a 7.5g silverbar row |
| `/products/kcg-silverbar-3don-studio-20260513.webp` | Current silverbar 3돈 guide image | Low for guide | Keep in guide; add product row only if KCG offers an 11.25g silverbar row |
| `/products/kcg-silverbar-5don-studio-20260513.webp` | Current silverbar 5돈 guide image | Low for guide | Keep in guide; add product row only if KCG offers an 18.75g silverbar row |
| `/products/kcg-silverbar-10don-studio-20260513.webp` | Current silverbar 10돈 guide image | Low for guide | Keep in guide; add product row only if KCG offers a 37.5g silverbar row |
| `/products/kcg-silverbar-frontback-100g-20260513.webp` | Current 100g silverbar product card/detail | Low for current launch candidate; still not stock/certificate proof | Keep as the active 100g silverbar front/back representative product image |
| `/products/kcg-silverbar-frontback-500g-20260513.webp` | Current 500g silverbar product card/detail | Low for current launch candidate; still not stock/certificate proof | Keep as the active 500g silverbar front/back representative product image |
| `/products/kcg-silverbar-frontback-1kg-20260513.webp` | Current 1kg silverbar product card/detail | Low for current launch candidate; still not stock/certificate proof | Keep as the active 1kg silverbar front/back representative product image |
| `/campaign/kcg-real-goldbar-promo-banner-20260511-v2.webp` | Previous home first-slide/social/promo banner and high-weight inquiry support | Low for rollback/reference; still not price/stock/certificate proof | Retain as previous KCG 실물 골드바 홍보 이미지 |
| `/products/kcg-real-goldbar-don-lineup-20260511-v2.webp` | Previous `/products` hero and goldbar fallback | Low for rollback/reference | Retain as previous 1/2/3/5/10돈 guide support |
| `/campaign/kcg-real-goldbar-price-desk-20260511.webp` | Previous home first-slide/social/promo banner | Low for current launch candidate; still needs KCG confirmation if treated as product proof | Retain for rollback/reference |
| `/campaign/kcg-korean-consultation-hands-20260511.webp` | Previous home/company consultation support image | Low; generated no-face human-context support only | Retain for rollback/reference |
| `/campaign/kcg-real-opening-campaign-20260511.webp` | Previous secondary home campaign slide using the KCG opening-card source | High for active UI after v0.2.43 because it looked pasted and embedded opening text can become stale | Retain only for rollback/reference |
| `/products/kcg-real-goldbar-lineup-20260511.webp` | Previous gold-bar category and selected product-card representative image | Medium after human-eye review; baked weight text can confuse product cards | Retain for brand/reference rollback, but current product-card UI prefers text-free AI representative images |
| `/products/kcg-real-goldbar-detail-20260511.webp` | Previous front/back support/detail representative image | Medium after human-eye review; baked `18.75g` text can mislead 3.75g/100g cards | Retain as reference only unless exact product context is approved |
| `/products/kcg-real-goldbar-single-20260511.webp` | Previous single-bar representative card image | Medium after human-eye review; source crop is not exact for every listed weight | Retain as reference only unless exact product context is approved |
| `/products/kcg-ai-goldbar-don-lineup-20260511.webp` | Previous `/products` hero, 1/2/3/5/10돈 guide, and 37.5g representative image | Low; generated text-free visual keeps exact grams in HTML | Retain for rollback/reference |
| `/products/kcg-ai-goldbar-hand-consultation-20260511.webp` | Previous 1g/small-bar representative image | Low; generated no-face consultation scene | Retain for rollback/reference |
| `/products/kcg-ai-goldbar-tray-20260511.webp` | Previous 3.75g and 10g representative product-card image | Low; generated catalog image without baked weight/price | Retain for rollback/reference |
| `/products/kcg-ai-goldbar-large-inquiry-20260511.webp` | Previous 100g/high-weight inquiry image | Low; generated large-bar image without stock/price claims | Retain for rollback/reference |
| `/campaign/kcg-generated-goldbar-banner-20260508.webp` | Previous generated home first-slide/social/promo banner based on KCG-style gold-bar lineup direction | Low now; retained for rollback/reference | Use only as representative fallback |
| `/products/kcg-generated-goldbar-lineup-20260508.webp` | Previous generated gold-bar category, hero, and selected product-card representative image | Low now; retained for rollback/reference | Use only as representative fallback |
| `/products/kcg-generated-goldbar-detail-20260508.webp` | Previous generated gold-bar product support/detail representative image | Low now; retained for rollback/reference | Use only as representative fallback |
| `/products/kcg-product-minimal-bars-20260506.webp` | Generated/representative gold-bar catalog card and fallback for small gold bars | High after approval, because customers use gold-bar images to judge product appearance | Web-size gold-bar lineup `KakaoTalk_20260508_091603752.jpg` or clean cutout `KakaoTalk_20260508_091553653.png` derivative |
| `/products/kcg-product-gold-silver-catalog-20260503.webp` | Generated mixed metal catalog image for 3.75g gold bar and 1kg silver bar fallback | High for gold-bar cards; not appropriate as a silver replacement until silver photos exist | Web-size gold-bar lineup `KakaoTalk_20260508_091613735.jpg` derivative for gold-bar cards only |
| `/campaign/kcg-home-price-desk-20260506.webp` | Price-desk campaign slide and 10g gold-bar fallback | Medium; keep home first viewport stable unless a better approved hero derivative is prepared | Clean cutout derivative only if it does not push the price table down |
| `/campaign/kcg-home-product-keyvisual-20260503.webp` | Product/support visual for high-weight gold and pure-gold medal placeholder | Medium; replace gold-bar use separately from pure-gold medal use | Clean cutout derivative for gold-bar cards; no replacement for medals without actual medal/product photo |
| `/products/kcg-product-b2b-consulting-20260503.webp` | B2B/gold-bar 100g and corporate buying representative image | Medium; current image is representative, not product proof | Approved front lineup/detail phone photos only after crop review, or keep representative image until B2B-specific photo exists |
| `/products/kcg-silver-gift-20260427-v2.jpg` | Silver/small gift representative image | Low for the current KCG gold-bar folder; do not replace with gold bars | No direct candidate in the 2026-05-08 KCG folder |
| `/campaign/kcg-hero-metal-bars.jpg` | Silver/metal fallback | Low; replacing with gold-bar photos would confuse silver inventory | No direct candidate in the 2026-05-08 KCG folder |
| `/products/kcg-product-pure-gold-gifts-20260506.webp` | Pure-gold gift/product representative image | Medium; should become real product/gift packaging later | No direct candidate unless a gold-bar photo is intentionally used only for generic pure-gold category support |
| `/products/kcg-pure-gold-products-20260427-v2.jpg` | Legacy pure-gold product placeholder remapped by presenter in many public flows | Medium; not solved by gold-bar lineup | No direct candidate in the 2026-05-08 KCG folder |
| `/campaign/kcg-old-gold-process-20260506.webp` | Old-gold buying process visual and jewelry buying fallback | Low for gold-bar replacement; keep because it explains process, not product appearance | No direct candidate in the 2026-05-08 KCG folder |
| `/products/kcg-product-jewelry-buying-20260503.webp` | Jewelry buying representative image | Low for gold-bar replacement | No direct candidate in the 2026-05-08 KCG folder |
| `/products/kcg-jewelry-buying-tray-20260430.webp` | Jewelry buying tray representative image | Low for gold-bar replacement | No direct candidate in the 2026-05-08 KCG folder |
| `/products/kcg-b2b-gift-packaging-20260430.webp` | Corporate gift/packaging representative image | Low for gold-bar replacement | No direct candidate unless an approved detail photo clearly shows packaging/context without implying final stock |
| `/products/kcg-product-corporate-consulting-20260506.webp` | Bulk/corporate consultation representative image | Low for gold-bar replacement | Front lineup/detail phone photos only after crop/background review |

## Product Slug Replacement Priority

| Product slug | Current public image path | Priority | Recommended next action |
| --- | --- | --- | --- |
| `kcg-gold-bar-1g` | `/products/kcg-real-goldbar-frontback-1g-20260513.webp` | P1 active KCG front/back product shot now; stock proof later | Keep this front/back product-shot derivative so the row looks like a real KCG product card rather than an AI representative placeholder. |
| `investment-gold-bar-consulting` | `/products/kcg-real-goldbar-frontback-3-75g-20260513.webp` | P1 active KCG front/back product shot now; stock proof later | Keep as the 3.75g/1돈 product-shot derivative; price and availability stay company 고시/상담. |
| `kcg-gold-bar-10g` | `/products/kcg-real-goldbar-frontback-10g-20260513.webp` | P1 active KCG front/back product shot now; stock proof later | Keep this front/back product-shot derivative instead of the old generated 10g representative. |
| `kcg-gold-bar-37-5g` | `/products/kcg-real-goldbar-frontback-37-5g-20260513.webp` | P1 active KCG front/back product shot now; stock proof later | Keep as the 37.5g/10돈 product-shot derivative; price and availability stay company 고시/상담. |
| `kcg-gold-bar-100g` | `/products/kcg-real-goldbar-frontback-100g-20260513.webp` | P1 active KCG front/back product shot now; stock proof later | Keep this front/back product-shot derivative; it is not proof that a 100g bar is currently in stock. |
| `kcg-silver-bar-100g` | `/products/kcg-silverbar-frontback-100g-20260513.webp` | P1 active silverbar-specific representative image now; stock proof later | Keep this silverbar-specific front/back image instead of the old silver gift placeholder. |
| `kcg-silver-bar-500g` | `/products/kcg-silverbar-frontback-500g-20260513.webp` | P1 active silverbar-specific representative image now; stock proof later | Keep this silverbar-specific front/back image instead of the generic metal fallback. |
| `kcg-silver-bar-1kg` | `/products/kcg-silverbar-frontback-1kg-20260513.webp` | P1 active silverbar-specific representative image now; stock proof later | Keep this silverbar-specific front/back image instead of the mixed gold/silver catalog fallback. |
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
| `/campaign/kcg-gold-silver-premium-banner-20260513.webp` | Current home/social banner representative image | Price proof, stock proof, certificate proof, final inventory proof |
| `/campaign/kcg-price-desk-gold-silver-banner-20260513.webp` | Current home secondary banner representative image | Price proof, stock proof, certificate proof, final inventory proof |
| `/campaign/kcg-opening-premium-banner-20260513.webp` | Current home third-slide banner without pasted opening copy | Opening-date claim unless KCG re-approves embedded event copy |
| `/campaign/kcg-products-gold-silver-consult-banner-20260513.webp` | Current `/products` hero and products quick-link banner | Price proof, stock proof, certificate proof, final inventory proof |
| `/campaign/kcg-real-goldbar-promo-banner-20260513.webp` | Previous home/banner/social/promo representative image | Active home/social/product promo unless rollback is requested; price proof, stock proof, certificate proof, final inventory proof |
| `/campaign/kcg-real-goldbar-hand-consultation-20260511-v2.webp` | Inactive/reference only after v0.2.36 | Active home/company/product representative image, real staff/customer identity, product proof, certificate proof |
| `/campaign/kcg-real-goldbar-promo-banner-20260511-v2.webp` | Previous home/banner/social/promo representative image | Price proof, stock proof, certificate proof, final inventory proof |
| `/products/kcg-real-goldbar-don-lineup-studio-v2-20260513.webp` | Current `/products` hero and goldbar fallback | Exact 10g/100g proof, price proof, inventory proof |
| `/products/kcg-real-goldbar-1don-studio-20260513.webp` | Current 1돈 guide and 3.75g product image | Price proof, stock proof, certificate proof |
| `/products/kcg-real-goldbar-2don-studio-20260513.webp` | Current 2돈 guide image | Product row proof unless a 7.5g row is added |
| `/products/kcg-real-goldbar-3don-studio-20260513.webp` | Current 3돈 guide image | Product row proof unless an 11.25g row is added |
| `/products/kcg-real-goldbar-5don-studio-20260513.webp` | Current 5돈 guide image | Product row proof unless an 18.75g row is added |
| `/products/kcg-real-goldbar-10don-studio-20260513.webp` | Current 10돈 guide and 37.5g product image | Price proof, stock proof, certificate proof |
| `/products/kcg-real-goldbar-don-lineup-20260511-v2.webp` | Previous `/products` hero and goldbar fallback | Exact 10g/100g proof, price proof, inventory proof |
| `/products/kcg-real-goldbar-1don-20260511.webp` | Previous 1돈 guide and 3.75g product image | Price proof, stock proof, certificate proof |
| `/products/kcg-real-goldbar-2don-20260511.webp` | Previous 2돈 guide image | Product row proof unless a 7.5g row is added |
| `/products/kcg-real-goldbar-3don-20260511.webp` | Previous 3돈 guide image | Product row proof unless an 11.25g row is added |
| `/products/kcg-real-goldbar-5don-20260511.webp` | Previous 5돈 guide image | Product row proof unless an 18.75g row is added |
| `/products/kcg-real-goldbar-10don-20260511.webp` | Previous 10돈 guide and 37.5g product image | Price proof, stock proof, certificate proof |
| `/campaign/kcg-real-goldbar-price-desk-20260511.webp` | Previous home/banner/social/promo representative image | Price proof, stock proof, certificate proof, final inventory proof |
| `/campaign/kcg-korean-consultation-hands-20260511.webp` | Previous consultation atmosphere image | Real staff/customer identity, product proof, certificate proof |
| `/campaign/kcg-real-opening-campaign-20260511.webp` | Previous opening campaign/reference slide | Active home slide unless rollback is requested; long-term evergreen claim unless the embedded text remains approved |
| `/products/kcg-real-goldbar-lineup-20260511.webp` | Previous gold-bar category and lineup representative image | Silver, jewelry buying, pure-gold ring/card/medal proof |
| `/products/kcg-real-goldbar-detail-20260511.webp` | Previous front/back product representative image | Final stock/certificate proof |
| `/products/kcg-real-goldbar-single-20260511.webp` | Previous single-bar representative image | Exact weight proof for every listed product |
| `/products/kcg-ai-goldbar-don-lineup-20260511.webp` | Previous text-free 1/2/3/5/10돈 guide and 37.5g representative image | Actual stock, price, certificate, or every shown size being available |
| `/products/kcg-ai-goldbar-hand-consultation-20260511.webp` | Previous small-bar consultation atmosphere image | Real staff/customer identity or final product proof |
| `/products/kcg-ai-goldbar-tray-20260511.webp` | Previous 3.75g/10g catalog support image | Exact packaged product proof or guaranteed inventory |
| `/products/kcg-ai-goldbar-large-inquiry-20260511.webp` | Previous 100g/high-weight inquiry representative image | Proof that a 100g bar is currently in stock |
| `/products/kcg-ai-goldbar-1g-representative-20260512.webp` | Previous 1g product representative image, inactive after v0.2.42 | Actual stock, package, certificate, or fixed quote proof |
| `/products/kcg-ai-goldbar-10g-representative-20260512.webp` | Previous 10g product representative image, inactive after v0.2.42 | Actual stock, package, certificate, or fixed quote proof |
| `/products/kcg-ai-goldbar-100g-representative-20260512.webp` | Previous 100g product representative image, inactive after v0.2.42 | Proof that a 100g bar is currently in stock |
| `/products/kcg-real-goldbar-frontback-1g-20260513.webp` | Current 1g product card/detail image | Price proof, stock proof, package/certificate proof, or final inventory proof |
| `/products/kcg-real-goldbar-frontback-3-75g-20260513.webp` | Current 3.75g product card/detail image | Price proof, stock proof, package/certificate proof, or final inventory proof |
| `/products/kcg-real-goldbar-frontback-10g-20260513.webp` | Current 10g product card/detail image | Price proof, stock proof, package/certificate proof, or final inventory proof |
| `/products/kcg-real-goldbar-frontback-37-5g-20260513.webp` | Current 37.5g product card/detail image | Price proof, stock proof, package/certificate proof, or final inventory proof |
| `/products/kcg-real-goldbar-frontback-100g-20260513.webp` | Current 100g product card/detail image | Price proof, stock proof, package/certificate proof, or final inventory proof |
| `/campaign/kcg-generated-goldbar-banner-20260508.webp` | Generated home/banner/promo representative image | Real product proof, price proof, inventory proof |
| `/products/kcg-generated-goldbar-lineup-20260508.webp` | Generated gold-bar category and lineup representative image | Silver, jewelry buying, pure-gold ring/card/medal proof |
| `/products/kcg-generated-goldbar-detail-20260508.webp` | Generated gold-bar card/detail representative image | Final product proof or stock/certificate proof |
| `KakaoTalk_20260508_091603752.jpg` | First approved gold-bar lineup derivative for catalog card review | Silver, jewelry buying, pure-gold ring/card/medal proof |
| `KakaoTalk_20260508_091613735.jpg` | Alternate lineup crop for catalog card or product detail | Final inventory/stock proof without approval |
| `KakaoTalk_20260508_091553653.png` and `_01/_02/_03` | High-quality product cutout derivative after WebP optimization | Raw public file path or oversized public PNG |
| `KakaoTalk_20260508_150411746*.jpg` | Front gold-bar lineup derivative after crop selection and WebP optimization | Raw public file path, silver/jewelry/ring proof, or stock/price proof without approval |
| `KakaoTalk_20260508_150416296*.jpg` | Reverse/detail engraving support image after glare/background review | Primary product proof, product availability proof, or certificate/package proof without approval |
| `KakaoTalk_20260508_164514053.jpg` | Campaign/reference card only if KCG approves the embedded opening text | Long-term evergreen UI image unless the text remains true and intentionally approved |
| `KakaoTalk_20260427_125126082*.png` | Brand/logo comparison only | Product image replacement |

## Next Safe Implementation Path

1. Keep all public goldbar derivatives labeled or described as representative 상담 imagery unless KCG explicitly approves product-proof wording.
2. If KCG supplies exact 1g, 10g, or 100g photos later, classify each source by exact product/weight before replacing those rows.
3. Codex creates only optimized WebP derivatives with deliberate public filenames.
4. Codex updates only the approved gold-bar product slugs in `src/lib/product-presenter.ts`, `src/mock/products.ts`, and `supabase/seed.sql` as needed.
5. Codex verifies `/products` desktop/mobile, `/products/investment-gold-bar-consulting`, and home first viewport so the company price table is not pushed down.
6. Codex runs `npm run audit:site`, `npm run test:site`, `npm run screenshot:site`, and `npm run qa:site`.

## Current Status

- `KCG-TODO-054` remains shared/user-approval blocked for final product-proof replacement.
- Codex has completed the safe pre-replacement map, the generated representative gold-bar asset refresh, the first real KCG-derived public asset pass, the v0.2.35 real KCG goldbar product/banner rework, the v0.2.36 no-hand core visual correction, the v0.2.39 studio money-unit/banner correction, and the v0.2.42 front/back goldbar product-shot correction.
- Actual stock/price/certificate/product-proof use remains blocked until KCG confirms exact file, crop, product/weight, and final-use classification.
