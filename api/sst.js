// api/sst.js — cached proxy for NOAA sea-surface temperature (SST).
// Source: NOAA CoastWatch "Geo-polar Blended Analysis Day+Night" (GHRSST L4, global 0.05°
// ≈ 5 km, daily) on NOAA's ERDDAP server. The app asks per 2°×2° tile; Vercel's CDN caches
// each tile for 6 h, so NOAA sees a handful of requests a day no matter how many users.
//   GET /api/sst?tile=<lat0>,<lon0>   (lat0/lon0 = even integers, south-west corner)
//   → { date, lat0, lon0, step: 0.05, n: 40, t: [ 1600 temps in °C ×100, row-major
//        south→north, west→east; null = land / no data ] }

export const maxDuration = 30;

const SOURCES = [
  "https://coastwatch.noaa.gov/erddap/griddap/noaacwBLENDEDsstDNDaily.json",
  // Same NOAA product mirrored on the West Coast node, used only if the primary fails.
  "https://coastwatch.pfeg.noaa.gov/erddap/griddap/nesdisBLENDEDsstDNDaily.json",
];
const STEP = 0.05, N = 40; // 2° tile at 0.05°
const TIMEOUT_MS = 20000;

async function fetchGrid(base, lat0, lon0) {
  const a = (lat0 + STEP / 2).toFixed(3), b = (lat0 + 2 - STEP / 2).toFixed(3);
  const c = (lon0 + STEP / 2).toFixed(3), d = (lon0 + 2 - STEP / 2).toFixed(3);
  const q = `analysed_sst[(last)][(${a}):1:(${b})][(${c}):1:(${d})]`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`${base}?${encodeURIComponent(q)}`, { signal: ctrl.signal, headers: { "User-Agent": "castwise-fly (fishing app)" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const m = /^(-?\d{1,2}),(-?\d{1,3})$/.exec(String(req.query.tile || ""));
  if (!m) return res.status(400).json({ error: "bad tile" });
  const lat0 = Number(m[1]), lon0 = Number(m[2]);
  if (lat0 % 2 || lon0 % 2 || lat0 < -80 || lat0 > 78 || lon0 < -180 || lon0 > 178) {
    return res.status(400).json({ error: "tile must be even integers within range" });
  }

  let data = null;
  for (const base of SOURCES) {
    try { data = await fetchGrid(base, lat0, lon0); break; }
    catch (e) { console.warn("sst source failed", base, e?.message); }
  }
  if (!data?.table?.rows) {
    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
    return res.status(502).json({ error: "sst unavailable" });
  }

  const cols = data.table.columnNames || [];
  const iT = cols.indexOf("time"), iLat = cols.indexOf("latitude"), iLon = cols.indexOf("longitude"), iV = cols.indexOf("analysed_sst");
  const t = new Array(N * N).fill(null);
  let date = "", sum = 0, cnt = 0;
  for (const row of data.table.rows) {
    const v = row[iV];
    if (!date && row[iT]) date = String(row[iT]).slice(0, 10);
    if (v == null || Number.isNaN(v)) continue;
    const i = Math.round((row[iLat] - lat0 - STEP / 2) / STEP);
    const j = Math.round((row[iLon] - lon0 - STEP / 2) / STEP);
    if (i < 0 || i >= N || j < 0 || j >= N) continue;
    t[i * N + j] = v; sum += v; cnt++;
  }
  // GHRSST stores Kelvin; ERDDAP usually serves °C. Normalise either way.
  const kelvin = cnt && sum / cnt > 150;
  for (let k = 0; k < t.length; k++) if (t[k] != null) t[k] = Math.round((kelvin ? t[k] - 273.15 : t[k]) * 100);

  res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
  return res.status(200).json({ date, lat0, lon0, step: STEP, n: N, t });
}
