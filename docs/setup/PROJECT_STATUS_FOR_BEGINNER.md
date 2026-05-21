# KCG Project Status For Beginner

Last updated: 2026-05-21 KST.

This file is for junyoung when Git, branch, version, handoff, changelog, rollback, and open tasks feel confusing. It explains the current KCG site status in plain language.

### 지금 내가 보면 되는 것

- 현재 최신 상태를 알고 싶으면:
  - `PROJECT_STATUS_FOR_BEGINNER.md`
- 이어서 작업하고 싶으면:
  - `CURRENT_HANDOFF.md`
- 뭐가 바뀌었는지 보고 싶으면:
  - `CHANGELOG.md`
- 남은 일을 고르고 싶으면:
  - `OPEN_TASKS.md`
- 되돌리고 싶으면:
  - 이 문서의 "되돌리기 요청 문장"을 Codex에 복사해서 말하면 됨

## Current Snapshot

- 현재 공식 작업 버전: `v0.2.76`
- 최신 변경 제목: `Post-v0.2.75 operational risk ledger`
- 이전 변경 제목: `Admin/public product catalog parity`
- 이전 변경 제목: `One-click media image replacement`
- 이전 변경 제목: `One-click admin product image replacement`
- 이전 변경 제목: `Production admin image upload proof and storage metadata fallback`
- 이전 변경 제목: `Direct signed admin image upload path`
- 이전 변경 제목: `Admin 10MB image upload and file-selection verification`
- 이전 변경 제목: `Price detail unit repetition cleanup`
- 이전 변경 제목: `Don-unit goldbar catalog and buying simplification`
- 이전 변경 제목: `Approved goldbar product image restoration`
- 이전 변경 제목: `Consumer-perspective public price wording restoration`
- 이전 변경 제목: `Public price unit repetition cleanup`
- 이전 변경 제목: `Public price wording correction`
- 이전 변경 제목: `Public zero-change price display fix`
- 이전 변경 제목: `Admin product upload selection fix`
- 이전 변경 제목: `Admin upload body limit fix`
- 이전 변경 제목: `Admin product image workflow clarity`
- 이전 변경 제목: `Admin upload and price-entry convenience fix`
- 이전 변경 제목: `Admin price desk copy and purity workflow cleanup`
- 이전 변경 제목: `Operator-friendly media replacement center`
- 이전 변경 제목: `Admin operations console and media manager rebuild`
- 이전 변경 제목: `Image frame consistency hardening`
- 이전 변경 제목: `Candidate image preview batch`
- 이전 변경 제목: `Image asset governance system`
- 그 이전 변경 제목: `Goldbar product-card weight alignment`
- 그 이전 변경 제목: `Closed-day price confirmation hardening`
- 그 이전 변경 제목: `Role-based product image recovery`
- 그 이전 변경 제목: `Source-ready goldbar image QA gate`
- 그 이전 변경 제목: `Goldbar real lineup banner restore`
- 그 이전 변경 제목: `Main banner mock image removal`
- 그 이전 변경 제목: `Product image cleanup and admin purity-rate controls`
- 그 이전 변경 제목: `Public UI wrap and token stability polish`
- 그 이전 변경 제목: `Silverbar guide and campaign banner correction`
- 현재 작업 브랜치: `codex/kcg-launch-readiness-catalog-20260427`
- 이번 작업 버전: `v0.2.76`
- 직전 버전: `v0.2.75`
- 작업 전 HEAD: `0d4d391` 이후 v0.2.29 live 보정 커밋 기준
- 백업 브랜치: `backup/pre-v0.2.4-operations-product-audit` (`v0.2.4`와 `v0.2.5` 문서 보강 전으로 크게 돌아가는 책갈피)

## 실제 사이트 반영 여부

