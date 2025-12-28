/**
 * Prompt Injection & Jailbreak Detection Guardrail
 * Detects attempts to manipulate the AI through prompt injection or jailbreak techniques
 */

import { GuardrailResult } from './types';
import { PROMPT_INJECTION_PATTERNS, JAILBREAK_PATTERNS } from './config';

/**
 * Detects prompt injection attempts
 */
function detectPromptInjection(message: string): GuardrailResult {
  const lowerMessage = message.toLowerCase();

  // Check against known prompt injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      return {
        passed: false,
        reason: 'Message contains prompt injection attempt',
        severity: 'high',
        blockedContent: 'Prompt manipulation detected',
      };
    }
  }

  // Check for instruction-like patterns
  const instructionPatterns = [
    /(?:^|\n)\s*(?:instruction|rule|directive|command)\s*\d*\s*:/gi,
    /(?:^|\n)\s*(?:step\s+\d+|phase\s+\d+)\s*:/gi,
    /from\s+now\s+on,?\s+you\s+(will|must|should|are)/gi,
    /your\s+new\s+(role|task|purpose|objective)\s+is/gi,
  ];

  for (const pattern of instructionPatterns) {
    if (pattern.test(message)) {
      return {
        passed: false,
        reason: 'Message attempts to override system instructions',
        severity: 'high',
        blockedContent: 'Instruction override detected',
      };
    }
  }

  // Check for attempts to reveal system prompt
  const systemPromptPatterns = [
    /show\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instruction)/gi,
    /what\s+(are|were)\s+your\s+(initial|original|system)\s+(instructions|prompts)/gi,
    /reveal\s+your\s+(system\s+)?(prompt|instructions)/gi,
    /print\s+(your|the)\s+(system\s+)?(prompt|instructions)/gi,
    /output\s+your\s+(system\s+)?(configuration|settings|prompt)/gi,
  ];

  for (const pattern of systemPromptPatterns) {
    if (pattern.test(message)) {
      return {
        passed: false,
        reason: 'Message attempts to extract system prompt',
        severity: 'medium',
        blockedContent: 'System prompt extraction attempt',
      };
    }
  }

  // Check for XML/JSON injection attempts
  const injectionPatterns = [
    /<\s*system\s*>/gi,
    /<\s*instruction\s*>/gi,
    /<\s*prompt\s*>/gi,
    /\{\s*"role"\s*:\s*"system"/gi,
    /\[\s*system\s*\]/gi,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(message)) {
      return {
        passed: false,
        reason: 'Message contains structured injection attempt',
        severity: 'high',
        blockedContent: 'Structured injection detected',
      };
    }
  }

  return { passed: true };
}

/**
 * Detects jailbreak attempts
 */
function detectJailbreak(message: string): GuardrailResult {
  // Check against known jailbreak patterns
  for (const pattern of JAILBREAK_PATTERNS) {
    if (pattern.test(message)) {
      return {
        passed: false,
        reason: 'Message contains jailbreak attempt',
        severity: 'critical',
        blockedContent: 'Jailbreak pattern detected',
      };
    }
  }

  // Check for "character" or "persona" jailbreaks
  const personaPatterns = [
    /you\s+are\s+no\s+longer\s+an?\s+AI/gi,
    /you\s+are\s+now\s+a(n)?\s+(evil|unethical|unrestricted)/gi,
    /pretend\s+you\s+(have\s+no\s+)?(ethics|morals|restrictions|limitations)/gi,
    /answer\s+as\s+if\s+you\s+(have\s+no\s+)?(ethics|restrictions|filters)/gi,
    /response\s+without\s+(ethics|safety|restrictions|filters)/gi,
  ];

  for (const pattern of personaPatterns) {
    if (pattern.test(message)) {
      return {
        passed: false,
        reason: 'Message attempts persona-based jailbreak',
        severity: 'critical',
        blockedContent: 'Persona jailbreak detected',
      };
    }
  }

  // Check for bypassing content policy
  const policyBypassPatterns = [
    /this\s+is\s+just\s+(fictional|hypothetical|theoretical|educational)/gi,
    /for\s+(research|educational|academic)\s+purposes?\s+only/gi,
    /in\s+a\s+(fictional|hypothetical|alternate)\s+(world|universe|reality)/gi,
    /content\s+warning\s+disabled/gi,
  ];

  // Only flag if combined with other suspicious elements
  let policyBypassCount = 0;
  for (const pattern of policyBypassPatterns) {
    if (pattern.test(message)) {
      policyBypassCount++;
    }
  }

  if (policyBypassCount >= 2) {
    return {
      passed: false,
      reason: 'Message attempts to bypass content policy',
      severity: 'high',
      blockedContent: 'Policy bypass attempt detected',
    };
  }

  return { passed: true };
}

