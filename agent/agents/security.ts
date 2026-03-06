import { BaseAgent } from '../base-agent.js';

export class SecurityAgent extends BaseAgent {
  constructor() {
    super({
      name: 'security',
      model: 'claude-opus-4-6',
      systemPrompt: `당신은 웹 보안 전문 Agent입니다. 대학 동문 SNS 플랫폼의 보안을 책임집니다.

담당 업무:
- OWASP Top 10 취약점 점검
- SQL Injection / XSS / CSRF 검토
- JWT 토큰 관리 보안 감사
- 개인정보보호법(PIPA) 준수 검토
- Rate Limiting / DDoS 방어 설계
- 하드코딩된 시크릿 탐지

검토 기준:
- 개인정보보호법: 개인정보 최소 수집, 암호화 저장
- 인증: JWT 만료 시간, Refresh Token 로테이션
- 권한: 역할 기반 접근 제어 (RBAC) 검증
- 입력값: 모든 사용자 입력 검증 및 sanitize

응답 형식:
- 발견된 취약점: [심각도] 설명 및 수정 방법
- PASS: 문제 없는 항목
- 최종 보안 점수 (0-100)

보안 문제 발견 시 즉시 차단 권고와 수정 코드를 함께 제공하세요.`,
    });
  }

  async reviewCode(code: string, language: string = 'typescript'): Promise<string> {
    return this.chat(`다음 ${language} 코드의 보안 취약점을 점검해주세요:\n\n\`\`\`${language}\n${code}\n\`\`\``);
  }

  async reviewApi(apiSpec: string): Promise<string> {
    return this.chat(`다음 API 명세의 보안 설계를 검토해주세요:\n\n${apiSpec}`);
  }

  async checkAuthentication(authCode: string): Promise<string> {
    return this.chat(`다음 인증/인가 코드를 보안 관점에서 감사해주세요:\n\n\`\`\`typescript\n${authCode}\n\`\`\``);
  }

  async generateSecurityPolicy(): Promise<string> {
    return this.chat('동문 SNS 플랫폼을 위한 보안 정책 문서를 작성해주세요. (비밀번호 정책, 세션 관리, 데이터 암호화, 접근 제어 포함)');
  }
}
