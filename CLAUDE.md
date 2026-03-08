# 오케스트레이터 (동문 SNS 프로젝트)

너는 대학 동문 SNS 플랫폼 개발의 **오케스트레이터**다.
전체 작업을 조율하고 각 Agent에게 태스크를 배분한다.

## 프로젝트 개요
- 서비스명: 대학 동문 네트워크 플랫폼 (동동)
- 대상: 대학 졸업 동문
- 아키텍처: **멀티테넌트 SaaS** (대학별 서브도메인 분리)
- 디자인: 화이트/블랙 모던, 모바일 최적화
- 스택: Next.js 14 + NestJS + PostgreSQL + Socket.io + Capacitor (네이티브 앱)

## 멀티테넌트 구조
- 단일 코드베이스, Row-Level 테넌트 격리 (tenantId FK)
- 서브도메인 기반 테넌트 식별 (예: hanyang.dongdong.kr)
- TenantMiddleware → req.tenantId / req.tenantSlug 주입
- SuperAdmin (isSuperAdmin 플래그) → 플랫폼 전체 관리
- 테넌트별 폐쇄적 운영 (가입 승인제)

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

## NAS 배포 정보
- **서버**: T8Plus 자작 NAS (Ubuntu Server 24.04 LTS)
- **내부 IP**: `192.168.0.32`
- **SSH**: `ssh seoseokkyun@192.168.0.32` (포트 22, SSH 키 인증, 비밀번호 불필요)
- **프로젝트 경로**: `/home/seoseokkyun/dongdong/`
- **환경변수 파일**: `.env.production` (docker-compose 실행 시 `--env-file .env.production`)
- **Docker Compose**: `sudo docker compose --env-file .env.production up -d`
- **컨테이너**: postgres(5432), backend(3001), frontend(3000), nginx(80)
- **배포 명령어 예시**:
  ```bash
  # 파일 업로드
  scp <로컬파일> seoseokkyun@192.168.0.32:/home/seoseokkyun/dongdong/<경로>
  # 빌드 & 재시작
  ssh seoseokkyun@192.168.0.32 "cd /home/seoseokkyun/dongdong && sudo docker compose --env-file .env.production build <서비스> && sudo docker compose --env-file .env.production up -d <서비스>"
  # DB 직접 접근
  ssh seoseokkyun@192.168.0.32 "sudo docker exec dongdong-postgres-1 psql -U dongdong -d dongdong -c '<SQL>'"
  ```

## 도메인 & Cloudflare Tunnel
- **공식 도메인**: `aidongdong.co.kr`
- **Cloudflare Tunnel** (NAS에서 2개 독립 운영):
  - `dongdong` 터널 → `aidongdong.co.kr`, `*.aidongdong.co.kr` (systemd: `cloudflared-dongdong`)
  - `nas-tunnel` 터널 → `stockmindai.co.kr`, `www.stockmindai.co.kr`, `aisolar.co.kr`, `www.aisolar.co.kr` (systemd: `cloudflared`)
- **SSL**: Cloudflare 자동 (Flexible 모드)

## 개발 순서 및 진행 상태

### Phase 1: 인증 / 게시판 / 회원관리 ✅ 완료
- [x] 회원가입 (이메일 + 소셜 로그인) + 비밀번호 유효성 검사
- [x] 로그인 / 로그아웃 / 토큰 갱신
- [x] 게시판 CRUD (작성/수정/삭제/검색/카테고리)
- [x] 댓글 / 대댓글
- [x] 좋아요 토글
- [x] 게시글 고정 (관리자)
- [x] 가입 승인/거절 관리 (회장)
- [x] 회원 프로필 조회/수정
- [x] 회원 역할 변경 / 강제탈퇴
- [x] CORS 다중 origin 지원

### Phase 2: 모임관리, 공지 ✅ 완료
- [x] 모임 CRUD + RSVP (백엔드)
- [x] 공지사항 CRUD (백엔드)
- [x] 모임 목록 페이지네이션 수정 (page, totalPages 반환)
- [x] 프론트엔드 연동 검증 완료

