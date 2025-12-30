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

import { pool } from "@/lib/db";
import { PoolClient } from "pg";
