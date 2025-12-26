/**
 * Message utility functions
 * Helpers for message creation, formatting, and validation
 */

import { Message, MessageSender } from '@/types/chat';

/**
 * Create a new message object
 */
export function createMessage(
  content: string,
  sender: MessageSender,
  conversationId: string = 'temp'
): Message {
  return {
    id: generateTempId(),
    conversationId,
    sender,
    content,
    timestamp: new Date(),
    status: sender === 'user' ? 'sending' : 'sent',
  };
}

/**
 * Generate a temporary ID for optimistic UI updates
 * Will be replaced by server-generated ID
 */
function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate message content
 * Returns error message if invalid, null if valid
 */
export function validateMessage(content: string): string | null {
  const trimmed = content.trim();

  if (!trimmed) {
    return 'Message cannot be empty';
  }

  if (trimmed.length > 5000) {
    return 'Message is too long (maximum 5000 characters)';
  }

  return null;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return 'Just now';
  }

  if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  // Same day
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Different day
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Truncate long text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}