### Phase 3: 실시간 채팅, DM ✅ 완료
- [x] 그룹 채팅 (Socket.io 게이트웨이)
- [x] DM (백엔드)
- [x] 채팅 메시지에 sender 정보 포함 (REST + Socket)
- [x] DM 메시지에 sender 정보 포함
- [x] 프론트엔드 실시간 연동 검증 완료

### Phase 4: 회비/회계 ✅ 완료
- [x] 회비 일정/납부 관리 (백엔드)
- [x] 회계 장부 (백엔드)
- [x] 납부하기 버튼 기능 연결
- [x] 프론트엔드 연동 검증 완료

### Phase 5: 부가기능 ✅ 완료
- [x] 알림 (백엔드)
- [x] 이미지 업로드 서비스 (ConfigService 기반 URL 생성)
- [x] 보안 점검 (Rate limiting, DTO MaxLength, MIME 검증, WebSocket 입력 검증)
- [x] QA 테스트 (Backend 170개 + Frontend 123개 = 293개 전체 통과)
- [x] DevOps 배포 설정 (Dockerfile, docker-compose, nginx 리버스 프록시)

### Phase 6: 신고/관리 기능 ✅ 완료
- [x] 게시글 신고 (백엔드: Report 모델, 마이그레이션, API)
- [x] 게시글 신고 (프론트: 신고 버튼/사유 선택 모달)
- [x] 관리자 신고 목록 조회 및 처리 (삭제/반려)
- [x] 댓글 신고 (게시글 상세 페이지 내 Flag 버튼)

### Phase 7: 멀티테넌트 SaaS ✅ 완료
- [x] Tenant 모델 및 DB 마이그레이션 (tenants 테이블, 각 모델에 tenantId FK)
- [x] TenantMiddleware (서브도메인/헤더 기반 테넌트 식별)
- [x] SuperAdmin 가드 및 Tenant CRUD API (`/api/v1/tenants`)
- [x] 기존 서비스 tenantId 필터링 (posts, users, announcements, meetings, finance, notifications)
- [x] 프론트엔드 TenantProvider, useTenant 훅
- [x] SuperAdmin 대시보드 (`/super-admin`)
- [x] NAS 배포 완료

### Phase 8: UI/UX 개선 및 부가기능 ✅ 완료
- [x] DM 편지 삭제 기능 (백엔드 DELETE + 프론트 삭제 버튼)
- [x] 글래스모피즘 UI 전면 적용 (버튼/탭/FAB → backdrop-blur + 반투명)
- [x] 피드 페이지에 공지사항 섹션 추가 (최근 3개)
- [x] 알림 개별/전체 삭제 기능 (백엔드 DELETE + 프론트 X 버튼, 전체 삭제)

### Phase 9: 네이티브 앱 (Capacitor) 🔲 진행 예정
> **전략**: Capacitor를 사용하여 기존 Next.js 웹앱을 iOS/Android 네이티브 앱으로 래핑
> **장점**: 코드베이스 재사용 극대화, 웹과 네이티브 동시 배포, 네이티브 API 접근 가능

#### 9-1. Capacitor 초기 설정
- [ ] `@capacitor/core`, `@capacitor/cli` 설치 (frontend/)
- [ ] `npx cap init` → `capacitor.config.ts` 생성
- [ ] `webDir`을 Next.js 빌드 출력(`out/`)으로 설정
- [ ] Next.js `output: 'export'` 정적 빌드 설정 추가 (네이티브용 빌드 스크립트)
- [ ] `.gitignore`에 `ios/`, `android/` 네이티브 프로젝트 폴더 추가

#### 9-2. 플랫폼 추가 및 네이티브 프로젝트 생성
- [ ] `npx cap add ios` → Xcode 프로젝트 생성
- [ ] `npx cap add android` → Android Studio 프로젝트 생성
- [ ] 앱 아이콘 및 스플래시 스크린 리소스 생성 (`@capacitor/assets`)
- [ ] `Info.plist` / `AndroidManifest.xml` 기본 설정 (앱 이름, 번들 ID)
- [ ] 번들 ID 규칙: `kr.aidongdong.app` (iOS/Android 공통)

