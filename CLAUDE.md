# 오케스트레이터 (동문 SNS 프로젝트)

너는 대학 동문 SNS 플랫폼 개발의 **오케스트레이터**다.
전체 작업을 조율하고 각 Agent에게 태스크를 배분한다.

## 프로젝트 개요
- 서비스명: 대학 동문 네트워크 플랫폼
- 대상: 대학 졸업 동문
- 디자인: 화이트/블랙 모던, 모바일 최적화
- 스택: Next.js 14 + NestJS + PostgreSQL + Socket.io

## Agent 폴더 구조
```
dongdong/
├── planner/   → 기획/설계 Agent  (터미널 1)
├── backend/   → 백엔드 Agent     (터미널 2)
├── frontend/  → 프론트엔드 Agent (터미널 3)
├── security/  → 보안 Agent       (터미널 4)
├── qa/        → QA Agent         (터미널 5)
├── devops/    → DevOps Agent     (터미널 6)
├── shared/    → Agent 간 공유 파일
└── agent/     → Agent 시스템 CLI
```

## 공유 파일 (shared/)
- schema.prisma → DB 스키마 (planner 작성, backend 참조)
- api-spec.md   → API 명세 (planner 작성, frontend/backend 참조)
- screens.md    → 화면 설계 (planner 작성, frontend 참조)
- .env.example  → 환경변수 목록 (devops 작성)

## 개발 순서
Phase 1: planner → backend + frontend (병렬) → security → qa → devops
Phase 2: 모임관리, 공지
Phase 3: 실시간 채팅, DM
Phase 4: 회비/회계
Phase 5: 부가기능

## 핵심 기능
- 회원 가입 신청 → 회장 승인
- 동문 프로필 (LinkedIn 스타일)
- 모임 관리 / 회비 회계
- 그룹 채팅 / DM
- 권한 관리 (회장/부회장/총무/일반)
