# KCG Campaign Image Prompts

Last updated: 2026-05-08 KST.

This document is the source of truth for KCG campaign, product, service, and visit-guide image generation. It intentionally describes the image itself and avoids brittle layout instructions such as price-table placement, empty space, black boxes, UI overlays, or left/right panel slots.

## Source Folder

- Candidate source folder: `C:\Users\junyo\Documents\File-Hub\30_Media\Images`
- AI source folder: `C:\Users\junyo\Documents\File-Hub\30_Media\Images\AI generated`
- Confirmed repo assets are copied only into `public/campaign`, `public/products`, or `public/services`.
- Do not copy private document photos from `C:\Users\junyo\Documents\File-Hub\30_Media\Images\KakaoTalk` into the repo. Those images can include contracts, addresses, signatures, and other private or legal content.

## Current Asset Decisions

- Public UI should reference the optimized `.webp` versions of the large generated assets. Keep original generated sources in File-Hub and review folders, not as the business source of truth.
- `public/campaign/kcg-generated-goldbar-banner-20260508.webp`: current home first-slide, social image, and products promo banner. It is generated from the 2026-05-08 KCG gold-bar reference direction and remains representative imagery, not real product/stock/price proof.
- `public/products/kcg-generated-goldbar-lineup-20260508.webp`: current gold-bar category/product lineup representative image and `/products` hero.
- `public/products/kcg-generated-goldbar-detail-20260508.webp`: current gold-bar product card/detail representative image.
- `public/campaign/kcg-home-price-desk-20260506.webp`: previous home first-slide and social image. It introduced the v0.2.10 `Graphite Desk + Seoul Retail + Human Consultation` direction with a darker price desk, metal products, and screen-like price context while the actual price/copy remains DOM-managed.
- `public/campaign/kcg-home-human-consultation-20260506.webp`: current home consultation slide. It uses AI-generated generic 상담원/고객 context without real staff/customer identity, competitor marks, or fake KCG signage.
- `public/campaign/kcg-home-seoul-retail-20260506.webp`: current Seoul retail / visit mood image for home/about surfaces. It references Jongno jewelry-district retail atmosphere without competitor signs or invented storefront logos.
- `public/campaign/kcg-price-guide-visual-20260506.webp`: current price-table reading guide visual for `/prices`; all labels and guidance are separate HTML text.
- `public/campaign/kcg-old-gold-process-20260506.webp`: current old-gold buying/process image for home/services/catalog surfaces. It shows sorting and consultation tools without fake certificates, appraisal documents, or guaranteed-quote claims.
- `public/products/kcg-product-minimal-bars-20260506.webp`: previous gold/silver catalog candidate for graphite/ceramic product table surfaces.
- `public/products/kcg-product-pure-gold-gifts-20260506.webp`: current 순금제품 candidate; it separates pure-gold gifts from bullion and avoids holiday-ad exaggeration.
- `public/products/kcg-product-corporate-consulting-20260506.webp`: current B2B/corporate consultation candidate with meeting-table atmosphere and no fake contracts or certificate seals.
- `public/image-options/2026-05-06/generated`: current v0.2.10 review folder with source PNG copies, optimized WebPs, contact sheet, and manifest.
- `public/campaign/kcg-home-product-keyvisual-20260503.webp`: previous home first-slide candidate. Keep as a comparison fallback; it is a text-free commercial product key visual with larger gold/silver product scale, a scale, blank envelopes, and calmer left-side space for the live price panel.
- `public/campaign/kcg-home-inspection-action-20260503.webp`: previous service/home supporting candidate. It shows a cropped gloved inspection action without faces, readable documents, prices, or fake logos.
- `public/campaign/kcg-visit-transaction-guide-20260503.webp`: previous visit/company supporting image. It is a clean transaction-preparation counter scene for 매장안내, 회사소개, or service context.
- `public/products/kcg-product-gold-silver-catalog-20260503.webp`: previous gold/silver catalog candidate. It gives product cards a sharper category image than the older repeated desk photos.
- `public/products/kcg-silver-gift-20260427-v2.jpg`: retained for silver-bar product/category cards so gold and silver surfaces do not repeat the same image. Keep it only where silver recognition matters more than using the newest generated set.
- `public/products/kcg-product-jewelry-buying-20260503.webp`: previous jewelry-buying candidate. It replaces repeated jewelry-buying fallback imagery with a cleaner tray/scale scene.
- `public/products/kcg-product-b2b-consulting-20260503.webp`: previous B2B candidate. It separates corporate/bulk consultation from generic jewelry or white-glove images.
- `public/image-options/2026-05-03`: review folder with copied existing-current images, new original PNGs, optimized new WebPs, contact sheets, and a manifest so junyoung can compare choices later.
- `public/image-options/2026-05-03/diverse-banner-directions`: second-pass banner candidates created after junyoung pointed out that the first 2026-05-03 set still repeated the same gold-bar, gloves, envelope, and scale vocabulary. These candidates are not applied by default; use them for choosing a genuinely different home/banner direction.
- `public/campaign/kcg-brand-gold-bars-20260427-v4.webp`: previous home first-slide review banner. Keep it as a comparison candidate; it has campaign energy but baked KCG-style marks and a darker poster feel than the 2026-05-03 text-free key visual.
- `public/campaign/kcg-main-desk-photo-20260427-v3.webp`: previous supporting home slide. Keep it as a comparison candidate; it avoids fake copy but repeats the beige consultation-room desk mood.
- `public/campaign/kcg-advisor-counter-20260430.webp`: generated with the built-in image tool for a gloved-hands consultation scene. It is allowed because it shows no identifiable face, staff identity, customer testimonial, fake logo, price board, or private document. Use it mainly for service/process contexts; avoid overusing it as a home campaign slide so the whole site does not become a same-looking white-glove visual set.
- `public/campaign/kcg-hero-gold-bars.jpg`: previous fourth home slide after the 2026-04-30 image-role review. Keep as a clean product fallback, but current home carousel uses `kcg-hero-metal-bars.jpg` as the retained legacy slide because it contrasts better with the new text-free 2026-05-03 candidates.
- `public/company/kcg-company-heritage-20260430.webp`: generated with the built-in image tool for company-introduction visual credibility. It is a generic KCG-compatible consultation desk mood image and does not replace verified legal/company information.
- `public/products/kcg-jewelry-buying-tray-20260430.webp`: previous jewelry-buying fallback. Keep as a comparison candidate; current public catalog prefers `kcg-product-jewelry-buying-20260503.webp`.
- `public/products/kcg-b2b-gift-packaging-20260430.webp`: previous B2B/corporate gift fallback. Keep as a comparison candidate; current public catalog prefers `kcg-product-b2b-consulting-20260503.webp`.
- `public/campaign/kcg-main-commerce-banner-20260427-v2.jpg`: retired from the first slide. The composition was useful as a controlled experiment, but the baked advertising copy and generated commercial-poster feel did not match the requested reference direction.
- `public/products/kcg-old-gold-jewelry-20260427-v2.jpg`: old-gold/jewelry category asset cropped from a Wikimedia Commons / The Met public-domain (CC0) image: `https://upload.wikimedia.org/wikipedia/commons/d/d9/Gold_ring_set_with_an_emerald_MET_DT283.jpg`. Keep only as a fallback; current public catalog should prefer `kcg-product-jewelry-buying-20260503.webp`.
- `KakaoTalk_20260427_125126082_01.png`: official wide KCG lockup. Use as a real UI or compositing layer when needed; do not ask AI to redraw it.
- `KakaoTalk_20260427_125126082.png`: official KCG symbol. Use as a real UI or compositing layer when needed.
- `ChatGPT Image 2026년 4월 27일 오후 01_02_09.png`: approved in the 2026-04-27 image pass because it avoided baked text, fake KCG marks, price boards, people, and private documents. It is now a comparison/fallback candidate; the 2026-05-03 text-free commercial product key visual is the current first slide.
- `ChatGPT Image 2026년 4월 27일 오후 01_01_57.png`: usable only for location, silver bar, and purchase-guide supporting surfaces.
- `ChatGPT Image 2026년 4월 27일 오후 01_01_43.png`: usable only for service/process and B2B supporting surfaces.
- `1.png`: promoted into `public/campaign/kcg-brand-gold-bars-20260427-v4.webp` in the 2026-04-30 review round because it had stronger campaign energy than the plain consultation-room image and used KCG-specific generated branding rather than competitor material.
- `ChatGPT Image 2026년 4월 27일 오후 01_28_38.png`: hold for public backgrounds because text, logo-like marks, and campaign copy are baked into the image without enough first-screen advantage.

