import { Sender } from "./models";

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
	sender: Sender;
	text: string;
	timestamp: string;
}

export interface GetHistoryData {
	sessionId: string;
	conversationId: string;
	messages: HistoryMessage[];
}

export interface ApiResponse<T = any> {
	code: number;          // HTTP-like status code
	message: string;       // description / explanation
	data: T | null;        // real payload
}
