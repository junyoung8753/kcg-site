# 한국센터금거래소 사이트

서울 종로구 돈화문로6가길 12 골든타워 303호에 위치한 `(주)한국센터금거래소`의 단일 공개 후보 사이트입니다. 현재 사이트의 기준 표면은 `/` 하나이며, 과거 비교용 라우트는 유지하지 않습니다.

## 제품 방향

KCG 사이트는 쇼핑몰보다 `시세 확인 + 전화 문의 + 거래 전 준비`에 집중합니다. 회사 범위는 순금·고금 매입, 순금/골드바 판매, B2C 전화 문의·거래 상담, B2B 대량·기업 상담입니다.

- 첫 화면은 회사 고시 시세표, 기준 시각, 내가 살 때/팔 때 구분을 가장 먼저 보여줍니다.
- 자동 국제 시세와 뉴스 헤드라인은 시장 흐름을 보는 보조 정보입니다.
- 실제 거래 금액은 순도, 중량, 부속, 보증서, 실물 상태 확인 후 현장에서 최종 안내합니다.
- 상품 판매란은 결제/장바구니가 아닌 상담형 카탈로그입니다. 골드바, 순금 제품, 실버바, 고금·주얼리 매입, B2B 문의를 사진·가격 문구와 함께 관리할 수 있습니다.
- KRX 금시장, 유사 투자/리딩방, 원격 선입금 거래와 혼동되지 않도록 민간 현장 상담 사이트로 안내합니다.
- 사업자등록번호와 법적 고지는 확인 문서가 들어오기 전까지 임시값임을 명시하며, 공개 오픈 전 점검에서 차단합니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase(Postgres) 우선 구조
- Vercel 배포 기준

## 주요 라우트

- `/` 메인 시세/상담 데스크
- `/prices` 오늘의 고시 시세, 실시간 참고 시세, 국내 환산 참고 시세
- `/products` 상담형 상품 카탈로그
- `/announcements` 공지사항 목록
- `/announcements/[slug]` 공지 상세
- `/services` 취급 품목과 상담 범위
- `/about` 위치, 거래 전 준비, 운영 안내
- `/admin/login` 관리자 로그인
- `/admin/launch` 오픈 전 점검판

## 데이터 구조

### 회사 고시 시세

- 메인 상단 시세표는 관리자 수기 입력 기준입니다.
- 외부 API가 회사 고시 시세를 자동으로 덮어쓰지 않습니다.
- 실제 상담은 회사 고시 시세와 현장 확인 결과를 기준으로 안내합니다.

### 자동 참고 시세

- `METALS_DEV_API_KEY`가 있으면 Metals.Dev로 자동 연동됩니다.
- 키가 없으면 Gold API 무료 현재가를 사용합니다.
- 두 공급자 모두 실패하면 체크된 운영 seed 데이터로 내려갑니다.
- 모든 자동 데이터는 출처와 참고용 안내를 함께 표시합니다.
- KRX 금시장 데이터는 공식성이 있어도 약관과 시장정보 계약 범위 확인 전에는 production 참고시세나 차트에 넣지 않습니다.

### 뉴스 헤드라인

- Google News RSS-style URL은 제목, 출처, 날짜, 외부 링크만 표시합니다.
- 기사 본문, 기사 이미지, 출판사 요약은 재게시하지 않습니다.
- 운영 기준은 `docs/quality/data-source-compliance.md`를 따릅니다.

## 브랜딩 자산

- `public/brand/kcg-logo.png`: KCG 심볼
- `public/brand/kcg-lockup.png`: 로고 + 상호 조합
- `public/campaign/*`: 시세/상담/거래 안내용 캠페인 이미지
- `src/app/icon.png`: 사이트 아이콘
- `docs/brand/campaign-image-prompts.md`: ChatGPT 이미지 생성용 메인 배너 프롬프트

## 환경 변수

`.env.local`

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.co.kr
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

