// GET /api/tide?lat=..&lng=..&date=YYYY-MM-DD (local date; defaults to today JST)
// Japan: JMA tide tables (潮位表). Puerto Rico/US: NOAA CO-OPS predictions. See _lib/gov.js.
import { getTides, inJapan } from "./_lib/gov.js";
export const maxDuration = 20;
export default async function handler(req, res) {
  const lat = Number(req.query.lat), lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ error: "bad lat/lng" });
  const offsetH = inJapan(lat, lng) ? 9 : -4; // JST / Atlantic Standard Time (PR has no DST)
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.date || "")) ? req.query.date : new Date(Date.now() + offsetH * 3600e3).toISOString().slice(0, 10);
  const t = await getTides(+lat.toFixed(2), +lng.toFixed(2), date);
  if (!t) { res.setHeader("Cache-Control", "public, s-maxage=3600"); return res.status(404).json({ error: "no tide station nearby" }); }
  res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
  return res.status(200).json(t);
}
