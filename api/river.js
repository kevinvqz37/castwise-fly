// GET /api/river?lat=..&lng=..  → { status, rain24h, warnings, gauge }
// Japan: JMA warnings + AMeDAS 24 h rain. Puerto Rico: USGS gauges + NWS alerts. See _lib/gov.js.
import { getRiver } from "./_lib/gov.js";
export const maxDuration = 20;
export default async function handler(req, res) {
  const lat = Number(req.query.lat), lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ error: "bad lat/lng" });
  const r = await getRiver(+lat.toFixed(2), +lng.toFixed(2));
  if (!r) { res.setHeader("Cache-Control", "public, s-maxage=300"); return res.status(404).json({ error: "no river data" }); }
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=1800");
  return res.status(200).json(r);
}
