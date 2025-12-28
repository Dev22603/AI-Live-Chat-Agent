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
import { HistoryData, HistoryMessage } from "@/types/api";
import { MessageSender } from "@/types/chat";
import { PoolClient } from "pg";

/**
 * Saves a chat message to the database
 *
 * @param conversationId - The conversation identifier (UUID)
 * @param message - The message content
 * @param sender - Who sent the message ('user' or 'model')
 * @returns The saved message with generated ID and timestamp
 * @throws Error if database operation fails
 *
 * @example
 * const savedMessage = await saveMessage('uuid-here', 'Hello!', 'user');
 */
export async function saveMessage(
	conversationId: string,
	message: string,
	sender: MessageSender
): Promise<HistoryMessage> {
	let client: PoolClient | null = null;

	try {
		// Get a client from the connection pool
		client = await pool.connect();

		// Start transaction
		await client.query("BEGIN");

		// Ensure conversation exists
		await client.query(
			`INSERT INTO conversations (id, created_at, updated_at)
			 VALUES ($1, NOW(), NOW())
			 ON CONFLICT (id)
			 DO UPDATE SET updated_at = NOW()`,
			[conversationId]
		);

		// Insert the message
		const result = await client.query(
			`INSERT INTO messages (conversation_id, sender, content, created_at)
			 VALUES ($1, $2, $3, NOW())
			 RETURNING id, conversation_id, sender, content, created_at`,
			[conversationId, sender, message]
		);

		// Commit transaction
		await client.query("COMMIT");

		// Map database result to HistoryMessage type
		const row = result.rows[0];
		return {
			id: row.id,
			sender: row.sender as MessageSender,
			text: row.content,
			timestamp: row.created_at.toISOString(),
		};
	} catch (error) {
		// Rollback transaction on error
		if (client) {
			await client.query("ROLLBACK");
		}

		// Log error for debugging
		console.error("Error saving message:", error);

		// Throw a meaningful error
		throw new Error(
			`Failed to save message: ${
				error instanceof Error ? error.message : "Unknown error"
			}`
		);
	} finally {
		// Always release the client back to the pool
		if (client) {
			client.release();
		}
	}
}

export async function getConversationHistory(conversationId: string): Promise<HistoryData> {
	let client: PoolClient | null = null;
	try {
		client = await pool.connect();
		const result = await client.query(
			"SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
			[conversationId]
		);

		const ConversationHistory: HistoryData = {
			conversationId: conversationId,
			messages: result.rows.map((row: any) => ({
				id: row.id,
				sender: row.sender as MessageSender,
				text: row.content,
				timestamp: row.created_at.toISOString(),
			})),
		};
		return ConversationHistory;
	} catch (error) {
		console.error("Error getting conversation history:", error);
		throw error;
	} finally {
		if (client) {
			client.release();
		}
	}
}
// TODO: Implement remaining repository methods
// - getConversationHistory(conversationId)
// - deleteMessage(messageId)
// - getMessageById(messageId)
