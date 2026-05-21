# KCG Image QA Checklist

Last updated: 2026-05-17 KST.

Use this before connecting any image to KCG operational pages. This checklist does not approve prices, fees, search launch, payments, trading, DNS, credentials, or public indexing.

## Baseline Visual Rules

- Bright background.
- White, warm beige, and soft gold as the main mood.
- Natural-light feeling.
- No excessive gold shine.
- No black background for new candidate assets.
- No casino, speculation, luxury-flex, or investment-profit mood.
- No repeated scale/tray/goldbar display visual pattern across the same route.
- No generated-AI distortion, fake text, fake certificate, fake stamp, or fake regulatory document.
- Image role must match the section purpose.
- Mobile crop must keep the subject and KCG context stable.
- Check whether visitors could mistake the image for a real product, employee, customer, or store photo.

## Product Asset Rules

- Existing approved goldbar SKU images are protected by `docs/audit/goldbar-sku-image-lock-snapshot.md`.
- A2 approved product renders are official KCG assets when SKU weight, purity, logo, engraving, and design match.
- Do not remove an approved A2 image just because it is rendered, composited, or AI-enhanced.
- A3 unverified product-like images cannot be used in individual product cards or detail pages.
- Individual products without approved A1/A2 assets use the `이미지 준비중` placeholder.
- Category representative images are allowed only when they do not imply exact SKU appearance.

## Generated Candidate Rules

- Candidate files stay under `public/assets/generated/candidates/`.
- Candidate files are preview/report only and cannot be linked by operational pages.
- Codex does not promote candidates to approved.
- Human approval is required before moving a candidate into `public/assets/generated/approved/` and setting `approval_status: approved`.
- The JSON manifest must be updated before operational use.

## Virtual People Rules

Allowed:

- Consultation atmosphere.
- Phone consultation.
- Visit guidance.
- Service introduction.
- Images where the face is not the core trust guarantee.

Forbidden:

- Real employee names, titles, or name tags.
- Customer-testimonial-like images.
- Expert recommendation or guarantee mood.
- Fake appraiser or fake certificate.
- Face resembling a real person.
- Copy that implies "our actual employee" when the image is virtual.

Preferred composition:

- Hands, side angle, over-the-shoulder view, consultation table, documents, and product cases over face close-ups.

## Section Direction

- Sales/products: keep existing approved goldbar SKU assets. New individual products use placeholder until approved.
- Product categories: use representative images that cannot be mistaken for a specific weight.
- Buying: vary old gold consultation, hands, tray, scale, documents, phone consultation, purity check, market-rate check, and product case. No single scene type should exceed 40% in a candidate set.
- Service: mix process cards, icons, and bright consultation scenes.
- Store guide: if real store photos are insufficient, use visit-preparation/consultation atmosphere and do not fake an exterior/interior as verified KCG property.
- Company: avoid goldbar wallpaper. Prioritize trust, transparent operation, consultation, and management images.
- Notice: text-card thumbnails are allowed; actual title/copy stays as HTML text.
- B2B: corporate gifts, packaging, bulk consultation, and meeting-table images are allowed without fake contracts or seals.

## Screenshot Review Flags

Flag these in screenshot review notes:

- Dark/black image blocks dominating a route.
- Same goldbar lineup repeated across unrelated sections.
- Same scale or tray scene repeated across buying/service/store-guide beyond the 40% rule.
- Cropped product weight, KCG logo, or engraving.
- Face close-up that looks like a real staff/customer proof point.
- AI-looking warped hands, fake text, impossible packaging, fake certificate, or unreadable logo.
- Candidate path accidentally rendered in an operational page.