## v0.2.10 Generation Direction

The 2026-05-06 prompt set used one design thesis: `Graphite Desk + Seoul Retail + Human Consultation`. The images should feel like a Seoul retail gold-exchange desk with charcoal/silver/white structure, gold accents, larger product scale, and a practical consultation path. Important business text, official logos, CTAs, and prices should remain DOM or controlled overlay text when possible.

Generated roles:

- Home price desk: charcoal price desk, gold/silver bars, laptop/tablet with blurred price-table UI, consultation hand movement allowed.
- Home human consultation: generic AI 상담원 and customer across a desk, natural but not identifiable; official KCG logo is added outside the AI image.
- Seoul retail mood: Jongno-inspired storefront/interior mood without competitor signs, fake logos, or readable private documents.
- Price guide visual: customer perspective reading a price table; numbers/labels are abstract UI only.
- Old-gold process: jewelry sorting tray, hand, loupe/scale cues; no certificate, appraisal, contract, or guarantee document.
- Minimal bars: graphite/ceramic product table for gold and silver bars, more financial-desk than shopping-mall.
- Pure-gold gifts: product-family image with optional hand detail, restrained and not holiday-ad driven.
- Corporate consulting: business consultation table with sample metals and folders; no fake contract, seal, certificate, or public-office document.

