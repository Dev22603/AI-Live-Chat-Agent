/**
 * Conversation Repository
 *
 * Handles all database operations related to user conversations.
 * This layer abstracts the database logic from the service layer.
 *
 * Responsibilities:
 * - CRUD operations for conversations
 * - Conversation validation
 * - Conversation cleanup/expiration
 *
 * Pattern: Repository Pattern
 * API Routes → Services → Repositories → Database
 */

// TODO: Implement conversation repository methods
// - createConversation(conversationId)
// - getConversation(conversationId)
// - updateConversation(conversationId, data)
// - deleteConversation(conversationId)
// - validateConversation(conversationId)

import { pool } from "@/lib/db";
import { PoolClient } from "pg";


export async function getConversation(conversationId: string) {
	let client: PoolClient | null = null;
	try {
		client = await pool.connect();
		const result = await client.query(
			"SELECT id, created_at, updated_at FROM conversations WHERE id = $1",
			[conversationId]
		);
		const conversation = result.rows[0];
		return conversation;
	} catch (error) {
		throw new Error("Failed to get conversation");
	} finally {
		if (client) {
			client.release();
		}
	}
}
