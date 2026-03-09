'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAgentStore } from '@/lib/store';
import { agentRegistry } from '@/lib/agents';
import AgentCard from './AgentCard';

export default function AgentPanel() {
  const pathname = usePathname();
  const { agents, activeAgentId, setAgents, setActiveAgent } = useAgentStore();

  useEffect(() => {
    setAgents(agentRegistry);
  }, [setAgents]);

  useEffect(() => {
    const match = pathname.match(/\/agents\/([^\/]+)/);
    if (match) {
      setActiveAgent(match[1]);
    } else {
      setActiveAgent(null);
    }
  }, [pathname, setActiveAgent]);

  const onlineCount = agents.filter(a => a.status === 'online' || a.status === 'busy').length;

  return (
    <aside className="w-72 border-r border-neutral-800 p-4 flex flex-col">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-semibold">Agents</h2>
        <span className="text-xs text-neutral-500">
          {onlineCount}/{agents.length} online
        </span>
      </div>

      <div className="flex-1 overflow-auto space-y-1">
        {agents.map(agent => (
          <AgentCard 
            key={agent.id} 
            agent={agent}
            isActive={agent.id === activeAgentId}
          />
        ))}
      </div>

      <div className="mt-3 border-t border-neutral-800 pt-2">
        <input 
          type="text"
          placeholder="Message agents..."
          className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </aside>
  );
}
