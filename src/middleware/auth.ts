/**
 * Authentication Middleware
 * Validates API key for protected endpoints
 */

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
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    // Extract API key from headers
    const authHeader = req.headers.authorization;
    console.log("authHeader", authHeader);
    const apiKeyHeader = req.headers["x-api-key"] as string | undefined;
    console.log("apiKeyHeader", apiKeyHeader);

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

    if (providedKey !== config.apiKey) {
      throw new AuthenticationError("Invalid API key");
    }

    // Authentication successful
    next();
  } catch (error) {
    next(error);
  }
}
