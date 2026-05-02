# KCG Launch Briefing

Last updated: 2026-04-30 KST.

This briefing is written for explaining the current site direction and remaining launch decisions. It intentionally excludes passwords, API keys, recovery codes, and private account information.

## One-Line Direction

한국센터금거래소 사이트는 `가격 확인 → 상품/매입 범위 확인 → 전화 문의 → 본사·매장 확인`을 빠르게 이어주는 종로 금거래소형 상담 사이트입니다.

## Why This Structure

- Major Korean gold-exchange sites put the price lineup first because customers usually enter to check today’s buy/sell basis before anything else.
- KCG is not yet operating as a checkout mall, securities platform, or live trading service, so the site avoids cart/payment/order wording.
- The home page follows a price-first flow: company posted prices, international reference prices, chart/reference context, notices, then product/category entry.
- `/products` follows a Korean gold-exchange product-list pattern: category tabs, item count, sorting controls, product cards, and a narrow supporting rail. It does not copy competitor images, prices, slogans, or internal data.
- `/company` is kept for trust facts and the boss-written company introduction. Product/service selling copy is kept in `/products` and `/services`.

## Current Completion Status

- Custom domains `kcgold.co.kr` and `www.kcgold.co.kr` resolve to Vercel and HTTPS works.
- Supabase production storage is connected; `/api/health` reports `mode=supabase`.
- Search exposure is still blocked: `/robots.txt` returns `Disallow: /`, sitemap is empty before launch, and page metadata remains `noindex`.
- The public site uses real legal/company facts provided by KCG: 법인명, 대표이사, 사업자등록번호, 본사/매장 information, and family links.
- Product/catalog pages are consultation-first and include current posted-price reference calculations.
- Large generated PNG assets have optimized WebP public versions so the visible site can load lighter images while keeping source originals.

## What Still Needs Real Business Confirmation

- Final product photos by category and weight.
- Actual making-fee/margin rules for gold bars, silver bars, and pure-gold products.
- Which items should be public, inquiry-only, or hidden.
- Final admin password rotation before public search launch.
- Final legal/address/phone visual confirmation by the company.
- Explicit approval to remove noindex/robots blocking and allow Google/Naver indexing.

## Market Data Position

- Current setup is enough for launch review: KCG posted prices are primary, Gold API free reference prices and TradingView official widgets are secondary market context.
- TradingView attribution must stay visible. Its widget data must not be scraped, stored, or republished as KCG-owned data.
- Metals.Dev is not mandatory now. It becomes useful if KCG wants stable bid/ask, currency rates, and time-series data inside its own tables/charts. A practical starting plan is Silver `$9.99/month` or Platinum `$19.99/month`, not the highest tier.
- KRX should stay out of production price display until use terms, commercial distribution scope, and any KRX/Koscom market-data contract needs are confirmed.

## Launch Gate

Do not treat domain connection or production deployment as public launch approval. Public search launch requires all of the following:

- Real product information and images approved.
- Final admin password rotated and stored only in Vercel env.
- Company confirms legal/business/contact display.
- No temporary/internal wording appears on public pages.
- Junyoung explicitly approves removing robots/noindex blocking.

## Manager Briefing Summary

현재 사이트는 금거래소 고객이 가장 먼저 보는 `오늘 시세`를 중심으로 구성했고, 상품은 쇼핑몰 결제형이 아니라 실제 KCG 운영에 맞춘 상담형 카탈로그로 만들었습니다. 도메인·HTTPS·Supabase 운영 저장소는 연결되어 있고, 검색 노출은 최종 승인 전까지 일부러 막아둔 상태입니다. 남은 핵심은 디자인보다 운영 확정입니다: 실제 상품 사진, 공임/마진 기준, 공개할 품목, 최종 관리자 비밀번호, 검색 노출 승인입니다.
