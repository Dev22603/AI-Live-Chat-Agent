import {
	ChatData,
	ChatRequest,
	convertToGeminiFormat,
	GeminiHistoryMessage,
	HistoryData,
} from "@/types";
import { randomUUID } from "crypto";
import { pool } from "@/lib/db";
import { success, error } from "@/lib/response";
import { getConversation } from "@/repositories/conversationRepository";
import {
	getConversationHistory,
	saveChatExchange,
	saveMessage,
} from "@/repositories";
import { getChat } from "@/config/gemini";

export async function POST(request: Request) {
	let conversationId: string | null = null;
	let userMessage = "";

	try {
		const body: ChatRequest = await request.json();
		userMessage = body.message?.trim() ?? "";

		if (!userMessage) {
			return error("message cant be empty", 400);
		}

		conversationId = body.conversationId?.trim() ?? null;
		if (!conversationId) {
			conversationId = randomUUID();
		}

		const conversation: HistoryData = await getConversationHistory(
			conversationId
		);

		const history: GeminiHistoryMessage[] =
			convertToGeminiFormat(conversation);
		const chat = getChat(history);
		const response = await chat.sendMessage({ message: userMessage });

		if (response.text) {
			// Save both messages atomically when we have a complete exchange
			await saveChatExchange(conversationId, userMessage, response.text);
		} else {
			// Fallback: save just user message if AI failed to respond
			await saveMessage(conversationId, userMessage, "user");
		}

		return success<ChatData>(201, "message sent", {
			message: response.text || "Chatbot error: no response received",
			conversationId: conversationId,
		});
	} catch (err) {
		// Try to save user message for audit trail
		try {
			if (conversationId && userMessage) {
				await saveMessage(conversationId, userMessage, "user");
			}
		} catch (saveError) {
			console.error("Failed to save user message on error:", saveError);
		}

		console.error("Error in chat endpoint:", err);
		return error("Failed to process chat message", 500);
	}
}
