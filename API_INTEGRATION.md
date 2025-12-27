# API Integration Guide

This document explains how to integrate the backend API with the frontend chat interface.

## Overview

The frontend is fully implemented and ready for API integration. All API calls are isolated in the `services/chatService.ts` file. Currently, it contains mock implementations that should be replaced with actual API calls.

---

## Quick Start

1. **Locate the API service file**: `services/chatService.ts`
2. **Find the TODO comments**: Search for `// TODO: Replace this mock with actual API call`
3. **Replace mock implementations** with actual fetch calls (examples provided below)
4. **Test with your backend**

---

## API Endpoints Required

### 1. POST `/api/chat/message`

**Purpose**: Send a user message and receive AI reply

**Request Format**:
```typescript
{
  message: string;      // User's message content
  sessionId?: string;   // Optional on first request, required on subsequent
}
```

**Response Format**:
```typescript
{
  reply: string;           // AI-generated response
  sessionId: string;       // Session ID (new or existing)
  conversationId?: string; // Optional: conversation UUID
  timestamp?: string;      // Optional: ISO timestamp
}
```

**Implementation Location**: `services/chatService.ts` → `sendMessage()` function

**Example Implementation**:
```typescript
export async function sendMessage(
  message: string,
  sessionId?: string | null
): Promise<ChatResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.SEND_MESSAGE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId: sessionId || undefined,
      } as ChatRequest),
      signal: AbortSignal.timeout(CHAT_CONFIG.REQUEST_TIMEOUT),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to send message');
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw handleApiError(error);
  }
}
```

---

### 2. GET `/api/chat/history` (Optional)

**Purpose**: Fetch conversation history when user returns

**Request Format**:
```
GET /api/chat/history?sessionId={sessionId}
```

**Response Format**:
```typescript
{
  messages: Array<{
    id: string;
    sender: 'user' | 'model';
    content: string;
    timestamp: string; // ISO format
  }>;
  conversationId: string;
}
```

**Implementation Location**: `services/chatService.ts` → `getConversationHistory()` function

**When to use**: Call this on initial page load if `sessionId` exists in localStorage to restore chat history.

---

## Backend Requirements (Based on FLOW.md)

### Session Flow

The backend must implement the following session handling logic:

```typescript
// Pseudocode for backend endpoint
async function handleChatMessage(req, res) {
  let sessionId = req.body.sessionId;

  // Step 1: Check if sessionId exists
  if (!sessionId) {
    // First visit - generate new sessionId
    sessionId = generateUUID(); // e.g., crypto.randomUUID()
  }

  // Step 2: Find or create conversation
  let conversation = await findConversationBySessionId(sessionId);

  if (!conversation) {
    conversation = await createConversation({
      sessionId: sessionId,
      createdAt: new Date(),
      status: 'active'
    });
  }

  // Step 3: Save user message
  await saveMessage({
    conversationId: conversation.id,
    sender: 'user',
    content: req.body.message,
    timestamp: new Date()
  });

  // Step 4: Call LLM
  const aiReply = await callLLM({
    conversationHistory: await getConversationHistory(conversation.id),
    userMessage: req.body.message
  });

  // Step 5: Save AI reply
  await saveMessage({
    conversationId: conversation.id,
    sender: 'model',
    content: aiReply,
    timestamp: new Date()
  });

  // Step 6: Return response
  res.json({
    reply: aiReply,
    sessionId: sessionId,
    conversationId: conversation.id
  });
}
```

---

## Database Schema

Based on TODO.md requirements, implement these tables:

### `conversations` table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_conversations_session_id ON conversations(session_id);
```

### `messages` table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'model')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id, created_at ASC);
```

---

## LLM Integration Requirements

### System Prompt

Include this system prompt when calling the LLM:

```
You are a helpful support agent for a small e-commerce store.
Answer clearly and concisely. Be friendly and professional.

Store Information:
- Shipping: Free standard shipping on orders over $50. Standard shipping takes 3-5 business days.
- Returns: Accepted within 30 days with original receipt. Full refund to original payment method.
- Support Hours: Monday-Friday, 9 AM - 6 PM EST
- Payment Methods: All major credit cards, PayPal, Apple Pay, Google Pay
```

### Conversation History

Send the last 10 messages (5 user + 5 AI) as context for better responses.

