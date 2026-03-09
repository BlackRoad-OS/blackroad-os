'use client';

import type { Agent } from '@/types';
import MessageStream from './MessageStream';

interface AgentWorkspaceProps {
  agent: Agent;
}

export default function AgentWorkspace({ agent }: AgentWorkspaceProps) {
  return (
    <section className="flex-1 flex flex-col bg-neutral-950">
      {/* Agent Header */}
      <div className="border-b border-neutral-800 p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 flex items-center justify-center text-lg font-bold">
            {agent.name[0]}
          </div>
          
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{agent.name}</h1>
            <p className="text-sm text-neutral-400 capitalize">{agent.role}</p>
            
            <div className="flex gap-2 mt-2 flex-wrap">
              {agent.capabilities.map(cap => (
                <span key={cap} className="px-2 py-1 text-xs bg-neutral-800 rounded">
                  {cap}
                </span>
              ))}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-neutral-500">Status</div>
            <div className="text-sm font-medium capitalize">{agent.status}</div>
            {agent.currentTask && (
              <div className="text-xs text-neutral-400 mt-1">{agent.currentTask}</div>
            )}
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <MessageStream agentId={agent.id} />
    </section>
  );
}
