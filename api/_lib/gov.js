// Government data sources (free for commercial use with credit) — replaces Open-Meteo,
// whose free tier is non-commercial only.
//
//   Japan        JMA (気象庁)  AMeDAS observations, area + weekly forecasts, tide tables (潮位表),
//                              warnings. 公共データ利用規約（第1.0版）: credit "出典：気象庁ホームページ".
//   Puerto Rico  NOAA/NWS (api.weather.gov), NOAA CO-OPS tide predictions, USGS river gauges
//                              — US government works, public domain.
//
// Files in api/_lib are not deployed as endpoints; api/weather.js, api/tide.js, api/river.js
// and the bite-alert job import from here. Everything returns null instead of throwing.

const UA = "castwise-fly (fishing app; https://castwise-fly.vercel.app)";
const JMA = "https://www.jma.go.jp/bosai";

export const CREDIT = {
  jma: { ja: "出典：気象庁ホームページ（アメダス・天気予報・潮位表・警報）をもとにCastwiseが加工", en: "Source: Japan Meteorological Agency (processed by Castwise)" },
  us: { ja: "出典：NOAA / 米国立気象局・USGS", en: "Source: NOAA / National Weather Service, USGS" },
};

export const inJapan = (lat, lng) => lat > 24 && lat < 46 && lng > 122 && lng < 146;
export const inPuertoRico = (lat, lng) => lat > 17.5 && lat < 18.8 && lng > -68 && lng < -65;
const km = (a, b, c, d) => {
  const r = Math.PI / 180, x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
};

async function get(url, { json = true, timeout = 12000, headers = {} } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": UA, Accept: json ? "application/json, application/geo+json" : "text/plain", ...headers } });
    if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
    return json ? await r.json() : await r.text();
  } finally {
    clearTimeout(timer);
  }
}
const safe = async (p) => { try { return await p; } catch (e) { console.warn("gov:", e?.message); return null; } };

// Memo inside a warm serverless instance (the CDN cache in front does the heavy lifting).
const memo = new Map();
async function cached(key, ms, fn) {
  const hit = memo.get(key);
  if (hit && Date.now() - hit.t < ms) return hit.v;
  const v = await fn();
  if (v != null) memo.set(key, { t: Date.now(), v });
  return v;
}

// ─── shared weather classification ────────────────────────────────────────────
// The app's UI and fishing index speak WMO weather codes (0 clear … 95 thunder).
export function wmoFromText(t = "") {
  const s = String(t).toLowerCase();
  if (/雷|thunder|t-storm/.test(s)) return 95;
  if (/雪|snow/.test(s)) return 71;
  if (/雨|rain|shower|drizzle/.test(s)) return /時々|一時|shower|chance|isolated|scattered|slight/.test(s) ? 80 : 61;
  if (/霧|fog/.test(s)) return 45;
  if (/(晴|sunny|clear).*(くもり|曇|cloud)|(くもり|曇|cloud).*(晴|sun)|partly|mostly sunny|mostly clear/.test(s)) return 2;
  if (/くもり|曇|cloud|overcast/.test(s)) return 3;
  if (/晴|sunny|clear|fair/.test(s)) return 0;
  return null;
}
// JMA forecast "telop" codes: 1xx sunny, 2xx cloudy, 3xx rain, 4xx snow (the rest refines).
export function wmoFromJmaCode(c) {
  const n = Number(c);
  if (!n) return null;
  const d = Math.floor(n / 100), r = n % 100;
  if (d === 1) return r === 0 ? 0 : [1, 10, 11, 30, 31, 32].includes(r) ? 2 : 80; // 101 晴時々曇… / 102 晴一時雨…
  if (d === 2) return r === 0 ? 3 : [1, 10, 11, 9].includes(r) ? 2 : 80;
  if (d === 3) return [0, 1, 6, 8].includes(r) ? 61 : 80;
  if (d === 4) return 71;
  return null;
}

