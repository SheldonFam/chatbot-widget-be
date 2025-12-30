import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json({
    status: "ok",
    message: "Chat API is running with Gemini 2.5",
    timestamp: Date.now(),
  });
}
