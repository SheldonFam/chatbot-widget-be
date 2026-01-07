/**
 * Authentication Middleware
 * Validates API key for protected endpoints
 */

import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { config } from "../config/index.js";
import { AuthenticationError } from "../errors/index.js";

/**
 * API Key authentication middleware
 * Checks for API key in Authorization header or x-api-key header
 *
 * Expected formats:
 * - Authorization: Bearer <api-key>
 * - x-api-key: <api-key>
 *
 * Security: Uses timing-safe comparison to prevent timing attacks
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    // Extract API key from headers
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers["x-api-key"] as string | undefined;

    let providedKey: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      providedKey = authHeader.substring(7);
    } else if (apiKeyHeader) {
      providedKey = apiKeyHeader;
    }

    // Validate API key
    if (!providedKey) {
      throw new AuthenticationError(
        "API key is required. Provide it via Authorization header or x-api-key header"
      );
    }

    // Use timing-safe comparison to prevent timing attacks
    // This ensures comparison takes constant time regardless of where strings differ
    const providedBuffer = Buffer.from(providedKey);
    const expectedBuffer = Buffer.from(config.apiKey);

    // Check length first (not timing-sensitive since length is not secret)
    // Then use crypto.timingSafeEqual for constant-time comparison
    const isValid =
      providedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(providedBuffer, expectedBuffer);

    if (!isValid) {
      throw new AuthenticationError("Invalid API key");
    }

    // Authentication successful
    next();
  } catch (error) {
    next(error);
  }
}
