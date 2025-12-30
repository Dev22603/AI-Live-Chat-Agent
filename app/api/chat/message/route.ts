import {
	ChatData,
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
import { safeParseJSON, validateChatRequest } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";
import { isAppError } from "@/types/errors";

export async function POST(request: Request) {
	let conversationId: string | null = null;
	let userMessage = "";

	try {
		// Safely parse JSON
		const parseResult = await safeParseJSON(request);
		if (!parseResult.success) {
			return error(parseResult.error || "Invalid request format", 400);
		}

		// Validate request body
		const validationResult = validateChatRequest(parseResult.data);
		if (!validationResult.success || !validationResult.data) {
			return error(validationResult.error || "Invalid request data", 400);
		}

		const { message, conversationId: requestConversationId } = validationResult.data;
		userMessage = message;

		// Use validated conversationId or generate new one
		conversationId = requestConversationId || randomUUID();

		// Check rate limit
		try {
			checkRateLimit(conversationId);
		} catch (rateLimitError) {
			if (isAppError(rateLimitError)) {
				return error(rateLimitError.message, rateLimitError.statusCode);
			}
			throw rateLimitError;
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
		// Don't expose error details to client
		const errorMessage = err instanceof Error ? err.message : "Failed to process chat message";
		return error("An error occurred while processing your message. Please try again.", 500);
	}
}
