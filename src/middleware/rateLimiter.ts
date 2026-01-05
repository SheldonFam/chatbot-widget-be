/**
 * Rate Limiter Middleware
 * Protects API endpoints from abuse
 */

import rateLimit from "express-rate-limit";
import { config } from "../config/index.js";

/**
 * General API rate limiter
 * Applied to all API routes
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: "Too Many Requests",
    message: "Too many requests from this IP, please try again later.",
    statusCode: 429,
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

/**
 * Stricter rate limiter for chat endpoints
 * Prevents abuse of AI resources
 */
export const chatLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 20, // 20 requests per minute
  message: {
    success: false,
    error: "Too Many Requests",
    message: "Too many chat requests, please slow down.",
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
