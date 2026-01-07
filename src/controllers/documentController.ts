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
 * Security: Limits file size, validates file type, and uses memory storage
 * Limits: 10MB max file size (reduced for better security and cost control)
 */
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for immediate processing
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (reduced from 50MB for better security)
    files: 1, // Only accept 1 file at a time
  },
  fileFilter: (_req, file, cb) => {
    // Security: Validate MIME type
    if (file.mimetype !== "application/pdf") {
      cb(
        new ValidationError(
          "Invalid file type. Only PDF files are allowed."
        ) as any
      );
      return;
    }

    // Security: Validate file extension
    const fileName = file.originalname.toLowerCase();
    if (!fileName.endsWith(".pdf")) {
      cb(
        new ValidationError(
          "Invalid file extension. Only .pdf files are allowed."
        ) as any
      );
      return;
    }

    // Security: Prevent path traversal attacks in filename
    if (file.originalname.includes("..") || file.originalname.includes("/")) {
      cb(
        new ValidationError(
          "Invalid filename. Filename contains forbidden characters."
        ) as any
      );
      return;
    }

    cb(null, true);
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

    // Security: Validate file size (should be caught by multer, but double-check)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(
        "File size exceeds 10MB limit. Please upload a smaller file."
      );
    }

    // Security: Validate minimum file size (prevent empty/corrupted files)
    if (file.size < 100) {
      throw new ValidationError(
        "File is too small. Please upload a valid PDF file."
      );
    }

    // Security: Sanitize filename (remove any special characters)
    const sanitizedFileName = (file.originalname || "document.pdf")
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 255); // Limit filename length

    // Upload PDF to Gemini Files API
    const { fileUri, mimeType } = await aiService.uploadPDF(
      file.buffer,
      sanitizedFileName
    );

    // Send successful response
    res.json({
      success: true,
      fileUri,
      fileName: sanitizedFileName,
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
  req: Request<Record<string, never>, Record<string, never>, DocumentQARequest>,
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
