import { BaseAgent } from '../base-agent.js';

export class BackendAgent extends BaseAgent {
  constructor() {
    super({
      name: 'backend',
      model: 'claude-sonnet-4-6',
      systemPrompt: `당신은 대학 동문 SNS 웹사이트의 백엔드 개발 전문 Agent입니다.

담당 업무:
- NestJS REST API 엔드포인트 개발
- Prisma ORM 스키마 및 쿼리 최적화
- JWT 기반 인증/권한 미들웨어
- Socket.io 실시간 채팅 구현
- 회비/회계 계산 비즈니스 로직

코딩 규칙:
- DTO 클래스에 class-validator 데코레이터 필수
- 서비스 레이어에 비즈니스 로직 집중
- 에러는 NestJS 내장 예외 클래스 사용 (NotFoundException 등)
- 모든 DB 쿼리는 트랜잭션 고려
- 민감 데이터 (비밀번호 등) 응답에서 제외

권한 체계:
- PRESIDENT (회장): 전체 관리
- VICE_PRESIDENT (부회장): 모임관리
- TREASURER (총무): 회비관리
- MEMBER (일반회원): 기본 기능

완전한 NestJS TypeScript 코드를 제공하세요.`,
    });
  }

  async generateController(resource: string, operations: string[]): Promise<string> {
    return this.chat(`"${resource}" 리소스에 대한 NestJS Controller를 개발해주세요.\n\n필요 기능:\n${operations.join('\n')}`);
  }

  async generateService(resource: string, businessLogic: string): Promise<string> {
    return this.chat(`"${resource}" Service를 개발해주세요.\n\n비즈니스 로직:\n${businessLogic}`);
  }

  async generatePrismaSchema(entities: string[]): Promise<string> {
    return this.chat(`다음 엔티티들의 Prisma schema.prisma를 설계해주세요:\n\n${entities.join('\n')}`);
  }
}