// ─── Japan: forecast offices (one per prefecture; Hokkaido split) ─────────────
const JMA_OFFICES = [
  ["011000", 45.42, 141.67], ["012000", 43.77, 142.37], ["013000", 44.02, 144.27], ["014030", 42.92, 143.2], ["014100", 42.98, 144.38], ["015000", 42.32, 140.97], ["016000", 43.06, 141.35], ["017000", 41.77, 140.73],
  ["020000", 40.82, 140.74], ["030000", 39.7, 141.15], ["040000", 38.27, 140.87], ["050000", 39.72, 140.1], ["060000", 38.24, 140.36], ["070000", 37.75, 140.47],
  ["080000", 36.34, 140.45], ["090000", 36.57, 139.88], ["100000", 36.39, 139.06], ["110000", 35.86, 139.65], ["120000", 35.61, 140.12], ["130000", 35.69, 139.69], ["140000", 35.45, 139.64],
  ["150000", 37.9, 139.02], ["160000", 36.7, 137.21], ["170000", 36.59, 136.63], ["180000", 36.07, 136.22], ["190000", 35.66, 138.57], ["200000", 36.65, 138.18], ["210000", 35.39, 136.72], ["220000", 34.98, 138.38], ["230000", 35.18, 136.91], ["240000", 34.73, 136.51],
  ["250000", 35.0, 135.87], ["260000", 35.02, 135.76], ["270000", 34.69, 135.52], ["280000", 34.69, 135.18], ["290000", 34.69, 135.83], ["300000", 34.23, 135.17],
  ["310000", 35.5, 134.24], ["320000", 35.47, 133.05], ["330000", 34.66, 133.93], ["340000", 34.4, 132.46], ["350000", 34.19, 131.47],
  ["360000", 34.07, 134.56], ["370000", 34.34, 134.04], ["380000", 33.84, 132.77], ["390000", 33.56, 133.53],
  ["400000", 33.61, 130.42], ["410000", 33.25, 130.3], ["420000", 32.74, 129.87], ["430000", 32.79, 130.74], ["440000", 33.24, 131.61], ["450000", 31.91, 131.42], ["460100", 31.56, 130.56], ["460040", 28.38, 129.49], ["471000", 26.21, 127.68],
];
export function jmaOffice(lat, lng) {
  let best = null, bd = 1e9;
  for (const [code, a, b] of JMA_OFFICES) { const d = km(lat, lng, a, b); if (d < bd) { bd = d; best = code; } }
  return best;
}

// ─── Japan: AMeDAS (live observations) ─────────────────────────────────────────
const deg = v => (Array.isArray(v) ? v[0] + v[1] / 60 : Number(v));
const val = v => (Array.isArray(v) && v[0] != null && (v[1] === 0 || v[1] == null) ? v[0] : null); // [value, quality flag 0 = normal]
async function amedasTable() { return cached("amedasTable", 24 * 3600e3, () => safe(get(`${JMA}/amedas/const/amedastable.json`))); }
async function amedasLatest() {
  return cached("amedasLatest", 5 * 60e3, async () => {
    const t = await safe(get(`${JMA}/amedas/data/latest_time.txt`, { json: false }));
    if (!t) return null;
    const stamp = t.trim().slice(0, 19).replace(/[-T:]/g, ""); // 2026-10-12T14:40:00+09:00 → 20261012144000
    const data = await safe(get(`${JMA}/amedas/data/map/${stamp}.json`));
    return data ? { time: t.trim(), data } : null;
  });
}
// Nearest station that reports `field` (e.g. "temp", "precipitation24h").
export async function amedasNearest(lat, lng, field = "temp", maxKm = 40) {
  const [table, latest] = await Promise.all([amedasTable(), amedasLatest()]);
  if (!table || !latest) return null;
  let best = null;
  for (const [id, st] of Object.entries(table)) {
    const obs = latest.data[id];
    if (!obs || val(obs[field]) == null) continue;
    const d = km(lat, lng, deg(st.lat), deg(st.lon));
    if (d <= maxKm && (!best || d < best.km)) best = { id, km: d, st, obs };
  }
  if (!best) return null;
  const o = best.obs;
  return {
    station: best.st.kjName, stationEn: best.st.enName, km: Math.round(best.km), time: latest.time,
    temp: val(o.temp), humidity: val(o.humidity), windMs: val(o.wind), windDir16: val(o.windDirection), // 1 = NNE … 16 = N, 0 = calm
    precip1h: val(o.precipitation1h), precip24h: val(o.precipitation24h),
  };
}

