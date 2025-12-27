const CONVERSATION_ID_KEY = 'chatConversationId';

export function getConversationId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(CONVERSATION_ID_KEY);
  } catch (error) {
    console.error('Error reading conversationId:', error);
    return null;
  }
}

export function setConversationId(conversationId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CONVERSATION_ID_KEY, conversationId);
  } catch (error) {
    console.error('Error saving conversationId:', error);
  }
}

export function clearConversationId(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CONVERSATION_ID_KEY);
  } catch (error) {
    console.error('Error clearing conversationId:', error);
  }
}

export function hasConversationId(): boolean {
  return getConversationId() !== null;
}
