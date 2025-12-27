-- ============================================
-- Database Schema for AI Live Chat Agent
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tables
-- ============================================

-- Conversations Table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'model')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Cache Table
CREATE TABLE session_cache (
  session_id VARCHAR(255) PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Composite index for fetching messages by conversation with chronological ordering
CREATE INDEX idx_conversation_id ON messages (conversation_id, created_at);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on conversations
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Optional: Add status column to conversations
-- ============================================
-- Uncomment if you want to track conversation status

-- ALTER TABLE conversations ADD COLUMN status VARCHAR(20) DEFAULT 'active'
--   CHECK (status IN ('active', 'archived', 'closed'));
-- CREATE INDEX idx_conversations_status ON conversations(status);

-- ============================================
-- Optional: Add indexes for full-text search
-- ============================================
-- Uncomment if you want to enable message search

-- CREATE INDEX idx_messages_content_fulltext ON messages USING gin(to_tsvector('english', content));

-- ============================================
-- Sample Queries
-- ============================================

-- Get conversation history
-- SELECT m.id, m.sender, m.content, m.created_at
-- FROM messages m
-- JOIN conversations c ON m.conversation_id = c.id
-- WHERE c.session_id = 'session-123'
-- ORDER BY m.created_at ASC;

-- Clean up old sessions (older than 30 days)
-- DELETE FROM session_cache WHERE last_accessed < NOW() - INTERVAL '30 days';
