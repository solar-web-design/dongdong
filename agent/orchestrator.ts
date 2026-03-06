import Anthropic from '@anthropic-ai/sdk';
import { Task, TaskResult, AgentRole, Priority } from './types.js';
import { PlannerAgent } from './agents/planner.js';
import { FrontendAgent } from './agents/frontend.js';
import { BackendAgent } from './agents/backend.js';
import { SecurityAgent } from './agents/security.js';
import { QAAgent } from './agents/qa.js';
import { DevOpsAgent } from './agents/devops.js';

export class OrchestratorAgent {
  private client: Anthropic;
  private agents: Map<AgentRole, any>;
  private taskQueue: Task[] = [];
  private completedTasks: TaskResult[] = [];
  private taskCounter = 0;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.agents = new Map([
      ['planner', new PlannerAgent()],
      ['frontend', new FrontendAgent()],
      ['backend', new BackendAgent()],
      ['security', new SecurityAgent()],
      ['qa', new QAAgent()],
      ['devops', new DevOpsAgent()],
    ]);
  }

  // 요청을 분석하고 태스크로 분해
  async analyzeAndDelegate(userRequest: string): Promise<TaskResult[]> {
    console.log('\n[오케스트레이터] 요청 수신:', userRequest);
    console.log('─'.repeat(60));

    const tasks = await this.breakdownToTasks(userRequest);
    const results: TaskResult[] = [];

    for (const task of tasks) {
      console.log(`\n[오케스트레이터] 태스크 배정: ${task.task_id} → ${task.to}`);
      const result = await this.delegateTask(task);
      results.push(result);

      // 보안 검토가 필요한 코드 결과물은 Security Agent에 추가 검토
      if (result.artifacts.code && (task.to === 'backend' || task.to === 'frontend')) {
        console.log(`\n[오케스트레이터] 보안 검토 요청: ${task.task_id}`);
        const securityResult = await this.requestSecurityReview(task.task_id, result.artifacts.code);
        results.push(securityResult);
      }
    }

    this.completedTasks.push(...results);
    return results;
  }

  // Claude Opus로 태스크 분해
  private async breakdownToTasks(request: string): Promise<Task[]> {
    const response = await this.client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: `당신은 동문 SNS 플랫폼 개발 프로젝트의 오케스트레이터입니다.
사용자 요청을 분석하여 적절한 Agent에게 배정할 태스크 목록을 JSON 배열로 반환하세요.

Agent 종류: planner, frontend, backend, security, qa, devops

반드시 JSON 배열만 반환하세요:
[
  {
    "task_id": "task-001",
    "from": "orchestrator",
    "to": "agent이름",
    "priority": "high|medium|low",
    "title": "태스크 제목",
    "description": "상세 설명",
    "dependencies": [],
    "acceptance_criteria": ["기준1", "기준2"]
  }
]`,
      messages: [{ role: 'user', content: request }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]';

    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const tasks: Task[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      // task_id 순번 부여
      return tasks.map((t, i) => ({
        ...t,
        task_id: `task-${String(++this.taskCounter).padStart(3, '0')}`,
      }));
    } catch {
      // JSON 파싱 실패 시 단일 태스크로 처리
      return [this.createDefaultTask(request)];
    }
  }

  private async delegateTask(task: Task): Promise<TaskResult> {
    const agent = this.agents.get(task.to);
    if (!agent) {
      return {
        task_id: task.task_id,
        agent: task.to,
        status: 'failed',
        artifacts: {},
        notes: `Agent "${task.to}" 를 찾을 수 없습니다.`,
        blockers: [`Unknown agent: ${task.to}`],
      };
    }

    try {
      return await agent.processTask(task);
    } catch (error) {
      return {
        task_id: task.task_id,
        agent: task.to,
        status: 'failed',
        artifacts: {},
        notes: `태스크 처리 중 오류 발생`,
        blockers: [String(error)],
      };
    }
  }

  private async requestSecurityReview(originalTaskId: string, code: string): Promise<TaskResult> {
    const securityAgent = this.agents.get('security') as SecurityAgent;
    const reviewResult = await securityAgent.reviewCode(code);

    return {
      task_id: `${originalTaskId}-security`,
      agent: 'security',
      status: 'completed',
      artifacts: { docs: reviewResult },
      notes: '보안 검토 완료',
      blockers: [],
    };
  }

  private createDefaultTask(request: string): Task {
    return {
      task_id: `task-${String(++this.taskCounter).padStart(3, '0')}`,
      from: 'orchestrator',
      to: 'planner',
      priority: 'medium' as Priority,
      title: '요청 처리',
      description: request,
      dependencies: [],
      acceptance_criteria: ['요청에 맞는 결과물 산출'],
    };
  }

  // 특정 Agent와 직접 대화
  async chatWithAgent(agentRole: AgentRole, message: string): Promise<string> {
    const agent = this.agents.get(agentRole);
    if (!agent) throw new Error(`Agent "${agentRole}" 없음`);
    return agent.chat(message);
  }

  // 완료된 태스크 목록 조회
  getCompletedTasks(): TaskResult[] {
    return this.completedTasks;
  }

  // 전체 진행 상황 요약
  async getSummary(): Promise<string> {
    const total = this.completedTasks.length;
    const completed = this.completedTasks.filter(t => t.status === 'completed').length;
    const failed = this.completedTasks.filter(t => t.status === 'failed').length;

    return `
=== 프로젝트 진행 현황 ===
총 태스크: ${total}
완료: ${completed}
실패: ${failed}
진행률: ${total > 0 ? Math.round((completed / total) * 100) : 0}%
=========================`;
  }
}
