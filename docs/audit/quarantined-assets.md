# Quarantined And Needs-Review Image Assets

This file records image assets that should not be connected to active customer-facing pages unless a later human approval explicitly changes their status. Do not delete ambiguous assets just because they look generated. Remove active UI links first, then record the reason here.

## Current Quarantine / Rejected Records

| asset | status | reason | active usage |
| --- | --- | --- | --- |
| `public/campaign/kcg-real-photo-goldbar-products-banner-20260514.jpg` | quarantined | Previously rejected main-banner mock style. Kept only under `docs/brand/retired-public-assets/2026-05-14/public/campaign/` for rollback/reference. | none |
| `public/campaign/kcg-real-photo-goldbar-price-banner-20260514.jpg` | quarantined | Previously rejected main-banner mock style. Kept only under `docs/brand/retired-public-assets/2026-05-14/public/campaign/` for rollback/reference. | none |
| `public/campaign/kcg-real-photo-goldbar-opening-banner-20260514.jpg` | quarantined | Previously rejected main-banner mock style. Kept only under `docs/brand/retired-public-assets/2026-05-14/public/campaign/` for rollback/reference. | none |
| `public/campaign/kcg-generated-goldbar-banner-20260508.webp` | rejected | Deleted from active public tree before this pass; do not restore without fresh approval because it predates the current A1/A2 manifest distinction. | none |
| `public/products/kcg-generated-goldbar-lineup-20260508.webp` | rejected | Deleted from active public tree before this pass; old generated product-like asset. | none |
| `public/products/kcg-generated-goldbar-detail-20260508.webp` | rejected | Deleted from active public tree before this pass; old generated product-like asset. | none |
| `public/products/kcg-ai-goldbar-1g-representative-20260512.webp` | rejected | Previous unverified product-like representative image. It must not be used for exact SKU card/detail. | none |
| `public/products/kcg-ai-goldbar-10g-representative-20260512.webp` | rejected | Previous unverified product-like representative image. It must not be used for exact SKU card/detail. | none |
| `public/products/kcg-ai-goldbar-100g-representative-20260512.webp` | rejected | Previous unverified product-like representative image. It must not be used for exact SKU card/detail. | none |

## Quarantine Rule

- `A3 unverified_product_like_image` cannot appear in individual product cards or detail pages.
- Candidate generated assets stay under `public/assets/generated/candidates/` and are preview/report only.
- New generated assets move to `public/assets/generated/approved/` only after human approval and manifest update.
- Existing approved KCG goldbar SKU assets remain in their current `public/products` paths and are not moved.
