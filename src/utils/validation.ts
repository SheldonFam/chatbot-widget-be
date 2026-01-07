import type { ChatRequest, DocumentQARequest } from "../types.js";

// Security limits to prevent abuse and DoS attacks
const MAX_MESSAGE_LENGTH = 5000; // 5000 characters per message
const MAX_HISTORY_LENGTH = 50; // Maximum 50 messages in history
const MAX_QUESTION_LENGTH = 2000; // 2000 characters for document questions

/**
 * Validates a chat request body
 * @param body - The request body to validate
 * @returns Error message string if invalid, null if valid
 */
export function validateChatRequest(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return "Invalid request body";
  }

  const request = body as ChatRequest;
  const { message, history, conversationHistory } = request;

  // Validate message exists
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return "Message is required and must be a non-empty string";
  }

  // Security: Limit message length to prevent DoS attacks
  if (message.length > MAX_MESSAGE_LENGTH) {
    return `Message too long (maximum ${MAX_MESSAGE_LENGTH} characters)`;
  }

  // Validate history format
  if (history !== undefined && !Array.isArray(history)) {
    return "history must be an array";
  }

  // Security: Limit history size to prevent resource exhaustion
  if (history && history.length > MAX_HISTORY_LENGTH) {
    return `History too long (maximum ${MAX_HISTORY_LENGTH} messages)`;
  }

  // Security: Validate each history message
  if (history) {
    for (let i = 0; i < history.length; i++) {
      const msg = history[i];

      if (!msg || typeof msg !== "object") {
        return `Invalid history message at index ${i}`;
      }

      if (!msg.role || !msg.content) {
        return `History message at index ${i} missing role or content`;
      }

      if (typeof msg.role !== "string" || typeof msg.content !== "string") {
        return `History message at index ${i} has invalid role or content type`;
      }

      if (msg.role !== "user" && msg.role !== "assistant") {
        return `History message at index ${i} has invalid role (must be 'user' or 'assistant')`;
      }

      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return `History message at index ${i} too long (maximum ${MAX_MESSAGE_LENGTH} characters)`;
      }
    }
  }

  // Legacy support validation
  if (
    conversationHistory !== undefined &&
    !Array.isArray(conversationHistory)
  ) {
    return "conversationHistory must be an array";
  }

  if (conversationHistory && conversationHistory.length > MAX_HISTORY_LENGTH) {
    return `conversationHistory too long (maximum ${MAX_HISTORY_LENGTH} messages)`;
  }

  return null;
}

/**
 * Validates a document Q&A request body
 * @param body - The request body to validate
 * @returns Error message string if invalid, null if valid
 */
export function validateDocumentQARequest(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return "Invalid request body";
  }

  const request = body as DocumentQARequest;
  const { fileUri, question, history } = request;

  // Validate fileUri
  if (!fileUri || typeof fileUri !== "string" || fileUri.trim().length === 0) {
    return "fileUri is required and must be a non-empty string";
  }

  // Security: Validate fileUri format (should start with https:// for Gemini API)
  if (!fileUri.startsWith("https://")) {
    return "fileUri must be a valid HTTPS URL";
  }

  // Validate question
  if (
    !question ||
    typeof question !== "string" ||
    question.trim().length === 0
  ) {
    return "question is required and must be a non-empty string";
  }

  // Security: Limit question length
  if (question.length > MAX_QUESTION_LENGTH) {
    return `Question too long (maximum ${MAX_QUESTION_LENGTH} characters)`;
  }

  // Validate history format
  if (history !== undefined && !Array.isArray(history)) {
    return "history must be an array";
  }

  // Security: Limit history size
  if (history && history.length > MAX_HISTORY_LENGTH) {
    return `History too long (maximum ${MAX_HISTORY_LENGTH} messages)`;
  }

  // Security: Validate each history message
  if (history) {
    for (let i = 0; i < history.length; i++) {
      const msg = history[i];

      if (!msg || typeof msg !== "object") {
        return `Invalid history message at index ${i}`;
      }

      if (!msg.role || !msg.content) {
        return `History message at index ${i} missing role or content`;
      }

      if (typeof msg.role !== "string" || typeof msg.content !== "string") {
        return `History message at index ${i} has invalid role or content type`;
      }

      if (msg.role !== "user" && msg.role !== "assistant") {
        return `History message at index ${i} has invalid role (must be 'user' or 'assistant')`;
      }

      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return `History message at index ${i} too long (maximum ${MAX_MESSAGE_LENGTH} characters)`;
      }
    }
  }

  return null;
}
