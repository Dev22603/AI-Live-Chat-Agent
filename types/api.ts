import { MessageSender } from "./chat";

export interface ChatRequest {
	message: string;
	conversationId?: string | null;
}

export interface ChatData {
	message: string;
	conversationId: string;
}

export interface HistoryMessage {
	id: string;
	sender: MessageSender;
	text: string;
	timestamp: string;
}

export interface HistoryData {
	conversationId: string;
	messages: HistoryMessage[];
}

export interface GeminiHistoryMessage {
	role: "user" | "model";
	parts: Array<{ text: string }>;
}


export function convertToGeminiFormat(historyData: HistoryData): GeminiHistoryMessage[] {
	return historyData.messages.map(msg => ({
		role: msg.sender,           // 'user' or 'model'
		parts: [{ text: msg.text }] // Wrap in array with text object
	}));
}
export interface ApiResponse<T = unknown> {
	code: number;          // HTTP-like status code
	message: string;       // description / explanation
	data: T;               // real payload (object for success, null for error)
}
