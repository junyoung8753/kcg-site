# 한국센터금거래소 MVP

서울 종로구 돈화문로6가길 12 골든타워 303호에 위치한 `(주)한국센터금거래소`의 공개 준비용 사이트입니다.

현재 공개 후보는 `/`이고, `/option-1`, `/option-2`는 내부 비교 보관용 경로로 유지합니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase(Postgres) 우선 구조
- Vercel 배포 기준

## 현재 동작 구조

### 1. 회사 시세표
- 메인 상단 시세표는 **관리자 수기 입력** 기준입니다.
- 실제 거래가는 이 회사 시세표와 현장 확인 결과를 기준으로 안내합니다.

### 2. 실시간 참고 시세
- `METALS_DEV_API_KEY`가 있으면 **Metals.dev**로 자동 연동됩니다.
- 키가 없으면 **Gold API 무료 실시간 현재가**를 사용합니다.
- Gold API 무료 모드에서는 `실시간 참고 시세`로만 표시되며, `bid/ask`, `전일 대비`, `히스토리 차트`는 제공되지 않습니다.
- 두 공급자 모두 실패하면 운영형 fallback 데이터로 내려갑니다.
- 회사 거래 기준은 항상 상단 `회사 고시 시세표`가 우선이며, 자동 데이터는 참고용입니다.

### 3. 뉴스
- 시장 뉴스는 **Google News RSS** 기반 외부 헤드라인을 사용합니다.
- RSS 실패 시 운영형 seed 뉴스로 자연스럽게 fallback 됩니다.

### 4. 관리자
- `/admin`에서 시세와 공지사항을 관리할 수 있습니다.
- Supabase 미연결 상태에서는 mock/preview 모드로 동작합니다.
- Supabase 연결 시 공개 데이터와 관리자 저장이 실제 DB 기준으로 동작합니다.
- 시세 저장 시 `기준 시각 오래됨`, `변동폭 과다`, `매입/판매 간격 과다` 경고를 확인할 수 있습니다.

## 주요 라우트

- `/` 메인
- `/prices` 오늘의 고시 시세 / 실시간 참고 시세 / 국내 환산 참고 시세
- `/announcements` 공지사항 목록
- `/announcements/[slug]` 공지 상세
- `/services` 취급 품목 / 상담 범위
- `/about` 방문 전 준비 / 위치 / 운영 안내
- `/admin/login` 관리자 로그인

## 브랜딩 자산

현재 실제 브랜드 자산을 기준으로 아래 파일이 연결되어 있습니다.

- `public/brand/kcg-logo.png` : KCG 심볼
- `public/brand/kcg-lockup.png` : 로고 + 상호 조합
- `src/app/icon.png` : 사이트 아이콘

## 운영 편의 링크

- 거래안내와 footer에는 `네이버 지도`, `카카오맵`, `전화 연결` 링크가 포함되어 있습니다.
- 사업자등록번호는 아직 확인 중 상태로 두고, 대표자명과 운영 정보 중심으로 먼저 안내합니다.

## 환경 변수

`.env.local`

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.co.kr
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

# 시장 데이터
MARKET_DATA_PROVIDER=auto
METALS_DEV_API_KEY=
MARKET_DATA_REVALIDATE_SECONDS=60
```

### `MARKET_DATA_PROVIDER`

- `auto` : Metals.dev 키가 있으면 Metals.dev, 없으면 Gold API 무료, 실패 시 fallback
- `metals-dev` : Metals.dev 우선, 실패하면 Gold API 무료, 그 다음 fallback
- `gold-api` : Gold API 무료 우선, 실패하면 fallback
- `mock` : 운영형 fallback 데이터만 사용

## 실행 방법

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

## 관리자 계정

- 로컬 기본 관리자 비밀번호: `gold-demo-2026`
- preview 배포 비밀번호: `0000`

## Preview 배포

현재 preview는 검색 차단 상태입니다.

- 전체 페이지 `noindex, nofollow`
- `robots.txt` 전체 차단
- `/admin` 검색 제외 유지

최종 공개 전에는 아래 항목을 실제 값으로 교체해야 합니다.

- 사업자등록번호
- 강한 관리자 비밀번호
- 실제 도메인 연결

## Cloud 작업 재개

이 repo가 Codex Cloud / 새 PC 작업 기준입니다.

```bash
git clone https://github.com/junyoung8753/kcg-site.git
cd kcg-site
npm ci
vercel link --yes --project kcg-confirm-preview
vercel pull --yes
npm run lint
npm run typecheck
npm run audit:site
npm run build
npm audit --audit-level=moderate
```

주의:

- `.env*`, `.vercel`, 관리자 비밀번호, Supabase service role key는 git에 올리지 않습니다.
- production alias 변경 전에는 먼저 preview 배포로 확인합니다.
- 검색 차단 상태를 해제하거나 실제 도메인을 연결하려면 사업자등록번호, 관리자 비밀번호, 법적 안내 문구를 먼저 확정해야 합니다.
- 프로젝트 작업 규칙은 `AGENTS.md`를 우선 확인합니다.

## 검증

```bash
cmd /c npm.cmd run lint
cmd /c npm.cmd run typecheck
cmd /c npm.cmd run audit:site
cmd /c npm.cmd run build
cmd /c npm.cmd audit --audit-level=moderate
```

헬스 체크:

- `/api/health`

현재 `/api/health`에는 아래 상태가 포함됩니다.

- `marketProvider`
- `marketSourceName`
- `marketSourceTier`
- `marketStatus`
- `marketDisplayMode`
- `marketUpgradeReadyProvider`
- `marketUpdatedAt`
- `marketIsStale`
- `marketStaleMinutes`
- `headlineSource`

사이트 복원/시각 QA 체크:

- `npm run audit:site`는 캠페인 이미지, 모바일 헤더 CTA, 모바일 하단 CTA, 서비스 문구, 시세표 핵심 문구가 코드에서 빠지지 않았는지 확인합니다.
- 렌더링된 페이지까지 함께 확인하려면 로컬 서버 실행 후 PowerShell에서 `$env:SITE_AUDIT_URL="http://localhost:3000"; npm run audit:site`를 실행합니다.
- 시각 변경 후에는 모바일 `/` 스크린샷과 데스크톱 주요 라우트 스크린샷을 함께 확인합니다.

## 현재 상태 메모

- 대표자명은 `홍연호`, 운영시간은 `평일 09:00 - 18:30` 기준으로 반영했습니다.
- 사업자등록번호는 확인 전까지 placeholder 상태로 유지합니다.
- 법적 정보는 확정 문서가 들어오기 전까지 운영 안내 중심 문구로 유지합니다.
- 회사 시세표를 외부 API가 자동으로 덮어쓰지 않도록 분리 설계되어 있습니다.
- Metals.dev 키가 나중에 추가되면 별도 코드 수정 없이 더 풍부한 실시간 참고 시세로 자동 승격됩니다.
