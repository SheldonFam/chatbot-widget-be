/**
 * Request Logger Middleware
 * Logs incoming HTTP requests with timing information
 */

import { Request, Response, NextFunction } from "express";

/**
 * Simple request logger middleware
 * Logs method, path, status code, and response time
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  // Log when response finishes
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    // Color code by status
    let statusColor = "\x1b[32m"; // Green for 2xx
    if (res.statusCode >= 400)
      statusColor = "\x1b[31m"; // Red for 4xx/5xx
    else if (res.statusCode >= 300) statusColor = "\x1b[33m"; // Yellow for 3xx

    console.log(
      `\x1b[36m[${timestamp}]\x1b[0m ${req.method} ${req.path} ${statusColor}${res.statusCode}\x1b[0m - ${duration}ms`
    );
  });

  next();
}