#### 9-3. 네이티브 플러그인 연동
- [ ] **푸시 알림**: `@capacitor/push-notifications` + FCM(Android) / APNs(iOS)
- [ ] **카메라/갤러리**: `@capacitor/camera` (프로필 사진, 게시글 이미지 업로드)
- [ ] **로컬 저장소**: `@capacitor/preferences` (토큰 저장, 자동 로그인)
- [ ] **상태바/네비게이션바**: `@capacitor/status-bar` (네이티브 UI 통합)
- [ ] **딥링크**: `@capacitor/app` (aidongdong.co.kr 딥링크 → 앱 전환)
- [ ] **공유**: `@capacitor/share` (게시글/모임 공유)
- [ ] **네트워크 상태**: `@capacitor/network` (오프라인 감지 및 안내)

#### 9-4. 인증 및 네트워크 어댑터
- [ ] 네이티브 환경 감지 유틸 (`Capacitor.isNativePlatform()`)
- [ ] API Base URL 분기: 웹(상대경로) vs 네이티브(`https://aidongdong.co.kr`)
- [ ] OAuth 소셜 로그인 네이티브 대응 (커스텀 URL 스킴 or In-App Browser)
- [ ] 토큰 저장소 분기: 웹(cookie/localStorage) vs 네이티브(Preferences/Keychain)
- [ ] WebSocket(Socket.io) 네이티브 환경 연결 테스트

#### 9-5. 푸시 알림 백엔드 연동
- [ ] FCM 프로젝트 생성 및 서비스 키 발급
- [ ] User 모델에 `deviceToken`, `platform` 필드 추가 (Prisma 마이그레이션)
- [ ] 디바이스 토큰 등록 API (`POST /api/v1/users/device-token`)
- [ ] 백엔드 NotificationService에 FCM/APNs 발송 로직 추가
- [ ] 알림 트리거: 새 댓글, DM, 모임 초대, 가입 승인 시 푸시 발송

#### 9-6. 앱 스토어 배포 준비
- [ ] iOS: Apple Developer 계정, 인증서/프로비저닝 프로파일
- [ ] Android: Google Play Console, 서명 키 생성
- [ ] 앱 메타데이터 (스크린샷, 설명, 개인정보 처리방침 URL)
- [ ] iOS TestFlight / Android 내부 테스트 트랙 배포
- [ ] 앱 심사 제출 및 출시

#### 9-7. 네이티브 빌드 파이프라인
- [ ] 빌드 스크립트: `npm run build:native` → `next build && next export && npx cap sync`
- [ ] 환경별 Capacitor 설정 (`capacitor.config.ts`에서 서버 URL 분기)
- [ ] CI/CD 연동 (선택): GitHub Actions → Fastlane 자동 빌드/배포

## 핵심 기능
- 회원 가입 신청 → 회장 승인
- 동문 프로필 (LinkedIn 스타일)
- 모임 관리 / 회비 회계
- 그룹 채팅 / DM
- 권한 관리 (회장/부회장/총무/일반)
- 멀티테넌트 (대학별 서브도메인 분리)
- SuperAdmin 플랫폼 관리
- 네이티브 앱 (iOS/Android) — Capacitor 기반, 푸시 알림, 딥링크

## 주요 기술 패턴
- 컨트롤러에서 express import: `import * as express from 'express'` (isolatedModules 호환)
- 요청 타입: `req: express.Request` → `req.tenantId` 접근
- Prisma where 절 타입: `const where: Prisma.XxxWhereInput = { ... }`
- 글로벌 prefix `api/v1`이 있으므로 컨트롤러 경로에 중복 금지
- 네이티브 플랫폼 감지: `import { Capacitor } from '@capacitor/core'` → `Capacitor.isNativePlatform()`
- 네이티브 빌드: `next build && next export` → `npx cap sync` → Xcode/Android Studio 빌드
- API URL 분기: 네이티브에서는 절대 URL(`https://aidongdong.co.kr/api/v1/...`) 사용
