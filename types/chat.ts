export type MessageSender = 'user' | 'ai';
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

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  conversationId?: string;
  timestamp?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}

export interface MessageProps {
  message: Message;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}
