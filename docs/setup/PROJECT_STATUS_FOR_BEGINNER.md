# KCG Project Status For Beginner

Last updated: 2026-05-05 KST.

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

- 현재 공식 작업 버전: `v0.2.6`
- 현재 작업 브랜치: `codex/kcg-launch-readiness-catalog-20260427`
- 이번 작업 버전: `v0.2.6`
- 직전 버전: `v0.2.5`
- 작업 전 HEAD: `c161f74`
- 백업 브랜치: `backup/pre-v0.2.4-operations-product-audit` (`v0.2.4`와 `v0.2.5` 문서 보강 전으로 크게 돌아가는 책갈피)

## 실제 사이트 반영 여부

- 실제 사이트 화면이 바뀐 것: 홈 시세표 크기/간격, 국제 현재가 표 글자 가독성, 모바일 상품/서비스 첫 화면, 관리자 가격/대시보드 라벨
- 실제 사이트 화면은 아직 안 바뀌고, 문서/기준만 바뀐 것: v0.2.6 QA 점수표와 handoff/status trace
- 배포된 것: 이 문서 기준으로는 아직 최종 확인 필요. 실제 배포 여부는 Codex 최종 보고와 `npx vercel inspect https://kcgold.co.kr/`로 확인한다.
- 아직 배포 안 된 것: 커밋/배포 전 working tree에 남아 있는 `v0.2.6` 변경
- 내가 고객에게 보여줘도 되는 것: 배포 후 `kcgold.co.kr` 사이트. 검색 노출은 계속 차단.
- 아직 내부 기준/계획일 뿐인 것: 실제 상품 사진/공임/최종 판매정책/검색 노출 승인
- 이번 작업에서 건드린 범위: 공개 UI 일부, 관리자 UI 일부, QA/상태 문서, `package.json`, `package-lock.json`
- 절대 건드리지 않은 범위: 검색 노출/noindex 해제, 결제/장바구니, 실시간 거래, 경쟁사 시세 수집, Supabase schema, Vercel env/secret

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
| 현재 작업 버전 | `v0.2.6` | 전문가 패널 QA로 실제 공개/관리자 화면의 확실한 문제를 다듬는 버전 | 이번 변경 확인 |
| 이전 버전 | `v0.2.5` | 기존 API 연동 감사 문서를 추가하고 이미 연동된 API를 현재 사이트 QA 범위로 정리한 기준 보강 | 비교/이전 상태 확인 |
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
   - 배포
   - 반드시 별도 승인 필요

## 하지 말아야 할 것

- push 하지 않음 = GitHub 원격 저장소에 올리지 않음
- deploy 하지 않음 = 실제 사이트에 공개 반영하지 않음
- `src` 수정 없음 = 사이트 기능 코드는 건드리지 않음
- `public` 수정 없음 = 고객에게 보이는 이미지/파일은 바꾸지 않음
- API 로직 수정 없음 = 시세나 데이터 가져오는 작동 방식은 바꾸지 않음
- Supabase schema 수정 없음 = 데이터베이스 구조는 건드리지 않음
- Vercel 설정 수정 없음 = 실제 배포/도메인/환경 설정은 건드리지 않음

## 문제가 생기면 어디를 보면 되는지

- 지금 최신 상태: `docs/setup/PROJECT_STATUS_FOR_BEGINNER.md`
- 이어서 작업할 기준: `docs/setup/CURRENT_HANDOFF.md`
- 버전별 변경 기록: `docs/setup/CHANGELOG.md`
- 남은 할 일: `docs/setup/OPEN_TASKS.md`
- 되돌리기 책갈피: `backup/pre-v0.2.4-operations-product-audit`
