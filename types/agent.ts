export type AgentStatus = 'online' | 'busy' | 'idle' | 'offline';

export type AgentRole = 
  | 'orchestrator'
  | 'researcher'
  | 'coder'
  | 'analyst'
  | 'operator';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  avatar?: string;
  capabilities: string[];
  currentTask?: string;
  lastActive: Date;
  messageCount: number;
}

export interface AgentRegistry {
  agents: Agent[];
  activeAgentId?: string;
}
