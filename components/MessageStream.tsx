'use client';

import { useAgentStore } from '@/lib/store';

interface MessageStreamProps {
  agentId: string;
}

export default function MessageStream({ agentId }: MessageStreamProps) {
  const { messages } = useAgentStore();
  const agentMessages = messages.filter(m => m.agentId === agentId);

  return (
    <div className="flex-1 overflow-auto p-4">
      {agentMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
          <div className="text-center">
            <div className="text-4xl mb-2">💬</div>
            <div>No messages yet</div>
            <div className="text-xs mt-1">Start a conversation with this agent</div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {agentMessages.map(message => (
            <div key={message.id} className="flex gap-3">
              <div className="text-xs text-neutral-500 w-16">
                {message.timestamp.toLocaleTimeString()}
              </div>
              <div className="flex-1">
                <div className="text-sm">{message.content}</div>
                {message.metadata?.status && (
                  <div className="text-xs text-neutral-500 mt-1">
                    {message.metadata.status}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
