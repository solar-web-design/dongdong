# 오케스트레이터 (동문 SNS 프로젝트)

너는 대학 동문 SNS 플랫폼 개발의 **오케스트레이터**다.
전체 작업을 조율하고 각 Agent에게 태스크를 배분한다.

## 프로젝트 개요
- 서비스명: 대학 동문 네트워크 플랫폼 (동동)
- 대상: 대학 졸업 동문
- 아키텍처: **멀티테넌트 SaaS** (대학별 서브도메인 분리)
- 디자인: 화이트/블랙 모던, 모바일 최적화
- 스택: Next.js 14 + NestJS + PostgreSQL + Socket.io

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
- **Tailscale IP**: `100.80.32.52` (외부 접속용)
- **SSH**: `ssh seoseokkyun@192.168.0.32` (내부) / `ssh seoseokkyun@100.80.32.52` (외부, Tailscale)
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

### Phase 9: 테넌트 격리 강화 및 SuperAdmin UX ✅ 완료
- [x] 전 서비스 테넌트 격리 강화 (finance, posts, announcements, meetings, notifications, users, reports)
  - requireTenant() 헬퍼로 생성 시 tenantId 필수 검증
  - 목록 조회 시 tenantId 없으면 빈 배열 반환
  - ID 기반 조회 시 tenantId 불일치 검증
- [x] 크로스 서브도메인 쿠키 공유 (COOKIE_DOMAIN=.aidongdong.co.kr, COOKIE_SECURE=true)
- [x] NEXT_PUBLIC_API_URL 상대경로로 변경 (/api/v1) — 서브도메인 Host 헤더 보존
- [x] SuperAdmin 대시보드 모바일 카드 레이아웃 (테이블 → 카드)
- [x] SuperAdmin 레이아웃에 네비게이션 탭 추가 (대시보드/개설 신청)
- [x] SuperAdmin 상세 페이지 뒤로가기 버튼
- [x] 동문회 개설 신청 기능 (tenant-request API + 프론트 페이지)
- [x] 랜딩페이지 리디자인 + 공개 페이지 분리 ((public) route group)
- [x] NAS 배포 완료

### Phase 10: 인증 테넌트 격리 ✅ 완료 (배포 대기)
- [x] 크로스 테넌트 로그인 차단
  - 로그인 시 tenantId 검증 (서브도메인: 소속 회원만, 메인도메인: SuperAdmin만)
  - JWT 페이로드에 tenantId 포함
  - JWT 검증(JwtStrategy) 시 토큰 tenantId ↔ 요청 tenantId 일치 확인
  - OAuth 로그인도 테넌트 격리 적용
  - refresh 토큰 재발급 시에도 tenantId 포함
- [x] NAS 배포 (집에서 진행 필요)

### Phase 11: 원격 배포 환경 구축 (진행 중)
- [x] Tailscale VPN 설치 (NAS + PC)
  - NAS: Tailscale v1.94.2 설치, IP `100.80.32.52`
  - 집 PC: Tailscale Windows 클라이언트 설치 및 로그인
  - 회사 PC: Tailscale Windows 클라이언트 설치 및 로그인
  - Tailscale 인증: Google 계정 (NAS와 동일 계정 필수)
  - `ssh seoseokkyun@100.80.32.52`로 외부 NAS SSH 접속 확인
- [ ] 회사 PC SSH 키 NAS 등록 (NAS의 PasswordAuthentication=no이므로 집에서 authorized_keys에 추가 필요)

## 로드맵: 플랫폼 고도화 계획

### Phase 12: UI 컴포넌트 고도화 (shadcn/ui)
- [ ] shadcn/ui 초기 설정 (`npx shadcn init`)
- [ ] 기존 커스텀 컴포넌트 점진적 교체 (버튼, 모달, 탭, 드롭다운 등)
- [ ] 디자인 시스템 통일 (컬러 토큰, 타이포그래피, 간격 규칙)
- 효과: 디자인 일관성 + 접근성 내장 + 코드량 감소

### Phase 13: 모바일 앱 (PWA)
- [ ] PWA 매니페스트 및 Service Worker 설정
- [ ] 홈 화면 추가 (Add to Home Screen) 안내 배너
- [ ] 웹 푸시 알림 (Firebase Cloud Messaging + Service Worker)
- [ ] 오프라인 캐시 (게시글 목록, 프로필 등 읽기 데이터)
- [ ] 모바일 UX 최적화 (터치 제스처, 바텀 네비게이션)
- 목표: 앱 스토어 배포 없이 네이티브 앱 수준의 경험 제공
- 대상: 40~60대 동문 → 설치 간편한 PWA가 적합

### Phase 14: 킬러 기능 — 동문 네트워킹
- [ ] 동문 검색 (이름, 졸업연도, 학과, 거주지, 업종)
- [ ] 업종/직군별 카테고리 태그 (프로필에 추가)
- [ ] 동문 인맥 지도 (졸업연도별, 지역별 시각화)
- [ ] 멘토링 매칭 (선배↔후배, 업종 기반 자동 추천)
- [ ] 동문 명함 (QR코드 생성 → 오프라인 모임에서 교환)
- 목표: "밴드에 없는, 동문만을 위한 기능"으로 차별화