- 이번 `v0.2.76`에서 실제 운영 페이지 화면이 새로 바뀌는 것: 없음. `v0.2.75`에서 이미 배포된 화면을 더 수정하지 않고, 운영 리스크를 문서와 source audit으로 고정했다. `/admin/products`는 상품별 사진, `/admin/media`는 배너/페이지 이미지 담당이라는 기준, raw/legacy Supabase 상품 행은 삭제하지 않고 `hidden/stale data`로 제외한다는 기준, `KCG-TODO-124` owner SQL과 production write smoke는 별도 승인 Gate라는 기준을 기록했다. 공개 `/prices`, 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값, production DB schema/data는 바꾸지 않았다.
- 이전 snapshot text: 이번 `v0.2.75`에서 실제 운영 페이지 화면이 새로 바뀌는 것: 관리자 `/admin/products` 기본 목록과 `/admin/media` 상품 요약이 고객 화면 `/products`와 같은 7개 상품/매입 기준으로 보인다. 보이는 항목은 `KCG 골드바 1돈`, `KCG 골드바 2돈`, `KCG 골드바 3돈`, `KCG 골드바 5돈`, `KCG 골드바 10돈`, `고금 주얼리 매입`, `대량 골드바 상담`이다. `KCG 골드바 1g`, `순금 카드 1g`, `14K 주얼리 매입`, `순금 기념메달`처럼 고객 화면에서 숨긴 raw/legacy 항목은 기본 관리자 상품 목록에도 나오지 않는다. 공개 `/prices`, 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다.
- 이전 snapshot text: 이번 `v0.2.74`에서 실제 운영 페이지 화면이 새로 바뀌는 것: 관리자 `/admin/media`에서 홈 배너, 상품/매입 상단, 서비스, 매장안내, 회사소개 이미지를 바꿀 때 기본 화면은 `위치 선택 -> 파일 선택 -> 이 이미지로 바로 반영` 흐름만 보인다. 이미지 이름, 대체 텍스트, 업로드 자산 재선택, 수동 연결 같은 내부/고급 필드는 `고급 정보 보기`와 `고급 연결 열기` 안에 접혀 있다. 상품별 사진은 `/admin/products`에서 `이 사진으로 바로 교체`를 쓴다. 공개 `/products`와 `/prices`, 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다.
- 이전 snapshot text: 이번 `v0.2.73`에서 실제 운영 페이지 화면이 새로 바뀌는 것: 관리자 `/admin/products`에서 상품 사진을 바꿀 때 기본 화면은 `상품 선택 -> 파일 선택 -> 이 사진으로 바로 교체` 흐름만 보인다. 업로드 자산 선택, 이미지 slug, 서브카테고리, 상품 정보 편집 같은 내부/고급 필드는 `고급 설정 열기` 안에 접혀 있다. 공개 `/products`와 `/prices`, 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다.
- 이전 snapshot text: 이번 `v0.2.72`에서 실제 운영 페이지 화면이 새로 바뀌는 것: 관리자 `/admin/products`와 `/admin/media` 이미지 업로드가 production DB에 `site_assets` 테이블이 아직 없어도 막히지 않도록, 비공개 Supabase Storage 메타데이터 fallback을 사용한다. 실제 live에서 Junyoung의 8,363,068-byte PNG가 signed URL로 업로드되고, 메타 저장/readback/cleanup까지 통과했다. DB 테이블이 나중에 적용되면 기존 DB 경로를 우선 사용한다. 공개 `/products`와 `/prices`, 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다.
- 이전 snapshot text: 이번 `v0.2.71`에서 실제 운영 페이지 화면이 새로 바뀌는 것: 관리자 `/admin/products`와 `/admin/media` 이미지 업로드가 7-8MB 파일을 Vercel Server Action 본문으로 보내지 않고, 브라우저에서 Supabase signed upload URL로 직접 올리는 구조가 된다. UI는 기존처럼 파일명/용량과 진행 상태를 보여준다. 공개 `/products`와 `/prices`, 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. Production DB 10MB 제약 적용과 실제 live write smoke는 `KCG-TODO-123` Gate로 남아 있었다.
- 이전 snapshot text: 이번 `v0.2.70`에서 실제 운영 페이지 화면이 새로 바뀌는 것: 관리자 `/admin/products`와 `/admin/media` 이미지 업로드가 `JPEG/PNG/WebP, 10MB 이하`로 보이고, 파일을 고르면 선택한 파일명과 용량이 바로 표시된다. 7-8MB급 이미지가 Next Server Action 본문 제한에서 막히지 않도록 서버 파서 한도는 `12mb`로 올렸다. 공개 `/products`와 `/prices`, 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-122`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.69`에서 실제 운영 페이지 화면이 새로 바뀌는 것: 공개 `/prices` 상세 시세표에서 `고시가 / 3.75g 기준`처럼 단위 기준이 반복되어 보이지 않는다. `3.75g 기준`은 상단 KCG 시세표 패널 한 곳에만 보이고, 상세 시세표는 `고시가`와 실제 가격만 더 간결하게 보인다. 직전 `v0.2.68`의 공개 `/products` 1·2·3·5·10돈 골드바, `고금 주얼리 매입`, B2B 상담 정리와 `내가 살 때` / `내가 팔 때`, `0.00%` 미노출은 유지한다. 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-121`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.68`에서 실제 운영 페이지 화면이 새로 바뀌는 것: 공개 `/products`는 `KCG 골드바 1돈`, `2돈`, `3돈`, `5돈`, `10돈`, `고금 주얼리 매입`, `B2B·기업` 중심으로 보인다. 골드바 제목/중량 칩/상세는 돈 단위를 우선해서 `돈`과 `g`가 중복되지 않게 하고, 공개 매입은 `고금 주얼리 매입` 하나로 합친다. `순금 돌반지`, `순금 기념 메달`, `18K 주얼리 매입`, `14K 주얼리 매입`, `백금·은 제품 매입`은 고객 화면에서 숨긴다. 직전 `v0.2.66`의 공개 시세표 `내가 살 때` / `내가 팔 때`, `3.75g 기준` 단일 표기, `0.00%` 미노출과 `v0.2.67` 승인 골드바 이미지 매핑은 유지한다. 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-120`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.67`에서 실제 운영 페이지 화면이 새로 바뀌는 것: `/products`와 골드바 상세에서 3.75g/1돈, 37.5g/10돈 상품 이미지가 승인된 KCG 골드바 1돈/10돈 실물 기준 이미지로 보인다. 직전 `v0.2.66`의 공개 시세표 `내가 살 때` / `내가 팔 때`, `3.75g 기준` 단일 표기, `0.00%` 미노출은 유지한다. 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-119`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.66`에서 실제 운영 페이지 화면이 새로 바뀌는 것: `/`와 `/prices` 공개 시세표가 소비자 기준 `내가 살 때` / `내가 팔 때` 열 제목으로 보이고, 관련 고객 안내 문구도 같은 관점을 따른다. `3.75g 기준`은 시세표 상단에 한 번만 보이고, `0.00%` zero-delta 등락 줄은 계속 숨긴다. 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-118`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.65`에서 실제 운영 페이지 화면이 새로 바뀌는 것: `/`와 `/prices` 공개 시세표에서 `3.75g 기준`은 시세표 상단에 한 번만 보이고, 행마다 `24K · 3.75g 기준`처럼 반복되지 않는다. 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-117`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.64`에서 실제 운영 페이지 화면이 새로 바뀌는 것: `/`와 `/prices` 공개 시세표에서 `내가 살 때`/`내가 팔 때` 문구가 보이지 않고, 열 제목은 `살 때`/`팔 때`로 보인다. 변동 없는 가격 셀 아래에는 fallback 보조문구가 나오지 않는다. 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-116`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.63`에서 실제 운영 페이지 화면이 새로 바뀌는 것: `/`와 `/prices` 공개 시세표에서 변동 없는 기준 이력이 `0.00% — 0` 또는 `0.00% - 0`처럼 보이지 않는다. 실제 가격값, 가격 산식 의미, Supabase 가격 행, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-115`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.62`에서 실제 운영 페이지 화면이 새로 바뀌는 것: `/admin/products`에서 1돈 상품 화면으로 들어가 업로드하면 로그인 후에도 1돈 상품 선택이 유지되고, 업로드 성공 후 방금 올린 이미지가 업로드 이미지 선택값으로 보인다. 고객 화면 반영은 여전히 관리자가 `상품 사진 저장`을 눌러야 완료된다. 가격값, 가격 산식 의미, public 상품 이미지, 결제/장바구니, 실시간 거래, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-114`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.61`에서 실제 운영 페이지 화면이 새로 바뀌는 것: 없음. `/admin/products`에서 1MB를 넘는 정상 상품 이미지가 Next Server Action 기본 제한에 막히던 업로드 처리 한도를 고쳤다. 관리자가 보는 업로드 화면은 그대로이고, `JPEG/PNG/WebP, 5MB 이하` 정책에 맞게 Server Action body limit을 `6mb`로 맞췄다. 가격값, 가격 산식 의미, public 상품 이미지, 결제/장바구니, 실시간 거래, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-113`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.60`에서 실제 운영 페이지 화면이 새로 바뀌는 것: `/admin/products`에서 상품 이미지 교체가 `대표 이미지 바꾸기 -> 1. 새 이미지 올리기 -> 2. 대표 이미지 선택/저장` 순서로 보인다. 업로드나 저장 후에도 작업하던 상품으로 돌아오고, 상품명/가격/노출 같은 고급 수정 영역은 접혀 있어 이미지 교체만 할 때 덜 헷갈린다. 가격값, 가격 산식 의미, public 상품 이미지, 결제/장바구니, 실시간 거래, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-112`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.59`에서 실제 운영 페이지 화면이 새로 바뀌는 것: `/admin/media`와 `/admin/products`의 이미지 업로드가 별도 승인 대기 흐름이 아니라 바로 사용 가능한 운영자 업로드 흐름으로 보인다. 업로드 전 `site-assets` Storage bucket을 서버에서 확인·생성·보정하고, `/admin/prices` 직접 입력 화면은 가격 셀과 비고/이력 영역을 줄여 더 한눈에 들어온다. 저장 완료 뒤에도 이탈 경고가 남는 문제도 줄였다. 가격값, 가격 산식 의미, 결제/장바구니, 실시간 거래, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-111`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.58`에서 실제 운영 페이지 화면이 새로 바뀌는 것: `/admin/prices` 자동시세 ON/OFF 영역이 짧고 직관적인 토글 중심으로 바뀐다. 직접 입력 화면에서는 `18K/14K 자동 계산`과 `24K 팔 때 기준 환산 계수`가 같은 블록에 보여서 순금 팔 때 입력, 18K/14K 자동 채우기, 계수 저장을 한자리에서 처리한다. 가격값, 가격 산식 의미, 결제/장바구니, 실시간 거래, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-110`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.57`에서 실제 운영 페이지 화면이 새로 바뀌는 것: `/admin/media`가 내부 manifest 입력 화면이 아니라 `이미지 교체 센터`로 보인다. 운영자는 홈 배너, 상품 이미지, 서비스 이미지, 매장안내 이미지, 회사소개 이미지, 공지 썸네일을 고르고 현재 preview/status를 본 뒤 `이미지 교체` 또는 `이미지 추가`를 누르는 흐름으로 쓴다. 기본 화면에서는 `asset_id`, `A1/A2/A3`, `approval_status`, `allowed_usage`, `sku_match`, checksum, storage path 같은 내부 값을 숨기고, 필요한 경우 `고급 정보 보기`에서만 확인한다. `/admin/products`도 상품별 thumbnail, 이미지 상태, `이미지 교체` 업로드/선택 흐름을 제공한다. 가격값, 가격 산식 의미, 결제/장바구니, 실시간 거래, 검색 노출 상태, DNS, 인증/비밀값, candidate 자동 승인, locked goldbar SKU 이미지 path/hash는 바꾸지 않았다. `KCG-TODO-109`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.56`에서 실제 운영 페이지 화면이 새로 바뀌는 것: `/admin/prices`, `/admin/products`, `/admin/media`, `/admin/announcements`가 매일 운영 콘솔처럼 보이도록 바뀐다. 저장 중/저장됨/실패 상태와 이탈 방지 guard가 생기고, 상품/공지 편집은 목록+선택 편집 패널로 바뀌며, 미디어 업로드와 운영 연결은 approved 자산 기준으로 분리된다. 공개 hero route는 approved 슬롯이 없으면 기존 승인 fallback 이미지를 계속 쓴다. 가격값, 가격 산식 의미, 결제/장바구니, 실시간 거래, 검색 노출 상태, DNS, 인증/비밀값은 바꾸지 않았다. `KCG-TODO-108`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.55`에서 실제 운영 페이지 화면이 새로 바뀌는 것: `/products` 상품 카드와 상품 상세의 `이미지 준비중` placeholder가 실제 이미지와 같은 이미지 칸을 유지하고, `/products`, `/services`, `/about`, `/company` 상단 이미지 칸 높이가 같은 체계로 정렬된다. active 이미지 파일, 후보/approved 상태, 가격, 은 시세표, 결제/장바구니, 검색 노출 상태는 바꾸지 않았다. `KCG-TODO-107`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.54`에서 실제 운영 페이지 화면이 새로 바뀌는 것: 없음. 홈 hero 확장, 서비스, 매장안내, 회사소개 대체 후보 이미지를 `public/assets/generated/candidates/` 아래에 만들고 preview/report만 작성했다. 후보는 `approval_status: candidate`, `allowed_usage: candidate_preview`이며 사람이 승인하기 전에는 `approved` 승격이나 운영 페이지 연결을 하지 않는다. 가격, 은 시세표, 결제/장바구니, 검색 노출 상태는 바꾸지 않았다. `KCG-TODO-106`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.53`에서 실제 사이트 화면이 새로 바뀌는 것: 홈 campaign이 승인 골드바 라인업, 상담, 매장 3장 자동 슬라이드로 복구되고, `/services`, `/about`, `/company` hero 이미지가 섹션 목적에 맞는 기존 이미지로 돌아간다. 승인 자산이 없는 개별 상품은 `이미지 준비중` placeholder를 표시한다. 가격, 은 시세표, 결제/장바구니, 검색 노출 상태는 바꾸지 않았다. `KCG-TODO-105`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.52`에서 실제 사이트 화면이 새로 바뀌는 것: `/products`의 1g/3.75g/10g/37.5g/100g 골드바 카드와 상세가 각각 KCG real-photo product 컷으로 보이고, 카드 줄 높이와 가격 패널 정렬이 안정화된다. 대량 골드바 상담은 라인업 상담 이미지로 남긴다. 가격, 은 시세표, 결제/장바구니, 검색 노출 상태는 바꾸지 않았다. `KCG-TODO-104`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.51`에서 실제 사이트 화면이 새로 바뀌는 것: 주말·공휴일·회사 휴무일·영업시간 외에는 화면 금액이 거래 확정가로 오해되지 않도록 `/`, `/prices`, `/products`, 상품 상세, `/admin/prices`의 고시/참고가 상태와 운영자 응대 패널이 보강된다. 회사 고시 시세 값, 은 시세표, 운영 DB 저장값, noindex/search 차단, 결제/장바구니/실시간 거래는 바꾸지 않았다.
- 이전 snapshot text: 이번 `v0.2.50`에서 실제 사이트 화면이 새로 바뀌는 것: `/products`의 상품 카드와 상세가 역할 기반 이미지 정책으로 다시 채워졌다. 정확한 실물 기준 골드바는 exact crop을 쓰고, 대량 골드바는 라인업 상담 이미지, 순금/매입/B2B는 카테고리 상담 이미지를 쓴다.
- 이전 snapshot text: 이번 `v0.2.48`에서 실제 사이트 화면이 새로 바뀌는 것: 홈 첫 배너가 `kcg-approved-goldbar-lineup-reflection-20260517.jpg` source-ready 라인업으로 보이고, `/products` 상단과 1돈·2돈·3돈·5돈·10돈 guide는 `kcg-approved-*` source-ready crop으로 보인다. AI로 새 각인·문양·중량을 만들지 않았고, 2돈/3돈처럼 visual과 중량이 맞지 않던 예전 guide 이미지는 active UI에서 뺐다. 가격, 은 시세표, 결제/장바구니, 검색 노출 상태는 바꾸지 않았다. `KCG-TODO-100`에 기록한다.
- 이전 snapshot text: 이번 `v0.2.47`에서 실제 사이트 화면이 새로 바뀌는 것: 홈 첫 배너가 KCG 골드바 1돈·2돈·3돈·5돈·10돈 완성형 라인업 배너 `kcg-real-goldbar-promo-banner-20260513.webp`로 돌아오고, `/products` 상단 이미지는 `kcg-real-photo-goldbar-lineup-20260514.jpg` 실물 라인업 사진으로 보인다. 싸구려 목업·실버바·금은 혼합·손바닥 강조·AI/generated 목업 배너는 계속 active UI에서 막는다. TradingView 외부 위젯이 네트워크 문제로 안 뜰 때도 명시 fallback이 검증되도록 테스트를 보강했다. 가격, 상품 카드/상세 골드바 이미지, 은 시세표, 결제/장바구니, 검색 노출 상태는 바꾸지 않았다. `KCG-TODO-099`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.46`에서 실제 사이트 화면이 새로 바뀌는 것: Junyoung이 거절한 메인 배너의 가짜 목업처럼 보이는 골드바/실버바 계열 이미지가 홈 main campaign, `/products` hero/promo, social image, admin 추천 이미지에서 빠진다. 홈 배너는 기존 매장/고금 상담/주얼리 트레이/순금 상담 이미지로 교체했고, 거절된 `kcg-real-photo-goldbar-products-banner-20260514.jpg`, `kcg-real-photo-goldbar-price-banner-20260514.jpg`, `kcg-real-photo-goldbar-opening-banner-20260514.jpg`는 served `public/campaign` 밖으로 격리했다. 가격, 상품 카드/상세 골드바 이미지, 은 시세표, 결제/장바구니, 검색 노출 상태는 바꾸지 않았다. `KCG-TODO-098`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.45`에서 실제 사이트 화면이 새로 바뀌는 것: `/products`의 hero/promo, 골드바 상품 카드/상세 이미지, 1돈·2돈·3돈·5돈·10돈 가이드 이미지가 `kcg-real-photo-goldbar-*-20260514.jpg` 실물 기반 파생 이미지로 보인다. 실버바 tab/card/guide/detail은 별도 승인 전까지 고객 화면에서 숨기고, `/admin/prices`에는 18K/14K 계수를 24K 기준으로 수정·저장·미리보기하는 패널이 보인다. 운영 DB 저장값, 은 시세표, 결제/장바구니, 검색 노출 상태는 바꾸지 않았다. `KCG-TODO-097`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.44`에서 실제 사이트 화면이 새로 바뀌는 것: 전화번호, 짧은 CTA, `/products` 제목, 1/2/3/5/10돈 안내 문구, 상품/서비스/회사/상담 도우미 버튼 같은 작은 텍스트들이 모바일과 데스크톱에서 덜 어색하게 줄바꿈된다. `kcg-number-token`, `kcg-action-token`으로 전화번호와 짧은 액션 문구를 안정화했고, Playwright 테스트에 public route 토큰 줄바꿈/가로 overflow 회귀 검사를 넣었다. 가격, 상품 이미지, 결제/장바구니, 검색 노출 상태는 바꾸지 않았다. `KCG-TODO-096`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.43`에서 실제 사이트 화면이 새로 바뀌는 것: 홈 첫 3개 배너가 `kcg-gold-silver-premium-banner-20260513.webp`, `kcg-price-desk-gold-silver-banner-20260513.webp`, `kcg-opening-premium-banner-20260513.webp`로 보이고, `/products` hero/promo는 `kcg-products-gold-silver-consult-banner-20260513.webp`로 보인다. `/products`에는 실버바 1돈·2돈·3돈·5돈·10돈 상담 단위 가이드가 추가되고, 기존 실버바 100g·500g·1kg 상품은 `kcg-silverbar-frontback-100g-20260513.webp`, `kcg-silverbar-frontback-500g-20260513.webp`, `kcg-silverbar-frontback-1kg-20260513.webp`로 보인다. 1/2/3/5/10돈 실버바는 이번 작업에서 실제 판매 SKU로 새로 확정한 것이 아니라 상담 단위 guide다. `KCG-TODO-095`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.42`에서 실제 사이트 화면이 새로 바뀌는 것: `/products`의 골드바 상품 카드와 골드바 상세 화면에서 1g·3.75g·10g·37.5g·100g이 각각 KCG 실물 골드바 앞면/뒷면 느낌의 흰 배경 상품컷으로 보인다. 적용 파일은 `kcg-real-goldbar-frontback-1g-20260513.webp`, `kcg-real-goldbar-frontback-3-75g-20260513.webp`, `kcg-real-goldbar-frontback-10g-20260513.webp`, `kcg-real-goldbar-frontback-37-5g-20260513.webp`, `kcg-real-goldbar-frontback-100g-20260513.webp`다. 고객 화면의 `상담용 대표 이미지` 배지와 `사이트용으로 최적화한 파생 이미지` 안내 문구도 사라진다. 가격·수급·재고·보증은 여전히 회사 고시 시세와 상담 기준으로 안내한다. `KCG-TODO-094`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.41`에서 실제 사이트 화면이 새로 바뀌는 것: `/prices`의 `국제 현재가(출처: Gold API · 참고용)` 영역에서 `국내 환산` 3.75g 원화 표가 사라지고, 대신 국제 현재가와 환율은 참고용이며 실제 거래 금액은 KCG 회사 고시 시세표와 상담 기준이라는 안내 패널이 보인다. 홈의 USD/KRW 요약 caption도 `국내 환산 기준`이 아니라 `시장 참고 환율`로 보인다. `KCG-TODO-093`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.40`에서 실제 사이트 화면이 새로 바뀌는 것: `/admin/prices` 직접 입력 표 위에 `24K 기준 계산` helper가 보인다. 24K `내가 팔 때` 값을 바꾸면 기존 설정 산식으로 18K/14K `내가 팔 때` 값이 자동으로 채워지고, 저장 시 서버에서도 같은 산식이 다시 적용된다. 버튼 클릭 후 오래 기다리는 문제의 원인이던 Supabase price history baseline과 가격 저장 흐름은 항목별 순차 요청을 batch/parallel 처리로 줄였다. 실제 공개 가격은 관리자가 저장 버튼을 누를 때만 바뀐다. `KCG-TODO-092`에 기록했다.
- Historical previous change title retained for audit continuity: `KCG studio goldbar product/banner images`.
- 이전 snapshot text: 이번 `v0.2.39`에서 실제 사이트 화면이 새로 바뀌는 것: `/products`의 1돈·2돈·3돈·5돈·10돈 guide 이미지와 3.75g/1돈, 37.5g/10돈 상품 이미지가 한 세트처럼 보이는 KCG 실물 파생 스튜디오 상품컷으로 바뀐다. 홈/상품 홍보 배너도 `kcg-real-goldbar-promo-banner-20260513.webp`로 보이고, `/products` hero는 `kcg-real-goldbar-don-lineup-studio-v2-20260513.webp`로 보인다. 각 돈 단위 guide는 `kcg-real-goldbar-1don-studio-20260513.webp`, `kcg-real-goldbar-2don-studio-20260513.webp`, `kcg-real-goldbar-3don-studio-20260513.webp`, `kcg-real-goldbar-5don-studio-20260513.webp`, `kcg-real-goldbar-10don-studio-20260513.webp`를 쓴다. 원본 파일명은 public에 그대로 넣지 않았고, 이미지가 가격·재고·보증서 증거라는 뜻도 아니다. `KCG-TODO-091`에 기록했다.
- Historical previous change title retained for audit continuity: `Product catalog merch polish`.
- 이전 snapshot text: 이번 `v0.2.38`에서 실제 사이트 화면이 새로 바뀌는 것: `/products` 상품 카드와 상품 상세가 단순 목록이 아니라 쇼핑몰 상품 검토 화면처럼 보이도록 바뀐다. 큰 상품 이미지 무대, `중량`, `999.9 FINE GOLD`, 상담 상태 칩, 더 강조된 `현재 고시가 기준 참고가`, `전화 상담` CTA가 보인다. 결제·장바구니·즉시구매·실시간 거래는 추가하지 않았다. `KCG-TODO-090`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.37`에서 실제 사이트 화면이 새로 바뀌는 것: `/products`와 상품 상세에서 1g/10g/100g 골드바가 라인업·홍보 배너 같은 다른 중량 이미지를 빌려 쓰지 않고, 각각 `kcg-ai-goldbar-1g-representative-20260512.webp`, `kcg-ai-goldbar-10g-representative-20260512.webp`, `kcg-ai-goldbar-100g-representative-20260512.webp`로 보인다. 3.75g/1돈은 `kcg-real-goldbar-1don-20260511.webp`, 37.5g/10돈은 `kcg-real-goldbar-10don-20260511.webp`로 유지한다. `KCG-TODO-089`과 `docs/brand/kcg-ai-goldbar-product-assets-2026-05-11.md`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.36`에서 실제 사이트 화면이 새로 바뀌는 것: 손바닥 위에 골드바를 올린 컷은 홈/회사/1g 상품 대표 이미지에서 빠지고, 홈 두 번째 slide와 `/company` hero는 `kcg-real-goldbar-price-desk-20260511.webp`로 보인다. 1g 골드바 대표 이미지는 손 없는 `kcg-ai-goldbar-tray-20260511.webp`로 보인다. 홈 첫 배너는 `kcg-real-goldbar-promo-banner-20260511-v2.webp`, `/products` hero와 1/2/3/5/10돈 가이드는 KCG 실물 골드바 파생 이미지로 유지한다. `KCG-TODO-088`과 `docs/brand/kcg-real-goldbar-product-assets-2026-05-11.md`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.35`에서 실제 사이트 화면이 새로 바뀌는 것: 홈 첫 배너와 social image가 실제 KCG 골드바 라인업 파생 이미지 `kcg-real-goldbar-promo-banner-20260511-v2.webp`로 보이고, 홈/회사 상담 이미지는 손 위에 놓인 실제 KCG 골드바 컷 `kcg-real-goldbar-hand-consultation-20260511-v2.webp`로 보였다. 이번 `v0.2.36`에서 손바닥 컷은 현재 core UI active surface에서 제외됐다. `/products` hero와 1/2/3/5/10돈 가이드에는 각각 KCG 실물 골드바 파생 이미지가 들어간다. 3.75g/1돈과 37.5g/10돈 상품 카드는 해당 중량 이미지로 보이고, 10g/100g은 exact photo가 없어 상담/라인업 대표 이미지로 유지한다. `KCG-TODO-087`과 `docs/brand/kcg-real-goldbar-product-assets-2026-05-11.md`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.34`에서 실제 사이트 화면이 새로 바뀌는 것: `/products` hero가 텍스트 없는 골드바 돈 단위 라인업 이미지로 보이고, 상품 목록 위에 `1돈=3.75g`, `2돈=7.5g`, `3돈=11.25g`, `5돈=18.75g`, `10돈=37.5g` 상담 가이드가 보인다. 골드바 상품 카드와 상세 대표 이미지는 상품명과 다른 박힌 중량 문자를 피하도록 새 AI 대표 이미지로 보인다. `KCG-TODO-086`과 `docs/brand/kcg-ai-goldbar-product-assets-2026-05-11.md`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.33`에서 실제 사이트 화면이 새로 바뀌는 것: `/products` 상품 카드에 상담 참고가 caveat와 `참고가 낮은순/높은순` 정렬 라벨이 보이고, `/about` 모바일 첫 화면에 네이버 지도·카카오맵·본사 전화 CTA가 바로 보인다. `/admin/login`은 로그인 전 admin shell 없이 로그인 카드가 먼저 보이고, `/admin/launch`는 최종 상품 가격·공임·이미지 final-use·최종 관리자 비밀번호 rotation·Vercel/Supabase 소유권 이전 같은 user-only blocker를 별도로 보여준다. `/admin/prices`는 자동시세 OFF가 오래된 수동 시세 때문에 자동으로 켜지지 않고 경고만 남긴다는 운영 문구를 보여준다. `KCG-TODO-085`와 `docs/setup/QA_DEEPQA_2026-05-11.md`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.32`에서 source 기준 실제 사이트 화면이 새로 바뀌는 것: 홈 첫 배너/상담 slide/opening slide, `/products` hero/promo, 골드바 상품 카드/상세 대표 이미지, `/company` 상담 이미지가 KCG 실제 로고/골드바 파생 이미지와 새 상담 손동작 이미지로 보인다. 핵심 파일은 `kcg-real-goldbar-price-desk-20260511.webp`, `kcg-real-goldbar-lineup-20260511.webp`, `kcg-korean-consultation-hands-20260511.webp`다. 원본 KakaoTalk 파일은 public에 그대로 넣지 않았고, 이미지는 계속 `상담용 대표 이미지`이며 실제 재고·가격·보증·인증서 증거가 아니다. `KCG-TODO-084`와 `docs/brand/kcg-real-image-assets-2026-05-11.md`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.31`에서 source 기준 실제 사이트 화면이 새로 바뀌는 것: 없음. Junyoung이 지정한 현재 KCG 이미지 폴더 `C:\Users\junyo\Documents\File-Hub\80_보관\사진_영상\Images\KCG 이미지`를 기준으로 image intake 문서와 raw KakaoTalk filename audit guardrail을 맞춘 QA 작업이다. `KCG-TODO-083`에 완료 기록이 있다.
- 이전 snapshot text: 이번 `v0.2.30`에서 source 기준 실제 사이트 화면이 새로 바뀌는 것: `/admin/prices` 직접 입력표가 고객 화면의 시세표와 같은 품목명, 순서, 살 때/팔 때 배열로 보인다. 관리자는 각 칸에서 현재 공개가, 새 입력값, 차액, 노출, 비고를 함께 보며 어떤 고객-facing 가격을 바꾸는지 알 수 있고, 가격 입력칸은 빈 값 저장을 막는 native 숫자 입력 guard를 가진다. `KCG-TODO-082`와 `QA_LAUNCH_REVIEW_2026-05-08.md`에 기록했다.
- 이전 snapshot text: 이번 `v0.2.29`에서 source 기준 실제 사이트 화면이 새로 바뀌는 것(배포 후 live에서도 보이는 것): 홈 첫 배너, `/products` hero/promo, 골드바 상품 카드/상세 대표 이미지가 새 생성 WebP 3종(`kcg-generated-goldbar-banner-20260508.webp`, `kcg-generated-goldbar-lineup-20260508.webp`, `kcg-generated-goldbar-detail-20260508.webp`)으로 보인다. 기존 Supabase 상품 행의 예전 골드바 이미지 경로도 slug별 생성 이미지로 분산된다. 이미지는 계속 `상담용 대표 이미지`이고, raw KakaoTalk 원본을 복사한 것이 아니며, 실제 상품사진·포장·재고·가격 증거가 아니다. `KCG-TODO-081`에 완료 기록이 있다.
- 이전 snapshot text: 이번 `v0.2.28`에서 실제 사이트 화면이 새로 바뀌는 것: source 기준 `/products` 목록과 상품 상세 이미지에 `상담용 대표 이미지` 안내가 보인다. 실제 상품사진·포장·재고 증거로 확정하지 않았다.
- 이전 snapshot text: 이번 `v0.2.27`에서 실제 사이트 화면이 새로 바뀌는 것: 없음. 현재 public product image 사용처와 KCG 골드바 후보 파일은 `docs/brand/product-image-replacement-map-2026-05-08.md`에 승인 전 replacement map으로 정리했다. 실제 이미지는 아직 repo/public로 복사하거나 public image URL로 연결하지 않았고, 실제 상품사진으로 확정하지 않았다.
- 이전 snapshot text: 이번 `v0.2.26`에서 실제 사이트 화면이 새로 바뀌는 것: 없음. Junyoung이 제공한 `KCG 이미지` 폴더는 `docs/brand/kcg-image-intake-2026-05-08.md`에 승인 전 후보로 정리했고, raw KakaoTalk 파일이 served `public` tree 어디에도 바로 들어오지 못하도록 audit guardrail을 추가했다.
- 이번 배포에 포함되어 live에서도 보이는 이전 source 변경: `v0.2.18` 상담 도우미와 모바일 하단 고정 CTA에는 `상담` 버튼, `v0.2.20` `KCG_PUBLIC_SEARCH_APPROVED=1` 공개 승인 checklist와 `상담 기준 공임` label, `v0.2.21` 공개 승인 게이트 guard, `v0.2.22` `/admin/products`의 `이미지 성격` 구분, `v0.2.23` `/admin/launch` 운영 상태 구분(`소스 QA`, `라이브 리뷰 반영`, `공개 검색 런칭`), `v0.2.24` `/admin/products`의 `이미지 확인 필터`(`실사진 확인`, `교체 대상`, `권한 검증`, `이미지 없음`), `v0.2.25` admin products 모바일 이미지 근거, `v0.2.28` public `상담용 대표 이미지` 안내.
- 이번 배포와 별개로 아직 source/계획 기준만 남은 것: OpenAI API key, SMS 자동 발송, Kakao 공식 채널 URL, KRX/Koscom 승인·계약 경로는 준비 기준만 추가됐다.
- 배포된 것: latest live review는 `v0.2.76` 기준 `dpl_EhwBtXeXKedmAJCcP2UeBfgDkEe2`이며, `https://kcgold.co.kr`, `https://www.kcgold.co.kr`, `https://kcg-confirm-preview.vercel.app`, `https://kcg-confirm-preview-junyoung8753-2361s-projects.vercel.app`에 alias되어 있다. 이 deploy는 검색 런칭이 아니며 noindex/robots 차단은 유지된다.
- 아직 배포 안 된 것: 기존 Vercel project transfer, 기존 Supabase project transfer, final admin secret rotation, 검색 노출/noindex 해제, KRX API 승인/키/env/실제 provider 연결, 실제 상품 공임/최종 판매정책 확정, 유료 서버/API 결제는 아직 별도 작업. `v0.2.54` 후보 이미지는 candidate/report 용도이며 active UI 연결이나 approved 승격은 하지 않았다.
- 내가 고객에게 보여줘도 되는 것: noindex-protected live `kcgold.co.kr` 검토 화면. 검색 노출은 아직 차단.
- 아직 내부 기준/계획일 뿐인 것: `kcgoldx@gmail.com`으로 진행할 KRX/Koscom 승인 결과, KRX 공개·상업 표시 범위, 최종 전문 상품 촬영/재고·보증서·포장 정책, product image replacement map approval decision, 실제 상품 공임/최종 판매정책/검색 노출 승인, 회사 Vercel/Supabase 기존 프로젝트 이전 실행, 유료 서버/API가 필요할 때 회사 카드 입력, 선택적 Google Workspace/domain-mail 결제
- 이번 작업에서 건드린 범위: `v0.2.75` 이후 운영 리스크 ledger, `/admin/products`와 `/admin/media` 이미지 담당 기준, hidden/stale raw DB row 정책, `KCG-TODO-124` owner SQL 계획, production write-smoke opt-in 정책, read-only QA 기준, handoff/changelog/status/open-task 정리, `package.json`
- 절대 건드리지 않은 범위: 실제 가격값/가격 산식 의미 확정, 검색 노출/noindex 해제, 결제/장바구니, 실시간 거래, 경쟁사 시세 수집, SMS 발송, Kakao credential, OpenAI key/env 입력, Vercel env/secret 값 변경, 실제 KRX API 호출, 실제 KRX key/env 입력
- 배포 기본값: 2026-05-06 KST 기준 junyoung은 KCG 사이트 변경을 완료·검증하면 live 배포까지 진행하라고 지시했다. 단, 검색 노출/noindex 해제, 결제/장바구니/실시간 거래, secret/env 변경, 되돌리기 어려운 인프라 변경은 여전히 별도 승인 대상이다.
- 이번 검증 결과: `v0.2.76`는 로컬 `npm run audit:site` (`2674 checks, 1 skipped`), `npm run lint`, `npm run typecheck`, `npm run release:trace`, `npm audit --audit-level=moderate` (`0 vulnerabilities`), `npm run build`, `npm run test:site` (`36 passed`), `npm run screenshot:admin`, `npm run qa:site` (`2746 checks, 0 skipped`; Playwright `34 passed, 2 skipped`)를 통과했다. Live read-only 검증도 통과했다: Vercel inspect ready, release-state forced noindex, live audit `2746 checks, 0 skipped`, live Playwright `34 passed, 2 skipped`. Production write smoke는 의도적으로 실행하지 않았다.

