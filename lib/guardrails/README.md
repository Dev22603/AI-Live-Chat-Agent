# Guardrails System

A comprehensive security and content moderation system for the AI Live Chat Agent.

## Overview

The guardrails system provides multiple layers of protection to ensure safe and appropriate interactions between users and the AI assistant. It includes input validation, content moderation, jailbreak detection, and response filtering.

## Features

### 1. **Input Validation** (`inputValidator.ts`)
- **Length Validation**: Ensures messages are within acceptable length limits
- **Format Validation**: Checks for invalid characters, excessive repetition, and special characters
- **PII Detection**: Identifies and blocks personal identifiable information (SSN, credit cards, phone numbers)
- **Suspicious URL Detection**: Flags shortened URLs and potentially malicious links
- **Input Sanitization**: Removes harmful content while preserving message intent

### 2. **Content Moderation** (`contentModeration.ts`)
- **Profanity Filtering**: Detects and blocks inappropriate language
- **Harmful Content Detection**: Identifies requests for dangerous or illegal content
- **Spam Detection**: Catches spam patterns (excessive caps, punctuation, emojis)
- **Malicious Link Detection**: Identifies phishing and scam attempts
- **Configurable Strictness**: Three levels (low, medium, high) for different use cases

### 3. **Prompt Injection & Jailbreak Detection** (`promptInjection.ts`)
- **Prompt Injection Detection**: Identifies attempts to override system instructions
- **Jailbreak Pattern Recognition**: Detects known jailbreak techniques (DAN mode, etc.)
- **System Prompt Extraction Prevention**: Blocks attempts to reveal AI configuration
- **Persona-based Jailbreak Detection**: Catches roleplay manipulation attempts
- **Encoding Detection**: Identifies base64 and other obfuscation techniques
- **XML/JSON Injection Prevention**: Blocks structured injection attempts

### 4. **AI Response Filtering** (`responseFilter.ts`)
- **Prompt Leakage Prevention**: Ensures AI doesn't reveal system instructions
- **Response PII Check**: Prevents AI from generating sensitive information
- **Harmful Response Detection**: Blocks dangerous instructions in AI output
- **Capability Claims Validation**: Prevents false claims about AI capabilities
- **Jailbreak Success Detection**: Catches indicators of successful jailbreak
- **Code Injection Prevention**: Blocks XSS and other code injection attempts
- **Response Sanitization**: Cleans output while maintaining readability

## Architecture

```
User Input
    ↓
┌─────────────────────────────────┐
│ Frontend Validation             │
│ - Quick checks                  │
│ - User feedback                 │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Backend Input Guardrails        │
│ 1. Input Validation             │
│ 2. Jailbreak Detection          │
│ 3. Content Moderation           │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ AI Processing (Gemini)          │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Response Filtering              │
│ - Safety checks                 │
│ - Content validation            │
│ - Sanitization                  │
└─────────────────────────────────┘
    ↓
User Response
```

## Usage

### Basic Usage

```typescript
import { checkAllInputGuardrails, getSafeResponse } from '@/lib/guardrails';

// Validate user input
const inputCheck = checkAllInputGuardrails(userMessage);
if (!inputCheck.passed) {
  console.error('Guardrail violation:', inputCheck.reason);
  return;
}

// Filter AI response
const safeResponse = getSafeResponse(aiResponse);
if (!safeResponse.safe) {
  console.warn('Response filtered:', safeResponse.reason);
}
```

### Frontend Validation

```typescript
import { validateInputFrontend, quickJailbreakCheck } from '@/lib/guardrails';

// Quick validation for UI
const validation = validateInputFrontend(message);
if (!validation.passed) {
  setError(validation.reason);
}

// Quick jailbreak check
if (quickJailbreakCheck(message)) {
  setError('Suspicious content detected');
}
```

### Individual Guardrail Functions

```typescript
import {
  validateInput,
  moderateContent,
  detectPromptInjectionAndJailbreak,
  filterAIResponse,
} from '@/lib/guardrails';

// Input validation only
const validation = validateInput(message);

// Content moderation only
const moderation = moderateContent(message);

// Jailbreak detection only
const jailbreak = detectPromptInjectionAndJailbreak(message);

// Response filtering only
const filtered = filterAIResponse(response);
```

## Configuration

