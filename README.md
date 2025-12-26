# AI Live Chat Agent

A modern, real-time chat interface for an AI-powered e-commerce support agent built with Next.js, React, and TypeScript.

## Overview

This is a live chat widget that allows users to interact with an AI support agent. The frontend is fully implemented with session-based conversation tracking (no authentication required). Users can ask questions about shipping, returns, payment methods, and more.

## Features

- **Real-time chat interface** with smooth animations
- **Session-based conversations** - no login required
- **Persistent chat history** across page refreshes
- **Typing indicators** for better UX
- **Error handling** with retry functionality
- **Responsive design** with Tailwind CSS
- **Full TypeScript** type safety
- **Separation of concerns** - API calls isolated in service layer

## Tech Stack

- **Frontend**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS 4
- **Language**: TypeScript 5
- **State Management**: React Hooks
- **API Service Layer**: Isolated in `services/`
- **Backend**: Ready for integration (see API_INTEGRATION.md)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the chat interface.

### 3. Test with Mock Data

The frontend is fully functional with mock AI responses. You can test the entire user experience before implementing the backend.

**Try asking:**
- "What is your shipping policy?"
- "How do I return an item?"
- "What are your support hours?"
- "What payment methods do you accept?"

## Project Structure

```
├── app/
│   ├── page.tsx              # Main chat page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── ChatWidget.tsx        # Main chat container (state management)
│   ├── MessageList.tsx       # Scrollable message list
│   ├── Message.tsx           # Individual message component
│   ├── ChatInput.tsx         # Input box with send button
│   ├── TypingIndicator.tsx   # "Agent is typing..." animation
│   └── ErrorMessage.tsx      # Error display with retry
├── services/
│   └── chatService.ts        # API service layer (all API calls)
├── lib/
│   ├── session.ts            # sessionId localStorage management
│   └── messageUtils.ts       # Message helpers and formatting
├── types/
│   └── chat.ts               # TypeScript type definitions
├── constants/
│   └── chat.ts               # App constants and config
├── API_INTEGRATION.md        # Backend integration guide
├── FLOW.md                   # Session handling flow
└── TODO.md                   # Original requirements
```

## How It Works

### Session Flow (see FLOW.md for details)

1. **First visit**: User opens chat with no sessionId
2. **User sends message**: Frontend sends message to backend
3. **Backend generates sessionId**: Returns AI reply + sessionId
4. **Frontend stores sessionId**: Saved to localStorage
5. **Subsequent messages**: Frontend includes sessionId with every request
6. **Page refresh**: sessionId persists, conversation continues
7. **New browser/device**: New sessionId, new conversation

### Key Components

- **`ChatWidget`**: Main component with state management and API orchestration
- **`MessageList`**: Handles message rendering and auto-scroll behavior
- **`ChatInput`**: Textarea with validation, character count, and keyboard shortcuts
- **`chatService`**: Isolated API layer - all backend calls go through here

## Backend Integration

The frontend is ready for backend integration. See **[API_INTEGRATION.md](./API_INTEGRATION.md)** for:

- Required API endpoints
- Request/response formats
- Database schema
- LLM integration guide
- Error handling
- Testing scenarios
- Complete implementation examples

**Summary**: Replace mock implementations in `services/chatService.ts` with actual fetch calls to your backend API.

## Environment Variables

When implementing the backend, create a `.env.local` file:

```env
# LLM API (choose one)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key

# Database (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Note**: Never commit `.env.local` to version control.

## Development Notes

### Code Quality
- **No API calls in components**: All API logic is in `services/chatService.ts`
- **Type-safe**: Full TypeScript coverage with strict mode
- **Proper error handling**: User-friendly error messages with retry
- **Clean separation**: Components, services, utilities, and types are separated

### UI/UX Features
- Auto-scroll to latest message
- Disable send button while processing
- Typing indicator during AI response
- Enter to send, Shift+Enter for new line
- Character count (max 5000 characters)
- Error messages with dismiss/retry options
- Responsive design for mobile and desktop

## Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel
```

### Other Platforms

```bash
npm run build
npm start
```

## Next Steps

1. **Backend Implementation**: Follow [API_INTEGRATION.md](./API_INTEGRATION.md)
2. **Database Setup**: Create tables for conversations and messages
3. **LLM Integration**: Connect OpenAI or Anthropic API
4. **Replace Mocks**: Update `services/chatService.ts` with real API calls
5. **Test End-to-End**: Verify all user flows work correctly

## Documentation

- **[API_INTEGRATION.md](./API_INTEGRATION.md)** - Complete backend integration guide
- **[FLOW.md](./FLOW.md)** - Detailed session handling flow
- **[TODO.md](./TODO.md)** - Original project requirements

## License

This project is part of a technical assignment for Spur AI.
