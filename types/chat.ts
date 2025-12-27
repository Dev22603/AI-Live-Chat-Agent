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
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
}


