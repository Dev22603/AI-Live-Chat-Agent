import { ChatData, ChatRequest } from "@/types";
import { randomUUID } from "crypto";
import { pool } from "@/lib/db";
import { success, error } from "@/lib/response";

export async function POST(request: Request) {
	const body: ChatRequest = await request.json();
	const userMessage = body.message.trim();

	if (!userMessage) {
		return error("message cant be empty", 400);
	}
	let sessionId = body.sessionId?.trim() ?? null;
	if (!sessionId) {
		sessionId = randomUUID();
	}
	return success<ChatData>(201, "message sent", {
		message: "ok sir",
		sessionId: sessionId,
	});
}
