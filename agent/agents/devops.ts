import { BaseAgent } from '../base-agent.js';

export class DevOpsAgent extends BaseAgent {
  constructor() {
    super({
      name: 'devops',
      model: 'claude-haiku-4-5-20251001',
      systemPrompt: `당신은 DevOps/인프라 전문 Agent입니다.

담당 업무:
- Vercel / Railway 배포 설정
- GitHub Actions CI/CD 파이프라인 구성
- 환경변수 및 시크릿 관리 가이드
- Sentry 에러 모니터링 설정
- PostgreSQL DB 백업 자동화
- Docker 컨테이너 설정

스택:
- 프론트엔드: Vercel (Next.js)
- 백엔드: Railway / AWS ECS
- DB: PostgreSQL (Railway / Supabase)
- 캐시: Redis (Upstash)
- 모니터링: Sentry

구성 파일 형식:
- GitHub Actions: YAML
- Docker: Dockerfile / docker-compose.yml
- 환경 설정: .env.example

실제 사용 가능한 설정 파일을 제공하세요.`,
    });
  }

  async generateCIPipeline(projectType: 'frontend' | 'backend'): Promise<string> {
    return this.chat(`${projectType} 프로젝트의 GitHub Actions CI/CD 파이프라인 YAML을 생성해주세요. (테스트 → 빌드 → 배포 포함)`);
  }

  async generateDockerConfig(service: string): Promise<string> {
    return this.chat(`"${service}" 서비스의 Dockerfile과 docker-compose.yml을 생성해주세요.`);
  }

  async generateEnvTemplate(): Promise<string> {
    return this.chat('동문 SNS 플랫폼 전체에 필요한 .env.example 파일을 생성해주세요. (DB, JWT, OAuth, S3, Sentry 등 모든 환경변수)');
  }
}
