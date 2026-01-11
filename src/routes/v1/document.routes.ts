/**
 * Document Routes (v1)
 * Defines all document-related endpoints (PDF upload and Q&A)
 */

import { Router } from "express";
import {
  handlePDFUpload,
  uploadPDF,
  handleDocumentQA,
} from "../../controllers/documentController";
import { chatLimiter } from "../../middleware/rateLimiter";

const router = Router();

/**
 * POST /api/v1/documents/upload
 * PDF upload endpoint
 */
router.post("/upload", chatLimiter, uploadPDF, handlePDFUpload);

/**
 * POST /api/v1/documents/qa
 * Document Q&A endpoint
 */
router.post("/qa", chatLimiter, handleDocumentQA);

export default router;
