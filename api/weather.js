// GET /api/weather?lat=..&lng=..  → normalized current weather + today's blocks + week
// Japan: JMA (AMeDAS + forecast). Puerto Rico/US: NWS. See _lib/gov.js.
import { getWeather } from "./_lib/gov.js";
export const maxDuration = 20;
export default async function handler(req, res) {
  const lat = Number(req.query.lat), lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return res.status(400).json({ error: "bad lat/lng" });
  const w = await getWeather(+lat.toFixed(2), +lng.toFixed(2));
  if (!w) { res.setHeader("Cache-Control", "public, s-maxage=120"); return res.status(404).json({ error: "no weather source for this location" }); }
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800");
  return res.status(200).json(w);
}
