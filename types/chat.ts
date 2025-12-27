export type MessageSender = 'user' | 'model';
export type MessageStatus = 'sending' | 'sent' | 'error';

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
}

export interface Conversation {
  id: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived' | 'closed';
}


export interface ChatResponse {
  reply: string;
  sessionId: string;
  conversationId?: string;
  timestamp?: string;
}


export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}