MARKET_DATA_PROVIDER=auto
METALS_DEV_API_KEY=
MARKET_DATA_REVALIDATE_SECONDS=60
KCG_FORCE_NOINDEX=1
```

`MARKET_DATA_PROVIDER` 값:

- `auto`: Metals.Dev 키가 있으면 Metals.Dev, 없으면 Gold API, 실패 시 seed 데이터
- `metals-dev`: Metals.Dev 우선, 실패하면 Gold API, 그 다음 seed 데이터
- `gold-api`: Gold API 우선, 실패하면 seed 데이터
- `mock`: seed 데이터만 사용

`KCG_FORCE_NOINDEX=1`은 공개 launch 승인 전 검색 색인을 막기 위한 설정입니다. 실제 공개 도메인과 검색 허용은 사업자등록번호, 관리자 비밀번호, 법적 안내 문구, 운영 데이터가 확정된 뒤 승인받고 변경합니다. 사업자등록번호가 `000-00-00000` 임시값이면 robots/sitemap이 검색 노출을 허용하지 않습니다.

## 도메인, Supabase, API 준비

자세한 실행 절차는 `docs/setup/DOMAIN_SUPABASE_MARKET_RUNBOOK.md`를 기준으로 봅니다.

- `kcgold.co.kr`와 `www.kcgold.co.kr`는 Whois에서 구매한 도메인 기준입니다.
- Vercel에 도메인을 추가한 뒤 `vercel domains inspect`가 알려주는 정확한 A/CNAME 값을 Whois DNS에 입력합니다.
- 기존 MX/TXT/SPF/DKIM 같은 메일·인증 레코드는 삭제하지 않습니다.
- DNS 연결 후에도 `KCG_FORCE_NOINDEX=1`은 유지합니다.
- Supabase 운영 DB는 `supabase/schema.sql`과 `supabase/seed.sql`을 기준으로 준비합니다.
- Supabase service role 또는 secret key, Vercel env, Whois 비밀번호는 채팅이나 Git에 남기지 않습니다.

## 로컬 실행

가장 쉬운 방법은 `바로실행.cmd`를 실행하는 것입니다.

직접 실행:

```bash
cmd /c npm.cmd install
cmd /c npm.cmd run build
cmd /c npm.cmd run start
```

로컬 주소:

- `http://127.0.0.1:3000`
- `http://127.0.0.1:3000/prices`
- `http://127.0.0.1:3000/admin/login`

## 관리자

- 로컬 기본 관리자 비밀번호: `0000`
- 배포 환경에서는 `ADMIN_PASSWORD`와 `ADMIN_SESSION_SECRET`을 Vercel 환경 변수로 설정합니다.
- Supabase 미연결 상태에서는 seed 데이터 기반으로 읽기/관리 화면이 동작합니다.
- Supabase 연결 시 공개 데이터와 관리자 저장이 실제 DB 기준으로 동작합니다.

## 검증

코드 변경 후 기본 검증:

```bash
cmd /c npm.cmd run lint
cmd /c npm.cmd run typecheck
cmd /c npm.cmd run audit:site
cmd /c npm.cmd run build
cmd /c npm.cmd run test:site
cmd /c npm.cmd audit --audit-level=moderate
```

시각 변경 후 추가 검증:

```bash
cmd /c npm.cmd run screenshot:site
```

렌더링된 로컬 서버까지 함께 확인하려면:

```powershell
$env:SITE_AUDIT_URL="http://127.0.0.1:3000"; npm run audit:site
```

헬스 체크:

- `/api/health`

`/api/health`에는 데이터 공급자, 출처 URL, 약관 URL, stale 여부, headline 출처 정보, launch readiness 요약이 포함됩니다.

## 작업 보드

KCG 오픈 준비 TODO 원장은 `docs/setup/OPEN_TASKS.md`입니다. 브라우저에서 보기 편한 로컬 대시보드는 아래 명령으로 생성합니다.

```bash
cmd /c npm.cmd run tasks:dashboard
```

생성 결과는 `output/kcg-open-tasks.html`이며, 이 파일은 로컬 확인용 생성물이므로 Git에 올리지 않습니다. 작업 상태를 바꿀 때는 원본 `docs/setup/OPEN_TASKS.md`를 수정한 뒤 대시보드를 다시 생성합니다.

## Cloud 작업 재개

이 repo가 Codex Cloud / 새 PC 작업 기준입니다. 자세한 흐름은 `docs/setup/continue-anywhere.md`와 `docs/setup/CLOUD_ONLY_WORKFLOW.md`를 기준으로 봅니다.

새 PC 또는 새 local checkout에서:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "iwr -UseBasicParsing https://raw.githubusercontent.com/junyoung8753/kcg-site/main/scripts/Start-KcgContinuation.ps1 -OutFile $env:TEMP\Start-KcgContinuation.ps1; & $env:TEMP\Start-KcgContinuation.ps1"
```

repo 폴더 안에서는:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-continuation.ps1 -Install -PullVercel
```

주의:

- `.env*`, `.vercel`, 관리자 비밀번호, Supabase service role key는 git에 올리지 않습니다.
- production 배포, stable alias 변경, 검색 색인 허용은 명확한 승인 후 진행합니다.
- 프로젝트 작업 규칙은 `AGENTS.md`를 우선 확인합니다.

## 현재 상태 메모

- 대표이사명은 `홍연호`, 운영시간은 `평일 09:00 - 18:30` 기준으로 반영했습니다.
- 사업자등록번호는 확인 전까지 `000-00-00000` 임시값으로 표시하되, 화면에 임시값임을 명시하고 공개 오픈 전 점검에서 차단합니다.
- 회사 시세표와 자동 참고 시세는 분리되어 있습니다.
- Metals.Dev 키가 추가되면 별도 코드 수정 없이 더 풍부한 실시간 참고 시세로 승격됩니다.
- KRX Open API 또는 시장정보는 승인·계약 범위 확인 전까지 공개 production 데이터 소스로 사용하지 않습니다.
