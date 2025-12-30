# AI Live Chat Agent - Refactoring TODO

This document tracks all identified improvements, bug fixes, and enhancements for the AI Live Chat Agent project.

## 🔴 Critical Bugs

### **BUG-1: Profanity Filter False Positive**
**File:** `lib/guardrails/contentModeration.ts:24`
**Severity:** Critical
**Description:** The profanity check uses `.includes()` which causes false positives. "hello" contains "hell" and gets flagged as inappropriate.
```typescript
// Current buggy code:
if (cleanWord === profanity || cleanWord.includes(profanity))
```
**Fix:** Use word boundary matching instead:
```typescript
// Should be:
if (cleanWord === profanity)
// Or use regex with word boundaries for partial matches
```
**Impact:** Users can't send common words like "hello", "shell", "helping", etc.

---

## ✅ Completed (Already Fixed)

- [x] **#1** - Fix duplicate setState calls in ChatWidget error handling
- [x] **#2** - Add missing transaction rollback in saveChatExchange
- [x] **#3** - Remove unused pool import from API route
- [x] **#4** - Add focus management to ChatInput after sending
- [x] **#7** - Add markdown rendering for AI messages
- [x] **#10** - Add scroll-to-bottom button in MessageList

---

## 🔴 High Priority (Must Fix)

### UI/UX Critical Issues

**#1 - Update App Metadata**
- **File:** `app/layout.tsx:15-18`
- **Issue:** Still using default "Create Next App" title and description
- **Fix:** Update to "ShopEase Support Chat" or similar
```typescript
export const metadata: Metadata = {
  title: "ShopEase Support Chat",
  description: "Get instant help with your ShopEase orders, shipping, and returns",
};
```

**#2 - Add Loading State for History Fetch**
- **File:** `components/ChatWidget.tsx:22-62`
- **Issue:** Users see blank screen while conversation history loads
- **Fix:** Add skeleton loader component
- **Impact:** Poor UX during initial load

**#26 - User-Friendly Error Messages**
- **File:** `services/chatService.ts:33`
- **Issue:** Shows technical errors like `Server error (500): Unable to process request`
- **Fix:** Map HTTP status codes to friendly messages
```typescript
const ERROR_MAP = {
  400: "Invalid message. Please try again.",
  401: "Authentication required.",
  403: "Access denied.",
  404: "Service not found.",
  429: "Too many requests. Please wait a moment.",
  500: "Server error. Please try again later.",
  503: "Service temporarily unavailable.",
};
```

**#29 - Graceful Degradation**
- **File:** `components/ChatWidget.tsx:50-57`
- **Issue:** If history fetch fails, user can't send new messages
- **Fix:** Allow new messages even if history load fails, show warning

### Type Safety Issues

**#37 - Replace `any` Type in Repository**
- **File:** `repositories/chatRepository.ts:112`
```typescript
result.rows.map((row: any) => ({  // BAD
```
- **Fix:** Define proper PostgreSQL row interface
```typescript
interface DbMessageRow {
  id: string;
  conversation_id: string;
  sender: 'user' | 'model';
  content: string;
  created_at: Date;
}
```

**#38 - Type Helper Function Parameter**
- **File:** `repositories/chatRepository.ts:174`
```typescript
function convertToHistoryMessage(message: any): HistoryMessage  // BAD
```
- **Fix:** Use `DbMessageRow` interface

**#39 - Validate Request Body Structure**
- **File:** `app/api/chat/message/route.ts:24`
- **Issue:** Assumes `body` structure is correct
- **Fix:** Add Zod schema validation or type guards

**#40 - Add Return Type Annotations**
- **File:** `components/ChatInput.tsx:26, 39, 48`
- **Issue:** Handler functions don't declare return types
- **Fix:** Explicitly mark as `void` or appropriate type

---

## 🟡 Medium Priority (Should Fix)

### Architecture Improvements

**#11 - Combine Duplicate setState** ✅ DONE
- Already fixed

**#12 - Add Transaction Rollback** ✅ DONE
- Already fixed

**#13 - Inconsistent Error Handling**
- **File:** `repositories/chatRepository.ts:120-122`
- **Issue:** Just re-throws error without transformation
```typescript
} catch (error) {
  console.error("Error getting conversation history:", error);
  throw error;  // Should wrap with meaningful message
}
```
- **Fix:** Wrap with descriptive error like other functions

**#14 - Hardcoded Strings in Components**
- **File:** `components/Message.tsx:70-74`
- **Issue:** Status text ("Sending...", "Failed") hardcoded
- **Fix:** Move to constants file
```typescript
// constants/chat.ts
export const MESSAGE_STATUS = {
  SENDING: 'Sending...',
  SENT: 'Sent',
  FAILED: 'Failed to send',
} as const;
```