**Example LLM Call (OpenAI)**:
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: "user", content: userMessage }
  ],
  max_tokens: 500,
  temperature: 0.7
});
```

---

## Error Handling

The frontend expects these error formats:

### Success Response
```typescript
{
  reply: string;
  sessionId: string;
}
```

### Error Response
```typescript
{
  error: string;        // Error type (e.g., "ValidationError")
  message: string;      // User-friendly error message
  statusCode?: number;  // HTTP status code
}
```

### Error Scenarios to Handle

1. **Empty message**: Return 400 with message "Message cannot be empty"
2. **Message too long**: Return 400 with message "Message is too long"
3. **LLM API failure**: Return 500 with message "AI service temporarily unavailable"
4. **Rate limiting**: Return 429 with message "Too many requests. Please wait."
5. **Invalid sessionId**: Generate new session and continue (don't error)

---

## Environment Variables

Create a `.env.local` file with:

```env
# Database (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LLM API
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_claude_key

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

**Security Note**: Never commit `.env.local` to version control. Add it to `.gitignore`.

---

## Testing Your API Integration

### 1. Remove Mock Implementation

In `services/chatService.ts`, delete the entire section:
```typescript
// ============================================================================
// MOCK IMPLEMENTATIONS - DELETE THESE WHEN BACKEND IS READY
// ============================================================================
```

### 2. Test Scenarios

Test these user flows:

#### Test 1: First Visit
- User opens chat (no sessionId in localStorage)
- User sends: "What is your shipping policy?"
- Verify: Backend generates sessionId and returns it
- Verify: Frontend stores sessionId in localStorage
- Verify: AI responds with shipping info

#### Test 2: Continued Conversation
- User sends another message: "What about returns?"
- Verify: Frontend sends stored sessionId
- Verify: Backend loads existing conversation
- Verify: AI has context from previous messages

#### Test 3: Page Refresh
- User refreshes browser
- Verify: sessionId persists in localStorage
- Verify: Chat history loads (if implemented)
- User sends new message
- Verify: Conversation continues seamlessly

#### Test 4: Error Handling
- Disconnect backend
- User sends message
- Verify: Error message displays
- Verify: User can retry
- Restore backend
- User clicks "Retry"
- Verify: Message sends successfully

---

## Integration Checklist

- [ ] Create database tables (conversations, messages)
- [ ] Set up LLM API credentials (OpenAI/Claude)
- [ ] Implement POST `/api/chat/message` endpoint
- [ ] Implement session handling (generate/retrieve sessionId)
- [ ] Implement conversation persistence
- [ ] Integrate LLM with system prompt
- [ ] Add conversation history to LLM context
- [ ] Implement error handling with proper status codes
- [ ] Test all user flows above
- [ ] Replace mock in `services/chatService.ts`
- [ ] (Optional) Implement GET `/api/chat/history`
- [ ] (Optional) Add Redis caching for sessionId → conversationId

---

## Optional Enhancements

### Redis Caching

Cache sessionId → conversationId mapping for faster lookups:

```typescript
// On message received
await redis.set(`session:${sessionId}`, conversationId, 'EX', 86400); // 24h expiry

// On conversation lookup
const cachedConvId = await redis.get(`session:${sessionId}`);
if (cachedConvId) {
  return await getConversationById(cachedConvId);
}
```

### Rate Limiting

Prevent abuse with rate limiting:

```typescript
const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests. Please wait.'
});

app.post('/api/chat/message', rateLimiter, handleChatMessage);
```

### Message Validation

```typescript
function validateMessage(message: string): void {
  if (!message || message.trim().length === 0) {
    throw new ValidationError('Message cannot be empty');
  }
  if (message.length > 5000) {
    throw new ValidationError('Message is too long (max 5000 characters)');
  }
}
```

---

## Need Help?

- **Frontend Issues**: Check `components/ChatWidget.tsx` for state management
- **API Service**: Review `services/chatService.ts` for request/response handling
- **Session Management**: See `lib/session.ts` for localStorage logic
- **Flow Documentation**: Read `FLOW.md` for session handling details
- **Requirements**: Check `TODO.md` for complete feature list

---

## Summary

1. The frontend is **100% complete** and functional with mocks
2. All API logic is in `services/chatService.ts`
3. Replace the mock implementations with real fetch calls
4. Backend must follow the session flow in FLOW.md
5. Use the database schema provided
6. Test all scenarios before deploying

**You can test the UI right now** with the mock data by running:
```bash
npm run dev
```

The mock responses will simulate a working chat experience while you build the backend.
