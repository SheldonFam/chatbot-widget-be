import express, { Request, Response } from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import type {
  ChatRequest,
  ChatResponse,
  HealthResponse,
  StreamChunk,
} from "./src/types";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Gemini - it automatically reads GEMINI_API_KEY from env
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "",
});

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// Health Check Endpoint
// ============================================
app.get("/health", (_req: Request, res: Response<HealthResponse>) => {
  res.json({
    status: "ok",
    message: "Chat API is running with Gemini 2.5",
    timestamp: Date.now(),
  });
});

// ============================================
// Chat Endpoint (Non-streaming)
// ============================================
app.post(
  "/api/chat",
  async (req: Request<{}, {}, ChatRequest>, res: Response<ChatResponse>) => {
    try {
      const { message, conversationHistory = [] } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          response: "",
          error: "Message is required",
        });
      }

      // Build contents array with conversation history
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> =
        [];

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
        parts: [{ text: message }],
      });

      // Call Gemini API
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        // @ts-ignore - systemInstruction is valid but not in type definitions yet
        systemInstruction:
          "You are a helpful assistant in a chat widget. Be concise and friendly.",
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      return res.json({
        success: true,
        response: response.text || "",
      });
    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return res.status(500).json({
        success: false,
        response: "",
        error: "Failed to get response from AI",
        details: errorMessage,
      });
    }
  }
);

// ============================================
// Streaming Endpoint
// ============================================
app.post(
  "/api/chat/stream",
  async (req: Request<{}, {}, ChatRequest>, res: Response): Promise<void> => {
    try {
      const { message, conversationHistory = [] } = req.body;

      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Build contents array
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> =
        [];

      conversationHistory.forEach((msg) => {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      });

      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      // Stream response
      const stream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: contents,
        // @ts-ignore - systemInstruction is valid but not in type definitions yet
        systemInstruction:
          "You are a helpful assistant in a chat widget. Be concise and friendly.",
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      for await (const chunk of stream) {
        const content = chunk.text;
        if (content) {
          const streamChunk: StreamChunk = { content };
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
);

// ============================================
// Start Server
// ============================================
app.listen(port, () => {
  console.log(`🚀 Chat API server running on http://localhost:${port}`);
  console.log(`🤖 Using Google Gemini 2.5 Flash (FREE & Latest!)`);
  console.log(`📝 TypeScript enabled for better type safety`);
});
