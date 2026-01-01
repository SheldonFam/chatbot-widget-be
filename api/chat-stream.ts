import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { ChatRequest, StreamChunk } from "../src/types";
import { applyCors } from "../src/cors.js";
import {
  getAIClient,
  buildContentsFromHistory,
  SYSTEM_INSTRUCTION,
  DEFAULT_GENERATION_CONFIG,
} from "../utils/ai.js";
import { validateChatRequest } from "../utils/validation.js";

export const config = {
  runtime: "nodejs",
};

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
    res.status(405).end();
    return;
  }

  // Validate request before setting up streaming
  const validation = validateChatRequest(req.body);
  if (!validation.isValid) {
    res.setHeader("Content-Type", "application/json");
    res.status(400).json({
      error: validation.error?.error || "Invalid request",
    });
    return;
  }

  const { message, conversationHistory = [] } = req.body as ChatRequest;

  try {
    // Build contents array using shared utility
    const contents = buildContentsFromHistory(
      conversationHistory,
      message.trim()
    );

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: DEFAULT_GENERATION_CONFIG,
    } as Parameters<typeof ai.models.generateContentStream>[0]);

    for await (const chunk of stream) {
      if (chunk.text) {
        const streamChunk: StreamChunk = { content: chunk.text };
        res.write(`data: ${JSON.stringify(streamChunk)}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Streaming Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorChunk: StreamChunk = { error: errorMessage };

    res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
    res.end();
  }
}
