// api/rivers.js — cached proxy for OpenStreetMap waterways (Overpass API).
// Browsers can't call Overpass reliably (rate limits come back without CORS headers),
// so the app asks us per map tile and Vercel's CDN caches each tile for a week.
//   GET /api/rivers?tile=<z>/<x>/<y>&types=river|river,stream

export const maxDuration = 30;

const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

// Per-mirror timeout. Mirrors are queried in parallel (not one-by-one), so a slow
// or rate-limited mirror (overpass-api.de in particular) no longer eats the whole
// request budget — we just take whichever mirror answers first. This was the main
// cause of intermittent "river data unavailable" results far from Japan/Europe
// (e.g. Puerto Rico), where the first mirror in the old sequential list would often
// stall for its full timeout before the next one was even tried.
const MIRROR_TIMEOUT_MS = 12000;

function tileBBox(z, x, y) {
  const n = 2 ** z;
  const lon = v => (v / n) * 360 - 180;
  const lat = v => (Math.atan(Math.sinh(Math.PI * (1 - (2 * v) / n))) * 180) / Math.PI;
  return [lat(y + 1), lon(x), lat(y), lon(x + 1)]; // s, w, n, e
}

async function queryMirror(url, q) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), MIRROR_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      method: "POST",
      body: "data=" + encodeURIComponent(q),
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "castwise-fly (fishing app)" },
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const m = /^(\d{1,2})\/(\d+)\/(\d+)$/.exec(String(req.query.tile || ""));
  const types = req.query.types === "river,stream" ? "river|stream" : "river";
  if (!m) return res.status(400).json({ error: "bad tile" });
  const [z, x, y] = m.slice(1).map(Number);
  if (z < 8 || z > 14) return res.status(400).json({ error: "zoom 8-14 only" });

  const [s, w, n, e] = tileBBox(z, x, y).map(v => v.toFixed(5));
  const q = `[out:json][timeout:25];way["waterway"~"^(${types})$"](${s},${w},${n},${e});out geom qt;`;

  // Race all mirrors at once; use the first one that succeeds instead of walking
  // them one at a time, so one slow/overloaded mirror can't stall the others.
  const attempts = MIRRORS.map(url =>
    queryMirror(url, q).catch(err => {
      console.warn("overpass mirror failed", url, err?.message);
      throw err;
    })
  );

  try {
    const data = await Promise.any(attempts);
    const ways = (data.elements || [])
      .filter(el => el.geometry && el.geometry.length > 1)
      .map(el => ({
        n: el.tags?.name || "",
        t: el.tags?.waterway === "river" ? "r" : "s",
        g: el.geometry.map(p => [Math.round(p.lat * 1e5) / 1e5, Math.round(p.lon * 1e5) / 1e5]),
      }));
    res.setHeader("Cache-Control", "public, s-maxage=604800, stale-while-revalidate=2592000");
    return res.status(200).json({ ways });
  } catch {
    // All mirrors failed. Cache the miss briefly so a burst of tile requests for a
    // down region doesn't hammer every mirror again within the same few seconds,
    // but don't cache it for long since mirrors recover quickly.
    res.setHeader("Cache-Control", "public, s-maxage=20, stale-while-revalidate=60");
    return res.status(502).json({ error: "river data unavailable" });
  }
}
