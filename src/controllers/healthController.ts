/**
 * Health Controller
 * Handles health check endpoint
 */

import { Request, Response } from 'express';

/**
 * Health check endpoint
 * GET /api/v1/health
 */
export function handleHealthCheck(_req: Request, res: Response): void {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
}
