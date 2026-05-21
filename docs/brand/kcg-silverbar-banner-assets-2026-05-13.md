# KCG Silverbar And Banner Assets - 2026-05-13

Last updated: 2026-05-13 KST.

## Purpose

This note records the v0.2.43 visual correction for the public `/products` silverbar guide and the home campaign carousel. `KCG-TODO-095` tracks the task. The work responds to the issue that the previous opening and goldbar banner images looked like text or product graphics were pasted beside the site rather than composed as complete KCG campaign banners.

## Applied Assets

### Home and product banners

| Public asset | Applied surface | Boundary |
| --- | --- | --- |
| `/campaign/kcg-gold-silver-premium-banner-20260513.webp` | Home carousel first slide and social image | Promotional banner only; not price, stock, certificate, or final inventory proof |
| `/campaign/kcg-price-desk-gold-silver-banner-20260513.webp` | Home carousel second slide | Promotional support only; company posted prices remain in DOM/data |
| `/campaign/kcg-opening-premium-banner-20260513.webp` | Home carousel third slide | Replaces the pasted-looking opening poster; no stale opening copy is embedded |
| `/campaign/kcg-products-gold-silver-consult-banner-20260513.webp` | `/products` hero and product quick-link banner | Category 상담 visual only |

### Silverbar guide and product images

| Public asset | Applied surface | Boundary |
| --- | --- | --- |
| `/products/kcg-silverbar-don-lineup-studio-v2-20260513.webp` | `/products` silverbar 1/2/3/5/10돈 guide | consultation-unit guide only |
| `/products/kcg-silverbar-1don-studio-20260513.webp` | Silverbar guide card | 1돈 = 3.75g guide image |
| `/products/kcg-silverbar-2don-studio-20260513.webp` | Silverbar guide card | 2돈 = 7.5g guide image |
| `/products/kcg-silverbar-3don-studio-20260513.webp` | Silverbar guide card | 3돈 = 11.25g guide image |
| `/products/kcg-silverbar-5don-studio-20260513.webp` | Silverbar guide card | 5돈 = 18.75g guide image |
| `/products/kcg-silverbar-10don-studio-20260513.webp` | Silverbar guide card | 10돈 = 37.5g guide image |
| `/products/kcg-silverbar-frontback-100g-20260513.webp` | Existing `KCG 실버바 100g` card/detail fallback | Exact public product-row image for the existing 100g listing |
| `/products/kcg-silverbar-frontback-500g-20260513.webp` | Existing `KCG 실버바 500g` card/detail fallback | Exact public product-row image for the existing 500g listing |
| `/products/kcg-silverbar-frontback-1kg-20260513.webp` | Existing `KCG 실버바 1kg` card/detail fallback | Exact public product-row image for the existing 1kg listing |

## Source And Generation Boundary

- The silverbar images are site-ready generated derivatives made to match the KCG goldbar product-shot visual system. They do not represent a final photographed silverbar inventory item.
- Existing public silverbar product rows remain `100g`, `500g`, and `1kg`. The requested `1/2/3/5/10돈` silverbar images are applied as a 상담 단위 guide so the site does not invent new sellable SKU rows without final product approval.
- No raw KakaoTalk source filename was copied into `public/`.
- Review contact sheet: `output/kcg-image-review/kcg-silverbar-banner-assets-20260513-contact.png`.

## QA Harness Coverage

- `scripts/audit-site-fidelity.mjs` checks the new assets exist, stay under the public image size limit, and are referenced from the expected source files.
- `tests/site-fidelity.spec.ts` checks `/products` shows the silverbar guide, maps existing silverbar product rows to the new matching silverbar images, and keeps the old silver placeholder images out of public product cards.
- The home carousel Playwright checks now use the new 금·은 banner alt text so pasted-looking opening/goldbar campaign images cannot silently return as active slides.

## Rollback

Use `v0.2.42` to return to the previous state before the silverbar guide and home banner replacement. The main rollback targets are:

- `src/components/market/price-lineup.tsx`
- `src/components/products/product-catalog.tsx`
- `src/lib/product-presenter.ts`
- `src/app/layout.tsx`
- `src/app/(site)/products/page.tsx`
- `src/mock/products.ts`
- `supabase/seed.sql`