## Easy Words

- branch = 작업 줄기
- HEAD = 현재 코드가 가리키는 기준점
- rollback = 이전 상태로 되돌리기
- backup branch = 되돌리기용 책갈피
- dirty state = 아직 저장/정리되지 않은 변경사항
- changelog = 버전별 변경 기록
- handoff = 다음 작업자가 이어받는 현재 상태 메모
- deploy = 실제 사이트에 공개 반영
- push = GitHub 원격 저장소에 올리기

## Version And Status Table

| 구분 | 이름 | 쉬운 설명 | 내가 봐야 하는 경우 |
|---|---|---|---|
| 현재 작업 버전 | `v0.2.76` | Post-v0.2.75 operational risk ledger | 이번 변경 확인 |
| 이전 버전 | `v0.2.75` | Admin/public product catalog parity | 비교/이전 상태 확인 |
| 백업 브랜치 | `backup/pre-v0.2.4-operations-product-audit` | `v0.2.4`와 `v0.2.5` 문서 보강 전으로 돌아가는 책갈피 | 크게 되돌릴 때 |
| 현재 작업 브랜치 | `codex/kcg-launch-readiness-catalog-20260427` | 지금 Codex가 작업 중인 줄기 | 상태 확인 |
| handoff | `CURRENT_HANDOFF.md` | 다음 작업자에게 넘기는 현재 상태 메모 | 이어서 작업할 때 |
| changelog | `CHANGELOG.md` | 버전별 변경 기록 | 뭐가 바뀌었는지 볼 때 |
| open tasks | `OPEN_TASKS.md` | 남은 할 일 목록 | 다음 작업 고를 때 |

