/**
 * Chat Routes (v1)
 * Defines all chat-related endpoints
 */

import { Router } from "express";
import {
  handleChat,
  //   handleChatStream,
} from "../../controllers/chatController.js";
import { chatLimiter } from "../../middleware/rateLimiter.js";

const router = Router();

/**
 * POST /api/v1/chat
 * Non-streaming chat endpoint
 */
router.post("/", chatLimiter, handleChat);

export default router;
