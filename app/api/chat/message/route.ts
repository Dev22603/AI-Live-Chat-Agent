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
import {
	getConversationHistory,
	saveChatExchange,
	saveMessage,
} from "@/repositories";
import { getChat } from "@/config/gemini";
import { checkAllInputGuardrails, getSafeResponse } from "@/lib/guardrails";

export async function POST(request: Request) {
	let conversationId: string | null = null;
	let userMessage = "";

	try {
		const body: ChatRequest = await request.json();
		userMessage = body.message?.trim() ?? "";

		if (!userMessage) {
			return error("message cant be empty", 400);
		}

		// Apply guardrails to input
		const guardrailCheck = checkAllInputGuardrails(userMessage);
		if (!guardrailCheck.passed) {
			console.warn("Guardrail violation:", {
				reason: guardrailCheck.reason,
				severity: guardrailCheck.severity,
				blockedContent: guardrailCheck.blockedContent,
			});
			return error(
				guardrailCheck.reason || "Message violates content policy",
				400
			);
		}

		// Use sanitized message if available
		if (guardrailCheck.sanitizedMessage) {
			userMessage = guardrailCheck.sanitizedMessage;
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

		let aiResponse = response.text || "Chatbot error: no response received";

		// Apply response filtering guardrails
		if (response.text) {
			const safeResponse = getSafeResponse(response.text);
			if (!safeResponse.safe) {
				console.warn("Response filtered:", {
					reason: safeResponse.reason,
				});
			}
			aiResponse = safeResponse.message;
		}

		if (aiResponse && aiResponse !== "Chatbot error: no response received") {
			// Save both messages atomically when we have a complete exchange
			await saveChatExchange(conversationId, userMessage, aiResponse);
		} else {
			// Fallback: save just user message if AI failed to respond
			await saveMessage(conversationId, userMessage, "user");
		}

		return success<ChatData>(201, "message sent", {
			message: aiResponse,
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
		return error("Failed to process chat message", 500,err);
	}
}
