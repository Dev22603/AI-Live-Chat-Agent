/**
 * AI Response Filtering Guardrail
 * Validates and filters AI responses before sending to user
 */

import { GuardrailResult } from './types';
import { GUARDRAIL_CONFIG, PII_PATTERNS } from './config';

/**
 * Checks if response reveals system prompt or instructions
 */
function checkPromptLeakage(response: string): GuardrailResult {
  const leakagePatterns = [
    /my\s+(system\s+)?(prompt|instruction|directive)\s+(is|was|says?)/gi,
    /I\s+was\s+(told|instructed|programmed)\s+to/gi,
    /my\s+(creator|developer)\s+(told|said|instructed)/gi,
    /according\s+to\s+my\s+(system\s+)?(instructions|guidelines|rules)/gi,
    /I\s+am\s+programmed\s+to\s+always/gi,
  ];

  for (const pattern of leakagePatterns) {
    if (pattern.test(response)) {
      return {
        passed: false,
        reason: 'Response may reveal system instructions',
        severity: 'high',
        blockedContent: 'Prompt leakage detected',
      };
    }
  }

  return { passed: true };
}

/**
 * Checks for PII in AI response
 */
function checkResponsePII(response: string): GuardrailResult {
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(response)) {
      return {
        passed: false,
        reason: 'Response may contain sensitive information',
        severity: 'critical',
        blockedContent: 'PII in response',
      };
    }
  }

  return { passed: true };
}

/**
 * Checks response length
 */
function checkResponseLength(response: string): GuardrailResult {
  if (response.length > GUARDRAIL_CONFIG.MAX_RESPONSE_LENGTH) {
    return {
      passed: false,
      reason: 'Response exceeds maximum length',
      severity: 'low',
    };
  }

  if (response.trim().length === 0) {
    return {
      passed: false,
      reason: 'Response is empty',
      severity: 'medium',
    };
  }

  return { passed: true };
}

/**
 * Checks for harmful content in response
 */
function checkHarmfulResponse(response: string): GuardrailResult {
  const harmfulPatterns = [
    /here's\s+how\s+to\s+(make|build|create)\s+a\s+(bomb|weapon|explosive)/gi,
    /steps\s+to\s+(hack|steal|break\s+into)/gi,
    /you\s+can\s+(kill|harm|hurt)\s+(yourself|someone)/gi,
    /illegal\s+(drugs|substances).*how\s+to/gi,
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(response)) {
      return {
        passed: false,
        reason: 'Response contains harmful instructions',
        severity: 'critical',
        blockedContent: 'Harmful content in response',
      };
    }
  }

  return { passed: true };
}

/**
 * Checks if response inappropriately claims capabilities
 */
function checkCapabilityClaims(response: string): GuardrailResult {
  const falseCapabilityPatterns = [
    /I\s+can\s+(access|browse|search)\s+the\s+internet/gi,
    /I\s+have\s+access\s+to\s+(your|the)\s+(files|computer|system)/gi,
    /I\s+can\s+(see|view|access)\s+your\s+(camera|screen|location)/gi,
    /I\s+will\s+(remember|store)\s+this\s+forever/gi,
  ];

  for (const pattern of falseCapabilityPatterns) {
    if (pattern.test(response)) {
      return {
        passed: false,
        reason: 'Response makes false capability claims',
        severity: 'medium',
        blockedContent: 'False capability claim',
      };
    }
  }

  return { passed: true };
}

/**
 * Checks for jailbreak success indicators in response
 */
function checkJailbreakSuccess(response: string): GuardrailResult {
  const jailbreakIndicators = [
    /DAN\s+mode\s+(activated|enabled)/gi,
    /restrictions?\s+(disabled|removed|bypassed)/gi,
    /I\s+am\s+now\s+(unrestricted|uncensored|unfiltered)/gi,
    /ethical\s+guidelines?\s+(disabled|ignored|removed)/gi,
    /operating\s+in\s+(evil|unethical|unrestricted)\s+mode/gi,
  ];

  for (const pattern of jailbreakIndicators) {
    if (pattern.test(response)) {
      return {
        passed: false,
        reason: 'Response indicates successful jailbreak',
        severity: 'critical',
        blockedContent: 'Jailbreak success detected',
      };
    }
  }

  return { passed: true };
}

/**
 * Checks for code injection attempts in response
 */
function checkCodeInjection(response: string): GuardrailResult {
  // Check for potentially dangerous code patterns
  const dangerousCodePatterns = [
    /<script[^>]*>[\s\S]*<\/script>/gi,
    /javascript:/gi,
    /on(load|error|click|mouse\w+)\s*=/gi,
    /eval\s*\(/gi,
    /document\.cookie/gi,
  ];

  for (const pattern of dangerousCodePatterns) {
    if (pattern.test(response)) {
      return {
        passed: false,
        reason: 'Response may contain code injection',
        severity: 'high',
        blockedContent: 'Code injection detected',
      };
    }
  }

  return { passed: true };
}

/**
 * Sanitizes AI response
 */
function sanitizeResponse(response: string): string {
  let sanitized = response;

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove excessive whitespace while preserving paragraph structure
  sanitized = sanitized.replace(/[ \t]+/g, ' ');
  sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n');

  // Trim
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Main response filtering function
 */
export function filterAIResponse(response: string): GuardrailResult {
  // First sanitize
  const sanitized = sanitizeResponse(response);

  // Run all checks
  const checks = [
    checkResponseLength(sanitized),
    checkPromptLeakage(sanitized),
    checkResponsePII(sanitized),
    checkHarmfulResponse(sanitized),
    checkCapabilityClaims(sanitized),
    checkJailbreakSuccess(sanitized),
    checkCodeInjection(sanitized),
  ];

  // Find the most severe failed check
  const failedChecks = checks.filter(check => !check.passed);

  if (failedChecks.length === 0) {
    return {
      passed: true,
      sanitizedMessage: sanitized,
    };
  }

  // Return the most severe violation
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  failedChecks.sort((a, b) => {
    const aSeverity = severityOrder[a.severity || 'low'];
    const bSeverity = severityOrder[b.severity || 'low'];
    return bSeverity - aSeverity;
  });

  return failedChecks[0];
}

/**
 * Quick response validation (less strict)
 */
export function quickResponseValidation(response: string): GuardrailResult {
  if (!response || response.trim().length === 0) {
    return {
      passed: false,
      reason: 'Empty response',
      severity: 'medium',
    };
  }

  if (response.length > GUARDRAIL_CONFIG.MAX_RESPONSE_LENGTH) {
    return {
      passed: false,
      reason: 'Response too long',
      severity: 'low',
    };
  }

  return { passed: true };
}

/**
 * Filters response and returns safe version or error
 */
export function getSafeResponse(
  response: string
): { safe: boolean; message: string; reason?: string } {
  const filterResult = filterAIResponse(response);

  if (!filterResult.passed) {
    return {
      safe: false,
      message:
        "I apologize, but I cannot provide that response. Let me help you with something else.",
      reason: filterResult.reason,
    };
  }

  return {
    safe: true,
    message: filterResult.sanitizedMessage || response,
  };
}
