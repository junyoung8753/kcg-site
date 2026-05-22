# KCG Font Source

KCG uses `Pretendard Variable` as the primary Korean UI font for public and admin screens.

- Source: https://github.com/orioncactus/pretendard
- File used: `packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2`
- Version source: `v1.3.9`
- License: SIL Open Font License 1.1
- Local file: `src/app/fonts/PretendardVariable.woff2`

Use `next/font/local` so the site does not depend on runtime Google Fonts or CDN font requests. Keep `Apple SD Gothic Neo`, `Malgun Gothic`, and `sans-serif` as fallbacks.

Implementation rule:

- Do not reintroduce runtime Google Font imports for the main UI font.
- Keep the variable font file in the app tree so Next.js can optimize it. Font preloading is disabled in `src/app/layout.tsx` so first-time mobile visits do not fetch the full Korean variable font before critical content.
- If the font is updated, download from the official Pretendard repository release/tag and keep the license reference here.
- Do not edit the font binary or rename it in a way that breaks the `src/app/layout.tsx` `localFont` configuration.
