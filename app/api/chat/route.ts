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
import { getConversationHistory, saveMessage } from "@/repositories";
import { getChat } from "@/config/gemini";

export async function POST(request: Request) {
	const body: ChatRequest = await request.json();
	const userMessage = body.message.trim();

	if (!userMessage) {
		return error("message cant be empty", 400);
	}
	let conversationId = body.conversationId?.trim() ?? null;
	if (!conversationId) {
		conversationId = randomUUID();
	}
	const conversation: HistoryData = await getConversationHistory(
		conversationId
	);

	const history: GeminiHistoryMessage[] = convertToGeminiFormat(conversation);
	const chat = getChat(history);
	const response = await chat.sendMessage({ message: userMessage });
	saveMessage(conversationId, userMessage, "user");
	if (response.text) {
		saveMessage(conversationId, response.text, "model");
	}
	return success<ChatData>(201, "message sent", {
		message: response.text || "Chatbot error: no response received",
		conversationId: conversationId,
	});
}
