import { create } from 'zustand';
import type { Agent, Message } from '@/types';

interface AgentStore {
  agents: Agent[];
  activeAgentId: string | null;
  messages: Message[];
  
  setAgents: (agents: Agent[]) => void;
  setActiveAgent: (id: string | null) => void;
  addMessage: (message: Message) => void;
  updateAgentStatus: (id: string, status: Agent['status']) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  activeAgentId: null,
  messages: [],
  
  setAgents: (agents) => set({ agents }),
  
  setActiveAgent: (id) => set({ activeAgentId: id }),
  
  addMessage: (message) => 
    set((state) => ({ 
      messages: [...state.messages, message] 
    })),
  
  updateAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map(agent =>
        agent.id === id ? { ...agent, status } : agent
      )
    }))
}));
