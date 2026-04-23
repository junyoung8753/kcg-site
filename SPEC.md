# 한국센터금거래소 무료 자동연동 우선 + 유료 점진 전환 사양

## 목표

- 회사 상단 시세표는 **관리자 수기 입력**으로 유지한다.
- 국제 참고 시세와 국내 환산 참고 시세는 **무료 자동연동**으로 동작하게 만든다.
- 무료로 먼저 운영 가능해야 하며, 유료 공급자 연결 시 코드 수정 없이 자동 승격 가능해야 한다.
- 무료 공급자에서 제공하지 않는 데이터는 억지로 꾸며내지 않는다.
- preview 단계에서는 검색 차단을 유지한다.
- 자동 데이터는 고객 참고용으로만 정직하게 라벨링한다.
- 유료 전환은 공급자별 환경 변수 스위치 구조로 준비한다.

## 채택한 방향

### 회사 시세표
- 관리자 입력값 유지
- 외부 API가 덮어쓰지 않음

### 자동 참고 데이터
- 1순위: `Metals.dev`
- 2순위: `Gold API` 무료 실시간 현재가
- 마지막: 운영형 fallback 데이터
- 회사 시세표 외의 자동 데이터는 모두 참고용으로만 노출

### 시장 뉴스
- Google News RSS
- 실패 시 seed fallback

## 데이터 원칙

- `prices`는 회사 고시 시세
- `market-data`는 실시간 참고 시세 / 국내 환산 참고 시세 / 시장 뉴스
- 무료 공급자에서 제공하지 않는 `bid/ask`, `전일 대비`, `히스토리 차트`는 화면에서 숨기거나 설명형으로 대체한다.
- 실제 거래 금액은 항상 회사 고시 시세와 현장 확인 결과가 우선이라는 문구를 유지한다.
- `공식 기준가`, `공식 시세`, `거래 기준가`처럼 오해될 수 있는 라벨은 자동 데이터 영역에서 사용하지 않는다.

## 구현 범위

### 1. 시장 데이터 계층
- `MARKET_DATA_PROVIDER=auto` 기본
- `METALS_DEV_API_KEY`가 있으면 Metals.dev 사용
- 없으면 Gold API 무료 사용
- Gold API도 실패하면 mock fallback

### 2. 대시보드 표현
- 공급자별 표시 차등
  - Metals.dev: 현재가 + bid/ask + 변동률
  - Gold API 무료: 현재가 중심
  - Mock: 운영형 fallback
- 없는 데이터는 가짜로 보이지 않게 정직하게 표시

### 3. 헬스 체크
- `/api/health`에 `marketProvider`, `marketSourceName`, `marketSourceTier`, `marketStatus`, `marketDisplayMode`, `marketUpgradeReadyProvider`, `marketUpdatedAt`, `headlineSource`, `marketIsStale`, `marketStaleMinutes` 추가

### 4. 문서 정리
- README, SPEC, TODO를 현재 구조로 갱신

## 운영 환경 변수

```bash
MARKET_DATA_PROVIDER=auto
METALS_DEV_API_KEY=
MARKET_DATA_REVALIDATE_SECONDS=60
```

## 완료 기준

- 키가 없어도 메인과 시세 페이지에서 무료 실시간 참고 시세가 보인다.
- 키가 생기면 Metals.dev로 자동 승격된다.
- 회사 시세표는 여전히 관리자 수기 입력 기준이다.
- 고객이 자동 데이터를 회사 거래 기준으로 오해하지 않게 표현된다.
- stale 상태와 공급자 메타가 동작한다.
- `lint`, `typecheck`, `build`가 통과한다.
- preview 재배포 후 `/api/health`에서 공급자 상태를 확인할 수 있다.
