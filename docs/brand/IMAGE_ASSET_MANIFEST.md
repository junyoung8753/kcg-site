# KCG Image Asset Manifest

Last updated: 2026-05-17 KST.

This document is the human-readable companion to `src/data/imageAssetManifest.json`. The JSON file is the machine-readable source for `npm run audit:site`; keep the field names aligned when adding or changing assets.

## Image Source Types

| code | meaning | individual product card/detail |
| --- | --- | --- |
| A1 | `approved_real_product_photo`: approved real product photo | allowed |
| A2 | `approved_product_render`: approved render, composite, or AI-enhanced product asset | allowed when SKU weight, purity, logo, engraving, and design match |
| A3 | `unverified_product_like_image`: unapproved product-like generated image | forbidden |
| B | `category_representative`: category representative image | allowed only where it cannot be mistaken for an exact SKU photo |
| C | `editorial_hero`: main banner or brand/editorial image | route hero/banner use |
| D | `service_process`: consultation, quote, scale, buying, or service process image | service/buying guidance use |
| E | `virtual_people`: virtual staff/customer atmosphere image | conditional, never as real staff/customer proof |
| F | `placeholder`: image-pending UI for individual products without approved assets | allowed for product card/detail |

## Required Fields

Every JSON manifest entry must include:

`asset_id`, `file_path`, `image_source_type`, `approval_status`, `allowed_usage`, `related_sku`, `sku_match`, `page_usage`, `section_usage`, `alt_text`, `aspect_ratio`, `mobile_crop_rule`, `hash_or_checksum`, `notes`.

## Approval Flow

- Existing approved KCG assets keep their current paths such as `public/products` and `public/campaign`.
- New generated candidates go under `public/assets/generated/candidates/{hero,products-category,buying,service,store-guide,company,notice,b2b}/`.
- Candidate assets are preview/report only. They cannot be linked by operational pages and cannot be marked `approval_status: approved`.
- Codex does not auto-promote candidates. A human must approve the asset, then move it to `public/assets/generated/approved/{category}/`, update the JSON manifest to `approval_status: approved`, and only then connect it to operational pages.
- Existing approved goldbar SKU images are locked by `docs/audit/goldbar-sku-image-lock-snapshot.md` and must not be moved into `public/assets/generated/approved/`.

## Current Approved Operational Assets

| asset_id | file_path | type | status | usage | SKU / section |
| --- | --- | --- | --- | --- | --- |
| brand-symbol-kcg-logo | `/brand/kcg-logo.png` | C | approved | brand_identity | global |
| brand-lockup-kcg | `/brand/kcg-lockup.png` | C | approved | brand_identity | global |
| brand-signboard-clean | `/brand/signboard-clean.jpg` | C | approved | hero | price signboard |
| hero-goldbar-lineup-reflection-20260517 | `/campaign/kcg-approved-goldbar-lineup-reflection-20260517.jpg` | A2 | approved | hero/social | approved goldbar lineup banner |
| hero-human-consultation-20260506 | `/campaign/kcg-home-human-consultation-20260506.webp` | E | approved | hero/company_hero | consultation atmosphere |
| hero-seoul-retail-20260506 | `/campaign/kcg-home-seoul-retail-20260506.webp` | C | approved | hero/store_guide_hero | visit/store atmosphere |
| service-old-gold-process-20260506 | `/campaign/kcg-old-gold-process-20260506.webp` | D | approved | service_hero | buying process |
| goldbar-lineup-no-reflection-20260517 | `/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg` | A2 | approved | product guide/category/detail | goldbar lineup |
| goldbar-1don-20260517 | `/products/kcg-approved-goldbar-1don-20260517.jpg` | A2 | approved | product_guide | 1돈 / 3.75g |
| goldbar-2don-20260517 | `/products/kcg-approved-goldbar-2don-20260517.jpg` | A2 | approved | product_guide | 2돈 / 7.5g |
| goldbar-3don-20260517 | `/products/kcg-approved-goldbar-3don-20260517.jpg` | A2 | approved | product_guide | 3돈 / 11.25g |
| goldbar-5don-20260517 | `/products/kcg-approved-goldbar-5don-20260517.jpg` | A2 | approved | product_guide | 5돈 / 18.75g |
| goldbar-10don-20260517 | `/products/kcg-approved-goldbar-10don-20260517.jpg` | A2 | approved | product_guide | 10돈 / 37.5g |
| goldbar-product-1g-20260514 | `/products/kcg-real-photo-goldbar-product-1g-20260514.jpg` | A1 | approved | product_card/product_detail | `kcg-gold-bar-1g` |
| goldbar-product-3-75g-20260514 | `/products/kcg-real-photo-goldbar-product-3-75g-20260514.jpg` | A1 | approved | product_card/product_detail | `investment-gold-bar-consulting` |
| goldbar-product-10g-20260514 | `/products/kcg-real-photo-goldbar-product-10g-20260514.jpg` | A1 | approved | product_card/product_detail | `kcg-gold-bar-10g` |
| goldbar-product-37-5g-20260514 | `/products/kcg-real-photo-goldbar-product-37-5g-20260514.jpg` | A1 | approved | product_card/product_detail | `kcg-gold-bar-37-5g` |
| goldbar-product-100g-20260514 | `/products/kcg-real-photo-goldbar-product-100g-20260514.jpg` | A1 | approved | product_card/product_detail | `kcg-gold-bar-100g` |
| category-pure-gold-gifts-20260506 | `/products/kcg-product-pure-gold-gifts-20260506.webp` | B | approved | category_card/b2b_category | pure gold gift consultation only |
| category-jewelry-buying-20260503 | `/products/kcg-product-jewelry-buying-20260503.webp` | B | approved | category_card | buying consultation only |
| placeholder-image-pending | `placeholder:image-pending` | F | approved | product_placeholder | no approved individual product asset |