// ─── Japan: area + weekly forecast ────────────────────────────────────────────
export async function jmaForecast(office) {
  const f = await cached(`fc:${office}`, 30 * 60e3, () => safe(get(`${JMA}/forecast/data/forecast/${office}.json`)));
  if (!Array.isArray(f) || !f[0]) return null;
  const short = f[0].timeSeries || [];
  const wx = short[0]?.areas?.[0], popsTS = short[1], tempsTS = short[2];
  const today = {
    area: wx?.area?.name || "", code: wx?.weatherCodes?.[0] || null, text: (wx?.weathers?.[0] || "").replace(/\s+/g, " "),
    wind: (wx?.winds?.[0] || "").replace(/\s+/g, " "),
    pops: (popsTS?.timeDefines || []).map((t, i) => ({ time: t, pop: Number(popsTS.areas?.[0]?.pops?.[i]) })).filter(p => !Number.isNaN(p.pop)),
    temps: (tempsTS?.timeDefines || []).map((t, i) => ({ time: t, temp: Number(tempsTS.areas?.[0]?.temps?.[i]) })).filter(p => !Number.isNaN(p.temp)),
  };
  const wk = f[1]?.timeSeries || [];
  const wDays = wk[0]?.timeDefines || [], wA = wk[0]?.areas?.[0] || {}, tA = wk[1]?.areas?.[0] || {};
  const week = wDays.map((t, i) => ({
    date: String(t).slice(0, 10), code: wA.weatherCodes?.[i] || null,
    pop: wA.pops?.[i] === "" || wA.pops?.[i] == null ? null : Number(wA.pops[i]),
    max: tA.tempsMax?.[i] === "" || tA.tempsMax?.[i] == null ? null : Number(tA.tempsMax[i]),
    min: tA.tempsMin?.[i] === "" || tA.tempsMin?.[i] == null ? null : Number(tA.tempsMin[i]),
  }));
  return { office, reportTime: f[0].reportDatetime, today, week };
}

// ─── Japan: warnings ──────────────────────────────────────────────────────────
const WARN = {
  "02": "暴風雪警報", "03": "大雨警報", "04": "洪水警報", "05": "暴風警報", "06": "大雪警報", "07": "波浪警報", "08": "高潮警報",
  "10": "大雨注意報", "12": "大雪注意報", "13": "風雪注意報", "14": "雷注意報", "15": "強風注意報", "16": "波浪注意報", "17": "融雪注意報",
  "18": "洪水注意報", "19": "高潮注意報", "20": "濃霧注意報", "21": "乾燥注意報", "22": "なだれ注意報", "23": "低温注意報", "24": "霜注意報",
  "25": "着氷注意報", "26": "着雪注意報", "32": "暴風雪特別警報", "33": "大雨特別警報", "35": "暴風特別警報", "36": "大雪特別警報", "37": "波浪特別警報", "38": "高潮特別警報",
};
const WARN_EN = { "大雨": "Heavy rain", "洪水": "Flood", "暴風": "Storm", "強風": "Strong wind", "波浪": "High waves", "高潮": "Storm surge", "雷": "Thunder", "大雪": "Heavy snow", "濃霧": "Dense fog" };
export const RIVER_WARNINGS = new Set(["03", "04", "10", "18", "33"]);
export async function jmaWarnings(office) {
  const w = await cached(`warn:${office}`, 5 * 60e3, () => safe(get(`${JMA}/warning/data/warning/${office}.json`)));
  if (!w?.areaTypes) return null;
  const active = new Map(); // code → Set(area names)
  for (const at of w.areaTypes.slice(0, 1)) for (const a of at.areas || []) for (const x of a.warnings || []) {
    if (!x.code || !WARN[x.code] || /解除|なし/.test(x.status || "")) continue;
    if (!active.has(x.code)) active.set(x.code, new Set());
    active.get(x.code).add(a.code);
  }
  const list = [...active.keys()].sort((a, b) => (b >= "30") - (a >= "30") || (a < "10") - (b < "10") || a.localeCompare(b)).map(code => {
    const ja = WARN[code];
    const kind = Object.keys(WARN_EN).find(k => ja.startsWith(k));
    const level = ja.includes("特別警報") ? "emergency" : ja.includes("警報") ? "warning" : "advisory";
    return { code, ja, en: `${WARN_EN[kind] || ja} ${level === "emergency" ? "emergency warning" : level}`, level, river: RIVER_WARNINGS.has(code) };
  });
  return { reportTime: w.reportDatetime, headline: w.headlineText || "", list };
}

