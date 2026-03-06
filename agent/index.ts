import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (p: string) => new Promise<string>((r) => rl.question(p, r));

// Agent별 프롬프트 템플릿 (Claude Code에 붙여넣기용)
const AGENTS: Record<string, { label: string; prompt: string }> = {
  orchestrator: {
    label: '오케스트레이터 (전체 조율)',
    prompt: `[오케스트레이터 모드]
아래 요청을 분석해서:
1. 어떤 Agent(기획/프론트/백엔드/보안/QA/DevOps)가 필요한지 판단
2. 각 Agent가 해야 할 작업을 순서대로 정리
3. 첫 번째 태스크부터 직접 수행

프로젝트: 대학 동문 SNS 플랫폼 (Next.js 14 + NestJS + PostgreSQL)

요청:`,
  },
  planner: {
    label: '기획/설계 Agent',
    prompt: `[기획/설계 Agent 모드]
대학 동문 SNS 플랫폼 기획/설계 전담입니다.
- DB ERD, API 명세, 사용자 스토리, 화면 설계 텍스트 작성
- 기술 스택: Next.js 14, TypeScript, PostgreSQL, Prisma, NestJS

요청:`,
  },
  frontend: {
    label: '프론트엔드 Agent',
    prompt: `[프론트엔드 Agent 모드]
대학 동문 SNS 플랫폼 프론트엔드 전담입니다.
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Server Component 우선, React Query API 연동
- 화이트/블랙 모던 디자인, 모바일 최적화
- 완전한 TypeScript 코드 제공

요청:`,
  },
  backend: {
    label: '백엔드 Agent',
    prompt: `[백엔드 Agent 모드]
대학 동문 SNS 플랫폼 백엔드 전담입니다.
- NestJS + Prisma + PostgreSQL
- JWT 인증, RBAC 권한 (PRESIDENT/VICE_PRESIDENT/TREASURER/MEMBER)
- DTO class-validator, 트랜잭션, 에러 처리 포함
- 완전한 NestJS TypeScript 코드 제공

요청:`,
  },
  security: {
    label: '보안 Agent',
    prompt: `[보안 Agent 모드]
웹 보안 전담입니다.
- OWASP Top 10, SQL Injection, XSS, CSRF 점검
- JWT 보안, RBAC 검증, 개인정보보호법(PIPA) 준수
- 발견된 취약점: [심각도] 설명 + 수정 코드
- 최종 보안 점수 (0-100) 제공

요청:`,
  },
  qa: {
    label: 'QA Agent',
    prompt: `[QA Agent 모드]
품질 보증 전담입니다.
- Jest 단위/통합 테스트, E2E 시나리오
- 커버리지 80% 이상, Happy Path + Edge Case + Error Case
- NestJS: Jest + Supertest / Next.js: Jest + React Testing Library
- 완전한 테스트 코드 제공

요청:`,
  },
  devops: {
    label: 'DevOps Agent',
    prompt: `[DevOps Agent 모드]
인프라/배포 전담입니다.
- Vercel(프론트) + Railway(백엔드/DB)
- GitHub Actions CI/CD, 환경변수 관리
- Docker, Sentry 모니터링, DB 백업
- 실제 사용 가능한 YAML/설정 파일 제공

요청:`,
  },
};

// 태스크 로그
const LOG_FILE = path.join(__dirname, 'task-log.json');
function loadLog(): any[] {
  if (!fs.existsSync(LOG_FILE)) return [];
  return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
}
function saveLog(tasks: any[]): void {
  fs.writeFileSync(LOG_FILE, JSON.stringify(tasks, null, 2));
}

function showMenu(): void {
  console.log('\n' + '─'.repeat(52));
  console.log('  동문 SNS Agent 시스템 (Claude Code 연동)');
  console.log('─'.repeat(52));
  console.log('  1. 오케스트레이터 (전체 조율)');
  console.log('  2. 기획/설계 Agent');
  console.log('  3. 프론트엔드 Agent');
  console.log('  4. 백엔드 Agent');
  console.log('  5. 보안 Agent');
  console.log('  6. QA Agent');
  console.log('  7. DevOps Agent');
  console.log('  8. 태스크 로그');
  console.log('  0. 종료');
  console.log('─'.repeat(52));
}

async function main(): Promise<void> {
  console.log('\n  동문 SNS Agent 협업 시스템');
  console.log('  Claude Code (Max 구독) 연동 모드\n');
  console.log('  사용법: Agent 선택 → 요청 입력 → 프롬프트 자동 복사');
  console.log('         → Claude Code 채팅창에 Ctrl+V 붙여넣기');

  while (true) {
    showMenu();
    const choice = (await question('  선택: ')).trim();

    const agentMap: Record<string, string> = {
      '1': 'orchestrator', '2': 'planner', '3': 'frontend',
      '4': 'backend', '5': 'security', '6': 'qa', '7': 'devops',
    };

    if (choice === '0') {
      console.log('\n  종료합니다.\n');
      rl.close();
      break;
    }

    if (choice === '8') {
      const logs = loadLog();
      if (logs.length === 0) {
        console.log('\n  기록된 태스크가 없습니다.');
      } else {
        console.log('\n=== 태스크 로그 ===');
        logs.forEach((t, i) => {
          console.log(`  ${i + 1}. [${t.agent}] ${t.title} (${t.date})`);
        });
      }
      continue;
    }

    const agentKey = agentMap[choice];
    if (!agentKey) { console.log('  잘못된 선택입니다.'); continue; }

    const agent = AGENTS[agentKey];
    const request = (await question(`\n  [${agent.label}] 요청:\n  > `)).trim();
    if (!request) continue;

    const prompt = `${agent.prompt} ${request}`;

    // Windows 클립보드 복사
    try {
      const { execSync } = await import('child_process');
      // 임시 파일로 클립보드 복사 (특수문자 안전 처리)
      const tmpFile = path.join(__dirname, '_tmp_prompt.txt');
      fs.writeFileSync(tmpFile, prompt, 'utf-8');
      execSync(`clip < "${tmpFile}"`, { shell: 'cmd.exe' });
      fs.unlinkSync(tmpFile);
      console.log('\n  클립보드에 복사됨!');
      console.log('  Claude Code 채팅창에 Ctrl+V 하세요.\n');
    } catch {
      console.log('\n  ── 아래 내용을 Claude Code에 붙여넣기 ──\n');
      console.log(prompt);
      console.log('\n  ────────────────────────────────────────\n');
    }

    // 로그 저장
    const logs = loadLog();
    logs.push({
      agent: agent.label,
      title: request.substring(0, 50),
      date: new Date().toLocaleString('ko-KR'),
    });
    saveLog(logs);
  }
}

main().catch(console.error);