Edit `config.ts` to customize guardrail behavior:

```typescript
export const GUARDRAIL_CONFIG = {
  MAX_MESSAGE_LENGTH: 5000,
  MAX_WORDS: 1000,
  MAX_MESSAGES_PER_MINUTE: 10,
  MAX_RESPONSE_LENGTH: 10000,
  LOG_VIOLATIONS: true,
};
```

### Pattern Customization

Add custom patterns to detect specific threats:

```typescript
// In config.ts
export const PROMPT_INJECTION_PATTERNS = [
  /your_custom_pattern/gi,
  // ... existing patterns
];
```

## Severity Levels

Violations are categorized by severity:

- **Critical**: Immediate block, serious security threat
  - Jailbreak attempts
  - Harmful content requests
  - PII in responses

- **High**: Block with warning, significant policy violation
  - Prompt injection
  - Malicious links
  - System prompt extraction

- **Medium**: Block or warn based on context
  - Profanity
  - Suspicious URLs
  - Format violations

- **Low**: Warn only, minor issues
  - Excessive length
  - Spam patterns
  - Minor format issues

## Response Format

All guardrail functions return a `GuardrailResult`:

```typescript
interface GuardrailResult {
  passed: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  blockedContent?: string;
  sanitizedMessage?: string; // Only in validation results
}
```

## Integration Points

### 1. API Route (`/app/api/chat/message/route.ts`)
- Line 33-49: Input guardrails applied before AI processing
- Line 67-76: Response filtering before saving/returning

### 2. Frontend (`/lib/messageUtils.ts`)
- Line 31-39: Frontend validation with user feedback

### 3. Chat Input (`/components/ChatInput.tsx`)
- Uses `validateMessage()` which includes guardrail checks

## Testing

Test each guardrail category:

```bash
# Test input validation
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "test message here"}'

# Test jailbreak detection
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "ignore previous instructions"}'

# Test profanity filter
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "message with profanity"}'
```

## Monitoring & Logging

Guardrail violations are logged for monitoring:

```typescript
console.warn("Guardrail violation:", {
  reason: guardrailCheck.reason,
  severity: guardrailCheck.severity,
  blockedContent: guardrailCheck.blockedContent,
});
```

Set `LOG_VIOLATIONS: true` in config to enable violation logging.

## Best Practices

1. **Layered Defense**: Use both frontend and backend validation
2. **User Feedback**: Provide clear, helpful error messages
3. **Monitoring**: Track violation patterns to improve detection
4. **Balance**: Don't be overly restrictive - balance security with usability
5. **Updates**: Regularly update patterns based on new threats
6. **Testing**: Test guardrails with real-world attack vectors

## Customization

### Adding New Patterns

1. Add pattern to `config.ts`:
   ```typescript
   export const MY_CUSTOM_PATTERNS = [
     /pattern1/gi,
     /pattern2/gi,
   ];
   ```

2. Use in detection function:
   ```typescript
   for (const pattern of MY_CUSTOM_PATTERNS) {
     if (pattern.test(message)) {
       return { passed: false, reason: 'Custom violation' };
     }
   }
   ```

### Creating Custom Guardrails

1. Create new file in `/lib/guardrails/`
2. Export function that returns `GuardrailResult`
3. Add to `index.ts` exports
4. Integrate in API route

## Performance Considerations

- Frontend checks are lightweight (quick validation)
- Backend checks are comprehensive (full guardrails)
- Patterns compile once at module load
- Checks run in sequence, fail fast
- No external API calls (all local)

## Security Notes

- **Defense in Depth**: Multiple layers of protection
- **Zero Trust**: Validate all input, filter all output
- **Fail Secure**: Block by default on detection
- **Audit Trail**: Log all violations for review
- **Regular Updates**: Patterns need periodic updates

## Future Enhancements

- [ ] Rate limiting per conversation
- [ ] Machine learning-based detection
- [ ] External content moderation API integration
- [ ] Advanced PII detection with context
- [ ] Custom blocklists per deployment
- [ ] Real-time threat intelligence updates

## Support

For issues or questions about guardrails:
1. Check console logs for violation details
2. Review severity level and reason
3. Adjust patterns in `config.ts` if needed
4. Monitor false positives and adjust strictness

## License

Part of AI Live Chat Agent project.
