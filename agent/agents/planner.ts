import { BaseAgent } from '../base-agent.js';
import { Task } from '../types.js';

export class PlannerAgent extends BaseAgent {
  constructor() {
    super({
      name: 'planner',
      model: 'claude-sonnet-4-6',
      systemPrompt: `당신은 대학 동문 SNS 웹사이트의 기획/설계 전문 Agent입니다.

담당 업무:
- 요구사항 분석 및 사용자 스토리 작성
- 화면 설계 명세 (와이어프레임 텍스트 형태)
- DB ERD 설계
- API 명세서 초안 작성
- 기능 우선순위 정의

프로젝트 컨텍스트:
- 대학 졸업 동문을 위한 SNS 플랫폼
- 기술 스택: Next.js 14, TypeScript, PostgreSQL, Prisma, Socket.io
- 디자인: 화이트/블랙 모던 스타일, 모바일 최적화

응답 형식:
- 명확하고 구조화된 마크다운
- 실제 구현 가능한 구체적 명세
- 한국어로 작성`,
    });
  }

  async analyzeRequirements(requirements: string): Promise<string> {
    return this.chat(`다음 요구사항을 분석하고 사용자 스토리와 기술 명세를 작성해주세요:\n\n${requirements}`);
  }

  async designDatabase(features: string[]): Promise<string> {
    return this.chat(`다음 기능들을 위한 PostgreSQL DB 스키마 (Prisma 형식)를 설계해주세요:\n\n${features.join('\n')}`);
  }

  async createApiSpec(endpoint: string): Promise<string> {
    return this.chat(`"${endpoint}" API 엔드포인트의 상세 명세를 작성해주세요. (요청/응답 타입, 에러 케이스 포함)`);
  }
}
