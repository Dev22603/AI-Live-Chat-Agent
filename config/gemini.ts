import dotenv from "dotenv";
dotenv.config();
import { config } from "./env";
import { GoogleGenAI } from "@google/genai";
import { GeminiHistoryMessage } from "@/types";

// Type definition for Gemini chat history format


const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY, // get this from Google AI Studio
});
const GOOGLE_AI_MODEL = "gemini-2.5-flash";

/**
 * Creates a Gemini chat session with optional history
 * @param history - Array of previous messages in Gemini format
 * @returns Chat session instance
 */
const getChat = (history: GeminiHistoryMessage[] = []) => {
	return ai.chats.create({
		model: GOOGLE_AI_MODEL,
		history,
	});
};

export { getChat };