// ─── Japan: tide tables (潮位表), Kyushu + Yamaguchi stations ────────────────────
// Codes from JMA's tide table pages (s_kyushun.php / s_kyushus.php); coordinates are the ports'.
export const JMA_TIDE_STATIONS = [
  ["QA", "徳山", 34.04, 131.8], ["HS", "本渡瀬戸", 32.46, 130.2], ["X2", "平戸瀬戸", 33.36, 129.58], ["J9", "三田尻", 34.04, 131.58], ["MS", "三角", 32.62, 130.45],
  ["ZL", "仮屋", 33.47, 129.85], ["WH", "宇部", 33.93, 131.25], ["KU", "熊本", 32.76, 130.56], ["KA", "唐津", 33.47, 129.97], ["O3", "苅田", 33.78, 130.99],
  ["O6", "大牟田", 33.02, 130.41], ["QF", "博多", 33.62, 130.4], ["BP", "別府", 33.28, 131.5], ["OU", "大浦", 33.0, 130.22], ["X3", "郷ノ浦", 33.75, 129.69],
  ["QC", "大分", 33.27, 131.68], ["KT", "口之津", 32.61, 130.19], ["QE", "厳原", 34.2, 129.29], ["X5", "佐伯", 32.96, 131.94], ["NS", "長崎", 32.74, 129.87],
  ["O1", "対馬", 34.37, 129.33], ["O7", "水俣", 32.2, 130.37], ["KO", "皇后", 33.9, 130.8], ["N5", "対馬比田勝", 34.65, 129.48], ["O5", "八代", 32.52, 130.56],
  ["FE", "福江", 32.7, 128.85], ["K5", "萩", 34.43, 131.4], ["RH", "苓北", 32.47, 130.03], ["QD", "佐世保", 33.16, 129.72], ["ZK", "須佐", 34.63, 131.6],
  ["Z6", "細島", 32.43, 131.68], ["QG", "大泊", 31.02, 130.69], ["QH", "西之表", 30.73, 130.99], ["MG", "宮崎", 31.9, 131.45], ["KG", "鹿児島", 31.6, 130.57],
  ["TJ", "種子島", 30.47, 130.97], ["AB", "油津", 31.58, 131.41], ["MK", "枕崎", 31.27, 130.3], ["X6", "志布志", 31.47, 131.11], ["ZJ", "阿久根", 32.02, 130.19],
];
// One line per day: 24 × 3-char hourly heights (cm), YYMMDD, station code, 4 highs + 4 lows of
// (hhmm + 3-char cm); "9999"/"999" = none.
export function parseJmaTideLine(line) {
  if (!line || line.length < 136) return null;
  const n = s => (s.trim() === "" ? null : Number(s));
  const hourly = Array.from({ length: 24 }, (_, h) => n(line.slice(h * 3, h * 3 + 3)));
  const yy = n(line.slice(72, 74)), mm = n(line.slice(74, 76)), dd = n(line.slice(76, 78));
  const ev = (start, type) => Array.from({ length: 4 }, (_, k) => {
    const t = line.slice(start + k * 7, start + k * 7 + 4).trim(), h = line.slice(start + k * 7 + 4, start + k * 7 + 7).trim();
    if (!t || t === "9999") return null;
    const tt = t.padStart(4, "0");
    return { time: `${tt.slice(0, 2)}:${tt.slice(2)}`, type, cm: n(h) };
  }).filter(Boolean);
  return { date: `20${String(yy).padStart(2, "0")}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`, station: line.slice(78, 80), hourly, events: [...ev(80, "high"), ...ev(108, "low")].sort((a, b) => a.time.localeCompare(b.time)) };
}
async function jmaTideYear(code, year) {
  return cached(`tide:${code}:${year}`, 12 * 3600e3, async () => {
    for (const base of ["https://www.data.jma.go.jp/kaiyou/data/db/tide/suisan/txt", "https://www.data.jma.go.jp/gmd/kaiyou/data/db/tide/suisan/txt"]) {
      const t = await safe(get(`${base}/${year}/${code}.txt`, { json: false }));
      if (t && t.length > 1000) return t;
    }
    return null;
  });
}

