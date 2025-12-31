import type { VercelRequest, VercelResponse } from "@vercel/node";

const ALLOWED_ORIGINS = [process.env.FRONTEND_URL, "http://localhost:5173"];

export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin as string;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true; // request handled
  }

  return false; // continue request
}
