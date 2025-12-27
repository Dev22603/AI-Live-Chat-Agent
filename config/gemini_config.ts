import dotenv from "dotenv";
dotenv.config();
import { config } from "../constants/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY, // get this from Google AI Studio
});
// create a chat session
const chat = ai.chats.create({
	model: "gemini-2.5-flash", // or any supported chat model name
    history:
});

export { chat };