// ─── US / Puerto Rico: NOAA tides ─────────────────────────────────────────────
async function noaaStations() {
  return cached("noaaStations", 7 * 24 * 3600e3, async () => {
    const d = await safe(get("https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions"));
    return d?.stations?.map(s => ({ id: s.id, name: s.name, lat: Number(s.lat), lng: Number(s.lng) })) || null;
  });
}

// Today's (and tomorrow's) highs/lows near lat/lng. dateISO = local date "YYYY-MM-DD".
export async function getTides(lat, lng, dateISO) {
  if (inJapan(lat, lng)) {
    let best = null;
    for (const [code, name, a, b] of JMA_TIDE_STATIONS) { const d = km(lat, lng, a, b); if (d <= 60 && (!best || d < best.km)) best = { code, name, km: d }; }
    if (!best) return null;
    const txt = await jmaTideYear(best.code, dateISO.slice(0, 4));
    if (!txt) return null;
    const days = txt.split(/\r?\n/).map(parseJmaTideLine).filter(Boolean);
    const i = days.findIndex(d => d.date === dateISO);
    if (i < 0) return null;
    const pick = d => d && { date: d.date, events: d.events.map(e => ({ time: e.time, type: e.type, height: e.cm != null ? (e.cm / 100).toFixed(2) : null })), hourly: d.hourly };
    return { source: "jma", station: best.name, stationCode: best.code, km: Math.round(best.km), datum: "潮位表基準面", today: pick(days[i]), tomorrow: pick(days[i + 1]) };
  }
  const st = await noaaStations();
  if (!st) return null;
  let best = null;
  for (const s of st) { const d = km(lat, lng, s.lat, s.lng); if (d <= 60 && (!best || d < best.km)) best = { ...s, km: d }; }
  if (!best) return null;
  const ymd = dateISO.replace(/-/g, "");
  const d = await safe(get(`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=castwise&begin_date=${ymd}&range=48&datum=MLLW&station=${best.id}&time_zone=lst_ldt&units=metric&interval=hilo&format=json`));
  const preds = d?.predictions;
  if (!Array.isArray(preds)) return null;
  const byDay = {};
  for (const p of preds) {
    const [day, time] = String(p.t).split(" ");
    (byDay[day] ||= []).push({ time, type: p.type === "H" ? "high" : "low", height: Number(p.v).toFixed(2) });
  }
  const days = Object.keys(byDay).sort();
  return { source: "noaa", station: best.name, stationCode: best.id, km: Math.round(best.km), datum: "MLLW", today: { date: days[0], events: byDay[days[0]] || [] }, tomorrow: days[1] ? { date: days[1], events: byDay[days[1]] } : null };
}

// Tide stage at a local time "HH:MM" from that day's high/low events.
export function stageAt(events, hhmm) {
  if (!events?.length) return null;
  const m = t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const now = m(hhmm);
  const near = events.find(e => Math.abs(m(e.time) - now) <= 45);
  if (near) return near.type; // "high" | "low"
  const prev = [...events].reverse().find(e => m(e.time) < now), next = events.find(e => m(e.time) > now);
  if (prev) return prev.type === "low" ? "rising" : "falling";
  if (next) return next.type === "high" ? "rising" : "falling";
  return null;
}

