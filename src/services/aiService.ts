/**
 * AI Service Layer
 * Handles all AI-related operations including chat and streaming
 */

import { GoogleGenAI } from "@google/genai";
import { config } from "../config/index.js";
import { AIServiceError } from "../errors/index.js";
import type { Message } from "../types.js";

/**
 * Content part for AI API
 */
interface ContentPart {
  role: string;
  parts: Array<{ text: string }>;
}

/**
 * AI Service class
 * Encapsulates all AI operations for better testability and separation of concerns
 */
export class AIService {
  private ai: GoogleGenAI;

  constructor(apiKey?: string) {
    const key = apiKey || config.googleApiKey;
    if (!key) {
      throw new AIServiceError("Google API key is not configured");
    }

    // Initialize based on whether using Vertex AI or API key
    if (config.ai.useVertexAI) {
      this.ai = new GoogleGenAI({
        vertexai: true,
        project: config.ai.vertexProjectId || "",
        location: config.ai.vertexLocation || "global",
      });
    } else {
      this.ai = new GoogleGenAI({ apiKey: key });
    }
  }

  /**
   * Builds content array from chat history
   * Converts application message format to AI SDK format
   */
  private buildContentsFromHistory(
    currentMessage: string,
    history: Message[] = []
  ): ContentPart[] {
    const contents: ContentPart[] = [];

    // Add history
    for (const msg of history) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: currentMessage }],
    });

    return contents;
  }

  /**
   * Generate a chat response (non-streaming)
   * @param message - Current user message
   * @param history - Previous conversation history
   * @returns AI response text
   * @throws AIServiceError if generation fails
   */
  async generateChatResponse(
    message: string,
    history: Message[] = []
  ): Promise<string> {
    try {
      const contents = this.buildContentsFromHistory(message, history);

      // ✅ Using the official SDK pattern
      const response = await this.ai.models.generateContent({
        model: config.ai.model,
        contents, // Can be string or ContentPart[]
      });

      console.log("response", response);

      const text = response.text; // ✅ Property, not method
      console.log("text", text);

      if (!text) {
        throw new AIServiceError("AI returned empty response");
      }

      return text;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }

      // Log the full error to understand what's happening
      console.error("🔴 Gemini API Error Details:", {
        errorType: error?.constructor?.name,
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        status: (error as any)?.status,
        statusCode: (error as any)?.statusCode,
        details: (error as any)?.details,
        fullError: error,
      });

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new AIServiceError("Failed to generate AI response", errorMessage);
    }
  }
  /**
   * Generate a streaming chat response
   * @param message - Current user message
   * @param history - Previous conversation history
   * @returns Async generator yielding text chunks
   * @throws AIServiceError if generation fails
   */
  async *generateStreamingResponse(
    message: string,
    history: Message[] = []
  ): AsyncGenerator<string, void, unknown> {
    try {
      const contents = this.buildContentsFromHistory(message, history);

      const response = await this.ai.models.generateContentStream({
        model: config.ai.model,
        contents,
      });

      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new AIServiceError(
        "Failed to generate streaming response",
        errorMessage
      );
    }
  }

  /**
   * Health check for AI service
   * Verifies that the AI service is accessible
   */
  // async healthCheck(): Promise<boolean> {
  //   try {
  //     // ✅ Simple health check like the official example
  //     await this.ai.models.generateContent({
  //       model: config.ai.model,
  //       contents: "test",
  //     });
  //     return true;
  //   } catch {
  //     return false;
  //   }
  // }
}

// Export singleton instance
export const aiService = new AIService();
