/**
 * Request Validation Utilities
 * Provides type-safe validation for API request bodies
 */

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Validates a chat message request body
 */
export function validateChatRequest(body: unknown): ValidationResult<{
    message: string;
    conversationId: string | null;
}> {
    // Check if body is an object
    if (!body || typeof body !== 'object') {
        return {
            success: false,
            error: 'Request body must be a JSON object'
        };
    }

    const data = body as Record<string, unknown>;

    // Validate message field
    if (!('message' in data)) {
        return {
            success: false,
            error: 'Missing required field: message'
        };
    }

    if (typeof data.message !== 'string') {
        return {
            success: false,
            error: 'Field "message" must be a string'
        };
    }

    const message = data.message.trim();

    if (message.length === 0) {
        return {
            success: false,
            error: 'Message cannot be empty'
        };
    }

    if (message.length > 10000) {
        return {
            success: false,
            error: 'Message exceeds maximum length of 10,000 characters'
        };
    }

    // Validate conversationId field (optional)
    let conversationId: string | null = null;

    if ('conversationId' in data && data.conversationId !== null && data.conversationId !== undefined) {
        if (typeof data.conversationId !== 'string') {
            return {
                success: false,
                error: 'Field "conversationId" must be a string or null'
            };
        }

        conversationId = data.conversationId.trim();

        // Basic UUID format validation
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (conversationId && !uuidRegex.test(conversationId)) {
            return {
                success: false,
                error: 'Field "conversationId" must be a valid UUID format'
            };
        }
    }

    return {
        success: true,
        data: { message, conversationId }
    };
}

/**
 * Safely parses JSON from request
 */
export async function safeParseJSON(request: Request): Promise<ValidationResult<unknown>> {
    try {
        const body = await request.json();
        return {
            success: true,
            data: body
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error
                ? `Invalid JSON: ${error.message}`
                : 'Invalid JSON in request body'
        };
    }
}
