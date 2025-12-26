/**
 * Chat API Service Layer
 * All API calls should go through this service
 *
 * NOTE: This contains mock implementations for development
 * Replace with actual API calls once backend is ready
 * See API_INTEGRATION.md for integration details
 */

import { ChatRequest, ChatResponse, ApiError } from '@/types/chat';
import { API_ENDPOINTS, CHAT_CONFIG } from '@/constants/chat';

/**
 * Send a chat message to the backend
 *
 * @param message - User's message content
 * @param sessionId - Optional sessionId from localStorage
 * @returns Promise with AI reply and sessionId
 *
 * Backend endpoint: POST /api/chat/message
 * Request: { message: string, sessionId?: string }
 * Response: { reply: string, sessionId: string }
 */
export async function sendMessage(
  message: string,
  sessionId?: string | null
): Promise<ChatResponse> {
  try {
    // TODO: Replace this mock with actual API call
    // Example implementation:
    /*
    const response = await fetch(API_ENDPOINTS.SEND_MESSAGE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId: sessionId || undefined,
      } as ChatRequest),
      signal: AbortSignal.timeout(CHAT_CONFIG.REQUEST_TIMEOUT),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to send message');
    }

    const data: ChatResponse = await response.json();
    return data;
    */

    // MOCK IMPLEMENTATION - Remove when backend is ready
    return mockSendMessage(message, sessionId);
  } catch (error) {
    console.error('Error sending message:', error);
    throw handleApiError(error);
  }
}

/**
 * Fetch conversation history (optional feature)
 *
 * @param sessionId - Session ID to fetch history for
 * @returns Promise with array of messages
 *
 * Backend endpoint: GET /api/chat/history?sessionId={sessionId}
 */
export async function getConversationHistory(
  sessionId: string
): Promise<ChatResponse[]> {
  try {
    // TODO: Replace this mock with actual API call
    // Example implementation:
    /*
    const response = await fetch(
      `${API_ENDPOINTS.GET_HISTORY}?sessionId=${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(CHAT_CONFIG.REQUEST_TIMEOUT),
      }
    );

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to fetch history');
    }

    const data = await response.json();
    return data.messages || [];
    */

    // MOCK IMPLEMENTATION - Remove when backend is ready
    return mockGetHistory(sessionId);
  } catch (error) {
    console.error('Error fetching history:', error);
    throw handleApiError(error);
  }
}

/**
 * Handle and normalize API errors
 */
function handleApiError(error: unknown): Error {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return new Error('Request timed out. Please try again.');
    }
    return error;
  }
  return new Error('An unexpected error occurred');
}

// ============================================================================
// MOCK IMPLEMENTATIONS - DELETE THESE WHEN BACKEND IS READY
// ============================================================================

/**
 * Mock implementation of sendMessage
 * Simulates backend response with delay
 */
async function mockSendMessage(
  message: string,
  sessionId?: string | null
): Promise<ChatResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Generate or reuse sessionId
  const responseSessionId = sessionId || `mock-session-${Date.now()}`;

  // Simple mock responses based on keywords
  let reply = '';

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('shipping')) {
    reply =
      'We offer free standard shipping on all orders over $50. Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available for $15.';
  } else if (lowerMessage.includes('return')) {
    reply =
      'We accept returns within 30 days of purchase with the original receipt. Items must be unused and in original packaging. Full refund will be issued to the original payment method within 5-7 business days.';
  } else if (lowerMessage.includes('support') || lowerMessage.includes('hours')) {
    reply =
      'Our customer support team is available Monday through Friday, 9:00 AM - 6:00 PM EST. You can also email us anytime at support@example.com and we will respond within 24 hours.';
  } else if (lowerMessage.includes('payment')) {
    reply =
      'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, and Google Pay.';
  } else if (lowerMessage.includes('track')) {
    reply =
      'Once your order ships, you will receive a confirmation email with a tracking number. You can use this number on our website or the carrier\'s website to track your package.';
  } else if (
    lowerMessage.includes('hello') ||
    lowerMessage.includes('hi') ||
    lowerMessage.includes('hey')
  ) {
    reply =
      'Hello! How can I help you today? Feel free to ask about our shipping policy, returns, payment methods, or order tracking.';
  } else {
    reply =
      'Thank you for your message. I can help you with questions about shipping, returns, payment methods, and order tracking. What would you like to know?';
  }

  return {
    reply,
    sessionId: responseSessionId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Mock implementation of getConversationHistory
 */
async function mockGetHistory(sessionId: string): Promise<ChatResponse[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return empty history for mock
  return [];
}
