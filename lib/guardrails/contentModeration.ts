/**
 * Content Moderation Guardrail
 * Filters profanity, harmful content, and inappropriate material
 */

import { GuardrailResult } from './types';
import { PROFANITY_LIST, HARMFUL_CONTENT_KEYWORDS } from './config';

/**
 * Checks for profanity in the message
 */
function checkProfanity(message: string): GuardrailResult {
  const lowerMessage = message.toLowerCase();
  const words = lowerMessage.split(/\s+/);

  const foundProfanity: string[] = [];

  // Check each word against profanity list
  for (const word of words) {
    // Remove punctuation for comparison
    const cleanWord = word.replace(/[^\w]/g, '');

    for (const profanity of PROFANITY_LIST) {
      if (cleanWord === profanity || cleanWord.includes(profanity)) {
        foundProfanity.push(word);
        break;
      }
    }
  }

  // Check for leetspeak/obfuscated profanity
  const obfuscatedPatterns = [
    /f[*@#]ck/gi,
    /sh[*@#]t/gi,
    /b[*@#]tch/gi,
    /d[*@#]mn/gi,
  ];

  for (const pattern of obfuscatedPatterns) {
    if (pattern.test(message)) {
      foundProfanity.push('obfuscated profanity');
      break;
    }
  }

  if (foundProfanity.length > 0) {
    return {
      passed: false,
      reason: 'Message contains inappropriate language',
      severity: foundProfanity.length > 3 ? 'high' : 'medium',
      blockedContent: `Found ${foundProfanity.length} inappropriate word(s)`,
    };
  }

  return { passed: true };
}

/**
 * Checks for harmful or dangerous content
 */
function checkHarmfulContent(message: string): GuardrailResult {
  const lowerMessage = message.toLowerCase();

  // Check for explicit harmful content requests
  const harmfulPatterns = [
    /how\s+to\s+(make|build|create)\s+(bomb|weapon|explosive)/gi,
    /kill\s+(myself|yourself|someone)/gi,
    /suicide\s+(method|guide|how)/gi,
    /hack\s+into\s+/gi,
    /steal\s+(credit\s+card|password|identity)/gi,
    /illegal\s+(drugs|weapons|download)/gi,
    /child\s+(abuse|exploitation|pornography)/gi,
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(message)) {
      return {
        passed: false,
        reason: 'Message requests harmful or illegal content',
        severity: 'critical',
        blockedContent: 'Harmful content request detected',
      };
    }
  }

  // Check for harmful keywords (less strict)
  const harmfulKeywords = HARMFUL_CONTENT_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword)
  );

  // Context matters - only flag if multiple harmful keywords present
  if (harmfulKeywords.length >= 3) {
    return {
      passed: false,
      reason: 'Message may contain harmful content',
      severity: 'medium',
      blockedContent: `Multiple concerning keywords: ${harmfulKeywords.join(', ')}`,
    };
  }

  return { passed: true };
}

/**
 * Checks for spam patterns
 */
function checkSpam(message: string): GuardrailResult {
  // Check for all caps (potential spam)
  const upperCaseRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (message.length > 20 && upperCaseRatio > 0.7) {
    return {
      passed: false,
      reason: 'Message appears to be spam (excessive caps)',
      severity: 'low',
    };
  }

  // Check for excessive punctuation
  const punctuationRatio = (message.match(/[!?.]{3,}/g) || []).length;
  if (punctuationRatio > 3) {
    return {
      passed: false,
      reason: 'Message contains excessive punctuation',
      severity: 'low',
    };
  }

  // Check for repeated emojis (basic check)
  const emojiPattern = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojiCount = (message.match(emojiPattern) || []).length;
  if (emojiCount > 10) {
    return {
      passed: false,
      reason: 'Message contains too many emojis',
      severity: 'low',
    };
  }

  return { passed: true };
}

/**
 * Checks for attempts to share malicious links
 */
function checkMaliciousLinks(message: string): GuardrailResult {
  // Check for suspicious link patterns
  const suspiciousPatterns = [
    /click\s+here\s+to\s+(win|claim|get\s+free)/gi,
    /free\s+(money|bitcoin|crypto|gift)/gi,
    /(urgent|act\s+now|limited\s+time).*http/gi,
    /verify\s+your\s+(account|password).*http/gi,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(message)) {
      return {
        passed: false,
        reason: 'Message may contain phishing or scam attempt',
        severity: 'high',
        blockedContent: 'Suspicious link pattern detected',
      };
    }
  }

  // Check for excessive links
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urlCount = (message.match(urlPattern) || []).length;

  if (urlCount > 5) {
    return {
      passed: false,
      reason: 'Message contains too many links',
      severity: 'medium',
    };
  }

  return { passed: true };
}

/**
 * Main content moderation function
 * Runs all content checks on user input
 */
export function moderateContent(message: string): GuardrailResult {
  const checks = [
    checkProfanity(message),
    checkHarmfulContent(message),
    checkSpam(message),
    checkMaliciousLinks(message),
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
 * Content moderation with configurable strictness
 */
export function moderateContentWithLevel(
  message: string,
  strictness: 'low' | 'medium' | 'high' = 'medium'
): GuardrailResult {
  const result = moderateContent(message);

  // If not strict, only block critical and high severity
  if (strictness === 'low' && result.severity && ['low', 'medium'].includes(result.severity)) {
    return { passed: true };
  }

  // If medium strict, only block high and critical
  if (strictness === 'medium' && result.severity === 'low') {
    return { passed: true };
  }

  return result;
}