## Risk Labels

| 위험도 | 뜻 |
|---|---|
| LOW | 문서 수정, 체크리스트 수정, 설명 보강 |
| MEDIUM | UI 문구 수정, 이미지 교체, 작은 화면 구성 수정 |
| HIGH | API 로직, 시세 계산, 관리자 기능, 고객 데이터, 배포 설정 |
| FORBIDDEN | 결제, 실시간 거래, 개인정보 과수집, 법률/세무 자동판단, 경쟁사 시세 수집 |

앞으로 작업은 가능하면 아래 형식으로 관리한다.

| 작업 | 위험도 | 누가 결정 | 실제 사이트 영향 | 되돌리기 쉬움 |
|---|---|---|---|---|

## 그대로 복사해서 Codex에게 말하면 되는 문장

- "현재 상태를 초보자 기준으로 요약해줘. 최신 버전, 브랜치, 백업 기준, 실제 사이트 반영 여부만 알려줘."
- "이번 변경이 실제 사이트 화면을 바꾼 건지, 문서만 바꾼 건지 알려줘."
- "내가 지금 다음에 할 수 있는 작업 3개를 위험도 낮은 순서로 추천해줘."
- "이 작업을 하기 전에 되돌릴 기준점이 있는지 확인해줘."
- "이번 변경만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "실제 사이트에 반영되는 변경인지 아닌지 먼저 구분해줘."
- "이 작업은 LOW/MEDIUM/HIGH 중 어떤 위험도인지 판단해줘."
- "배포가 필요한 작업인지, 로컬 문서만 바꾸는 작업인지 알려줘."

