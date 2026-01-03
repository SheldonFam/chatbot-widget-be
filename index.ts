/**
 * Main Express Application
 * Entry point for the chatbot API server
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { config } from "./src/config/index.js";
import { requestLogger } from "./src/middleware/requestLogger.js";
import { apiLimiter } from "./src/middleware/rateLimiter.js";
import {
  errorHandler,
  notFoundHandler,
} from "./src/middleware/errorHandler.js";
import v1Routes from "./src/routes/v1/index.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ============================================
// Global Middleware
// ============================================

/**
 * CORS configuration
 * Allows requests from configured frontend origins
 */
app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

/**
 * Request body parsing
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Request logging
 */
app.use(requestLogger);

/**
 * Rate limiting for all API routes
 */
app.use("/api", apiLimiter);

// ============================================
// API Routes
// ============================================

/**
 * Mount v1 API routes
 */
app.use("/api/v1", v1Routes);

/**
 * Root endpoint
 */
app.get("/", (_req, res) => {
  res.json({
    name: "Chatbot Widget API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/api/v1/health",
      chat: "/api/v1/chat",
      chatStream: "/api/v1/chat/stream",
    },
    documentation: "See README.md for API documentation",
  });
});

// ============================================
// Error Handling
// ============================================

/**
 * 404 handler - must be after all routes
 */
app.use(notFoundHandler);

/**
 * Global error handler - must be last
 */
app.use(errorHandler);

// ============================================
// Start Server
// ============================================

/**
 * Start the Express server
 */
app.listen(config.port, () => {
  console.log(`\n🚀 Server started successfully!`);
  console.log(`📡 Port: ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🤖 AI Model: ${config.ai.model}`);
  console.log(`🔗 Base URL: http://localhost:${config.port}`);
  console.log(`\n📚 Available endpoints:`);
  console.log(`   GET  /api/v1/health       - Health check`);
  console.log(`   POST /api/v1/chat         - Chat (non-streaming)`);
  console.log(`   POST /api/v1/chat/stream  - Chat (streaming)`);
});

export default app;
