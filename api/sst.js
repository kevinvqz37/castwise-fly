// api/sst.js — cached proxy for NOAA sea-surface temperature (SST).
// Source: NASA JPL MUR SST v4.1 (GHRSST L4, global 0.01°, daily, ~1–2 day latency), served by
// NOAA CoastWatch's ERDDAP (West Coast node). We sample every 5th point → a 0.05° (~5 km) grid.
// Fallback: NOAA OISST v2.1 near-real-time (0.25°), spread onto the same 0.05° grid.
// (The old NOAA "Geo-polar Blended" ERDDAP datasets were retired in Oct 2026 — both IDs now 404.)
// The app asks per 2°×2° tile; Vercel's CDN caches each tile for 6 h.
//   GET /api/sst?tile=<lat0>,<lon0>   (lat0/lon0 = even integers, south-west corner)
//   → { date, source, lat0, lon0, step: 0.05, n: 40, t: [ 1600 temps in °C ×100, row-major
//        south→north, west→east; null = land / no data ] }

export const maxDuration = 30;

const ERDDAP = "https://coastwatch.pfeg.noaa.gov/erddap/griddap";
const STEP = 0.05, N = 40; // 2° tile at 0.05°
const TIMEOUT_MS = 20000;
const f2 = v => v.toFixed(2);

const SOURCES = [
  { name: "MUR", src: 0.01, url: (la, lo) => `${ERDDAP}/jplMURSST41.json?` + encodeURIComponent(
      `analysed_sst[(last)][(${f2(la + 0.02)}):5:(${f2(la + 1.99)})][(${f2(lo + 0.02)}):5:(${f2(lo + 1.99)})]`) },
  { name: "OISST", src: 0.25, url: (la, lo) => `${ERDDAP}/ncdcOisst21NrtAgg_LonPM180.json?` + encodeURIComponent(
      `sst[(last)][(0.0)][(${f2(la - 0.25)}):1:(${f2(la + 2.25)})][(${f2(lo - 0.25)}):1:(${f2(lo + 2.25)})]`) },
];

async function getJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "castwise-fly (fishing app)" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

// Rows → 40×40 grid. Each 0.05° cell takes the value of the source cell it falls in.
function toGrid(table, lat0, lon0, srcStep) {
  const cols = table.columnNames || [];
  const iT = cols.indexOf("time"), iLat = cols.indexOf("latitude"), iLon = cols.indexOf("longitude");
  const iV = cols.findIndex(c => c === "analysed_sst" || c === "sst");
  const pts = new Map(); let date = "";
  // Source points are cell centres: index each by the source cell it sits in (tiny epsilon
  // guards float error like 32.07/0.01 = 3206.9999…).
  const e = srcStep * 1e-4;
  const key = (a, b) => `${Math.floor((a + e) / srcStep)},${Math.floor((b + e) / srcStep)}`;
  for (const row of table.rows || []) {
    if (!date && row[iT]) date = String(row[iT]).slice(0, 10);
    const v = row[iV];
    if (v == null || Number.isNaN(v)) continue;
    pts.set(key(row[iLat], row[iLon]), v);
  }
  const t = new Array(N * N).fill(null); let sum = 0, cnt = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const v = pts.get(key(lat0 + STEP / 2 + i * STEP, lon0 + STEP / 2 + j * STEP));
    if (v != null) { t[i * N + j] = v; sum += v; cnt++; }
  }
  const kelvin = cnt && sum / cnt > 150; // GHRSST files are Kelvin; ERDDAP normally serves °C
  for (let k = 0; k < t.length; k++) if (t[k] != null) t[k] = Math.round((kelvin ? t[k] - 273.15 : t[k]) * 100);
  return { date, t, cnt };
}

export default async function handler(req, res) {
  const m = /^(-?\d{1,2}),(-?\d{1,3})$/.exec(String(req.query.tile || ""));
  if (!m) return res.status(400).json({ error: "bad tile" });
  const lat0 = Number(m[1]), lon0 = Number(m[2]);
  if (lat0 % 2 || lon0 % 2 || lat0 < -80 || lat0 > 78 || lon0 < -180 || lon0 > 178) {
    return res.status(400).json({ error: "tile must be even integers within range" });
  }

  for (const s of SOURCES) {
    try {
      const data = await getJson(s.url(lat0, lon0));
      const g = toGrid(data.table || {}, lat0, lon0, s.src);
      if (!g.cnt && !(data.table?.rows || []).length) throw new Error("empty");
      res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
      return res.status(200).json({ date: g.date, source: s.name, lat0, lon0, step: STEP, n: N, t: g.t });
    } catch (e) {
      console.warn("sst source failed", s.name, e?.message);
    }
  }
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
  return res.status(502).json({ error: "sst unavailable" });
}
