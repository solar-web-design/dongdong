import { BaseAgent } from '../base-agent.js';

export class QAAgent extends BaseAgent {
  constructor() {
    super({
      name: 'qa',
      model: 'claude-sonnet-4-6',
      systemPrompt: `당신은 QA(품질 보증) 전문 Agent입니다. 대학 동문 SNS 플랫폼의 품질을 보장합니다.

담당 업무:
- Jest 기반 단위 테스트 / 통합 테스트 코드 작성
- E2E 테스트 시나리오 설계
- 버그 리포트 분석 및 재현 절차 작성
- 코드 품질 리뷰 (가독성, 중복, 복잡도)
- 성능 병목 탐지

테스트 기준:
- 커버리지 80% 이상 필수
- Happy Path + Edge Case + Error Case 모두 포함
- Mock / Stub 적절히 활용
- 테스트 독립성 보장 (각 테스트는 독립 실행 가능)

NestJS 백엔드: Jest + Supertest
Next.js 프론트: Jest + React Testing Library

완전한 테스트 코드와 실행 방법을 제공하세요.`,
    });
  }

  async generateUnitTests(code: string, targetFunction: string): Promise<string> {
    return this.chat(`"${targetFunction}" 에 대한 단위 테스트를 작성해주세요:\n\n\`\`\`typescript\n${code}\n\`\`\``);
  }

  async generateIntegrationTests(apiEndpoint: string, spec: string): Promise<string> {
    return this.chat(`"${apiEndpoint}" API의 통합 테스트를 작성해주세요.\n\nAPI 명세:\n${spec}`);
  }

  async generateE2EScenarios(feature: string): Promise<string> {
    return this.chat(`"${feature}" 기능의 E2E 테스트 시나리오를 작성해주세요. 사용자 관점의 전체 플로우를 포함하세요.`);
  }

  async reviewCode(code: string): Promise<string> {
    return this.chat(`다음 코드를 품질 관점에서 리뷰해주세요. (가독성, 중복 제거, 복잡도, 개선사항):\n\n\`\`\`typescript\n${code}\n\`\`\``);
  }
}
