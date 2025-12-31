import { GoogleGenAI } from "@google/genai";

// Initialize Gemini - reads API key from environment variables
// For Vercel, environment variables are automatically available
// For local development, ensure .env file is loaded
export const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "",
});

// Validate API key on module load (only in development)
if (process.env.NODE_ENV !== "production" && !ai) {
  console.warn(
    "⚠️  Warning: GOOGLE_API_KEY or GEMINI_API_KEY not found in environment variables"
  );
}
