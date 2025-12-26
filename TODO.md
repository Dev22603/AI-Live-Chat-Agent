# TODO: Spur AI Live Chat Assignment

## Goal
Build a mini AI support agent for a live chat widget that:
- Accepts user messages
- Sends them to backend
- Calls an LLM
- Persists conversations
- Returns AI replies and displays them

---

## Tech Stack (recommended)
- [ ] Backend: Node.js + TypeScript
- [ ] Frontend: Svelte or SvelteKit (React or Vue allowed)
- [ ] Database: PostgreSQL or SQLite
- [ ] Optional: Redis cache
- [ ] Use real LLM API (OpenAI, Claude, etc.)
- [ ] Do not integrate Shopify, WhatsApp, Instagram, Facebook

---

## Core User Flow
- [ ] User opens page with chat widget
- [ ] User types message
- [ ] Frontend sends message to backend
- [ ] Backend persists conversation + messages
- [ ] Backend calls LLM
- [ ] Backend returns reply
- [ ] UI displays agent reply

---

## Frontend: Chat UI
- [ ] Scrollable message list
- [ ] Distinguish user vs AI messages
- [ ] Input box + send button
- [ ] Enter key sends message
- [ ] Auto scroll to latest
- [ ] Disable send button while request is processing
- [ ] Optional: "Agent is typing..." indicator
- [ ] Show error messages cleanly

---

## Backend API
### Endpoint
- [ ] Implement POST /chat/message
  - Request: `{ message: string, sessionId?: string }`
  - Response: `{ reply: string, sessionId: string }`

### Responsibilities
- [ ] Persist:
  - conversation
  - user message
  - AI reply
- [ ] Associate messages with session
- [ ] Call LLM API through wrapper function
  - Example: `generateReply(history, userMessage)`
- [ ] Handle all errors gracefully

---

## LLM Integration
- [ ] Use provider: OpenAI or Claude or similar
- [ ] Load API key from environment variable
- [ ] Never commit secrets

### Prompt
- [ ] Include system prompt:
  - "You are a helpful support agent for a small e commerce store. Answer clearly and concisely."
- [ ] Include conversation history for context

### Guardrails
- [ ] Handle API failures:
  - timeouts
  - invalid key
  - rate limits
- [ ] Return friendly error messages to user
- [ ] Optionally cap max tokens or history

---

## FAQ / Knowledge Base
Seed the agent with fictional store info:

- [ ] Shipping policy
- [ ] Return and refund policy
- [ ] Support hours

Implementation options:
- [ ] Hardcode in prompt
  or
- [ ] Store in DB and inject in prompt

---

## Data Model

### conversations
- [ ] id
- [ ] createdAt
- [ ] optional metadata

### messages
- [ ] id
- [ ] conversationId
- [ ] sender: "user" or "ai"
- [ ] text
- [ ] timestamp

### Reload behavior
- [ ] Fetch previous messages using sessionId or conversationId
- [ ] Render chat history on reload

---

## Robustness
- [ ] Validate input
  - [ ] Reject empty messages
  - [ ] Handle very long messages safely
- [ ] Backend must never crash on bad input
- [ ] Catch LLM errors
- [ ] Display clear messages instead of silent failure
- [ ] No secrets committed

---

## Non Requirements
- [ ] No Shopify, WhatsApp, Facebook, Instagram integrations
- [ ] No authentication needed
- [ ] No heavy infra
- [ ] Do not overbuild unless time remains

---

## README Requirements
- [ ] Local setup instructions
- [ ] DB setup and migrations
- [ ] Env variables example
- [ ] Architecture overview
- [ ] LLM provider used
- [ ] Prompting approach explanation
- [ ] Trade offs and "If I had more time" section
- [ ] Deployment instructions

---

## Evaluation Focus
- [ ] End to end correctness
- [ ] Persistent conversations
- [ ] Clean error handling
- [ ] Code quality and structure
- [ ] Encapsulation of LLM logic
- [ ] Extensibility mindset
- [ ] Robustness under weird inputs
- [ ] Good UX chat experience

---

## Timebox
- Aim: 8 to 12 hours
- Prioritize clarity, correctness, and structure over extra features
