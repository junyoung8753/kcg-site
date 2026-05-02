# KCG Campaign Image Prompts

Last updated: 2026-04-30 KST.

This document is the source of truth for KCG campaign, product, service, and visit-guide image generation. It intentionally describes the image itself and avoids brittle layout instructions such as price-table placement, empty space, black boxes, UI overlays, or left/right panel slots.

## Source Folder

- Candidate source folder: `C:\Users\junyo\Documents\File-Hub\30_Media\Images`
- AI source folder: `C:\Users\junyo\Documents\File-Hub\30_Media\Images\AI generated`
- Confirmed repo assets are copied only into `public/campaign`, `public/products`, or `public/services`.
- Do not copy private document photos from `C:\Users\junyo\Documents\File-Hub\30_Media\Images\KakaoTalk` into the repo. Those images can include contracts, addresses, signatures, and other private or legal content.

## Current Asset Decisions

- Public UI should reference the optimized `.webp` versions of the large generated assets. Keep the original `.png` files in `public/` only as source-preserving originals for review and future re-export.
- `public/campaign/kcg-brand-gold-bars-20260427-v4.webp`: current home first-slide review banner. It uses the KCG-owned/generated source `1.png` as a stronger gold-bar campaign visual. The baked KCG-style brand marks are accepted for this review candidate because they are KCG-specific and sit behind the live price lineup rather than replacing HTML/UI text.
- `public/campaign/kcg-main-desk-photo-20260427-v3.webp`: supporting home slide. It uses the approved File-Hub source `ChatGPT Image 2026년 4월 27일 오후 01_02_09.png` without baked campaign copy, fake logo text, white haze, or UI-like placeholders.
- `public/campaign/kcg-advisor-counter-20260430.webp`: generated with the built-in image tool for a gloved-hands consultation scene. It is allowed because it shows no identifiable face, staff identity, customer testimonial, fake logo, price board, or private document. Use it mainly for service/process contexts; avoid overusing it as a home campaign slide so the whole site does not become a same-looking white-glove visual set.
- `public/campaign/kcg-hero-gold-bars.jpg`: preferred fourth home slide after the 2026-04-30 image-role review. It keeps the home carousel product-led and moves the white-glove action image back to service/process surfaces.
- `public/company/kcg-company-heritage-20260430.webp`: generated with the built-in image tool for company-introduction visual credibility. It is a generic KCG-compatible consultation desk mood image and does not replace verified legal/company information.
- `public/products/kcg-jewelry-buying-tray-20260430.webp`: generated with the built-in image tool to replace the jewelry category fallback with a more accurate old-gold/jewelry buying tray scene.
- `public/products/kcg-b2b-gift-packaging-20260430.webp`: generated with the built-in image tool for B2B and corporate gift consultation cards.
- `public/campaign/kcg-main-commerce-banner-20260427-v2.jpg`: retired from the first slide. The composition was useful as a controlled experiment, but the baked advertising copy and generated commercial-poster feel did not match the requested reference direction.
- `public/products/kcg-old-gold-jewelry-20260427-v2.jpg`: old-gold/jewelry category asset cropped from a Wikimedia Commons / The Met public-domain (CC0) image: `https://upload.wikimedia.org/wikipedia/commons/d/d9/Gold_ring_set_with_an_emerald_MET_DT283.jpg`. Keep only as a fallback; current public catalog should prefer `kcg-jewelry-buying-tray-20260430.webp`.
- `KakaoTalk_20260427_125126082_01.png`: official wide KCG lockup. Use as a real UI or compositing layer when needed; do not ask AI to redraw it.
- `KakaoTalk_20260427_125126082.png`: official KCG symbol. Use as a real UI or compositing layer when needed.
- `ChatGPT Image 2026년 4월 27일 오후 01_02_09.png`: approved source for the current first slide because it avoids baked text, fake KCG marks, price boards, people, and private documents. It can still be replaced later by a stronger real KCG-shot commercial key visual.
- `ChatGPT Image 2026년 4월 27일 오후 01_01_57.png`: usable only for location, silver bar, and purchase-guide supporting surfaces.
- `ChatGPT Image 2026년 4월 27일 오후 01_01_43.png`: usable only for service/process and B2B supporting surfaces.
- `1.png`: promoted into `public/campaign/kcg-brand-gold-bars-20260427-v4.webp` for this review round because it has stronger campaign energy than the plain consultation-room image and uses KCG-specific generated branding rather than competitor material.
- `ChatGPT Image 2026년 4월 27일 오후 01_28_38.png`: hold for public backgrounds because text, logo-like marks, and campaign copy are baked into the image without enough first-screen advantage.

## Benchmark Direction After 2026-04-27 Review

Reference sites checked visually:

- 한국금거래소: price lineup is paired with a strong commercial campaign image, not a plain office photo.
- GBK금거래소: large app/campaign imagery uses clear hero-scale objects and high contrast.
- 국제표준금거래소: gold bar product pages use a wide hero with large product scale and simple background.
- 삼성금거래소: dense price surfaces sit beside product and campaign panels; the visual is secondary to price readability.

KCG takeaway:

- The home banner should feel like a Korean gold-exchange advertisement key visual, not a generic AI consultation-room photo.
- Competitor patterns may be borrowed aggressively at the level of structure, hierarchy, category grouping, and visual grammar, but competitor-owned images, prices, slogans, copy, logos, staff/model photos, and internal endpoints are not copied into KCG.
- The hero visual needs one dominant object group: large gold bars, silver bars, packaging, scale, or a gloved hand interacting with metal.
- Product scale must be bigger than the current desk images. Small objects on a beige desk read as stock photography and lose the exchange-site feeling.
- Use clean white, charcoal, gold, muted orange, and warm metal reflections. Avoid purple, bokeh, fantasy glow, luxury-hotel lounge mood, and generic marble desk staging.
- Human faces should remain out unless KCG approves model rights. Hands, gloves, sleeves, or a cropped torso can be used when they make the scene feel more commercial and real.
- Text may be added later in HTML or post-production. AI should not invent KCG logos, fake Korean slogans, fake prices, fake certificates, or competitor marks.
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
- Avoid large marketing slogans, price boards, fake certificates, fake logos, UI panels, watermarks, and recognizable faces.
- Natural tiny bar engravings such as purity or weight are allowed when they look like product detail, not a price promise.

### Product catalog images

- Product photos may show bar engravings, packaging, certificate envelopes, scale, gloves, and material texture.
- Do not include prices, fixed sales amounts, fake authentication wording, competitor trademarks, or customer information.
- If a category is not accurately represented by current images, generate a dedicated category image instead of stretching a weak placeholder forever.

### Consultation and process images

- Gloved hands, weighing, consultation counters, envelopes, and clean desk scenes are allowed.
- No readable customer names, ID cards, account numbers, signatures, contract details, addresses, or private documents.
- Avoid identifiable faces unless KCG owns a model release or approved real staff photography.

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
- Save accepted source files in the File-Hub AI folder first, then copy only approved, optimized public assets into the repo.
- Reject images that introduce fake prices, fake compliance claims, competitor marks, or private document details.
- Reject home banner candidates where the product scale is small, the scene reads as a generic beige office, or the image still feels usable for any random finance/luxury site.
- After choosing an image, run screenshot verification for desktop and mobile before replacing stable imagery.
