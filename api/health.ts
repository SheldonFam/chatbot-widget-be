import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../src/cors.js";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  if (applyCors(_req, res)) {
    return;
  }

  if (_req.method !== "GET" && _req.method !== "OPTIONS") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.json({
    status: "ok",
    message: "Chat API is running with Gemini 2.5",
    timestamp: Date.now(),
  });
}
