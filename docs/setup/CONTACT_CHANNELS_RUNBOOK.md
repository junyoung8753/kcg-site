# KCG Contact Channels Runbook

Last updated: 2026-05-05 KST.

This runbook prepares non-phone inquiry channels such as 카카오톡 문의 without showing unfinished links on the public site.

## Recommendation

- Primary public conversion stays phone-first because KCG pricing and 실물 확인 require live confirmation.
- Add KakaoTalk Channel chat next when the official KCG channel is created and verified. In public UI this should appear as a simple `카카오톡 문의` link/button only after the real channel URL exists.
- Keep Naver Blog as content/news, not a customer-service inbox.
- Avoid adding many chat widgets at once. Too many floating buttons make the gold-exchange site feel less trustworthy and harder to scan.

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

## Sources

- KakaoTalk Channel concepts: https://developers.kakao.com/docs/latest/en/kakaotalk-channel
- KakaoTalk Channel JavaScript chat button: https://developers.kakao.com/docs/latest/en/kakaotalk-channel/js
