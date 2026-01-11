/**
 * Health Routes (v1)
 * Defines health check endpoint
 */

import { Router } from "express";
import { handleHealthCheck } from "../../controllers/healthController";

const router = Router();

/**
 * GET /api/v1/health
 * Health check endpoint
 */
router.get("/", handleHealthCheck);

export default router;
