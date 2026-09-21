// api/claude.js — Anthropic proxy with IP rate limiting via Upstash Redis.
//
// SETUP (one time):
// 1. Create a free Upstash Redis DB at https://upstash.com
// 2. In Vercel project → Settings → Environment Variables, add:
//      UPSTASH_REDIS_REST_URL
//      UPSTASH_REDIS_REST_TOKEN
//      ANTHROPIC_API_KEY   (if not already set)
// 3. npm i @upstash/redis @upstash/ratelimit
// 4. Deploy.
//
// Limit: 15 requests / minute / IP. Adjust below.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(15, "60 s"),
  analytics: false,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Identify caller by IP (Vercel forwards real IP here)
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  try {
    const { success, remaining } = await ratelimit.limit(ip);
    if (!success) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please wait a moment and try again.",
      });
    }
    res.setHeader("X-RateLimit-Remaining", String(remaining));
  } catch (e) {
    // If Redis is unreachable, fail open but log — don't block real users
    console.warn("Rate limit check failed:", e?.message);
  }

  // Only allow calls from our own site (blocks people using the key from elsewhere)
  const origin = req.headers.origin || req.headers.referer || "";
  const allowed = ["https://castwise-fly.vercel.app", "http://localhost:5173", ...(process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean)];
  if (origin && !allowed.some(a => origin.startsWith(a)) && !/^https:\/\/castwise-fly-[a-z0-9-]+\.vercel\.app/.test(origin)) {
    return res.status(403).json({ error: "Forbidden origin" });
  }

  // Never forward the raw client body — pin model and cap tokens so the key can't be abused
  const body = req.body || {};
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 20) {
    return res.status(400).json({ error: "Invalid request" });
  }
  if (JSON.stringify(body.messages).length > 6_000_000) {
    return res.status(413).json({ error: "Request too large" });
  }
  const safeBody = {
    model: process.env.CLAUDE_MODEL || "claude-haiku-4-5",
    max_tokens: Math.min(Number(body.max_tokens) || 800, 1500),
    messages: body.messages,
    ...(typeof body.system === "string" ? { system: body.system.slice(0, 4000) } : {}),
  };

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(safeBody),
    });

    const data = await anthropicRes.json();
    return res.status(anthropicRes.status).json(data);
  } catch (e) {
    console.error("Anthropic proxy error:", e?.message);
    return res.status(500).json({ error: "Upstream request failed" });
  }
}
