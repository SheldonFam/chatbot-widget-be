import { GoogleGenAI } from "@google/genai";
import type { Message } from "../src/types";

// Initialize Gemini - it automatically reads GEMINI_API_KEY from env
export function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing API key: Please set GOOGLE_API_KEY or GEMINI_API_KEY in your environment variables"
    );
  }

  return new GoogleGenAI({ apiKey });
}

// Build contents array from conversation history
export function buildContentsFromHistory(
  conversationHistory: Message[],
  currentMessage: string
): Array<{ role: string; parts: Array<{ text: string }> }> {
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  // Add conversation history
  conversationHistory.forEach((msg) => {
    contents.push({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  });

  // Add current user message
  contents.push({
    role: "user",
    parts: [{ text: currentMessage }],
  });

  return contents;
}

// System instruction for the AI
export const SYSTEM_INSTRUCTION =
  "You are a helpful assistant in a chat widget. Be concise and friendly.";

// Default generation config
export const DEFAULT_GENERATION_CONFIG = {
  maxOutputTokens: 500,
  temperature: 0.7,
};
