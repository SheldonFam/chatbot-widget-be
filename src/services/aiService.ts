/**
 * AI Service Layer
 * Handles all AI-related operations including chat and streaming
 */

import { GoogleGenAI } from "@google/genai";
import { config } from "../config/index";
import { AIServiceError } from "../errors/index";
import type { Message } from "../types";

/**
 * Content part for AI API
 */
interface ContentPart {
  role: string;
  parts: Array<
    { text: string } | { fileData: { mimeType: string; fileUri: string } }
  >;
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

      const response = await this.ai.models.generateContent({
        model: config.ai.model,
        contents,
      });

      const text = response.text;

      if (!text) {
        throw new AIServiceError("AI returned empty response");
      }

      return text;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }

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
   * Upload a PDF file to Gemini Files API
   * @param fileBuffer - PDF file buffer
   * @param fileName - Name of the file
   * @returns File URI for use in subsequent requests
   * @throws AIServiceError if upload fails
   */
  async uploadPDF(
    fileBuffer: Buffer,
    fileName: string
  ): Promise<{ fileUri: string; mimeType: string }> {
    try {
      // Check if files API is available
      if (!this.ai.files || typeof this.ai.files.upload !== "function") {
        const errorMsg = `Files API not available. Available methods: ${
          this.ai.files ? Object.keys(this.ai.files).join(", ") : "none"
        }`;

        throw new AIServiceError(errorMsg);
      }

      // Convert Buffer to Blob for the SDK
      const fileBlob = new Blob([fileBuffer], { type: "application/pdf" });

      // Upload file using Files API
      const uploadedFile = await this.ai.files.upload({
        file: fileBlob,
        config: {
          displayName: fileName,
        },
      });

      // Wait for file to be processed if needed
      if (uploadedFile.state === "PROCESSING" && uploadedFile.name) {
        let fileStatus = uploadedFile;
        let attempts = 0;
        const maxAttempts = 30; // Max 60 seconds (30 * 2s)

        while (
          fileStatus.state === "PROCESSING" &&
          fileStatus.name &&
          attempts < maxAttempts
        ) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
          fileStatus = await this.ai.files.get({ name: fileStatus.name });
          attempts++;
        }

        if (fileStatus.state === "FAILED") {
          throw new AIServiceError("File processing failed");
        }

        if (attempts >= maxAttempts) {
          throw new AIServiceError(
            "File processing timeout - file took too long to process"
          );
        }
      }

      if (!uploadedFile.uri) {
        throw new AIServiceError("Failed to upload PDF: No file URI returned");
      }

      return {
        fileUri: uploadedFile.uri,
        mimeType: uploadedFile.mimeType || "application/pdf",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new AIServiceError("Failed to upload PDF", errorMessage);
    }
  }

  /**
   * Generate a Q&A response based on a document
   * @param fileUri - URI of the uploaded PDF file
   * @param question - User's question about the document
   * @param history - Previous conversation history
   * @returns AI response text
   * @throws AIServiceError if generation fails
   */
  async generateDocumentQA(
    fileUri: string,
    question: string,
    history: Message[] = []
  ): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    // Retry logic for transient errors (503, 429, etc.)
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const contents: ContentPart[] = [];

        // Add history
        for (const msg of history) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          });
        }

        // Add document and question
        contents.push({
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: "application/pdf",
                fileUri: fileUri,
              },
            },
            { text: question },
          ],
        });

        const response = await this.ai.models.generateContent({
          model: config.ai.model,
          contents,
        });

        const text = response.text;
        if (!text) {
          throw new AIServiceError("AI returned empty response");
        }

        return text;
      } catch (error) {
        if (error instanceof AIServiceError) {
          throw error;
        }

        lastError = error as Error;
        const status = (error as any)?.status || (error as any)?.statusCode;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Retry on transient errors (503, 429, 500)
        const isTransientError =
          status === 503 || status === 429 || status === 500;

        if (isTransientError && attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue; // Retry
        }

        // Handle 503 Service Unavailable (model overloaded)
        if (status === 503) {
          const friendlyMessage =
            "The AI model is currently overloaded. Please try again in a few moments.";
          throw new AIServiceError(friendlyMessage, errorMessage);
        }

        throw new AIServiceError(
          "Failed to generate document Q&A response",
          errorMessage
        );
      }
    }

    // If we exhausted all retries
    throw new AIServiceError(
      "Failed to generate document Q&A response after multiple attempts",
      lastError?.message || "Unknown error"
    );
  }
}

// Export singleton instance
export const aiService = new AIService();
