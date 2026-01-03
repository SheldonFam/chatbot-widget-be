/**
 * Centralized configuration management
 * All environment variables and app configuration should be accessed through this module
 */

import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

interface Config {
  // Server
  port: number;
  nodeEnv: string;

  // API Keys
  googleApiKey: string;

  // CORS
  allowedOrigins: string[];

  // AI Configuration
  ai: {
    model: string;
    useVertexAI: boolean; // ✅ Added flag to determine which auth method
    vertexProjectId?: string; // ✅ Optional for Vertex AI
    vertexLocation?: string; // ✅ Optional for Vertex AI
  };

  // Security
  apiKey: string;

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

/**
 * Validates that all required environment variables are present
 * @throws Error if required variables are missing
 */
function validateEnv(): void {
  const useVertexAI = process.env.USE_VERTEX_AI === "true";

  if (useVertexAI) {
    // Vertex AI requires project ID
    const required = ["GOOGLE_CLOUD_PROJECT"];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required Vertex AI environment variables: ${missing.join(
          ", "
        )}\n` + "Please check your .env file or environment configuration."
      );
    }
  } else {
    // API Key mode requires GOOGLE_API_KEY
    const required = ["GOOGLE_API_KEY"];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}\n` +
          "Please check your .env file or environment configuration."
      );
    }
  }
}

/**
 * Parses allowed origins from environment variable
 * Defaults to localhost:3000 for development
 */
function parseAllowedOrigins(): string[] {
  const originsEnv = process.env.FRONTEND_URL;

  if (!originsEnv) {
    return ["http://localhost:3000"];
  }

  return originsEnv.split(",").map((origin) => origin.trim());
}

/**
 * Creates and validates the application configuration
 */
function createConfig(): Config {
  const useVertexAI = process.env.USE_VERTEX_AI === "true";

  // Validate environment first
  validateEnv();

  return {
    port: parseInt(process.env.PORT || "3001", 10),
    nodeEnv: process.env.NODE_ENV || "development",

    googleApiKey: process.env.GOOGLE_API_KEY || "",

    allowedOrigins: parseAllowedOrigins(),

    ai: {
      model: "gemini-2.5-flash",
      useVertexAI,
      vertexProjectId: useVertexAI
        ? process.env.GOOGLE_CLOUD_PROJECT
        : undefined,
      vertexLocation: useVertexAI
        ? process.env.GOOGLE_CLOUD_LOCATION || "global"
        : undefined,
    },

    apiKey: process.env.API_KEY || "",

    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10), // 1 minute
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10), // 100 requests per minute
    },
  };
}

// Create and export the configuration
export const config = createConfig();

// Export helper to check if running in production
export const isProduction = config.nodeEnv === "production";
export const isDevelopment = config.nodeEnv === "development";
