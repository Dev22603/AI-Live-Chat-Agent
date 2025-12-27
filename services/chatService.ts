import { ApiResponse, ChatData, GetHistoryData } from '@/types/api';

export async function sendMessage(
  message: string,
  conversationId?: string | null
): Promise<ApiResponse<ChatData>> {
  try {
    // TODO: Replace with actual API call when backend is ready
    return mockSendMessage(message, conversationId);
  } catch (error) {
    console.error('Error sending message:', error);
    throw handleApiError(error);
  }
}

export async function getConversationHistory(
  conversationId: string
): Promise<ApiResponse<GetHistoryData>> {
  try {
    // TODO: Replace with actual API call when backend is ready
    return mockGetHistory(conversationId);
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

async function mockSendMessage(
  message: string,
  conversationId?: string | null
): Promise<ApiResponse<ChatData>> {
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  const responseConversationId = conversationId || `mock-conv-${Date.now()}`;
  const lowerMessage = message.toLowerCase();
  let reply = '';

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
    code: 201,
    message: 'message sent',
    data: {
      message: reply,
      conversationId: responseConversationId,
    },
  };
}

async function mockGetHistory(conversationId: string): Promise<ApiResponse<GetHistoryData>> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    code: 200,
    message: 'history retrieved',
    data: {
      conversationId,
      messages: [],
    },
  };
}
