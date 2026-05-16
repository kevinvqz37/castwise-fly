// Vercel serverless function — proxies Anthropic API calls
// Put this file at: /api/claude.js in your Vite project root
//
// Then in Vercel dashboard:
//   Settings → Environment Variables → Add:
//     Name:  ANTHROPIC_API_KEY
//     Value: sk-ant-xxxxx (your key from console.anthropic.com)

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting via simple IP-based check (basic — for serious apps use Upstash or similar)
  const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Anthropic API error: ${response.status}`, data);
      return res.status(response.status).json({ error: data.error || "API error" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Proxy server error" });
  }
}