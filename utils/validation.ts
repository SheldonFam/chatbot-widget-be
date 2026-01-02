import type { ChatRequest, ChatResponse } from "../src/types";

export interface ValidationResult {
  isValid: boolean;
  error?: ChatResponse;
}

/**
 * Validates a chat request body
 * @param body - The request body to validate
 * @returns Validation result with error details if invalid
 */
export function validateChatRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      error: {
        success: false,
        response: "",
        error: "Invalid request body",
      },
    };
  }

  const request = body as ChatRequest;
  const { message, conversationHistory } = request;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return {
      isValid: false,
      error: {
        success: false,
        response: "",
        error: "Message is required and must be a non-empty string",
      },
    };
  }

  if (
    conversationHistory !== undefined &&
    !Array.isArray(conversationHistory)
  ) {
    return {
      isValid: false,
      error: {
        success: false,
        response: "",
        error: "conversationHistory must be an array",
      },
    };
  }

  return { isValid: true };
}
