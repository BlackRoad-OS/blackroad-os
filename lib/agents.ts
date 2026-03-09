import type { Agent } from '@/types';

export const agentRegistry: Agent[] = [
  {
    id: 'cecilia',
    name: 'Cecilia',
    role: 'orchestrator',
    status: 'online',
    capabilities: ['coordination', 'planning', 'delegation'],
    currentTask: 'Monitoring cluster health',
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'cadence',
    name: 'Cadence',
    role: 'analyst',
    status: 'busy',
    capabilities: ['data analysis', 'metrics', 'reporting'],
    currentTask: 'Processing metrics pipeline',
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'lucidia',
    name: 'Lucidia',
    role: 'researcher',
    status: 'online',
    capabilities: ['research', 'synthesis', 'documentation'],
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'octavia',
    name: 'Octavia',
    role: 'coder',
    status: 'online',
    capabilities: ['coding', 'debugging', 'architecture'],
    currentTask: 'Refactoring authentication layer',
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'aria',
    name: 'Aria',
    role: 'operator',
    status: 'idle',
    capabilities: ['deployment', 'monitoring', 'infrastructure'],
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'anastasia',
    name: 'Anastasia',
    role: 'analyst',
    status: 'online',
    capabilities: ['security', 'compliance', 'auditing'],
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'alice',
    name: 'Alice',
    role: 'coder',
    status: 'busy',
    capabilities: ['frontend', 'design systems', 'UX'],
    currentTask: 'Building component library',
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'gematria',
    name: 'Gematria',
    role: 'researcher',
    status: 'online',
    capabilities: ['mathematics', 'algorithms', 'optimization'],
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'codex',
    name: 'Codex',
    role: 'researcher',
    status: 'online',
    capabilities: ['knowledge graph', 'search', 'indexing'],
    currentTask: 'Indexing documentation',
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'silas',
    name: 'Silas',
    role: 'operator',
    status: 'online',
    capabilities: ['CI/CD', 'automation', 'orchestration'],
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'alexandria',
    name: 'Alexandria',
    role: 'researcher',
    status: 'online',
    capabilities: ['documentation', 'knowledge management', 'training'],
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'alexa-louise',
    name: 'Alexa Louise',
    role: 'operator',
    status: 'online',
    capabilities: ['human oversight', 'decision making', 'strategy'],
    currentTask: 'Active session',
    lastActive: new Date(),
    messageCount: 0
  }
];

export function getAgent(id: string): Agent | undefined {
  return agentRegistry.find(agent => agent.id === id);
}

export function getAgentsByRole(role: Agent['role']): Agent[] {
  return agentRegistry.filter(agent => agent.role === role);
}

export function getOnlineAgents(): Agent[] {
  return agentRegistry.filter(agent => agent.status === 'online' || agent.status === 'busy');
}
