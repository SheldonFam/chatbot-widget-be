import type { ChatRequest } from '../types.js';

/**
 * Validates a chat request body
 * @param body - The request body to validate
 * @returns Error message string if invalid, null if valid
 */
export function validateChatRequest(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return 'Invalid request body';
  }

  const request = body as ChatRequest;
  const { message, history, conversationHistory } = request;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return 'Message is required and must be a non-empty string';
  }

  if (history !== undefined && !Array.isArray(history)) {
    return 'history must be an array';
  }

  if (conversationHistory !== undefined && !Array.isArray(conversationHistory)) {
    return 'conversationHistory must be an array';
  }

  return null;
}
