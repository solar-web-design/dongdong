import Anthropic from '@anthropic-ai/sdk';
import { AgentConfig, AgentMessage, Task, TaskResult } from './types.js';

export class BaseAgent {
  protected client: Anthropic;
  protected config: AgentConfig;
  protected history: AgentMessage[] = [];

  constructor(config: AgentConfig) {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.config = config;
  }

  async chat(userMessage: string): Promise<string> {
    this.history.push({ role: 'user', content: userMessage });

    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 4096,
      system: this.config.systemPrompt,
      messages: this.history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    this.history.push({ role: 'assistant', content: assistantMessage });
    return assistantMessage;
  }

  async processTask(task: Task): Promise<TaskResult> {
    const prompt = this.buildTaskPrompt(task);
    const response = await this.chat(prompt);
    return this.parseTaskResult(task, response);
  }

  protected buildTaskPrompt(task: Task): string {
    return `
## 태스크 수신

- **ID**: ${task.task_id}
- **제목**: ${task.title}
- **우선순위**: ${task.priority}
- **설명**: ${task.description}

### 수락 기준
${task.acceptance_criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

위 태스크를 처리하고 결과를 JSON 형식으로 반환해주세요.
    `.trim();
  }

  protected parseTaskResult(task: Task, response: string): TaskResult {
    return {
      task_id: task.task_id,
      agent: this.config.name,
      status: 'completed',
      artifacts: {
        code: response,
      },
      notes: `${this.config.name} Agent 처리 완료`,
      blockers: [],
    };
  }

  clearHistory(): void {
    this.history = [];
  }

  get name(): string {
    return this.config.name;
  }
}
