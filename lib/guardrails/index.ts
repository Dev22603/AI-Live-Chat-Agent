/**
 * Guardrails Index
 * Central export for all guardrail functions
 */

// Types
export type {
  GuardrailResult,
  ValidationResult,
  RateLimitInfo,
  GuardrailViolation,
} from './types';
export { GuardrailViolationType } from './types';

// Configuration
export { GUARDRAIL_CONFIG } from './config';

// Input Validation
export { validateInput, validateInputFrontend } from './inputValidator';

// Content Moderation
export { moderateContent, moderateContentWithLevel } from './contentModeration';

// Prompt Injection & Jailbreak Detection
export {
  detectPromptInjectionAndJailbreak,
  quickJailbreakCheck,
} from './promptInjection';

// Response Filtering
export {
  filterAIResponse,
  quickResponseValidation,
  getSafeResponse,
} from './responseFilter';

/**
 * Main guardrail check function
 * Runs all input guardrails and returns comprehensive result
 */
import { GuardrailResult } from './types';
import { validateInput } from './inputValidator';
import { moderateContent } from './contentModeration';
import { detectPromptInjectionAndJailbreak } from './promptInjection';

export function checkAllInputGuardrails(message: string): GuardrailResult {
  // Run all checks in order of severity
  const checks = [
    validateInput(message),
    detectPromptInjectionAndJailbreak(message),
    moderateContent(message),
  ];

  // Find first failed check
  const failedCheck = checks.find(check => !check.passed);

  if (failedCheck) {
    return failedCheck;
  }

  // All checks passed - return sanitized message from validation
  const validationResult = checks[0] as any;
  return {
    passed: true,
    sanitizedMessage: validationResult.sanitizedMessage || message,
  };
}
