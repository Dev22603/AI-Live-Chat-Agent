import dotenv from "dotenv";
dotenv.config();
import { config } from "./env";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY, // get this from Google AI Studio
});
const GOOGLE_AI_MODEL =  "gemini-2.5-flash";
// create a chat session

const getChat = (history: any[] = []) => {
	return ai.chats.create({
		model: GOOGLE_AI_MODEL,
		history,
	});
};


export { getChat };