/**
 * Detects role-playing attempts to manipulate AI
 */
function detectRoleplayManipulation(message: string): GuardrailResult {
  const suspiciousRoleplays = [
    /simulate\s+(being|acting\s+as)\s+a/gi,
    /act\s+as\s+(if\s+you\s+are\s+)?a(n)?\s+(unfiltered|unrestricted|uncensored)/gi,
    /roleplay\s+as\s+a(n)?\s+(evil|malicious|criminal)/gi,
  ];

  for (const pattern of suspiciousRoleplays) {
    if (pattern.test(message)) {
      return {
        passed: false,
        reason: 'Message attempts manipulation through roleplay',
        severity: 'high',
        blockedContent: 'Roleplay manipulation detected',
      };
    }
  }

  return { passed: true };
}

/**
 * Detects attempts to use encoding or obfuscation
 */
function detectObfuscation(message: string): GuardrailResult {
  // Check for base64 encoded instructions
  const base64Pattern = /(?:^|\s)([A-Za-z0-9+/]{40,}={0,2})(?:\s|$)/;
  if (base64Pattern.test(message)) {
    // Could be legitimate base64, only flag if combined with instruction keywords
    if (/decode|decrypt|execute|run\s+this/gi.test(message)) {
      return {
        passed: false,
        reason: 'Message may contain encoded malicious instructions',
        severity: 'high',
        blockedContent: 'Encoded content with execution keywords',
      };
    }
  }

  // Check for ROT13 or similar encoding indicators
  if (/rot13|rot-13|caesar\s+cipher|decode\s+this/gi.test(message)) {
    return {
      passed: false,
      reason: 'Message attempts to use encoding to hide instructions',
      severity: 'medium',
      blockedContent: 'Encoding attempt detected',
    };
  }

  // Check for Unicode/special character obfuscation
  const unicodePattern = /[\u200B-\u200D\uFEFF]/g;
  const hiddenCharCount = (message.match(unicodePattern) || []).length;

  if (hiddenCharCount > 5) {
    return {
      passed: false,
      reason: 'Message contains hidden Unicode characters',
      severity: 'medium',
      blockedContent: 'Hidden characters detected',
    };
  }

  return { passed: true };
}

/**
 * Main prompt injection detection function
 * Combines all detection methods
 */
export function detectPromptInjectionAndJailbreak(message: string): GuardrailResult {
  const checks = [
    detectPromptInjection(message),
    detectJailbreak(message),
    detectRoleplayManipulation(message),
    detectObfuscation(message),
  ];

  // Find the most severe failed check
  const failedChecks = checks.filter(check => !check.passed);

  if (failedChecks.length === 0) {
    return { passed: true };
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
 * Quick check for common jailbreak patterns (for frontend)
 */
export function quickJailbreakCheck(message: string): boolean {
  const criticalPatterns = [
    /DAN\s+mode/gi,
    /jailbreak/gi,
    /ignore\s+previous\s+instructions/gi,
    /you\s+are\s+now/gi,
  ];

  return criticalPatterns.some(pattern => pattern.test(message));
}
