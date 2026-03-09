'use client';

import Link from 'next/link';
import type { Agent } from '@/types';

const statusColors = {
  online: 'bg-green-500',
  busy: 'bg-yellow-500',
  idle: 'bg-neutral-500',
  offline: 'bg-red-500'
};

interface AgentCardProps {
  agent: Agent;
  isActive?: boolean;
}

export default function AgentCard({ agent, isActive }: AgentCardProps) {
  return (
    <Link
      href={`/agents/${agent.id}`}
      className={`
        block p-2 rounded-md hover:bg-neutral-800 transition-colors
        ${isActive ? 'bg-neutral-800 ring-1 ring-neutral-600' : ''}
      `}
    >
      <div className="flex items-start gap-2">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-medium">
            {agent.name[0]}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-neutral-900 ${statusColors[agent.status]}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-sm text-neutral-100">{agent.name}</span>
            <span className="text-xs text-neutral-500">{agent.role}</span>
          </div>
          
          {agent.currentTask && (
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {agent.currentTask}
            </p>
          )}
          
          {agent.messageCount > 0 && (
            <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
              {agent.messageCount} new
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