## Benchmark Direction After 2026-04-27 Review

Reference sites checked visually:

- 한국금거래소: price lineup is paired with a strong commercial campaign image, not a plain office photo.
- GBK금거래소: large app/campaign imagery uses clear hero-scale objects and high contrast.
- 국제표준금거래소: gold bar product pages use a wide hero with large product scale and simple background.
- 삼성금거래소: dense price surfaces sit beside product and campaign panels; the visual is secondary to price readability.

KCG takeaway:

- The home banner should feel like a Korean gold-exchange advertisement key visual, not a generic AI consultation-room photo.
- Competitor patterns may be borrowed aggressively at the level of structure, hierarchy, category grouping, and visual grammar, but competitor-owned images, prices, slogans, copy, logos, staff/model photos, and internal endpoints are not copied into KCG.
- The hero visual needs one dominant idea, not one repeated prop formula. Candidate batches must include at least three genuinely different directions such as pure product minimalism, retail/store atmosphere, secure vault/custody mood, local storefront context, warm metal macro, silver-led contrast, or editorial graphic treatment. Do not make every banner a variation of gold bars plus gloves, envelopes, and a scale.
- Gloves, certificate envelopes, and scales are useful process props, but they are not required for banners. Use them only when the image role is inspection, weighing, transaction preparation, or service explanation.
- Product scale must be bigger than the current desk images. Small objects on a beige desk read as stock photography and lose the exchange-site feeling.
- Use clean white, charcoal, gold, muted orange, and warm metal reflections. Avoid purple, bokeh, fantasy glow, luxury-hotel lounge mood, and generic marble desk staging.
- AI-generated generic 상담원/고객 faces, hands, gloves, sleeves, or cropped torsos can be used when they make the scene feel more commercial and real, but they must not resemble a real person, employee, celebrity, or customer testimonial.
- Korean text, the official KCG logo, and temporary price text may be used when controlled by HTML, Next/Image, or deliberate post-processing. AI should not invent KCG logos, fake Korean slogans, fake prices, fake certificates, fake appraisal/guarantee documents, or competitor marks.
- Do not cover the KCG home campaign image with a large white haze or large HTML marketing copy. The left price table already carries the working text; the right visual should read as an image-led banner. If a future final ad image needs campaign copy, create it as a deliberate approved campaign graphic or place short HTML copy outside the image area.

## Image Policy

### Official logo and signature

- Use the real PNG logo/lockup provided by KCG.
- Do not generate fake Korean logo text inside AI images.
- If a campaign needs the logo, place the actual logo through HTML, Next/Image, or a post-processing layer.

### Main slide banners

- The home first screen prioritizes price-table readability, but the visual itself must still have campaign strength.
- Prefer a commercial key visual with oversized gold/silver bars, packaging, scale, and controlled light over a plain consultation-room background.
- Avoid washing out the image just to make text readable. Heavy white overlays make the banner feel unfinished and generic.
- Avoid large marketing slogans, price boards, fake certificates, fake logos, fake appraisal/guarantee documents, watermarks, and recognizable real-person faces.
- Natural tiny bar engravings such as purity or weight are allowed when they look like product detail, not a price promise.

### Product catalog images

- Product photos may show bar engravings, packaging, certificate envelopes, scale, gloves, and material texture.
- Do not include prices, fixed sales amounts, fake authentication wording, competitor trademarks, or customer information.
- If a category is not accurately represented by current images, generate a dedicated category image instead of stretching a weak placeholder forever.

### Consultation and process images

- Gloved hands, weighing, consultation counters, envelopes, and clean desk scenes are allowed.
- No readable customer names, ID cards, account numbers, signatures, contract details, addresses, or private documents.
- Avoid identifiable real-person faces unless KCG owns a model release or approved real staff photography. Generic AI 상담 faces are allowed only when they do not imply actual staff/customer identity.

## Generation Prompts

Common direction:

```text
Create realistic commercial photography for a professional Korean gold exchange website. The image should feel like a finished advertising key visual for a trustworthy Korean gold dealer: clear product scale, polished metal texture, practical retail credibility, and calm confidence. Avoid generic stock-photo staging, luxury-hotel lounge mood, purple glow, fantasy bokeh, cartoon style, 3D render, and obviously composited scenes. If branding is needed, it will be applied later using the official KCG logo file, so do not invent logos or Korean brand text inside the generated image. Natural tiny purity or weight engravings on bars are acceptable. Do not include prices, fake certificates, readable private documents, customer data, or competitor trademarks.
```

