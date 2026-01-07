import type { ChatRequest, DocumentQARequest } from '../types.js';

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

/**
 * Validates a document Q&A request body
 * @param body - The request body to validate
 * @returns Error message string if invalid, null if valid
 */
export function validateDocumentQARequest(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return 'Invalid request body';
  }

  const request = body as DocumentQARequest;
  const { fileUri, question, history } = request;

  if (!fileUri || typeof fileUri !== 'string' || fileUri.trim().length === 0) {
    return 'fileUri is required and must be a non-empty string';
  }

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return 'question is required and must be a non-empty string';
  }

  if (history !== undefined && !Array.isArray(history)) {
    return 'history must be an array';
  }

  return null;
}