// ─── Weather (normalized for the app) ─────────────────────────────────────────
// → { source, credit, station, current:{temp,humidity,windMs,windDeg,precip1h,precip24h,wmo,textJa,textEn},
//     blocks:[{label, wmo, pop, temp}], week:[{date,wmo,max,min,pop}] }
export async function getWeather(lat, lng) {
  if (inJapan(lat, lng)) {
    const office = jmaOffice(lat, lng);
    const [obs, fc] = await Promise.all([amedasNearest(lat, lng, "temp"), jmaForecast(office)]);
    if (!obs && !fc) return null;
    const wmo = wmoFromText(fc?.today?.text) ?? wmoFromJmaCode(fc?.today?.code);
    const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    const blocks = (fc?.today?.pops || []).filter(p => String(p.time).slice(0, 10) === today).map(p => ({ label: `${Number(String(p.time).slice(11, 13))}時〜`, labelEn: `${Number(String(p.time).slice(11, 13))}:00–`, wmo: p.pop >= 50 ? Math.max(wmo ?? 61, 61) : wmo, pop: p.pop, temp: null }));
    return {
      source: "jma", credit: CREDIT.jma, station: obs ? `${obs.station}（アメダス）` : null, area: fc?.today?.area || null,
      current: obs ? { temp: obs.temp, humidity: obs.humidity, windMs: obs.windMs, windDeg: obs.windDir16 ? obs.windDir16 * 22.5 % 360 : null, precip1h: obs.precip1h, precip24h: obs.precip24h, wmo, textJa: fc?.today?.text || null, textEn: null, time: obs.time } : { wmo, textJa: fc?.today?.text || null },
      blocks,
      week: (fc?.week || []).map(d => ({ date: d.date, wmo: wmoFromJmaCode(d.code), max: d.max, min: d.min, pop: d.pop })),
    };
  }
  // US / Puerto Rico via api.weather.gov
  const pt = await cached(`nwsPt:${lat.toFixed(2)},${lng.toFixed(2)}`, 24 * 3600e3, () => safe(get(`https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`)));
  const P = pt?.properties;
  if (!P) return null;
  const [hourly, daily, stations] = await Promise.all([
    safe(get(`${P.forecastHourly}?units=si`)), safe(get(`${P.forecast}?units=si`)), safe(get(P.observationStations)),
  ]);
  const stId = stations?.features?.[0]?.properties?.stationIdentifier;
  const obs = stId ? (await safe(get(`https://api.weather.gov/stations/${stId}/observations/latest`)))?.properties : null;
  const kmh = v => (v == null ? null : v / 3.6);
  const hp = hourly?.properties?.periods || [];
  const blocks = hp.filter((_, i) => i % 2 === 0).slice(0, 8).map(p => ({ label: `${new Date(p.startTime).toLocaleString("en-US", { hour: "numeric", timeZone: P.timeZone })}`, labelEn: null, wmo: wmoFromText(p.shortForecast), pop: p.probabilityOfPrecipitation?.value ?? null, temp: p.temperature }));
  const dp = daily?.properties?.periods || [];
  const week = [];
  for (const p of dp) {
    const date = String(p.startTime).slice(0, 10);
    let d = week.find(x => x.date === date);
    if (!d) { d = { date, wmo: null, max: null, min: null, pop: null }; week.push(d); }
    if (p.isDaytime) { d.max = p.temperature; d.wmo = wmoFromText(p.shortForecast); } else d.min = p.temperature;
    const pop = p.probabilityOfPrecipitation?.value;
    if (pop != null) d.pop = Math.max(d.pop ?? 0, pop);
  }
  const textEn = obs?.textDescription || hp[0]?.shortForecast || null;
  return {
    source: "nws", credit: CREDIT.us, station: obs ? stId : null, area: P.relativeLocation?.properties?.city || null,
    current: {
      temp: obs?.temperature?.value ?? hp[0]?.temperature ?? null, humidity: obs?.relativeHumidity?.value != null ? Math.round(obs.relativeHumidity.value) : null,
      windMs: kmh(obs?.windSpeed?.value), windDeg: obs?.windDirection?.value ?? null, precip1h: obs?.precipitationLastHour?.value ?? null, precip24h: null,
      wmo: wmoFromText(textEn), textJa: null, textEn, time: obs?.timestamp || null,
    },
    blocks, week: week.slice(0, 7),
  };
}

