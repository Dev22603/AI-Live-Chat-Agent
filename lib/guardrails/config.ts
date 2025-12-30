/**
 * Guardrails Configuration
 */

export const GUARDRAIL_CONFIG = {
  // Input validation limits
  MAX_MESSAGE_LENGTH: 5000,
  MIN_MESSAGE_LENGTH: 1,
  MAX_WORDS: 1000,

  // Rate limiting (per conversation)
  MAX_MESSAGES_PER_MINUTE: 10,
  MAX_MESSAGES_PER_HOUR: 100,

  // Content filtering
  PROFANITY_SEVERITY_THRESHOLD: 'medium' as const,

  // Response filtering
  MAX_RESPONSE_LENGTH: 10000,

  // Logging
  LOG_VIOLATIONS: true,
  LOG_ALL_CHECKS: false,
};

// Prompt injection patterns to detect
export const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|commands)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)/gi,
  /forget\s+(all\s+)?(previous|prior|above|everything)/gi,
  /new\s+(instructions|prompt|command|task):/gi,
  /system\s*(prompt|message|instruction):/gi,
  /you\s+are\s+now/gi,
  /act\s+as\s+(a\s+)?(new|different)/gi,
  /pretend\s+(to\s+be|you\s+are)/gi,
  /roleplay\s+as/gi,
  /simulate\s+(being|a)/gi,
];

// Jailbreak attempt patterns
export const JAILBREAK_PATTERNS = [
  /DAN\s+mode/gi,
  /developer\s+mode/gi,
  /evil\s+mode/gi,
  /KEVIN\s+mode/gi,
  /jailbreak/gi,
  /sudo\s+mode/gi,
  /god\s+mode/gi,
  /root\s+access/gi,
  /admin\s+mode/gi,
  /bypass\s+(restrictions|filters|safety)/gi,
  /override\s+(safety|ethics|rules)/gi,
  /disable\s+(safety|ethics|filters|moderation)/gi,
  /without\s+(ethics|safety|restrictions)/gi,
];

// Harmful content keywords
export const HARMFUL_CONTENT_KEYWORDS = [
  'violence',
  'weapons',
  'drugs',
  'illegal',
  'hack',
  'exploit',
  'malware',
  'phishing',
  'scam',
  'fraud',
];

// Common profanity list (basic - can be extended)
export const PROFANITY_LIST = [
  'fuck',
  'shit',
  'ass',
  'bitch',
  'damn',
  'hell',
  'crap',
  'piss',
  // Add more as needed
];

// PII patterns
export const PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
  /\b\d{16}\b/g, // Credit card
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone
];

// Suspicious URL patterns
export const SUSPICIOUS_URL_PATTERNS = [
  /bit\.ly/gi,
  /tinyurl/gi,
  /goo\.gl/gi,
  /ow\.ly/gi,
  /t\.co/gi,
];

// Whitelisted business contact information (allowed in responses)
export const WHITELISTED_BUSINESS_INFO = [
  'support@shopease.in',
  '+91 79 4567 8900',
  '+91 98765 43210',
  'shopease@paytm',
  'www.shopease.in',
  'shopease.in',
  '402 Sakar Complex, Ashram Road, Ahmedabad, Gujarat 380009',
];