1. Home main slide banner - recommended commercial product key visual

```text
Generate a realistic high-end commercial hero banner for a professional Korean gold exchange website, 16:9 wide, high resolution. The scene is a polished retail key visual: three large pure gold bars and two silver bars arranged on a clean white display plinth with a precision scale, sealed certificate envelopes, and white inspection gloves nearby. Use crisp studio lighting, warm gold reflections, subtle charcoal and muted orange accents, and a clean Korean jewelry-district retail atmosphere. Make the metal objects large, sharp, and visually dominant, like a real advertising photo for gold bar sales and precious-metal consultation. Natural tiny purity or weight engravings on the bars are acceptable. Do not create prices, fake certificates, fake logos, competitor marks, UI panels, watermarks, readable personal documents, or identifiable faces.
```

2. Alternative home main slide banner: gloved inspection action

```text
Generate a realistic editorial commercial banner for a Korean gold exchange, 16:9 wide, high resolution. Close-up on a gloved hand placing a pure gold bar beside silver bars on a glass display counter, with a precision scale and sealed certificate envelopes in the foreground. The composition should feel like a professional store inspection and consultation moment, not a pawnshop and not a luxury-hotel lounge. Use strong product scale, crisp metal texture, clean white and charcoal surfaces, warm controlled highlights, and a practical premium retail mood. Cropped hands and sleeves are allowed; no identifiable face. Avoid prices, fake logos, fake certificates, UI panels, watermarks, readable private documents, and competitor marks.
```

3. Alternative home main slide banner: illustrated commercial poster

```text
Create a premium editorial illustration for a Korean gold exchange website hero banner, 16:9 wide. Use a realistic photo-illustration style with large gold bars, silver bars, a precision scale, and certificate envelopes arranged as a clean commercial key visual. White background, charcoal shadows, muted orange geometric accent, sharp metallic texture, restrained Korean financial-retail mood. It should look designed by a professional web designer and commercial illustrator, not like clip art or a generic AI render. Small natural bar engravings are acceptable. Do not invent logos, prices, fake certificates, UI panels, watermarks, private documents, or identifiable faces.
```

4. Gold bar and silver bar catalog card

```text
Generate a realistic 4:3 product catalog photo for a Korean gold exchange. Several pure gold bars and silver bars in different sizes arranged neatly on a neutral display surface with premium packaging and a certificate envelope nearby. Clean product photography, high resolution, accurate metallic reflections. Natural small purity or weight engravings are allowed. No prices, no promotional slogans, no fake brand logo, no human face.
```

5. Old gold and jewelry buying card

```text
Generate a realistic 4:3 commercial photo for old gold and jewelry buying consultation at a Korean gold exchange. A neat tray with rings, necklaces, small pure-gold items, a precision scale, inspection gloves, and a clean certificate envelope on a consultation counter. Organized and trustworthy, not messy, not pawnshop-like. No readable personal documents, no prices, no customer names, no face.
```

6. B2B bulk consultation card

```text
Generate a realistic 4:3 commercial photo for B2B precious-metals consultation. Sample gold bars and silver bars, premium packaging, a blank business document folder, and a pen arranged on a clean consultation table. Calm corporate mood, practical and trustworthy. Natural product markings are allowed, but no readable company names, no pricing, no fake certificates, no identifiable people.
```

7. Transaction guide supporting image

```text
Generate a realistic 16:9 photo for a Korean gold exchange transaction guide. A consultation counter with an electronic scale, inspection gloves, certificate envelopes, neatly arranged gold and silver bars, and a clean seating area in the background. It should suggest trade preparation, inspection, and settlement guidance without showing private documents. No customer names, no ID cards, no signatures, no account numbers, no face.
```

8. Brand mood image

```text
Generate a realistic high-end but understated 16:9 commercial image for a Korean gold exchange brand mood. A refined consultation room with glass display, warm gold accents, polished stone counter, and prominently displayed gold and silver bars. Leave any branding to a separate overlay; do not invent logos or Korean text. Professional, realistic, calm, not flashy.
```

## Use Notes

- Generate one candidate per prompt number before asking for variants.
- For a new banner exploration, generate one candidate per distinct art direction before making variants. A usable set should let junyoung choose between different concepts, not just different crops of the same gold-bar tabletop.
- Save accepted source files in the File-Hub AI folder first, then copy only approved, optimized public assets into the repo.
- Reject images that introduce fake prices, fake compliance claims, competitor marks, or private document details.
- Reject home banner candidates where the product scale is small, the scene reads as a generic beige office, or the image still feels usable for any random finance/luxury site.
- After choosing an image, run screenshot verification for desktop and mobile before replacing stable imagery.