### Phase 15: 초기 활성화 전략
- [ ] 동문회 개설 시 샘플 데이터 자동 생성 (환영 공지, 가이드 게시글)
- [ ] 관리자용 일괄 회원 초대 (CSV 업로드 → 이메일 초대 발송)
- [ ] 카카오톡/밴드 공유 링크 (가입 유도 랜딩페이지)
- [ ] 동문회 활동 리포트 (월간 통계: 게시글, 모임, 가입자 수)
- 목표: 빈 커뮤니티 문제 해결, 관리자가 쉽게 회원 유치

### Phase 16: 수익 모델
- [ ] 테넌트 요금제 설계 (Free / Pro / Enterprise)
  - Free: 회원 50명, 기본 기능
  - Pro: 회원 무제한, 푸시 알림, 회비 관리, 분석 리포트
  - Enterprise: 커스텀 도메인, 전용 지원, API 연동
- [ ] 결제 연동 (토스페이먼츠 / 카카오페이 정기결제)
- [ ] SuperAdmin 요금제 관리 화면
- 목표: 무료로 유입 → Pro 전환으로 지속가능한 수익

### Phase 17: 안정성 강화
- [ ] DB 자동 백업 (pg_dump 크론, 로컬 + 클라우드 이중 보관)
- [ ] 헬스체크 모니터링 (UptimeRobot 또는 자체 cron → 장애 시 알림)
- [ ] 에러 로깅 (Sentry 또는 자체 에러 수집)
- [ ] Docker 컨테이너 자동 재시작 정책 (`restart: unless-stopped`)
- [ ] NAS UPS 전원 관리 (정전 시 안전 셧다운)
- 목표: 단일 서버 리스크 최소화, 장애 대응 체계 구축

### Phase 18: AWS 마이그레이션 (점진적 스케일링)
- **1단계: DB 이전** (유료 테넌트 발생 시)
  - [ ] AWS RDS PostgreSQL (db.t4g.micro) 생성
  - [ ] 데이터 마이그레이션 (pg_dump → RDS 복원)
  - [ ] Backend DB 연결 RDS로 변경
  - [ ] NAS PostgreSQL 컨테이너 제거
  - 비용: 월 ~₩20,000-40,000 / 효과: 자동 백업, 장애 복구
- **2단계: 앱 서버 이전** (트래픽 증가 시)
  - [ ] ECS Fargate 또는 EC2 t4g.small로 컨테이너 배포
  - [ ] ALB(Application Load Balancer) 설정
  - [ ] Cloudflare DNS → AWS ALB로 변경
  - [ ] NAS → 개발/스테이징 서버로 전환
  - 비용: 월 ~₩50,000-80,000 / 효과: 안정적 서비스 운영
- **3단계: 풀 스케일링** (대규모 사용자)
  - [ ] ECS 오토스케일링 (트래픽 기반 자동 확장)
  - [ ] CloudFront CDN (정적 자산 캐싱)
  - [ ] ElastiCache Redis (세션/캐시)
  - [ ] CI/CD 파이프라인 (GitHub Actions → ECR → ECS 자동 배포)
  - 비용: 트래픽 따라 변동 / 효과: 무중단 배포, 자동 확장
- 전략: NAS 안정성 확보(Phase 17) → 수익 발생(Phase 16) → DB 이전 → 점진적 확장

## 핵심 기능
- 회원 가입 신청 → 회장 승인
- 동문 프로필 (LinkedIn 스타일)
- 모임 관리 / 회비 회계
- 그룹 채팅 / DM
- 권한 관리 (회장/부회장/총무/일반)
- 멀티테넌트 (대학별 서브도메인 분리)
- SuperAdmin 플랫폼 관리

## 주요 기술 패턴
- 컨트롤러에서 express import: `import * as express from 'express'` (isolatedModules 호환)
- 요청 타입: `req: express.Request` → `req.tenantId` 접근
- Prisma where 절 타입: `const where: Prisma.XxxWhereInput = { ... }`
- 글로벌 prefix `api/v1`이 있으므로 컨트롤러 경로에 중복 금지
- 테넌트 격리 패턴: 목록은 tenantId 없으면 빈 배열, 생성은 requireTenant()로 필수 검증, ID 조회는 tenantId 일치 확인
- 쿠키: COOKIE_DOMAIN(`.aidongdong.co.kr`), COOKIE_SECURE, httpOnly, sameSite=lax
- NEXT_PUBLIC_API_URL은 반드시 상대경로(`/api/v1`) — 절대경로 시 서브도메인 Host 헤더 유실
- SuperAdmin 경로: `/super-admin` (기존 `/admin`은 테넌트 관리자용)
