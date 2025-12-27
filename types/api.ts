import { MessageSender } from "./chat";

export interface ChatRequest {
	message: string;
	conversationId?: string | null;
}

export interface ChatData {
	message: string;
	conversationId: string;
}

export interface GetHistoryRequest {
	conversationId: string;
}
export interface HistoryMessage {
	id: string;
	sender: MessageSender;
	text: string;
	timestamp: string;
}

export interface GetHistoryData {
	conversationId: string;
	messages: HistoryMessage[];
}

export interface ApiResponse<T extends Record<string, any> | null = Record<string, any>> {
	code: number;          // HTTP-like status code
	message: string;       // description / explanation
	data: T;               // real payload (object for success, null for error)
}
