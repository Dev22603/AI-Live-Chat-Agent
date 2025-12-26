# FLOW: Session Handling

`sessionId` acts like a temporary anonymous identity.  
It lets us know:

> This conversation belongs to this browser.

There is:
- no signup
- no login

Yet all messages still link to the same conversation.

---

## What is `sessionId`

- Random unique string
- Generated only by the backend
- Returned to the frontend
- Stored locally
- Sent back with every request

Example:

```
a1c9a0a3-42af-4e4b-9db2-4c6a0a2b2a91
```

Frontend never generates it.

---

## Step 1: First visit

User opens the site.

They have:
- no sessionId
- empty localStorage
- empty cookies

First request:

```
POST /api/chat
{
  "message": "Hi"
}
```

No sessionId yet.

---

## Step 2: Backend detects missing session

Backend checks:

- Did we receive a sessionId?

If not, it creates one.

```
let sessionId = body.sessionId;

if (!sessionId) {
  sessionId = randomUUID();
}
```

Now there is a fresh session.

---

## Step 3: Persist conversation

Backend:

1. Creates conversation linked to `sessionId`
2. Saves user message
3. Calls LLM
4. Saves AI reply
5. Returns reply and `sessionId`

Example:

```
{
  "reply": "Hello, how can I help you today?",
  "sessionId": "a1c9a0a3-42af-4e4b-9db2-4c6a0a2b2a91"
}
```

---

## Step 4: Frontend stores it

```
localStorage.setItem("sessionId", data.sessionId);
```

---

## Step 5: Second message

Frontend reads stored value:

```
const sessionId = localStorage.getItem("sessionId");
```

Request now:

```
POST /api/chat
{
  "message": "What is your return policy?",
  "sessionId": "a1c9a0a3-42af-4e4b-9db2-4c6a0a2b2a91"
}
```

Backend loads the conversation and continues.

---

## Step 6: Page refresh

Nothing breaks.

```
const sessionId = localStorage.getItem("sessionId");
```

Same conversation continues.

---

## Step 7: New device or browser

No stored session.  
Backend issues a new one.

Different conversation. Expected.

---

## Step 8: Redis role

Redis only speeds things up.

Mapping example:

```
session:{sessionId} -> conversationId
```

Redis does not generate session ids.

---

## Summary

1. User sends first chat
2. Backend creates session
3. Saves conversation
4. Returns sessionId
5. Frontend stores it
6. All future requests reuse it
7. Backend loads correct conversation every time
