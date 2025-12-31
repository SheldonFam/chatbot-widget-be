import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ai } from "./gemini";
import type { ChatRequest, StreamChunk } from "../types";
import { applyCors } from "../src/cors";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    const { message, conversationHistory = [] } = req.body as ChatRequest;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      res.status(400).end("Message is required and must be a non-empty string");
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const contents = conversationHistory.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    contents.push({
      role: "user",
      parts: [{ text: message.trim() }],
    });

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      systemInstruction:
        "You are a helpful assistant in a chat widget. Be concise and friendly.",
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
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
