# KCG Font Policy

KCG uses a System font stack for public and admin screens, with no bundled Korean font download.

## Current Production Policy

- Primary stack: `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Apple SD Gothic Neo`, `Malgun Gothic`, `sans-serif`
- Runtime font dependency: none
- Bundled Korean font download: none
- Main implementation files: `src/app/layout.tsx` and `src/app/globals.css`

This keeps the site independent from Google Fonts, CDN fonts, and a large local
Korean variable font file. The goal is faster first visits on mobile while
preserving a familiar Korean interface on macOS, iOS, Windows, and Android.

## Retired Pretendard Bundle

Earlier KCG versions bundled `PretendardVariable.woff2` from the official
Pretendard repository:

- Source: https://github.com/orioncactus/pretendard
- Previous file source: `packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2`
- Previous version source: `v1.3.9`
- License: SIL Open Font License 1.1
- Previous local file: `src/app/fonts/PretendardVariable.woff2`

That local font was removed from the active app after live performance smoke
showed the full variable WOFF2 still downloaded at about 2.06MB on first visit
even when preloading was disabled.

## Guardrails

- Do not reintroduce runtime Google Font imports for the main UI font.
- Do not add a large bundled Korean font unless there is a measured design need
  and a smaller subset/weight plan.
- If a custom font returns later, verify the first-visit font transfer budget,
  mobile screenshots, and `npm run audit:site`.
