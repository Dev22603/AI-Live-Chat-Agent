/**
 * Chat-related TypeScript types
 * Based on TODO.md and FLOW.md specifications
 */

/**
 * Message sender type
 */
export type MessageSender = 'user' | 'ai';

/**
 * Message status for UI feedback
 */
export type MessageStatus = 'sending' | 'sent' | 'error';

/**
 * Individual message in a conversation
 */
export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
}

/**
 * Conversation metadata
 */
export interface Conversation {
  id: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived' | 'closed';
}

/**
 * API Request/Response Types
 */

/**
 * Request body for POST /api/chat
 * Based on FLOW.md specification
 */
export interface ChatRequest {
  message: string;
  sessionId?: string;
}

/**
 * Response body for POST /api/chat
 * Based on FLOW.md specification
 */
export interface ChatResponse {
  reply: string;
  sessionId: string;
  conversationId?: string;
  timestamp?: string;
}

/**
 * Error response from API
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}

/**
 * UI State Types
 */

/**
 * Chat widget state
 */
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}

/**
 * Message display props
 */
export interface MessageProps {
  message: Message;
}

/**
 * Chat input props
 */
export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}
