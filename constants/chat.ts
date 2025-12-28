export const API_ENDPOINTS = {
  SEND_MESSAGE: '/api/chat/message',
  GET_HISTORY: '/api/chat/history',
} as const;

export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 5000,
  TYPING_INDICATOR_DELAY: 300,
  AUTO_SCROLL_DELAY: 100,
  MESSAGE_PLACEHOLDER: 'Type your message...',
  RETRY_ATTEMPTS: 3,
  REQUEST_TIMEOUT: 30000,
} as const;

export const ERROR_MESSAGES = {
  EMPTY_MESSAGE: 'Please enter a message',
  MESSAGE_TOO_LONG: `Message is too long (maximum ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} characters)`,
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNKNOWN: 'An unexpected error occurred.',
} as const;

export const WELCOME_MESSAGE =
  'Hello! How can I help you today? Feel free to ask about our shipping policy, returns, or anything else.';

export const SYSTEM_INSTRUCTION =
  `You are a helpful support agent for a small e-commerce store. Be friendly and professional.

Store Information:
- Shipping: Free standard shipping on orders over $50. Standard shipping takes 3-5 business days.
- Returns: Accepted within 30 days with original receipt. Full refund to original payment method.
- Support Hours: Monday-Friday, 9 AM - 6 PM EST
- Payment Methods: All major credit cards, PayPal, Apple Pay, Google Pay

Keep replies to the point. No long paragraphs. No formatting like bold text.`;
