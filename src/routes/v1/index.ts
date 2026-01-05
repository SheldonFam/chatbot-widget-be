/**
 * V1 API Routes Index
 * Aggregates all v1 routes
 */

import { Router } from 'express';
import healthRoutes from './health.routes.js';
import chatRoutes from './chat.routes.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

/**
 * Health routes - No authentication required
 */
router.use('/health', healthRoutes);

/**
 * Chat routes - Authentication required
 */
router.use('/chat', authenticate, chatRoutes);

export default router;
