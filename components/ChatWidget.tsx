'use client';

import { useState, useEffect } from 'react';
import { Message, ChatState } from '@/types/chat';
import { getConversationId, setConversationId } from '@/lib/conversation';
import { createMessage } from '@/lib/messageUtils';
import { sendMessage, getConversationHistory } from '@/services/chatService';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ErrorMessage from './ErrorMessage';
import { ERROR_MESSAGES } from '@/constants/chat';
import { HistoryMessage } from '@/types/api';

export default function ChatWidget() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    conversationId: null,
  });

  useEffect(() => {
    const loadConversation = async () => {
      const storedConversationId = getConversationId();
      if (storedConversationId) {
        setState((prev) => ({
          ...prev,
          conversationId: storedConversationId,
          isLoading: true
        }));

        try {
          const response = await getConversationHistory(storedConversationId);

          // Transform HistoryMessage[] to Message[]
          const messages: Message[] = response.data.messages.map((historyMsg: HistoryMessage) => ({
            id: historyMsg.id,
            conversationId: storedConversationId,
            sender: historyMsg.sender,
            content: historyMsg.text,
            timestamp: new Date(historyMsg.timestamp),
            status: 'sent' as const,
          }));

          setState((prev) => ({
            ...prev,
            messages,
            isLoading: false,
          }));
        } catch (error) {
          console.error('Failed to load conversation history:', error);
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Failed to load conversation history',
          }));
        }
      }
    };

    loadConversation();
  }, []);

  const handleSendMessage = async (content: string) => {
    const userMessage = createMessage(content, 'user');

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await sendMessage(content, state.conversationId);

      if (!state.conversationId && response.data.conversationId) {
        setConversationId(response.data.conversationId);
        setState((prev) => ({ ...prev, conversationId: response.data.conversationId }));
      }

      const aiMessage = createMessage(
        response.data.message,
        'model',
        response.data.conversationId || 'temp'
      );

      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages.map((msg) =>
            msg.id === userMessage.id ? { ...msg, status: 'sent' as const } : msg
          ),
          aiMessage,
        ],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to send message:', error);

      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN;

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
        ),
      }));
    }
  };

  const handleRetry = () => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && lastMessage.sender === 'user' && lastMessage.status === 'error') {
      setState((prev) => ({
        ...prev,
        messages: prev.messages.slice(0, -1),
        error: null,
      }));
      handleSendMessage(lastMessage.content);
    } else {
      setState((prev) => ({ ...prev, error: null }));
    }
  };

  const handleDismissError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return (
    <div className="flex h-screen flex-col bg-white">
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

      {state.error && (
        <ErrorMessage
          message={state.error}
          onRetry={handleRetry}
          onDismiss={handleDismissError}
        />
      )}

      <MessageList messages={state.messages} isTyping={state.isLoading} />

      <ChatInput onSendMessage={handleSendMessage} disabled={state.isLoading} />
    </div>
  );
}
