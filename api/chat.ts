import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { ChatRequest, ChatResponse } from "../src/types";
import { applyCors } from "../src/cors.js";
import {
  getAIClient,
  buildContentsFromHistory,
  SYSTEM_INSTRUCTION,
  DEFAULT_GENERATION_CONFIG,
} from "../utils/ai.js";

// Initialize AI client at module level (singleton for serverless functions)
const ai = getAIClient();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (applyCors(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({
      success: false,
      response: "",
      error: "Method not allowed",
    });
    return;
  }

  try {
    const { message, conversationHistory = [] } = req.body as ChatRequest;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        response: "",
        error: "Message is required and must be a non-empty string",
      });
      return;
    }

    // Build contents array using shared utility
    const contents = buildContentsFromHistory(
      conversationHistory,
      message.trim()
    );

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: DEFAULT_GENERATION_CONFIG,
    } as Parameters<typeof ai.models.generateContent>[0]);

    const chatResponse: ChatResponse = {
      success: true,
      response: response.text || "",
    };

    res.json(chatResponse);
  } catch (err) {
    console.error("Gemini API Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    const errorResponse: ChatResponse = {
      success: false,
      response: "",
      error: "Failed to get response from AI",
      details: errorMessage,
    };

    res.status(500).json(errorResponse);
  }
}
