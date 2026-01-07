/**
 * Document Controller
 * Handles HTTP requests for PDF document upload and Q&A endpoints
 */

import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { aiService } from "../services/aiService.js";
import { ValidationError } from "../errors/index.js";
import { validateDocumentQARequest } from "../utils/validation.js";
import type {
  PDFUploadResponse,
  DocumentQARequest,
  DocumentQAResponse,
} from "../types.js";

/**
 * Configure multer for PDF file uploads
 * Limits: 50MB max file size (Gemini API limit)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (_req, file, cb) => {
    // Only accept PDF files
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(
        new ValidationError(
          "Invalid file type. Only PDF files are allowed."
        ) as any
      );
    }
  },
});

/**
 * Middleware for handling single PDF file upload
 * Accepts field name "file" (standard) or "pdf" (alternative)
 */
export const uploadPDF = upload.single("file");

/**
 * Handle PDF upload request
 * POST /api/v1/documents/upload
 */
export async function handlePDFUpload(
  req: Request,
  res: Response<PDFUploadResponse>,
  next: NextFunction
): Promise<void> {
  try {
    // Check if file was uploaded
    if (!req.file) {
      throw new ValidationError("PDF file is required");
    }

    const file = req.file;
    const fileName = file.originalname || "document.pdf";

    // Validate file size (50MB limit per Gemini API)
    if (file.size > 50 * 1024 * 1024) {
      throw new ValidationError(
        "File size exceeds 50MB limit. Please upload a smaller file."
      );
    }

    // Upload PDF to Gemini Files API
    const { fileUri, mimeType } = await aiService.uploadPDF(
      file.buffer,
      fileName
    );

    // Send successful response
    res.json({
      success: true,
      fileUri,
      fileName,
      mimeType,
      size: file.size,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle document Q&A request
 * POST /api/v1/documents/qa
 */
export async function handleDocumentQA(
  req: Request<{}, {}, DocumentQARequest>,
  res: Response<DocumentQAResponse>,
  next: NextFunction
): Promise<void> {
  try {
    // Validate request
    const validationError = validateDocumentQARequest(req.body);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    const { fileUri, question, history } = req.body;

    // Generate AI response based on document
    const responseText = await aiService.generateDocumentQA(
      fileUri,
      question,
      history
    );

    // Send successful response
    res.json({
      success: true,
      response: responseText,
    });
  } catch (error) {
    next(error);
  }
}
