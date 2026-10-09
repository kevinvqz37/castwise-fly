// Ocean temperature layer (NOAA satellite SST via /api/sst) and thermal-front hotspots.
//
// Fishing logic: predators and bait gather where water temperature changes sharply over a
// short distance (a thermal front, 潮目). We compute the temperature gradient in °C per km
// on NOAA's 5 km grid and flag the strongest breaks in view as likely high-activity spots.

const TILE = 2;           // degrees per tile (matches api/sst.js)
const MAX_TILES = 9;      // don't fetch more than a 3×3 block of tiles at once
const FRONT_MIN = 0.03;   // °C per km — weaker than this isn't a usable break
const HOTSPOT_SPACING_KM = 8;
const MAX_HOTSPOTS = 10;

const km = (lat1, lng1, lat2, lng2) => {
  const R = 6371, r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

export function tilesForBounds(b) {
  const s = Math.floor(b.getSouth() / TILE) * TILE, n = Math.floor(b.getNorth() / TILE) * TILE;
  const w = Math.floor(b.getWest() / TILE) * TILE, e = Math.floor(b.getEast() / TILE) * TILE;
  const out = [];
  for (let la = s; la <= n; la += TILE) for (let lo = w; lo <= e; lo += TILE) out.push([la, lo]);
  return out.length > MAX_TILES ? null : out;
}

export async function fetchSstTile([lat0, lon0], signal) {
  const r = await fetch(`/api/sst?tile=${lat0},${lon0}`, { signal });
  if (!r.ok) throw new Error("sst " + r.status);
  const d = await r.json();
  d.t = d.t.map(v => (v == null ? null : v / 100));
  return d;
}

// °C at a lat/lng from cached tiles (nearest grid cell), or null.
// Spots sit on the shore, where the nearest cell is often land, so look a few cells out.
function tempAt(tiles, lat, lng) {
  for (const d of tiles) {
    if (lat < d.lat0 || lat >= d.lat0 + TILE || lng < d.lon0 || lng >= d.lon0 + TILE) continue;
    const i0 = Math.floor((lat - d.lat0) / d.step), j0 = Math.floor((lng - d.lon0) / d.step);
    for (let r = 0; r <= 3; r++) for (let i = i0 - r; i <= i0 + r; i++) for (let j = j0 - r; j <= j0 + r; j++) {
      if (i < 0 || j < 0 || i >= d.n || j >= d.n) continue;
      const v = d.t[i * d.n + j];
      if (v != null) return v;
    }
    return null;
  }
  return null;
}

// Gradient (°C/km) for every ocean cell of a tile.
function gradients(d) {
  const { n, step, t, lat0 } = d, g = new Array(n * n).fill(null);
  for (let i = 0; i < n; i++) {
    const dy = step * 111.2, dx = step * 111.2 * Math.cos(((lat0 + (i + 0.5) * step) * Math.PI) / 180);
    for (let j = 0; j < n; j++) {
      const v = t[i * n + j];
      if (v == null) continue;
      const l = j > 0 ? t[i * n + j - 1] : null, r = j < n - 1 ? t[i * n + j + 1] : null;
      const u = i < n - 1 ? t[(i + 1) * n + j] : null, w = i > 0 ? t[(i - 1) * n + j] : null;
      const gx = l != null && r != null ? (r - l) / (2 * dx) : l != null ? (v - l) / dx : r != null ? (r - v) / dx : 0;
      const gy = u != null && w != null ? (u - w) / (2 * dy) : w != null ? (v - w) / dy : u != null ? (u - v) / dy : 0;
      g[i * n + j] = Math.hypot(gx, gy);
    }
  }
  return g;
}

function colorFor(x) { // x in 0..1 → blue → cyan → yellow → red
  const stops = [[0, [49, 54, 149]], [0.25, [69, 160, 220]], [0.5, [120, 210, 190]], [0.7, [250, 220, 90]], [0.85, [245, 140, 50]], [1, [215, 48, 39]]];
  for (let k = 1; k < stops.length; k++) {
    if (x <= stops[k][0]) {
      const [a, ca] = stops[k - 1], [b, cb] = stops[k], f = (x - a) / (b - a || 1);
      return ca.map((c, i) => Math.round(c + (cb[i] - c) * f));
    }
  }
  return stops.at(-1)[1];
}

// Build the overlay for the tiles in view. Returns { layer, min, max, date, hotspots }.
export function buildSstLayer(L, tiles, lang) {
  const layer = L.layerGroup();
  const vals = tiles.flatMap(d => d.t.filter(v => v != null)).sort((a, b) => a - b);
  if (!vals.length) return { layer, min: null, max: null, date: tiles[0]?.date || "", hotspots: [] };
  const min = vals[Math.floor(vals.length * 0.03)], max = vals[Math.floor(vals.length * 0.97)];
  const span = Math.max(max - min, 0.5);
  // Draw every tile into ONE canvas so there are no seams where tiles meet.
  const n = tiles[0].n;
  const la0 = Math.min(...tiles.map(d => d.lat0)), la1 = Math.max(...tiles.map(d => d.lat0));
  const lo0 = Math.min(...tiles.map(d => d.lon0)), lo1 = Math.max(...tiles.map(d => d.lon0));
  const cols = (lo1 - lo0) / TILE + 1, rows = (la1 - la0) / TILE + 1;
  const c = document.createElement("canvas");
  c.width = cols * n; c.height = rows * n;
  const ctx = c.getContext("2d"), img = ctx.createImageData(c.width, c.height);
  const fronts = [];
  for (const d of tiles) {
    const ox = ((d.lon0 - lo0) / TILE) * n, oy = ((la1 - d.lat0) / TILE) * n; // canvas rows run north→south
    const g = (d._g ||= gradients(d));
    for (let i = 0; i < d.n; i++) for (let j = 0; j < d.n; j++) {
      const v = d.t[i * d.n + j];
      if (v == null) continue;
      const p = ((oy + d.n - 1 - i) * c.width + ox + j) * 4;
      const [r, gg, b] = colorFor(Math.min(1, Math.max(0, (v - min) / span)));
      img.data[p] = r; img.data[p + 1] = gg; img.data[p + 2] = b; img.data[p + 3] = 150;
      const gr = g[i * d.n + j];
      if (gr != null && gr >= FRONT_MIN) fronts.push({ lat: d.lat0 + (i + 0.5) * d.step, lng: d.lon0 + (j + 0.5) * d.step, temp: v, grad: gr });
    }
  }
  ctx.putImageData(img, 0, 0);
  L.imageOverlay(c.toDataURL(), [[la0, lo0], [la1 + TILE, lo1 + TILE]], { opacity: 0.85, interactive: false }).addTo(layer);
  // Strongest fronts first, spaced apart so one long front doesn't fill the list.
  fronts.sort((a, b) => b.grad - a.grad);
  const hotspots = [];
  for (const f of fronts) {
    if (hotspots.length >= MAX_HOTSPOTS) break;
    if (hotspots.every(h => km(h.lat, h.lng, f.lat, f.lng) >= HOTSPOT_SPACING_KM)) hotspots.push(f);
  }
  const T = (ja, en, es) => (lang === "ja" ? ja : lang === "es" ? es : en);
  for (const h of hotspots) {
    const per10 = (h.grad * 10).toFixed(1);
    const icon = L.divIcon({ className: "", iconSize: [26, 26], iconAnchor: [13, 13],
      html: '<div style="width:26px;height:26px;border-radius:50%;background:rgba(230,57,70,0.85);border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 10px rgba(230,57,70,0.7)">🔥</div>' });
    L.marker([h.lat, h.lng], { icon }).bindPopup(
      `<div style="font-family:sans-serif;min-width:170px"><b>🔥 ${T("潮目（水温の境目）", "Thermal front", "Frente térmico")}</b><br>` +
      `🌡 ${h.temp.toFixed(1)}℃ · ${T(`10kmで${per10}℃変化`, `${per10}°C change over 10 km`, `${per10}°C de cambio en 10 km`)}<br>` +
      `<span style="color:#5a5a4a;font-size:12px">${T("ベイトと回遊魚が集まりやすいポイント", "Bait and predators tend to gather here", "Aquí suelen juntarse carnada y depredadores")}</span></div>`
    ).addTo(layer);
  }
  return { layer, min, max, date: tiles[0]?.date || "", hotspots };
}

// For a spot: water temp and the strongest front within `radiusKm`, from cached tiles.
export function sstAtSpot(tiles, lat, lng, radiusKm = 10) {
  if (!tiles.length) return null;
  const temp = tempAt(tiles, lat, lng);
  let front = 0;
  for (const d of tiles) {
    if (lat < d.lat0 - 0.2 || lat > d.lat0 + TILE + 0.2 || lng < d.lon0 - 0.2 || lng > d.lon0 + TILE + 0.2) continue;
    const g = (d._g ||= gradients(d));
    for (let i = 0; i < d.n; i++) for (let j = 0; j < d.n; j++) {
      const v = g[i * d.n + j];
      if (v == null || v <= front) continue;
      if (km(lat, lng, d.lat0 + (i + 0.5) * d.step, d.lon0 + (j + 0.5) * d.step) <= radiusKm) front = v;
    }
  }
  return { temp, front, nearFront: front >= FRONT_MIN };
}
