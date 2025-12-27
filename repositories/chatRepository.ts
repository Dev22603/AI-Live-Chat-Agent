/**
 * Chat Repository
 *
 * Handles all database operations related to chat messages and conversations.
 * This layer abstracts the database logic from the service layer.
 *
 * Responsibilities:
 * - CRUD operations for chat messages
 * - CRUD operations for conversations
 * - Fetching conversation history
 * - Managing sessions
 *
 * Pattern: Repository Pattern
 * API Routes → Services → Repositories → Database
 */

import { pool } from "@/lib/db";
import { HistoryMessage } from "@/types/api";
import { MessageSender } from "@/types/chat";
import { PoolClient } from "pg";

/**
 * Saves a chat message to the database
 *
 * @param sessionId - The session identifier
 * @param message - The message content
 * @param sender - Who sent the message ('user' or 'model')
 * @param conversationId - Optional conversation ID (will be created if not provided)
 * @returns The saved message with generated ID and timestamp
 * @throws Error if database operation fails
 *
 * @example
 * const savedMessage = await saveMessage('session-123', 'Hello!', 'user');
 */
export async function saveMessage(
	sessionId: string,
	message: string,
	sender: MessageSender,
	conversationId?: string
): Promise<HistoryMessage> {
	let client: PoolClient | null = null;

	try {
		// Get a client from the connection pool
		client = await pool.connect();

		// Start transaction
		await client.query('BEGIN');

		// If no conversationId provided, create or get one for this session
		let finalConversationId = conversationId;
		if (!finalConversationId) {
			const conversationResult = await client.query(
				`INSERT INTO conversations (session_id, status, created_at, updated_at)
				 VALUES ($1, 'active', NOW(), NOW())
				 ON CONFLICT (session_id)
				 DO UPDATE SET updated_at = NOW()
				 RETURNING id`,
				[sessionId]
			);
			finalConversationId = conversationResult.rows[0].id;
		}

		// Insert the message
		const result = await client.query(
			`INSERT INTO messages (conversation_id, sender, text, timestamp, created_at)
			 VALUES ($1, $2, $3, NOW(), NOW())
			 RETURNING id, conversation_id, sender, text, timestamp`,
			[finalConversationId, sender, message]
		);

		// Commit transaction
		await client.query('COMMIT');

		// Map database result to HistoryMessage type
		const row = result.rows[0];
		return {
			id: row.id,
			sender: row.sender as MessageSender,
			text: row.text,
			timestamp: row.timestamp.toISOString(),
		};
	} catch (error) {
		// Rollback transaction on error
		if (client) {
			await client.query('ROLLBACK');
		}

		// Log error for debugging
		console.error('Error saving message:', error);

		// Throw a meaningful error
		throw new Error(
			`Failed to save message: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	} finally {
		// Always release the client back to the pool
		if (client) {
			client.release();
		}
	}
}

// TODO: Implement remaining repository methods
// - getConversationHistory(sessionId)
// - createConversation(sessionId)
// - updateConversation(sessionId, data)
// - deleteMessage(messageId)
// - getMessageById(messageId)
