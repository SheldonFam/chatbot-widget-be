/**
 * Chat Controller
 * Handles HTTP requests for chat endpoints
 */

import { Request, Response, NextFunction } from "express";
import { aiService } from "../services/aiService.js";
import { ValidationError } from "../errors/index.js";
import { validateChatRequest } from "../utils/validation.js";
import type { ChatRequest, ChatResponse } from "../types.js";

/**
 * Handle non-streaming chat request
 * POST /api/v1/chat
 */
export async function handleChat(
  req: Request<{}, {}, ChatRequest>,
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
    console.log("responseText", responseText);
    // Send successful response
    res.json({
      success: true,
      response: responseText,
    });
  } catch (error) {
    next(error);
  }
}
