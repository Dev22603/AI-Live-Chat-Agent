import { Message, MessageSender } from '@/types/chat';
import { validateInputFrontend, quickJailbreakCheck } from '@/lib/guardrails';

export function createMessage(
  content: string,
  sender: MessageSender,
  conversationId: string = 'temp'
): Message {
  return {
    id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    conversationId,
    sender,
    content,
    timestamp: new Date(),
    status: sender === 'user' ? 'sending' : 'sent',
  };
}

export function validateMessage(content: string): string | null {
  const trimmed = content.trim();

  if (!trimmed) {
    return 'Message cannot be empty';
  }

  if (trimmed.length > 5000) {
    return 'Message is too long (maximum 5000 characters)';
  }

  // Apply frontend guardrails (less strict than backend)
  const validationResult = validateInputFrontend(trimmed);
  if (!validationResult.passed) {
    return validationResult.reason || 'Invalid message';
  }

  // Quick jailbreak check
  if (quickJailbreakCheck(trimmed)) {
    return 'Message contains suspicious content';
  }

  return null;
}

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

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

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