**#15 - Magic Numbers in ID Generation**
- **File:** `lib/messageUtils.ts:10`
```typescript
id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
```
- **Fix:** Add comment or use named constant for `2` and `9`

**#16 - Remove Unused Import** ✅ DONE
- Already fixed

**#17 - Duplicate SVG Icons**
- **Files:** Multiple components
- **Issue:** Same chat bubble SVG appears in 3+ places
- **Fix:** Create shared `<Icon>` components or use react-icons library

**#18 - Extract Custom Hook**
- **File:** `components/ChatWidget.tsx`
- **Issue:** 180 lines mixing UI and logic
- **Fix:** Extract to `useChatWidget` or `useChatState` hook
```typescript
function useChatWidget() {
  const [state, setState] = useState<ChatState>(...);
  const handleSendMessage = async (content: string) => { ... };
  const handleRetry = () => { ... };
  return { state, handleSendMessage, handleRetry, ... };
}
```

**#19 - Message Validation Duplication**
- **Files:** `lib/messageUtils.ts:26` and guardrails
- **Issue:** Length validation in frontend AND backend
- **Fix:** Clarify single source of truth, avoid drift

**#41 - Refactor Large ChatWidget**
- **File:** `components/ChatWidget.tsx`
- **Current:** 180 lines doing too much
- **Fix:** Split into:
  - `useChatState` hook (state management)
  - `useChatHistory` hook (loading history)
  - Smaller ChatWidget component (just rendering)

**#42 - Move System Instruction**
- **File:** `constants/chat.ts:27-99`
- **Issue:** 70+ lines of system instruction in constants
- **Fix:** Move to `prompts/system-instruction.ts`

**#43-44 - Extract Shared UI Components**
- **Issue:** Avatar circles repeated, button styles duplicated
- **Fix:** Create:
  - `<Avatar sender="user|model" />` component
  - `<Button variant="primary|secondary" />` component

**#24 - Move Data Transformation**
- **File:** `components/ChatWidget.tsx:36-43`
- **Issue:** Data transformation in component
- **Fix:** Move to service layer
```typescript
// In chatService.ts
export async function getConversationHistory(id: string): Promise<Message[]> {
  const response = await fetch(...);
  return transformHistoryToMessages(response.data.messages);
}
```

---

## 🟢 Low Priority (Nice to Have)

### UI/UX Enhancements

**#3 - Auto-Growing Textarea**
- **File:** `components/ChatInput.tsx:74`
- **Issue:** Fixed at 1 row, doesn't expand with content
- **Fix:** Implement dynamic row calculation
```typescript
const calculateRows = (text: string) => {
  const lines = text.split('\n').length;
  return Math.min(Math.max(lines, 1), 5); // 1-5 rows
};
```

**#4 - Empty Message Validation Feedback**
- **File:** `components/ChatInput.tsx`
- **Issue:** No visual feedback when user tries to send empty message
- **Fix:** Add shake animation or highlight border
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

**#5 - Smart Character Counter**
- **File:** `components/ChatInput.tsx:83-87`
- **Issue:** Shows counter from first character typed
- **Fix:** Only show when approaching limit (>4500 chars)
```typescript
{message.length > 4500 && (
  <div className={`... ${message.length > 4900 ? 'text-red-500' : 'text-gray-400'}`}>
```

**#6 - Responsive Message Bubble Width**
- **File:** `components/Message.tsx:55`
- **Issue:** `max-w-sm` (384px) limits messages on wide screens
- **Fix:** Use responsive max-width
```typescript
className="max-w-[70%] md:max-w-md lg:max-w-lg rounded-2xl ..."
```

**#8 - Copy Button for AI Responses**
- **File:** `components/Message.tsx`
- **Feature:** Add copy-to-clipboard button on AI message hover
```tsx
{!isUser && (
  <button onClick={() => copyToClipboard(message.content)} className="...">
    <ClipboardIcon />
  </button>
)}
```

**#9 - New Chat Button**
- **File:** `components/ChatWidget.tsx` (header)
- **Feature:** Add button to clear conversation and start fresh
```tsx
<button onClick={startNewChat} aria-label="Start new conversation">
  <PlusIcon /> New Chat
</button>
```

**#10 - Scroll-to-Bottom Button** ✅ DONE
- Already fixed

---

## ⚡ Performance Optimizations

**#20 - Debounce Input Validation**
- **File:** `components/ChatInput.tsx:48-53`
- **Issue:** Validates on every keystroke
- **Fix:** Debounce validation (300ms)
```typescript
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedValidate = useMemo(
  () => debounce((value: string) => {
    const error = validateMessage(value);
    setError(error);
  }, 300),
  []
);
```

