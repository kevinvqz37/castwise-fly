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

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await anthropicRes.json();
    return res.status(anthropicRes.status).json(data);
  } catch (e) {
    console.error("Anthropic proxy error:", e?.message);
    return res.status(500).json({ error: "Upstream request failed" });
  }
}
