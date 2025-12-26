/**
 * Chat-related constants
 */

/**
 * API endpoints
 * Note: These will be implemented by backend
 */
export const API_ENDPOINTS = {
  SEND_MESSAGE: '/api/chat/message',
  GET_HISTORY: '/api/chat/history',
} as const;

/**
 * UI configuration
 */
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 5000,
  TYPING_INDICATOR_DELAY: 300, // ms
  AUTO_SCROLL_DELAY: 100, // ms
  MESSAGE_PLACEHOLDER: 'Type your message...',
  RETRY_ATTEMPTS: 3,
  REQUEST_TIMEOUT: 30000, // 30 seconds
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  EMPTY_MESSAGE: 'Please enter a message',
  MESSAGE_TOO_LONG: `Message is too long (maximum ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} characters)`,
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNKNOWN: 'An unexpected error occurred.',
} as const;

/**
 * Welcome message from AI
 */
export const WELCOME_MESSAGE =
  'Hello! How can I help you today? Feel free to ask about our shipping policy, returns, or anything else.';