**#21 - Memoize Message Component**
- **File:** `components/Message.tsx`
- **Issue:** Re-renders all messages on every state change
- **Fix:** Use `React.memo`
```typescript
export default React.memo(Message, (prev, next) => {
  return prev.message.id === next.message.id &&
         prev.message.status === next.message.status;
});
```

**#22 - Memoize Timestamp Formatting**
- **File:** `components/Message.tsx:67` + `lib/messageUtils.ts:44-74`
- **Issue:** Recalculates timestamp on every render
- **Fix:** Use `useMemo` in component
```typescript
const formattedTime = useMemo(
  () => formatTimestamp(message.timestamp),
  [message.timestamp]
);
```

**#23 - Smart Auto-Scroll**
- **File:** `components/MessageList.tsx:39-45`
- **Issue:** Scrolls even if already at bottom
- **Fix:** Check position before scrolling
```typescript
const isAtBottom = () => {
  if (!containerRef.current) return false;
  const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
  return scrollHeight - scrollTop - clientHeight < 10;
};

// Only scroll if at bottom or new message from current user
if (isAtBottom() || messages[messages.length - 1]?.sender === 'user') {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}
```

**#45 - Race Condition in Message IDs**
- **File:** `components/ChatWidget.tsx:91-93` + `lib/messageUtils.ts:10`
- **Issue:** Temp IDs might collide if messages sent in same millisecond
- **Fix:** Use `crypto.randomUUID()` in browser
```typescript
id: crypto.randomUUID() // or window.crypto.randomUUID()
```

**#46 - Scroll Timing Issue**
- **File:** `components/MessageList.tsx:40`
- **Issue:** 100ms delay might not be enough for images/complex content
- **Better:** Use `IntersectionObserver` or `useLayoutEffect`

**#47 - Timer Cleanup (Already Good)**
- **File:** `components/MessageList.tsx:44`
- **Status:** ✅ Already properly handled with cleanup function

**#48 - Validate Conversation ID**
- **File:** `components/ChatWidget.tsx:77-79`
- **Issue:** If backend returns different ID, could cause issues
- **Fix:** Validate UUID format

**#49 - Message Deduplication**
- **Issue:** Double-clicking send could send duplicate messages
- **Fix:** Debounce send button or track in-flight messages
```typescript
const [isSending, setIsSending] = useState(false);

const sendMessage = async () => {
  if (isSending) return;
  setIsSending(true);
  try {
    // ... send logic
  } finally {
    setIsSending(false);
  }
};
```

**#50 - Database Connection Pool Cleanup**
- **File:** `lib/db.ts`
- **Issue:** Pool created but never cleaned up on app shutdown
- **Enhancement:** Add graceful shutdown
```typescript
process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
```

---

## 📱 Responsive Design

**#51 - Responsive Container Width**
- **File:** `app/page.tsx:6`
- **Issue:** `max-w-4xl` might be too wide for tablets
- **Fix:** Breakpoint-specific widths
```typescript
className="h-screen w-full max-w-md md:max-w-2xl lg:max-w-4xl"
```

**#52 - Mobile Padding Optimization**
- **File:** `components/ChatWidget.tsx:139`
- **Issue:** Same padding on mobile and desktop
- **Fix:** Reduce padding on mobile
```typescript
className="px-4 py-4 md:px-6"
```

**#53 - Touch Target Size**
- **File:** `components/ChatInput.tsx:91`
- **Issue:** `h-12 w-12` (48px) is at minimum for touch, could be larger
- **Fix:** Increase for mobile
```typescript
className="h-12 w-12 md:h-12 md:w-12 lg:h-12 lg:w-12"
// Or increase base to 44x44px minimum (iOS HIG)
```

---

## ♿ Accessibility

**#31 - Missing ARIA Landmarks**
- **Files:** Multiple components
- **Fix:** Add semantic HTML and ARIA
```tsx
<div role="main" aria-label="Chat application">
  <header aria-label="Chat header">...</header>
  <div role="log" aria-live="polite" aria-label="Chat messages">...</div>
  <form aria-label="Message input">...</form>
</div>
```

**#32 - Error Announcements**
- **File:** `components/ErrorMessage.tsx`
- **Fix:** Add ARIA live region
```tsx
<div role="alert" aria-live="assertive" className="...">
  {message}
</div>
```

**#33 - Typing Indicator Announcement**
- **File:** `components/TypingIndicator.tsx`
- **Fix:** Add screen reader text
```tsx
<div>
  <span className="sr-only" aria-live="polite">
    Assistant is typing
  </span>
  <div className="flex gap-1" aria-hidden="true">
    {/* Visual dots */}
  </div>
</div>
```