## 되돌리기 요청 문장

- "v0.2.76 운영 리스크 ledger 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.75 관리자 상품/공개 상품 일치 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.74 미디어 이미지 바로 교체 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.73 one-click product image replacement 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.71 direct signed admin image upload 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.70 관리자 10MB 이미지 업로드 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.60 관리자 상품 이미지 교체 흐름 개선 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.61 관리자 상품 이미지 업로드 1MB 제한 수정 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.59 관리자 업로드와 시세 입력 편의성 수정 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.58 관리자 시세 화면 간소화 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.57 관리자 이미지 교체센터 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.56 관리자 운영 콘솔 개편 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.55 이미지 프레임 정렬 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.54 후보 이미지 프리뷰 배치 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.44 공개 UI 줄바꿈 안정화 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.43 실버바 가이드와 홈 배너 교정 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.41 Gold API 국내 환산 표 제거 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.40 관리자 24K 자동계산/시세 저장 최적화 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.39 KCG 골드바 스튜디오형 상품/배너 이미지 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.38 상품 쇼케이스형 카탈로그 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.37 골드바 중량별 상품 이미지 매핑 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.36 손바닥 골드바 핵심 이미지 제거 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.35 실제 KCG 골드바 상품/배너 재작업 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.34 골드바 상품 이미지 가이드 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.33 deepQA hardening 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.32 실제 KCG 이미지 파생 적용 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.31 이미지 intake 경로 QA 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.30 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.29 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.28 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.27 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.26 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.25 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.24 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.23 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.22 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.21 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.20 전으로 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.19 Vercel 이전 기록만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.18 상담 도우미만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.17 KRX 승인 우선 guard만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.16 회사 이전 가능성/live QA 문서만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.15 회사 Vercel/Supabase CLI 전환 문서만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.14 최소 회사 계정 온보딩 모드 문서만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.13 회사 Gmail 운영/결제 이전 문서만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.12 고객/직원 흐름과 상품 이미지 다양화 수정만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.11 운영 콘솔 시간표기/가독성 수정만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.10 비주얼/인포그래픽 보강만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.9 운영형 QA 보강만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.8 관리자 토글 버그 수정과 대시보드 재정리만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.7 관리자 라이트 테마와 자동시세 UX 개선만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.6 전문가 패널 QA 화면 개선만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.5 기존 API 감사 문서 보강만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "v0.2.4 제품/업무 감리 문서 보강만 되돌리는 계획을 먼저 보여줘. 바로 실행하지는 마."
- "backup/pre-v0.2.4-operations-product-audit 기준으로 전체 되돌리는 계획을 보여줘. 바로 실행하지는 마."
- "지금 되돌릴 수 있는 기준점이 뭐야?"
- "이번 변경만 되돌리면 어떤 파일이 바뀌어?"

