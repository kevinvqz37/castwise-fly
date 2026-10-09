// api/geo.js — the visitor's country from Vercel's IP geolocation header, so the app can
// pick a default language without asking for location permission.
//   GET /api/geo → { country: "JP" | "PR" | "US" | … | "" }
export default function handler(req, res) {
  const country = String(req.headers["x-vercel-ip-country"] || "").toUpperCase().slice(0, 2);
  res.setHeader("Cache-Control", "private, no-store"); // per-visitor answer — never cache at the CDN
  return res.status(200).json({ country });
}
