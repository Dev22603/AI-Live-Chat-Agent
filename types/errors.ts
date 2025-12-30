/**
 * Error Types and Classes
 * Provides structured error handling across the application
 */

/**
 * Error codes for different error types
 */
export enum ErrorCode {
    // Validation Errors (400-499)
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INVALID_INPUT = 'INVALID_INPUT',
    MISSING_FIELD = 'MISSING_FIELD',
    INVALID_FORMAT = 'INVALID_FORMAT',

    // Authentication Errors (401-403)
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',

    // Resource Errors (404-409)
    NOT_FOUND = 'NOT_FOUND',
    CONFLICT = 'CONFLICT',

    // Rate Limiting (429)
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

    // Server Errors (500-599)
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

    // Guardrail Errors
    CONTENT_POLICY_VIOLATION = 'CONTENT_POLICY_VIOLATION',
    PROMPT_INJECTION_DETECTED = 'PROMPT_INJECTION_DETECTED',
}

/**
 * Base application error class
 */
export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly metadata?: Record<string, unknown>;

    constructor(
        message: string,
        code: ErrorCode,
        statusCode: number,
        isOperational: boolean = true,
        metadata?: Record<string, unknown>
    ) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.metadata = metadata;

        // Maintains proper stack trace
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
    constructor(message: string, metadata?: Record<string, unknown>) {
        super(message, ErrorCode.VALIDATION_ERROR, 400, true, metadata);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
    constructor(message: string, metadata?: Record<string, unknown>) {
        super(message, ErrorCode.DATABASE_ERROR, 500, true, metadata);
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }
}

/**
 * Guardrail violation error
 */
export class GuardrailError extends AppError {
    constructor(message: string, code: ErrorCode, metadata?: Record<string, unknown>) {
        super(message, code, 400, true, metadata);
        Object.setPrototypeOf(this, GuardrailError.prototype);
    }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
    constructor(message: string, metadata?: Record<string, unknown>) {
        super(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429, true, metadata);
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
    if (isAppError(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

/**
 * Format error for API response
 */
export interface ErrorResponse {
    code: string;
    message: string;
    statusCode: number;
    metadata?: Record<string, unknown>;
}

export function formatErrorResponse(error: unknown): ErrorResponse {
    if (isAppError(error)) {
        return {
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
            metadata: error.metadata,
        };
    }

    // Default error response for unknown errors
    return {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
        statusCode: 500,
    };
}
