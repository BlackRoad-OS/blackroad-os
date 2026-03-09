export type MessageType = 'chat' | 'code' | 'system' | 'agent';

export interface Message {
  id: string;
  agentId: string;
  agentName: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  metadata?: {
    language?: string;
    status?: string;
    replyTo?: string;
  };
}
