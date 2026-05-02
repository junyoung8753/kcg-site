@AGENTS.md

# Claude Code 전용 추가 지시사항

이 프로젝트는 Codex와 Claude Code를 모두 쓴다. `AGENTS.md`가 single-source-of-truth다.
Claude Code는 위 `@AGENTS.md` 임포트로 전체 규칙을 로드한다.

## Claude 전용 규칙

- 작업 시작 전 항상 `git status`로 clean한 상태 확인. 다른 도구(Codex 등)가 작업 중일 수 있음.
- 파일 대량 수정 전 plan mode 선호 (`ExitPlanMode`로 승인 후 진행).
- Checkpoints 기능으로 되돌리기 가능함을 적극 활용.

## 핵심 검증 명령 요약

- `npm run lint`
- `npm run typecheck`
- `npm run audit:site`
- `npm run build`
- `npm run test:site`
- `npm audit --audit-level=moderate`

## 시각 변경 시 필수 검증 경로

`/`, `/prices`, `/announcements`, `/services`, `/about`, `/admin/login`, `/api/health`