**#34 - Focus Management** ✅ DONE
- Already fixed

**#35 - Keyboard Shortcuts**
- **Feature:** Add keyboard navigation
```typescript
// In ChatWidget or MessageList
useEffect(() => {
  const handleKeyboard = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'End') {
      scrollToBottom();
    }
  };
  window.addEventListener('keydown', handleKeyboard);
  return () => window.removeEventListener('keydown', handleKeyboard);
}, []);
```

**#36 - Tooltips for Icon Buttons**
- **Files:** ChatInput, ErrorMessage
- **Fix:** Add title or tooltip component
```tsx
<button aria-label="Send message" title="Send message (Enter)">
```

---

## 🛡️ Error Handling & Resilience

**#25 - Retry Logic for API Calls**
- **File:** `services/chatService.ts`
- **Fix:** Add exponential backoff retry
```typescript
async function fetchWithRetry(url: string, options: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}
```

**#27 - Offline Detection**
- **File:** New hook `useOnlineStatus`
- **Feature:** Detect when user goes offline
```typescript
const isOnline = useOnlineStatus();
{!isOnline && <div>You're offline. Messages will be sent when you reconnect.</div>}
```

**#28 - LocalStorage Failure Warning**
- **File:** `lib/conversation.ts:9-21`
- **Issue:** Errors logged but not shown to user
- **Fix:** Return error status, show warning in UI
```typescript
export function setConversationId(id: string): { success: boolean; error?: string } {
  try {
    localStorage.setItem(CONVERSATION_ID_KEY, id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Unable to save conversation. Your chat may not persist.'
    };
  }
}
```

**#30 - Input Sanitization Notification**
- **File:** `app/api/chat/message/route.ts:46-48`
- **Issue:** Uses sanitized message silently
- **Fix:** Inform user what was sanitized (like Gmail)
```typescript
if (guardrailCheck.sanitizedMessage !== userMessage) {
  // Return info about what was sanitized
  metadata: {
    sanitized: true,
    reason: "Special characters removed for safety"
  }
}
```

---

## 🧪 Testing & Observability

**#54 - Add Error Boundaries**
- **File:** New component `components/ErrorBoundary.tsx`
- **Purpose:** Catch and display React errors gracefully
```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <ChatWidget />
</ErrorBoundary>
```

**#55 - Production Logging**
- **Files:** Multiple (console.log, console.error everywhere)
- **Fix:** Use proper logging service or strip in production
```typescript
// lib/logger.ts
export const logger = {
  error: (msg: string, meta?: any) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service (Sentry, LogRocket, etc.)
    } else {
      console.error(msg, meta);
    }
  },
};
```

**#56 - Analytics Integration**
- **Feature:** Track user behavior
  - Message send failures
  - Average response time
  - User engagement metrics
  - Error rates

**#57 - Performance Monitoring**
- **Feature:** Track slow API responses
```typescript
const start = performance.now();
const response = await fetch(...);
const duration = performance.now() - start;
if (duration > 3000) {
  analytics.track('slow_api_response', { duration, endpoint });
}
```

---

## 🔧 Developer Experience

**#58 - Runtime Validation with Zod**
- **Files:** API routes, components
- **Enhancement:** Add Zod schemas
```typescript
import { z } from 'zod';

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  conversationId: z.string().uuid().optional(),
});
```

**#59 - Component Documentation (Storybook)**
- **Enhancement:** Add Storybook for component development
```bash
npm install --save-dev @storybook/react @storybook/addon-essentials
```

**#60 - Pre-commit Hooks**
- **Enhancement:** Add Husky + lint-staged
```bash
npm install --save-dev husky lint-staged
```
```json
// package.json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

---

## 📊 Summary

- **Critical Bugs:** 1 (profanity filter)
- **High Priority:** 7 items
- **Medium Priority:** 13 items
- **Low Priority:** 40 items
- **Completed:** 6 items

### Recommended Implementation Order

1. **Immediate:** Fix profanity filter bug (BUG-1)
2. **Sprint 1:** High priority items (#1, #2, #26, #29, #37-40)
3. **Sprint 2:** Medium priority architecture (#18, #41, #42, #21)
4. **Sprint 3:** UX enhancements (#3, #8, #9, #20, #25)
5. **Sprint 4:** Accessibility (#31-35)
6. **Sprint 5:** Testing & monitoring (#54-57)
7. **Ongoing:** Performance optimizations as needed

---

**Last Updated:** 2025-12-30
**Project:** AI Live Chat Agent
**Version:** 1.0.0
