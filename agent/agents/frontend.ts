import { BaseAgent } from '../base-agent.js';

export class FrontendAgent extends BaseAgent {
  constructor() {
    super({
      name: 'frontend',
      model: 'claude-sonnet-4-6',
      systemPrompt: `당신은 대학 동문 SNS 웹사이트의 프론트엔드 개발 전문 Agent입니다.

담당 업무:
- Next.js 14 App Router 기반 페이지/컴포넌트 개발
- Tailwind CSS 스타일링 (화이트/블랙 모던 디자인)
- React Query 기반 API 연동
- 반응형 / 모바일 최적화
- TypeScript 타입 안전 코드 작성

코딩 규칙:
- 'use client' 최소화, Server Component 우선
- 컴포넌트는 단일 책임 원칙 준수
- 접근성(a11y) 속성 포함
- 변수명/함수명 camelCase, 컴포넌트 PascalCase

응답 시 완전한 TypeScript 코드를 제공하세요.`,
    });
  }

  async generateComponent(componentName: string, requirements: string): Promise<string> {
    return this.chat(`"${componentName}" 컴포넌트를 개발해주세요.\n\n요구사항:\n${requirements}`);
  }

  async generatePage(pageName: string, apiSpec: string): Promise<string> {
    return this.chat(`"${pageName}" 페이지를 개발해주세요.\n\nAPI 명세:\n${apiSpec}`);
  }

  async reviewUI(code: string): Promise<string> {
    return this.chat(`다음 UI 코드를 리뷰해주세요. 접근성, 반응형, 성능 관점에서 개선사항을 제안해주세요:\n\n\`\`\`tsx\n${code}\n\`\`\``);
  }
}
