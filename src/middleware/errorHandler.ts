/**
 * Error Handling Middleware
 * Centralized error handler for all Express errors
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/index.js';
import { isDevelopment } from '../config/index.js';

/**
 * Standard error response format
 */
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  stack?: string; // Only in development
  details?: string;
}

/**
 * Global error handler middleware
 * Should be registered last, after all routes
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal server error';
  let details: string | undefined;

  // Handle known AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    // Include details if available (e.g., AIServiceError)
    if ('details' in err && err.details) {
      details = err.details as string;
    }
  } else {
    // Log unexpected errors
    console.error('Unexpected error:', err);
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: err.name || 'Error',
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Include stack trace in development
  if (isDevelopment && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Include additional details if available
  if (details) {
    errorResponse.details = details;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 * Handles routes that don't exist
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
}
