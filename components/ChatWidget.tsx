/**
 * ChatWidget Component
 * Main chat interface with state management
 * Implements the flow described in FLOW.md
 */

'use client';

import { useState, useEffect } from 'react';
import { Message, ChatState } from '@/types/chat';
import { getSessionId, setSessionId } from '@/lib/session';
import { createMessage } from '@/lib/messageUtils';
import { sendMessage } from '@/services/chatService';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ErrorMessage from './ErrorMessage';
import { ERROR_MESSAGES, CHAT_CONFIG } from '@/constants/chat';

export default function ChatWidget() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: null,
  });

  /**
   * Initialize sessionId from localStorage on mount
   * Based on FLOW.md: Frontend reads stored value
   */
  useEffect(() => {
    const storedSessionId = getSessionId();
    if (storedSessionId) {
      setState((prev) => ({ ...prev, sessionId: storedSessionId }));
    }
  }, []);

  /**
   * Handle sending a message
   * Implements the flow from FLOW.md and TODO.md requirements
   */
  const handleSendMessage = async (content: string) => {
    // Create user message for optimistic UI update
    const userMessage = createMessage(content, 'user');

    // Add user message to UI immediately
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // Call API with message and sessionId
      // Based on FLOW.md: Frontend sends sessionId with every request
      const response = await sendMessage(content, state.sessionId);

      // Store sessionId if this is first message
      // Based on FLOW.md: Frontend stores sessionId from response
      if (!state.sessionId && response.sessionId) {
        setSessionId(response.sessionId);
        setState((prev) => ({ ...prev, sessionId: response.sessionId }));
      }

      // Create AI response message
      const aiMessage = createMessage(
        response.reply,
        'ai',
        response.conversationId || 'temp'
      );

      // Update UI with successful response
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false,
      }));
    } catch (error) {
      // Handle errors gracefully
      // Based on TODO.md: Show error messages cleanly
      console.error('Failed to send message:', error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.UNKNOWN;

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Mark user message as failed
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
        ),
      }));
    }
  };

  /**
   * Retry sending the last failed message
   */
  const handleRetry = () => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && lastMessage.sender === 'user' && lastMessage.status === 'error') {
      // Remove failed message and resend
      setState((prev) => ({
        ...prev,
        messages: prev.messages.slice(0, -1),
        error: null,
      }));
      handleSendMessage(lastMessage.content);
    } else {
      // Just clear error
      setState((prev) => ({ ...prev, error: null }));
    }
  };

  /**
   * Dismiss error message
   */
  const handleDismissError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Support Chat
            </h2>
            <p className="text-sm text-gray-500">
              We typically reply within a few minutes
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {state.error && (
        <ErrorMessage
          message={state.error}
          onRetry={handleRetry}
          onDismiss={handleDismissError}
        />
      )}

      {/* Message list */}
      <MessageList
        messages={state.messages}
        isTyping={state.isLoading}
      />

      {/* Input area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={state.isLoading}
      />
    </div>
  );
}
