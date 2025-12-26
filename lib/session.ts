const SESSION_ID_KEY = 'chatSessionId';

export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(SESSION_ID_KEY);
  } catch (error) {
    console.error('Error reading sessionId:', error);
    return null;
  }
}

export function setSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  } catch (error) {
    console.error('Error saving sessionId:', error);
  }
}

export function clearSessionId(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SESSION_ID_KEY);
  } catch (error) {
    console.error('Error clearing sessionId:', error);
  }
}

export function hasSessionId(): boolean {
  return getSessionId() !== null;
}
