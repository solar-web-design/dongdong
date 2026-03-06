# 보안 감사 보고서 - 동동 (동문 SNS 플랫폼)

**감사일**: 2026-03-07
**대상**: Phase 1 백엔드 + 프론트엔드 전체 코드
**감사자**: Security Agent

---

## 총점: 42 → 85 / 100 (수정 후)

> 1차 감사 + 2차 전체 모듈 검토 완료
> 수정 완료: C1~C4, H1~H4, H7~H8, M2, M4~M6
> 잔여 권장: H5(현재 안전), H6(Phase 2), M3(UX 트레이드오프), L1~L3

---

## [CRITICAL] 발견 사항 - 모두 수정 완료

### C1. JWT 시크릿 하드코딩 폴백값 [FIXED]
- **위치**: `auth.service.ts`, `jwt.strategy.ts`
- **설명**: `'dev-secret'` 폴백값 → 환경변수 미설정 시 토큰 위조 가능
- **수정**: 폴백값 제거, 환경변수 필수화 + 부재 시 서버 시작 차단

### C2. CORS 무제한 [FIXED]
- **위치**: `main.ts`
- **수정**: `origin: process.env.CORS_ORIGIN` + `credentials: true`

### C3. ValidationPipe 불완전 [FIXED]
- **위치**: `main.ts`
- **수정**: `forbidNonWhitelisted: true` 추가 → 허용되지 않은 필드 요청 시 400 에러

### C4. Refresh Token 평문 DB 저장 [FIXED]
- **위치**: `auth.service.ts`
- **수정**: `bcrypt.hash()` 후 저장, `bcrypt.compare()`로 검증

---

## [HIGH] 발견 사항

### H1. Rate Limiting 미적용 [FIXED]
- **수정**: `@nestjs/throttler` 글로벌 적용 (20회/분, 100회/10분)

### H2. Helmet 미적용 [FIXED]
- **수정**: `helmet()` 미들웨어로 보안 헤더 자동 적용

### H3. Register DTO Spread 오염 [FIXED]
- **수정**: `auth.service.ts`에서 명시적 필드만 Prisma에 전달

### H4. SUSPENDED 상태 JWT 유효 [FIXED]
- **수정**: `jwt.strategy.ts`에서 SUSPENDED 상태 거부

### H5. 프론트엔드 XSS - 에러 메시지 렌더링
- **상태**: PASS (React 자동 이스케이프, dangerouslySetInnerHTML 미사용)

### H6. localStorage 토큰 저장
- **상태**: 잔여 (Phase 2에서 httpOnly cookie 전환 권장)

### H7. Meetings - 권한 검증 없음 [FIXED]
- **위치**: `meetings.controller.ts`
- **설명**: 인증만 되면 누구나 모임 생성/수정/삭제 가능
- **수정**: `@Roles()` 데코레이터로 PRESIDENT/VICE_PRESIDENT/TREASURER 제한

### H8. ChangeRole - PRESIDENT 부여 가능 [FIXED]
- **위치**: `users.service.ts`
- **설명**: 회장이 다른 사용자를 회장으로 변경 가능 (복수 회장 생성)
- **수정**: PRESIDENT 역할 부여 차단

---

## [MEDIUM] 발견 사항

### M1. .env DB URL 인라인 credential
- **상태**: .gitignore에 포함됨 (PASS), `.env.example` 생성 완료

### M2. 비밀번호 정책 미흡 [FIXED]
- **수정**: 대소문자+숫자+특수문자 필수, 72자 상한 (bcrypt 제한)

### M3. 이메일 열거 공격 가능
- **상태**: 잔여 (UX vs 보안 트레이드오프, 현재 수준 유지)

### M4. 콘텐츠 길이 제한 없음 [FIXED]
- **위치**: 전체 DTO
- **설명**: title/content에 MaxLength 미적용 → 대용량 페이로드 DoS 가능
- **수정**: Post title 200자, content 10000자, Comment 2000자, Meeting 제목 200자 등

### M5. Images 배열 URL 미검증 [FIXED]
- **위치**: `create-post.dto.ts`
- **수정**: `@IsUrl()`, `@ArrayMaxSize(10)` 적용

### M6. AppModule 빈 상태 [RESOLVED]
- **상태**: 다른 Agent가 모듈 등록 완료

---

## [LOW] 발견 사항

### L1. Access Token 만료 시간 [FIXED]
- 1시간 → 30분으로 단축

### L2. Prisma 에러 노출 가능성
- **상태**: 잔여 (글로벌 ExceptionFilter 추가 권장)

### L3. CSP 미설정
- **상태**: 잔여 (Phase 2 권장)

---

## PASS 항목

| 항목 | 상태 |
|------|------|
| 비밀번호 bcrypt 해싱 (cost=12) | PASS |
| Prisma ORM (SQL Injection 방지) | PASS |
| JWT Bearer Token + Refresh 로테이션 | PASS |
| 로그인 응답에서 password/refreshToken 제외 | PASS |
| class-validator DTO + ValidationPipe whitelist | PASS |
| RBAC 가드 (RolesGuard) 전 컨트롤러 적용 | PASS |
| UUID 기반 ID (열거 방지) | PASS |
| .env .gitignore 포함 | PASS |
| React 자동 XSS 이스케이프 | PASS |
| 로그아웃 시 refreshToken 무효화 | PASS |
| 게시글/댓글/공지 소유권 검증 | PASS |
| 사용자 조회 시 민감 정보 제외 (USER_SELECT) | PASS |
| 가입 승인 흐름 (PENDING → PRESIDENT 승인) | PASS |
| 대댓글 부모 댓글 소속 검증 | PASS |
| 모임 RSVP 최대 인원 검증 | PASS |

---

## 수정된 파일 총 목록

| 파일 | 수정 내용 |
|------|-----------|
| `main.ts` | Helmet, CORS origin 제한, ValidationPipe forbidNonWhitelisted |
| `app.module.ts` | ThrottlerModule (Rate Limiting) |
| `auth.service.ts` | JWT 시크릿 필수화, 명시적 필드, refreshToken 해시, 만료 30분 |
| `jwt.strategy.ts` | 시크릿 필수화, SUSPENDED 차단 |
| `register.dto.ts` | 비밀번호 복잡성 + 최대 길이 |
| `create-post.dto.ts` | MaxLength, URL 검증, 배열 크기 제한 |
| `create-announcement.dto.ts` | MaxLength |
| `create-meeting.dto.ts` | MaxLength |
| `create-comment.dto.ts` | MaxLength |
| `meetings.controller.ts` | Roles 데코레이터 추가 |
| `users.service.ts` | PRESIDENT 역할 부여 방지 |
| `package.json` | helmet, @nestjs/throttler 의존성 |
| `shared/.env.example` | 환경변수 템플릿 |

---
