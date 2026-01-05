/**
 * Chat Routes (v1)
 * Defines all chat-related endpoints
 */

import { Router } from "express";
import {
  handleChat,
  handleChatStream,
} from "../../controllers/chatController.js";
import { chatLimiter } from "../../middleware/rateLimiter.js";

const router = Router();

/**
 * POST /api/v1/chat
 * Non-streaming chat endpoint
 */
router.post("/", chatLimiter, handleChat);

/**
 * POST /api/v1/chat/stream
 * Streaming chat endpoint (Server-Sent Events)
 */
router.post("/stream", chatLimiter, handleChatStream);

export default router;