// ─── Rivers ───────────────────────────────────────────────────────────────────
// Japan: no free live river-flow feed, so we report what JMA does publish — the prefecture's
// rain/flood warnings and the 24 h rainfall at the nearest AMeDAS gauge — and derive a simple
// "likely high water" status from them. Puerto Rico: real USGS stream gauges.
export async function getRiver(lat, lng) {
  if (inJapan(lat, lng)) {
    const office = jmaOffice(lat, lng);
    const [warn, rain] = await Promise.all([jmaWarnings(office), amedasNearest(lat, lng, "precipitation24h", 25)]);
    const riverWarn = (warn?.list || []).filter(w => w.river);
    const r24 = rain?.precip24h ?? null;
    let status = "unknown";
    if (riverWarn.some(w => w.level !== "advisory")) status = "danger";
    else if (riverWarn.length || (r24 != null && r24 >= 50)) status = "high";
    else if (r24 != null && r24 >= 15) status = "rising";
    else if (r24 != null) status = "normal";
    return { source: "jma", credit: CREDIT.jma, status, rain24h: r24, rainStation: rain?.station || null, warnings: warn?.list || [], gauge: null };
  }
  // USGS instantaneous values, nearest gauge within ~15 km
  const b = 0.14;
  const d = await safe(get(`https://waterservices.usgs.gov/nwis/iv/?format=json&bBox=${(lng - b).toFixed(3)},${(lat - b).toFixed(3)},${(lng + b).toFixed(3)},${(lat + b).toFixed(3)}&parameterCd=00060,00065&siteStatus=active&period=PT24H`));
  const series = d?.value?.timeSeries || [];
  const sites = {};
  for (const s of series) {
    const code = s.sourceInfo?.siteCode?.[0]?.value, g = s.sourceInfo?.geoLocation?.geogLocation;
    if (!code || !g) continue;
    const vals = (s.values?.[0]?.value || []).map(v => ({ t: v.dateTime, v: Number(v.value) })).filter(v => v.v > -999990);
    if (!vals.length) continue;
    const site = (sites[code] ||= { code, name: s.sourceInfo.siteName, km: km(lat, lng, g.latitude, g.longitude) });
    const param = s.variable?.variableCode?.[0]?.value;
    const last = vals.at(-1), first = vals[0];
    if (param === "00060") site.flow = { m3s: +(last.v * 0.0283168).toFixed(2), trend: last.v > first.v * 1.15 ? "up" : last.v < first.v * 0.87 ? "down" : "steady", time: last.t };
    if (param === "00065") site.stage = { m: +(last.v * 0.3048).toFixed(2), time: last.t };
  }
  const gauge = Object.values(sites).filter(s => s.flow || s.stage).sort((a, b) => a.km - b.km)[0] || null;
  const alerts = await safe(get(`https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lng.toFixed(4)}`));
  const warnings = (alerts?.features || []).map(f => f.properties).filter(Boolean).map(p => ({ code: p.event, ja: p.event, en: p.event, level: /Warning/.test(p.event) ? "warning" : /Watch/.test(p.event) ? "watch" : "advisory", river: /Flood|Rain/i.test(p.event) }));
  let status = gauge?.flow ? (gauge.flow.trend === "up" ? "rising" : "normal") : "unknown";
  if (warnings.some(w => w.river && w.level === "warning")) status = "danger";
  else if (warnings.some(w => w.river)) status = "high";
  return { source: "usgs", credit: CREDIT.us, status, rain24h: null, rainStation: null, warnings, gauge: gauge && { ...gauge, km: Math.round(gauge.km) } };
}
