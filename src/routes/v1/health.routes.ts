/**
 * Health Routes (v1)
 * Defines health check endpoints
 */

import { Router } from 'express';
import { handleHealthCheck } from '../../controllers/healthController.js';

const router = Router();

/**
 * GET /api/v1/health
 * Health check endpoint
 * No authentication required
 */
router.get('/', handleHealthCheck);

export default router;
