/**
 * MessageList Component
 * Scrollable list of messages with auto-scroll to latest
 * Based on TODO.md requirements
 */

'use client';

import { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/types/chat';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import { CHAT_CONFIG, WELCOME_MESSAGE } from '@/constants/chat';

interface MessageListProps {
  messages: MessageType[];
  isTyping?: boolean;
}

export default function MessageList({ messages, isTyping = false }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when new messages arrive
   * Based on TODO.md: Auto scroll to latest
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, CHAT_CONFIG.AUTO_SCROLL_DELAY);

    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden bg-white"
    >
      <div className="flex flex-col">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-8 w-8 text-blue-500"
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
              <h3 className="text-lg font-semibold text-gray-900">
                Welcome to Support Chat
              </h3>
              <p className="mt-2 max-w-md text-sm text-gray-600">
                {WELCOME_MESSAGE}
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
