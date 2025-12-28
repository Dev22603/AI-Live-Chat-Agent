import { HistoryData } from "@/types";
import { success, error } from "@/lib/response";
import { getConversationHistory } from "@/repositories";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const conversationId = searchParams.get("conversationId");

		if (!conversationId) {
			return error("conversationId is required", 400);
		}

		const history: HistoryData = await getConversationHistory(conversationId);

		return success<HistoryData>(200, "history retrieved", history);
	} catch (err) {
		console.error("Error in history endpoint:", err);
		return error("Failed to retrieve conversation history", 500);
	}
}
