/**
 * Session management utilities
 * Handles sessionId storage and retrieval from localStorage
 * Based on FLOW.md specification
 */

const SESSION_ID_KEY = 'chatSessionId';

/**
 * Retrieve sessionId from localStorage
 * Returns null if not found (first visit)
 */
export function getSessionId(): string | null {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }

  try {
    return localStorage.getItem(SESSION_ID_KEY);
  } catch (error) {
    console.error('Error reading sessionId from localStorage:', error);
    return null;
  }
}

/**
 * Store sessionId in localStorage
 * Called after receiving sessionId from backend
 */
export function setSessionId(sessionId: string): void {
  if (typeof window === 'undefined') {
    return; // Server-side rendering
  }

  try {
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  } catch (error) {
    console.error('Error saving sessionId to localStorage:', error);
  }
}

/**
 * Clear sessionId from localStorage
 * Used when starting a new conversation
 */
export function clearSessionId(): void {
  if (typeof window === 'undefined') {
    return; // Server-side rendering
  }

  try {
    localStorage.removeItem(SESSION_ID_KEY);
  } catch (error) {
    console.error('Error clearing sessionId from localStorage:', error);
  }
}

/**
 * Check if a sessionId exists in localStorage
 */
export function hasSessionId(): boolean {
  return getSessionId() !== null;
}
