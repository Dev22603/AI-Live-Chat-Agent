# AI Live Chat Agent

A real-time chat interface for an AI-powered e-commerce support agent built with Next.js, Supabase, and Google Gemini AI.

> **Note:** Redis is NOT implemented in this project. The application uses Supabase (PostgreSQL) for data storage.

## Features

- Real-time AI chat with Google Gemini
- Session-based conversations (no login required)
- Persistent chat history with Supabase
- Typing indicators and smooth animations
- Fully responsive design

## Prerequisites

- Node.js (v18 or higher)
- A Google Cloud account (for Gemini API)
- A Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd AI-Live-Chat-Agent
npm install
```

### 2. Get Your Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key (keep it safe!)

### 3. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for your database to be provisioned
3. Go to **Project Settings** → **Database**
4. Note down these connection details:
   - **Host** (DB_HOST)
   - **Port** (DB_PORT, usually 5432)
   - **Database name** (DB_NAME)
   - **User** (DB_USER)
   - **Password** (DB_PASSWORD)

5. Create the required tables by running this SQL in the Supabase SQL Editor:

```sql
-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_conversations_session ON conversations(session_id);
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google Gemini API Key
GOOGLE_API_KEY=your_gemini_api_key_here

# Supabase Database Configuration
DB_HOST=your_supabase_host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_NAME=postgres
```

**Example:**
```env
GOOGLE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuv
DB_HOST=db.abcdefghijk.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password_123
DB_NAME=postgres
```

### 5. Run the Project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   └── page.tsx           # Main chat page
├── components/            # React components
│   ├── ChatWidget.tsx
│   ├── MessageList.tsx
│   └── ...
├── config/                # Configuration files
│   └── env.ts            # Environment variables
├── lib/                   # Database and utilities
│   └── db.ts             # Supabase connection
├── services/              # Business logic
│   └── chatService.ts    # Chat API service
└── types/                 # TypeScript types
```

## How It Works

1. User opens the chat → A unique session ID is generated
2. User sends a message → Saved to Supabase
3. Message is sent to Google Gemini AI
4. AI response is received and saved to Supabase
5. Response is displayed in the chat
6. Chat history persists across page refreshes

## Troubleshooting

**"Connection error" when starting:**
- Check your `.env.local` file exists and has all required variables
- Verify your Supabase database is running
- Make sure your IP is allowed in Supabase (Project Settings → Database → Connection Pooling)

**"Invalid API key" error:**
- Verify your Google Gemini API key is correct
- Check if the API key has the necessary permissions

**Database connection fails:**
- Confirm your Supabase connection details are correct
- Check if you've created the required tables (conversations and messages)
- Ensure your database password doesn't contain special characters that need escaping

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add all environment variables from `.env.local`
5. Deploy!

**Important:** Add all your environment variables in Vercel's project settings before deploying.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini AI
- **Language:** TypeScript 5

## License

This project is part of a technical assignment.
