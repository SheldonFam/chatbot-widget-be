/**
 * Chat Controller
 * Handles HTTP requests for chat endpoints
 */

import { Request, Response, NextFunction } from "express";
import { aiService } from "../services/aiService.js";
import { ValidationError } from "../errors/index.js";
import { validateChatRequest } from "../utils/validation.js";
import type { ChatRequest, ChatResponse, StreamChunk } from "../types.js";

/**
 * Handle non-streaming chat request
 * POST /api/v1/chat
 */
export async function handleChat(
  req: Request<Record<string, never>, Record<string, never>, ChatRequest>,
  res: Response<ChatResponse>,
  next: NextFunction
): Promise<void> {
  try {
    // Validate request
    const validationError = validateChatRequest(req.body);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    const { message, history } = req.body;

    // Generate AI response
    const responseText = await aiService.generateChatResponse(message, history);

    // Send successful response
    res.json({
      success: true,
      response: responseText,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle streaming chat request
 * POST /api/v1/chat/stream
 */
export async function handleChatStream(
  req: Request<Record<string, never>, Record<string, never>, ChatRequest>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate request
    const validationError = validateChatRequest(req.body);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    const { message, history } = req.body;

    // Set up Server-Sent Events headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable buffering in nginx

    // Generate and stream AI response
    try {
      for await (const chunk of aiService.generateStreamingResponse(
        message,
        history
      )) {
        const streamChunk: StreamChunk = {
          content: chunk,
        };
        res.write(`data: ${JSON.stringify(streamChunk)}\n\n`);
      }

      // Send final chunk to indicate completion
      const finalChunk: StreamChunk = {};
      res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
      res.end();
    } catch (error) {
      // Send error through stream
      const errorChunk: StreamChunk = {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
      res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
      res.end();
    }
  } catch (error) {
    next(error);
  }
}
