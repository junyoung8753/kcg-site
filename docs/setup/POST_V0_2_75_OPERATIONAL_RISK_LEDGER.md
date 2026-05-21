# KCG Post v0.2.75 Operational Risk Ledger

Last updated: 2026-05-21 KST.

This ledger freezes the post-`v0.2.75` operating baseline after the admin/public product catalog parity release. It separates already-shipped behavior from later production data, schema, credential, launch, and write-smoke Gates.

## Goal

Keep the already deployed `v0.2.75` screens stable, and make the remaining risks explicit before the next product/admin change.

## v0.2.75 Release Surface

Use this list when reading a dirty working tree. These are the intended v0.2.75/v0.2.76 operating-risk surfaces; unrelated dirty files are not part of this risk ledger unless a later task explicitly adopts them.

- `src/lib/product-presenter.ts`
- `src/actions/media-actions.ts`
- `src/app/admin/products/page.tsx`
- `src/app/admin/products/admin-products-workspace.tsx`
- `src/app/admin/media/page.tsx`
- `src/app/admin/media/admin-media-workspace.tsx`
- `tests/site-fidelity.spec.ts`
- `tests/admin-upload.spec.ts`
- `scripts/audit-site-fidelity.mjs`
- `docs/setup/CHANGELOG.md`
- `docs/setup/CURRENT_HANDOFF.md`
- `docs/setup/OPEN_TASKS.md`
- `docs/setup/PRODUCT_OPERATIONS_CHECKLIST.md`
- `docs/setup/PROJECT_STATUS_FOR_BEGINNER.md`
- `package.json`
- `package-lock.json`

## Source Of Truth

- Public product catalog source of truth: `getPublicCatalogProducts()` plus the public image presenter.
- Public catalog rows: `KCG 골드바 1돈`, `KCG 골드바 2돈`, `KCG 골드바 3돈`, `KCG 골드바 5돈`, `KCG 골드바 10돈`, `고금 주얼리 매입`, `대량 골드바 상담`.
- Admin default `/admin/products` list must mirror that public 7-row catalog.
- Admin `/admin/media` product summaries must use the same public catalog and public image presenter.
- Raw DB product rows are not the default operator product list.

## Hidden / Stale Raw Product Rows

Legacy/raw Supabase product rows are treated as `hidden/stale data` when they do not belong to the public canonical catalog.

- They stay excluded by presenter and default admin views.
- They are not deleted, updated, or repurposed by this pass.
- Production DB cleanup requires a separate SQL plan, rollback SQL, and explicit production DB data-change approval.
- Examples of hidden/stale rows include gram-only goldbar rows, split 14K/18K buying rows, pure-gold gift rows, and silverbar rows that are not approved for the public catalog.

## KCG-TODO-124 Owner SQL Plan

`KCG-TODO-124` stays blocked until Supabase owner/dashboard SQL access is available. Do not paste database passwords, service-role keys, cookies, or recovery codes into chat.

When owner SQL access is available, apply or verify:

- `site_assets`
- `site_asset_usages`
- `media_change_history`
- `products.image_asset_id`
- `products_image_asset_id_fkey`
- `site_assets_size_bytes_check` with `size_bytes <= 10485760`
- Storage bucket `site-assets.file_size_limit = 10485760`

Minimum verification queries:

```sql
select to_regclass('public.site_assets') as site_assets;
select to_regclass('public.site_asset_usages') as site_asset_usages;
select to_regclass('public.media_change_history') as media_change_history;

select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'products'
  and column_name = 'image_asset_id';

select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conname in ('site_assets_size_bytes_check', 'products_image_asset_id_fkey');

select id, file_size_limit
from storage.buckets
where id = 'site-assets';
```

Expected result:

- The three media tables resolve to non-null `public.*` regclass values.
- `products.image_asset_id` exists.
- `site_assets_size_bytes_check` allows up to `10485760`.
- `products_image_asset_id_fkey` points to `site_assets(id)`.
- `site-assets` bucket reports `file_size_limit = 10485760`.
- Normal admin media/product uploads prefer DB metadata over the private Storage metadata fallback.

Rollback preparation before applying SQL:

- Capture pre-change table/column existence.
- Capture `storage.buckets` row for `site-assets`.
- Prepare rollback SQL for newly added constraints, column, and tables only if the production owner decides rollback is safer than leaving unused schema in place.

## Production Write Smoke Policy

Default QA is read-only. Do not run mutation upload smoke on production by routine.

Run opt-in production write smoke only when upload/storage behavior is suspected broken or after changing upload/storage logic. The smoke must be a full set:

1. Use an 8MB-class image file.
2. Upload through the deployed admin flow or protected smoke route.
3. Verify signed upload, metadata save, and readback.
4. Verify the target slot/product can show the uploaded image.
5. Restore the original product image or media slot.
6. Delete or disconnect the smoke asset/usage.
7. Confirm cleanup by readback.

Production write smoke requires explicit approval because it mutates live review storage/metadata even when the change is temporary.

## Read-Only Baseline

Use these commands before the next admin/product/image change:

```powershell
npm run audit:site
npm run test:site
npm run screenshot:admin
npm run check:release-state
SITE_AUDIT_URL=https://kcgold.co.kr npm run audit:site
SITE_AUDIT_URL=https://kcgold.co.kr npm run test:site
```

Full local confidence remains:

```powershell
npm run lint
npm run typecheck
npm run audit:site
npm run build
npm run test:site
npm run screenshot:admin
npm run qa:site
```

## Non-Goals

This pass does not change:

- public prices
- price formulas or price history rows
- Supabase price data
- search/noindex/robots release state
- payment, cart, checkout, or live trading behavior
- secrets, env values, admin password, or OAuth
- DNS, project transfer, or ownership transfer
- production DB data/schema without a separate approved Gate
