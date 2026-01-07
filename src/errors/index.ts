/**
 * Custom error classes for better error handling and categorization
 */

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error - thrown when request validation fails
 * Status code: 400
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * Authentication error - thrown when API key is invalid or missing
 * Status code: 401
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Invalid or missing API key") {
    super(message, 401);
  }
}

/**
 * Not found error - thrown when resource is not found
 * Status code: 404
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * AI service error - thrown when AI service fails
 * Status code: 503
 */
export class AIServiceError extends AppError {
  constructor(
    message: string = "AI service is currently unavailable",
    public details?: string
  ) {
    super(message, 503);
  }
}

/**
 * Rate limit error - thrown when rate limit is exceeded
 * Status code: 429
 */
export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests, please try again later") {
    super(message, 429);
  }
}
