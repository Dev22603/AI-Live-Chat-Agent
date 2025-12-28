/**
 * Input Validation Guardrail
 * Validates user messages for basic format, length, and safety
 */

import { ValidationResult } from './types';
import { GUARDRAIL_CONFIG, SUSPICIOUS_URL_PATTERNS, PII_PATTERNS } from './config';

/**
 * Validates message length
 */
function validateLength(message: string): ValidationResult {
  const length = message.length;
  const wordCount = message.split(/\s+/).filter(w => w.length > 0).length;

  if (length < GUARDRAIL_CONFIG.MIN_MESSAGE_LENGTH) {
    return {
      passed: false,
      reason: 'Message is too short',
      severity: 'low',
    };
  }

  if (length > GUARDRAIL_CONFIG.MAX_MESSAGE_LENGTH) {
    return {
      passed: false,
      reason: `Message exceeds maximum length of ${GUARDRAIL_CONFIG.MAX_MESSAGE_LENGTH} characters`,
      severity: 'medium',
    };
  }

  if (wordCount > GUARDRAIL_CONFIG.MAX_WORDS) {
    return {
      passed: false,
      reason: `Message exceeds maximum word count of ${GUARDRAIL_CONFIG.MAX_WORDS} words`,
      severity: 'medium',
    };
  }

  return { passed: true };
}

/**
 * Validates message format and structure
 */
function validateFormat(message: string): ValidationResult {
  // Check for null bytes
  if (message.includes('\0')) {
    return {
      passed: false,
      reason: 'Message contains invalid characters',
      severity: 'high',
    };
  }

  // Check for excessive repetition (potential spam)
  const repeatedPattern = /(.{3,})\1{5,}/;
  if (repeatedPattern.test(message)) {
    return {
      passed: false,
      reason: 'Message contains excessive repetition',
      severity: 'medium',
    };
  }

  // Check for excessive special characters
  const specialCharCount = (message.match(/[^a-zA-Z0-9\s.,!?'"()-]/g) || []).length;
  const specialCharRatio = specialCharCount / message.length;

  if (specialCharRatio > 0.3) {
    return {
      passed: false,
      reason: 'Message contains too many special characters',
      severity: 'medium',
    };
  }

  return { passed: true };
}

/**
 * Checks for suspicious URLs
 */
function checkSuspiciousUrls(message: string): ValidationResult {
  for (const pattern of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(message)) {
      return {
        passed: false,
        reason: 'Message contains suspicious shortened URLs',
        severity: 'medium',
        blockedContent: 'Shortened URL detected',
      };
    }
  }

  return { passed: true };
}

/**
 * Checks for PII (Personal Identifiable Information)
 */
function checkPII(message: string): ValidationResult {
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(message)) {
      return {
        passed: false,
        reason: 'Message may contain sensitive personal information (PII). Please avoid sharing SSN, credit cards, or phone numbers.',
        severity: 'high',
        blockedContent: 'PII detected',
      };
    }
  }

  return { passed: true };
}

/**
 * Sanitizes user input by removing potentially harmful content
 */
function sanitizeInput(message: string): string {
  let sanitized = message.trim();

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Main input validation function
 * Runs all validation checks on user input
 */
export function validateInput(message: string): ValidationResult {
  // First, sanitize the input
  const sanitizedMessage = sanitizeInput(message);

  // Check if message is empty after sanitization
  if (!sanitizedMessage || sanitizedMessage.length === 0) {
    return {
      passed: false,
      reason: 'Message cannot be empty',
      severity: 'low',
    };
  }

  // Run validation checks
  const checks = [
    validateLength(sanitizedMessage),
    validateFormat(sanitizedMessage),
    checkSuspiciousUrls(sanitizedMessage),
    checkPII(sanitizedMessage),
  ];

  // Find first failed check
  const failedCheck = checks.find(check => !check.passed);

  if (failedCheck) {
    return failedCheck;
  }

  // All checks passed
  return {
    passed: true,
    sanitizedMessage,
  };
}

/**
 * Quick validation for frontend (less strict)
 */
export function validateInputFrontend(message: string): ValidationResult {
  const sanitizedMessage = sanitizeInput(message);

  if (!sanitizedMessage || sanitizedMessage.length === 0) {
    return {
      passed: false,
      reason: 'Message cannot be empty',
      severity: 'low',
    };
  }

  if (sanitizedMessage.length > GUARDRAIL_CONFIG.MAX_MESSAGE_LENGTH) {
    return {
      passed: false,
      reason: `Message too long (max ${GUARDRAIL_CONFIG.MAX_MESSAGE_LENGTH} characters)`,
      severity: 'low',
    };
  }

  return {
    passed: true,
    sanitizedMessage,
  };
}
