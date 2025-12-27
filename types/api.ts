import { MessageSender } from "./chat";

export interface ChatRequest {
	message: string;
	sessionId?: string | null;
}

export interface ChatData {
	message: string;
	sessionId?: string;
}


export interface GetHistoryRequest {
	sessionId?: string;
}
export interface HistoryMessage {
	id: string;
	sender: MessageSender;
	text: string;
	timestamp: string;
}

export interface GetHistoryData {
	sessionId: string;
	conversationId: string;
	messages: HistoryMessage[];
}

export interface ApiResponse<T extends Record<string, any> | null = Record<string, any>> {
	code: number;          // HTTP-like status code
	message: string;       // description / explanation
	data: T;               // real payload (object for success, null for error)
}
