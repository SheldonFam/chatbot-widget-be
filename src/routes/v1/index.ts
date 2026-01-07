/**
 * V1 API Routes Index
 * Aggregates all v1 routes
 */

import { Router } from "express";
import healthRoutes from "./health.routes.js";
import chatRoutes from "./chat.routes.js";
import documentRoutes from "./document.routes.js";
import { authenticate } from "../../middleware/auth.js";
import {
  handlePDFUpload,
  uploadPDF,
} from "../../controllers/documentController.js";
import { chatLimiter } from "../../middleware/rateLimiter.js";

const router = Router();

/**
 * Health routes - No authentication required
 */
router.use("/health", healthRoutes);

/**
 * Chat routes - Authentication required
 */
router.use("/chat", authenticate, chatRoutes);

/**
 * Document routes - Authentication required
 */
router.use("/documents", authenticate, documentRoutes);

/**
 * Alias for document upload (shorter path for convenience)
 * POST /api/v1/upload -> same as /api/v1/documents/upload
 */
router.post("/upload", authenticate, chatLimiter, uploadPDF, handlePDFUpload);

export default router;
