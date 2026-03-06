export type AgentRole =
  | 'orchestrator'
  | 'planner'
  | 'frontend'
  | 'backend'
  | 'security'
  | 'qa'
  | 'devops';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'failed';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  task_id: string;
  from: AgentRole;
  to: AgentRole;
  priority: Priority;
  title: string;
  description: string;
  dependencies: string[];
  acceptance_criteria: string[];
  deadline?: string;
}

export interface TaskResult {
  task_id: string;
  agent: AgentRole;
  status: TaskStatus;
  artifacts: {
    files?: string[];
    tests?: string[];
    docs?: string;
    code?: string;
  };
  notes: string;
  blockers: string[];
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentConfig {
  name: AgentRole;
  model: string;
  systemPrompt: string;
}
