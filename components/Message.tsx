/**
 * Message Component
 * Displays a single message (user or AI)
 * Based on TODO.md: Distinguish user vs AI messages
 */

import { Message as MessageType } from '@/types/chat';
import { formatTimestamp } from '@/lib/messageUtils';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-gray-700' : 'bg-blue-500'
        }`}
      >
        {isUser ? (
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5 text-white"
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
        )}
      </div>

      {/* Message content */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`max-w-sm rounded-2xl px-4 py-2 ${
            isUser
              ? 'bg-gray-700 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
        <div className="mt-1 flex items-center gap-2 px-2">
          <span className="text-xs text-gray-500">
            {formatTimestamp(message.timestamp)}
          </span>
          {message.status === 'sending' && (
            <span className="text-xs text-gray-400">Sending...</span>
          )}
          {message.status === 'error' && (
            <span className="text-xs text-red-500">Failed</span>
          )}
        </div>
      </div>
    </div>
  );
}
