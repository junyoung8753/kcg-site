# KCG Contact Channels Runbook

Last updated: 2026-05-06 KST.

This runbook prepares non-phone inquiry channels such as 카카오톡 문의 without showing unfinished links on the public site.

## Recommendation

- Primary public conversion stays phone-first because KCG pricing and 실물 확인 require live confirmation.
- Add KakaoTalk Channel chat next when the official KCG channel is created and verified. In public UI this should appear as a simple `카카오톡 문의` link/button only after the real channel URL exists.
- Use `거래 상담 도우미` as the first no-cost inquiry layer: it can answer approved FAQ/visit/price questions without storing messages, then route final-price, legal/tax, personal-data, SMS, Kakao, or employee-required questions to human consultation.
- Keep Naver Blog as content/news, not a customer-service inbox.
- Avoid adding many chat widgets at once. Too many floating buttons make the gold-exchange site feel less trustworthy and harder to scan.

## Common Site Pattern And KCG Choice

Typical commerce/service sites use a layered flow: FAQ bot -> human chat or ticket -> Kakao/NaverTalk/SMS/CRM alert -> staff follow-up. That pattern works for ordinary product questions, but it becomes risky for KCG if it collects phone numbers, photos, documents, or "final quote" promises before privacy, retention, provider, and staff workflow are approved.

KCG's current choice is the conservative launch-safe version:

- No-storage FAQ assistant for 시세표, 고금 매입, 방문 준비, 상품/대량 문의, and KRX distinction.
- Deterministic handoff before AI for contact details, final-price/quote, payment/trading, legal/tax, document validity, SMS/Kakao, or staff-required questions.
- Phone-first human handoff now; Kakao official URL and SMS staff alerts only after real provider/channel setup and consent copy are approved.

## KakaoTalk Channel Setup

Kakao Developers documents that KakaoTalk Channel can provide a connection page for channel addition and 1:1 chat. The site should use the official channel profile ID from the Channel URL after `https://pf.kakao.com/`.

Required user-only setup:

- Create or confirm the official KCG KakaoTalk Channel.
- Verify business/channel ownership as needed in Kakao Business.
- Copy the channel URL, for example `https://pf.kakao.com/_example`.
- If using Kakao JavaScript SDK buttons later, register the production domain and use the channel profile ID.

Repo-ready fields:

- `siteConfig.contact.kakaoChannelUrl`
- `siteConfig.contact.kakaoChatUrl`
- `siteConfig.contact.naverTalkTalkUrl`

Current state: all optional channel URLs are `null`, so no unfinished Kakao/Naver inquiry button appears on the public site. When a real `카카오톡 문의` URL is added, footer and contact sections can show it automatically through `getOptionalContactLinks()`.

## AI / SMS Boundary

- Current `거래 상담 도우미` mode is no-storage FAQ guidance. `/api/health` exposes the active mode and confirms that messages are not stored and personal data is not collected.
- OpenAI can be enabled later only through environment variables such as `INQUIRY_ASSISTANT_PROVIDER=openai` and `OPENAI_API_KEY`; keys must stay out of chat/docs/Git and should use `store: false`.
- SMS staff alerts require a paid/approved provider, consent copy, retention policy, and secret env setup. Do not add SMS sending from the public site until those are approved.
- The assistant must not promise final prices, payment, live trading, investment outcomes, KRX execution, legal/tax conclusions, or document validity.

## Sources

- KakaoTalk Channel concepts: https://developers.kakao.com/docs/latest/en/kakaotalk-channel
- KakaoTalk Channel JavaScript chat button: https://developers.kakao.com/docs/latest/en/kakaotalk-channel/js
