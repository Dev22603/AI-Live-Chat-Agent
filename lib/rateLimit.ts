/**
 * Rate Limiting Utility
 * Implements in-memory rate limiting per conversation
 */

import { GUARDRAIL_CONFIG } from '@/lib/guardrails/config';
import { RateLimitError } from '@/types/errors';

interface RateLimitEntry {
    timestamps: number[];
}

// In-memory store for rate limiting
// In production, use Redis or similar distributed cache
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Cleans up old timestamps from rate limit entry
 */
function cleanupTimestamps(timestamps: number[], windowMs: number): number[] {
    const now = Date.now();
    return timestamps.filter(t => now - t < windowMs);
}

/**
 * Checks if request exceeds rate limit
 */
export function checkRateLimit(conversationId: string): void {
    const now = Date.now();
    const minuteWindow = 60 * 1000; // 1 minute
    const hourWindow = 60 * 60 * 1000; // 1 hour

    // Get or create rate limit entry
    let entry = rateLimitStore.get(conversationId);
    if (!entry) {
        entry = { timestamps: [] };
        rateLimitStore.set(conversationId, entry);
    }

    // Clean up old timestamps
    entry.timestamps = cleanupTimestamps(entry.timestamps, hourWindow);

    // Count messages in windows
    const messagesInMinute = entry.timestamps.filter(t => now - t < minuteWindow).length;
    const messagesInHour = entry.timestamps.length;

    // Check limits
    if (messagesInMinute >= GUARDRAIL_CONFIG.MAX_MESSAGES_PER_MINUTE) {
        throw new RateLimitError(
            `Rate limit exceeded: Maximum ${GUARDRAIL_CONFIG.MAX_MESSAGES_PER_MINUTE} messages per minute`,
            {
                limit: GUARDRAIL_CONFIG.MAX_MESSAGES_PER_MINUTE,
                window: 'minute',
                retryAfter: 60,
            }
        );
    }

    if (messagesInHour >= GUARDRAIL_CONFIG.MAX_MESSAGES_PER_HOUR) {
        throw new RateLimitError(
            `Rate limit exceeded: Maximum ${GUARDRAIL_CONFIG.MAX_MESSAGES_PER_HOUR} messages per hour`,
            {
                limit: GUARDRAIL_CONFIG.MAX_MESSAGES_PER_HOUR,
                window: 'hour',
                retryAfter: 3600,
            }
        );
    }

    // Add current timestamp
    entry.timestamps.push(now);
}

/**
 * Clears rate limit data for a conversation
 */
export function clearRateLimit(conversationId: string): void {
    rateLimitStore.delete(conversationId);
}

/**
 * Gets current rate limit status for a conversation
 */
export function getRateLimitStatus(conversationId: string): {
    messagesInMinute: number;
    messagesInHour: number;
    remainingMinute: number;
    remainingHour: number;
} {
    const now = Date.now();
    const minuteWindow = 60 * 1000;
    const hourWindow = 60 * 60 * 1000;

    const entry = rateLimitStore.get(conversationId);
    if (!entry) {
        return {
            messagesInMinute: 0,
            messagesInHour: 0,
            remainingMinute: GUARDRAIL_CONFIG.MAX_MESSAGES_PER_MINUTE,
            remainingHour: GUARDRAIL_CONFIG.MAX_MESSAGES_PER_HOUR,
        };
    }

    const cleanTimestamps = cleanupTimestamps(entry.timestamps, hourWindow);
    const messagesInMinute = cleanTimestamps.filter(t => now - t < minuteWindow).length;
    const messagesInHour = cleanTimestamps.length;

    return {
        messagesInMinute,
        messagesInHour,
        remainingMinute: Math.max(0, GUARDRAIL_CONFIG.MAX_MESSAGES_PER_MINUTE - messagesInMinute),
        remainingHour: Math.max(0, GUARDRAIL_CONFIG.MAX_MESSAGES_PER_HOUR - messagesInHour),
    };
}

/**
 * Cleanup task to periodically remove old rate limit entries
 * Call this periodically (e.g., every hour) to prevent memory leaks
 */
export function cleanupRateLimitStore(): void {
    const now = Date.now();
    const hourWindow = 60 * 60 * 1000;

    for (const [conversationId, entry] of rateLimitStore.entries()) {
        entry.timestamps = cleanupTimestamps(entry.timestamps, hourWindow);

        // Remove entry if no timestamps left
        if (entry.timestamps.length === 0) {
            rateLimitStore.delete(conversationId);
        }
    }
}

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupRateLimitStore, 60 * 60 * 1000);
}
