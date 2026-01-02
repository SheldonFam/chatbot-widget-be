import type { VercelRequest, VercelResponse } from "@vercel/node";

const ALLOWED_ORIGINS = (
  process.env.FRONTEND_URL?.split(",") ?? ["http://localhost:5173"]
).filter(Boolean);

export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}
