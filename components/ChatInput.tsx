'use client';

import { useState, useRef, FormEvent, KeyboardEvent } from 'react';
import { validateMessage } from '@/lib/messageUtils';
import { CHAT_CONFIG } from '@/constants/chat';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSendMessage,
  disabled,
  placeholder = CHAT_CONFIG.MESSAGE_PLACEHOLDER,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const sendMessage = () => {
    const validationError = validateMessage(message);

    if (validationError) {
      setError(validationError);
      return;
    }

    onSendMessage(message.trim());
    setMessage('');
    setError(null);

    // Return focus to input after sending
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) {
        sendMessage();
      }
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Error display */}
        {error && (
          <div className="text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Input area */}
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              maxLength={CHAT_CONFIG.MAX_MESSAGE_LENGTH}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
              style={{
                minHeight: '48px',
                maxHeight: '120px',
              }}
            />
            {/* Character count */}
            {message.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {message.length}/{CHAT_CONFIG.MAX_MESSAGE_LENGTH}
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:bg-gray-300"
            aria-label="Send message"
          >
            {disabled ? (
              <svg
                className="h-5 w-5 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Helper text */}
        <div className="text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    </div>
  );
}
