/**
 * Guardrails Types and Interfaces
 */

export interface GuardrailResult {
  passed: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  blockedContent?: string;
  sanitizedMessage?: string;
}

export interface ValidationResult extends GuardrailResult {
  // Extends GuardrailResult with sanitizedMessage already included
}

export interface RateLimitInfo {
  allowed: boolean;
  remainingRequests?: number;
  resetTime?: Date;
}

export enum GuardrailViolationType {
  PROMPT_INJECTION = 'prompt_injection',
  JAILBREAK_ATTEMPT = 'jailbreak_attempt',
  PROFANITY = 'profanity',
  HARMFUL_CONTENT = 'harmful_content',
  EXCESSIVE_LENGTH = 'excessive_length',
  INVALID_FORMAT = 'invalid_format',
  UNSAFE_RESPONSE = 'unsafe_response',
  PII_DETECTED = 'pii_detected',
}

export interface GuardrailViolation {
  type: GuardrailViolationType;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  conversationId?: string;
}
