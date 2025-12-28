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
import { getConversationHistory } from "@/repositories";
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

	// create a new conversation if the conversation id is null
	// if the conversation id is not null then fetch the messages, how u will do that: fetch the conversation from database
	// use conversationRepository.getConversation(conversationId)
	// get a chat model from gemini.ts with or without history, whatever the case is
	// get the reply, save it to the messages table and update the conversation (the time field)
	// return the reply and conversation id

	const history: GeminiHistoryMessage[] = convertToGeminiFormat(conversation);
	const chat = getChat(history);
	const response = await chat.sendMessage({ message: userMessage });

	return success<ChatData>(201, "message sent", {
		message: response.text || "Chatbot error: no response received",
		conversationId: conversationId,
	});
}