## Candidate Slot Plan

`v0.2.54` created a first candidate-only preview batch for hero, service, store-guide, and company replacement directions. These files remain preview/report only under `public/assets/generated/candidates/` and are not approved for operational pages.

| category | target count | filename pattern | prompt direction |
| --- | ---: | --- | --- |
| hero | 5-7 | `kcg-candidate-hero-YYYYMMDD-##.webp` | Bright KCG price-desk and consultation hero, white/warm beige/soft gold, no black background, no fake certificates. |
| products-category | 3-5 | `kcg-candidate-products-category-YYYYMMDD-##.webp` | Category-level product atmosphere that does not imply a specific SKU weight. |
| buying | 6-8 | `kcg-candidate-buying-YYYYMMDD-##.webp` | Vary scale, tray, phone consultation, document check, hands, product case, market-rate review. No scene type above 40%. |
| service | 4-6 | `kcg-candidate-service-YYYYMMDD-##.webp` | Bright process/consultation visuals with clear service role. |
| store-guide | 3-5 | `kcg-candidate-store-guide-YYYYMMDD-##.webp` | Visit preparation and consultation atmosphere; do not fake a verified storefront. |
| company | 3-5 | `kcg-candidate-company-YYYYMMDD-##.webp` | Trust, transparent operation, management/consultation context; avoid goldbar wall repetition. |
| notice | 3 | `kcg-candidate-notice-template-YYYYMMDD-##.webp` | Text-card thumbnail templates only; actual notice titles remain HTML text. |
| b2b | 3-5 | `kcg-candidate-b2b-YYYYMMDD-##.webp` | Corporate gift, packaging, bulk consultation, meeting table without fake contracts or seals. |

## Current Candidate Preview Batch

The detailed preview and QA notes live in `docs/brand/image-candidate-preview-2026-05-17.md`.

| category | count | status | notes |
| --- | ---: | --- | --- |
| hero | 7 | candidate only | 5 illustration concepts plus 2 brighter photo-style consultation hero candidates. |
| service | 5 | candidate only | 4 illustration concepts plus 1 photo-style jewelry/checking process candidate. |
| store-guide | 4 | candidate only | 3 illustration concepts plus 1 photo-style visit-preparation candidate. |
| company | 4 | candidate only | 3 illustration concepts plus 1 photo-style transparent-operations candidate. |

Approval remains blocked until a human chooses a specific file, moves it to `public/assets/generated/approved/{category}/`, changes the manifest entry to `approval_status: approved`, and verifies the operational route screenshots.

## Product Placeholder Targets

The following individual products have no approved A1/A2 asset and should render `이미지 준비중` until approved assets are added:

- `pure-gold-baby-ring-3-75g`
- `pure-gold-card-1g`
- `pure-gold-commemorative-medal`

`pure-gold-gift-consulting` remains a broad category-consultation item and may use the approved category representative image.