## 다음에 할 수 있는 작업

1. 안전한 작업
   - 문서/체크리스트/상태 정리
   - 실제 사이트 영향 없음

2. 중간 위험 작업
   - 메인 시세표 UX 점검
   - 이미지 placeholder 후보 정리
   - 문구/레이아웃 개선안 작성
   - 아직 배포 전 검토 필요

3. 높은 위험 작업
   - API 로직 변경
   - 관리자 기능 변경
   - 실제 이미지 교체
   - secret/env 변경
   - DNS/도메인 정책 변경
   - 검색 노출/noindex 해제
   - 배포 자체는 검증된 KCG 사이트 변경이면 기본 진행하되, 위 항목은 반드시 별도 승인 필요

## 하지 말아야 할 것

- 검증 전 push/deploy 하지 않음 = 테스트·감사·스크린샷 확인 없이 GitHub/실제 사이트에 올리지 않음
- 검색 노출/noindex 해제하지 않음 = junyoung의 명시 승인 전에는 robots/noindex 차단 유지
- 결제/장바구니/실시간 거래 추가 없음
- 경쟁사 이미지/카피/가격/API 데이터 사용 없음
- 외부 API 연결 추가 없음 = KRX 호출/키/env/provider parser는 아직 넣지 않음. 승인 전 provider 이름이 설정되면 fallback으로 막는 guard만 추가됨
- Supabase schema 수정 없음 = 데이터베이스 구조는 건드리지 않음
- Vercel 설정 수정 없음 = 실제 배포/도메인/환경 설정은 건드리지 않음

## 문제가 생기면 어디를 보면 되는지

- 지금 최신 상태: `docs/setup/PROJECT_STATUS_FOR_BEGINNER.md`
- 이어서 작업할 기준: `docs/setup/CURRENT_HANDOFF.md`
- 버전별 변경 기록: `docs/setup/CHANGELOG.md`
- 남은 할 일: `docs/setup/OPEN_TASKS.md`
- 되돌리기 책갈피: `backup/pre-v0.2.4-operations-product-audit`
