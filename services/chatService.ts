import { ApiResponse, ChatData, HistoryData } from '@/types/api';
import { API_ENDPOINTS, CHAT_CONFIG } from '@/constants/chat';

export async function sendMessage(
  message: string,
  conversationId?: string | null
): Promise<ApiResponse<ChatData>> {
  try {
    const response = await fetch(API_ENDPOINTS.SEND_MESSAGE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationId: conversationId || undefined,
      }),
      signal: AbortSignal.timeout(CHAT_CONFIG.REQUEST_TIMEOUT),
    });

    if (!response.ok) {
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      } else {
        // Response is not JSON (likely HTML error page)
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse.substring(0, 200));
        throw new Error(`Server error (${response.status}): Unable to process request`);
      }
    }

    // Parse JSON response
    const data: ApiResponse<ChatData> = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw handleApiError(error);
  }
}

export async function getConversationHistory(
  conversationId: string
): Promise<ApiResponse<HistoryData>> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.GET_HISTORY}?conversationId=${encodeURIComponent(conversationId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(CHAT_CONFIG.REQUEST_TIMEOUT),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch history');
    }

    const data: ApiResponse<HistoryData> = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw handleApiError(error);
  }
}

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
// MOCK IMPLEMENTATIONS - COMMENTED OUT (Real APIs now integrated)
// ============================================================================

// async function mockSendMessage(
//   message: string,
//   conversationId?: string | null
// ): Promise<ApiResponse<ChatData>> {
//   await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
//
//   const responseConversationId = conversationId || `mock-conv-${Date.now()}`;
//   const lowerMessage = message.toLowerCase();
//   let reply = '';
//
//   if (lowerMessage.includes('shipping')) {
//     reply =
//       'We offer free standard shipping on all orders over $50. Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available for $15.';
//   } else if (lowerMessage.includes('return')) {
//     reply =
//       'We accept returns within 30 days of purchase with the original receipt. Items must be unused and in original packaging. Full refund will be issued to the original payment method within 5-7 business days.';
//   } else if (lowerMessage.includes('support') || lowerMessage.includes('hours')) {
//     reply =
//       'Our customer support team is available Monday through Friday, 9:00 AM - 6:00 PM EST. You can also email us anytime at support@example.com and we will respond within 24 hours.';
//   } else if (lowerMessage.includes('payment')) {
//     reply =
//       'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, and Google Pay.';
//   } else if (lowerMessage.includes('track')) {
//     reply =
//       'Once your order ships, you will receive a confirmation email with a tracking number. You can use this number on our website or the carrier\'s website to track your package.';
//   } else if (
//     lowerMessage.includes('hello') ||
//     lowerMessage.includes('hi') ||
//     lowerMessage.includes('hey')
//   ) {
//     reply =
//       'Hello! How can I help you today? Feel free to ask about our shipping policy, returns, payment methods, or order tracking.';
//   } else {
//     reply =
//       'Thank you for your message. I can help you with questions about shipping, returns, payment methods, and order tracking. What would you like to know?';
//   }
//
//   return {
//     code: 201,
//     message: 'message sent',
//     data: {
//       message: reply,
//       conversationId: responseConversationId,
//     },
//   };
// }
//
// async function mockGetHistory(conversationId: string): Promise<ApiResponse<HistoryData>> {
//   await new Promise((resolve) => setTimeout(resolve, 500));
//   return {
//     code: 200,
//     message: 'history retrieved',
//     data: {
//       conversationId,
//       messages: [],
//     },
//   };
// }
