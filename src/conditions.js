// Conditions saved with every catch, and the personal patterns found in them.
//
// Saved for every catch: time of day, moon phase, air temp + weather (from the app's live
// weather). For sea/shore species we also save the tide stage and water temperature from the
// Open-Meteo Marine API (`sea_level_height_msl` = modelled sea level incl. tides, MeteoFrance
// SMOC; `sea_surface_temperature`). The marine model is ~8 km and less accurate right at the
// coast, so it's skipped for freshwater catches where it would be meaningless.

const T = (lang, ja, en, es) => (lang === "ja" ? ja : lang === "es" ? (es || en) : en);

export const TOD = {
  dawn:    { ja: "早朝", en: "Early morning", es: "Madrugada", icon: "🌅" },
  morning: { ja: "朝",   en: "Morning",       es: "Mañana",    icon: "🌤" },
  midday:  { ja: "昼",   en: "Midday",        es: "Mediodía",  icon: "☀️" },
  evening: { ja: "夕方", en: "Evening",       es: "Tarde",     icon: "🌇" },
  night:   { ja: "夜",   en: "Night",         es: "Noche",     icon: "🌙" },
};
export const TIDE = {
  rising:  { ja: "上げ潮",   en: "Rising tide",  es: "Marea subiendo", icon: "🌊⬆" },
  falling: { ja: "下げ潮",   en: "Falling tide", es: "Marea bajando",  icon: "🌊⬇" },
  high:    { ja: "満潮前後", en: "Around high",  es: "Pleamar",        icon: "🌊" },
  low:     { ja: "干潮前後", en: "Around low",   es: "Bajamar",        icon: "🏖" },
};
export const MOON = [
  { ja: "新月", en: "New moon", es: "Luna nueva", icon: "🌑" },
  { ja: "三日月", en: "Waxing crescent", es: "Creciente", icon: "🌒" },
  { ja: "上弦", en: "First quarter", es: "Cuarto creciente", icon: "🌓" },
  { ja: "十三夜", en: "Waxing gibbous", es: "Gibosa creciente", icon: "🌔" },
  { ja: "満月", en: "Full moon", es: "Luna llena", icon: "🌕" },
  { ja: "十六夜", en: "Waning gibbous", es: "Gibosa menguante", icon: "🌖" },
  { ja: "下弦", en: "Last quarter", es: "Cuarto menguante", icon: "🌗" },
  { ja: "有明月", en: "Waning crescent", es: "Menguante", icon: "🌘" },
];

export function todOf(h) {
  if (h >= 4 && h < 7) return "dawn";
  if (h >= 7 && h < 11) return "morning";
  if (h >= 11 && h < 15) return "midday";
  if (h >= 15 && h < 19) return "evening";
  return "night";
}
export function moonIndex(t) {
  const cycle = 29.530588 * 864e5, ref = Date.UTC(2024, 0, 11, 11, 57); // new moon 2024-01-11
  const phase = (((t - ref) % cycle) + cycle) % cycle / cycle;
  return Math.floor(phase * 8 + 0.5) % 8;
}

// Tide stage at hour index i of an hourly sea-level series.
export function tideStage(levels, i) {
  const at = k => levels[k];
  if (at(i) == null || at(i - 1) == null || at(i + 1) == null) return null;
  const win = [-2, -1, 0, 1, 2].map(d => at(i + d)).filter(v => v != null);
  const hi = Math.max(...win), lo = Math.min(...win), range = hi - lo;
  if (range > 0 && at(i) >= hi - range * 0.15 && at(i - 1) <= at(i) && at(i + 1) <= at(i)) return "high";
  if (range > 0 && at(i) <= lo + range * 0.15 && at(i - 1) >= at(i) && at(i + 1) >= at(i)) return "low";
  return at(i + 1) > at(i - 1) ? "rising" : "falling";
}

async function marineAt(lat, lng, t, timeoutMs = 4000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(3)}` +
      `&hourly=sea_level_height_msl,sea_surface_temperature&timezone=GMT&past_days=1&forecast_days=1`;
    const d = await (await fetch(url, { signal: ctrl.signal })).json();
    const times = d?.hourly?.time || [];
    const hourISO = new Date(Math.floor(t / 36e5) * 36e5).toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
    const i = times.findIndex(x => x.slice(0, 13) === hourISO);
    if (i < 0) return {};
    const lv = d.hourly.sea_level_height_msl || [], sst = d.hourly.sea_surface_temperature || [];
    return { tide: tideStage(lv, i), waterTemp: sst[i] != null ? Math.round(sst[i] * 10) / 10 : null };
  } catch {
    return {};
  } finally {
    clearTimeout(timer);
  }
}

// Snapshot taken when a catch is logged. Never throws, never blocks more than ~4 s.
export async function captureConditions({ weather, location, salt, t = Date.now() }) {
  const d = new Date(t);
  const cond = {
    t, hour: d.getHours(), month: d.getMonth() + 1,
    tod: todOf(d.getHours()), moon: moonIndex(t),
    airTemp: weather?.loaded && typeof weather.temp === "number" ? weather.temp : null,
    sky: weather?.loaded ? (weather.conditionIcon || null) : null,
    skyText: weather?.loaded ? (weather.condition?.en || null) : null,
  };
  if (salt && location?.lat != null) Object.assign(cond, await marineAt(location.lat, location.lng, t));
  return cond;
}

// Short chips for a catch card in the log.
export function conditionChips(cond, lang) {
  if (!cond) return [];
  const out = [];
  if (cond.tod && TOD[cond.tod]) out.push(`${TOD[cond.tod].icon} ${T(lang, TOD[cond.tod].ja, TOD[cond.tod].en, TOD[cond.tod].es)}`);
  if (cond.moon != null && MOON[cond.moon]) out.push(`${MOON[cond.moon].icon} ${T(lang, MOON[cond.moon].ja, MOON[cond.moon].en, MOON[cond.moon].es)}`);
  if (cond.tide && TIDE[cond.tide]) out.push(`${TIDE[cond.tide].icon} ${T(lang, TIDE[cond.tide].ja, TIDE[cond.tide].en, TIDE[cond.tide].es)}`);
  if (cond.waterTemp != null) out.push(`🌡 ${T(lang, "水温", "Water", "Agua")} ${cond.waterTemp}℃`);
  if (cond.airTemp != null) out.push(`${cond.sky || "🌡"} ${cond.airTemp}℃`);
  return out;
}

// ─── patterns ────────────────────────────────────────────────────────────────
const MIN = 3; // catches needed before we call something a pattern

function topOf(values) {
  const n = {};
  values.forEach(v => { if (v != null) n[v] = (n[v] || 0) + 1; });
  const [k, c] = Object.entries(n).sort((a, b) => b[1] - a[1])[0] || [];
  return k == null ? null : { key: k, count: c, of: values.filter(v => v != null).length };
}
const moonGroup = i => (i == null ? null : i === 0 || i === 7 || i === 1 ? "new" : i >= 3 && i <= 5 ? "full" : "quarter");
const MOON_GROUP = { new: { ja: "新月まわり", en: "around the new moon", es: "cerca de luna nueva" }, full: { ja: "満月まわり", en: "around the full moon", es: "cerca de luna llena" }, quarter: { ja: "半月まわり", en: "around the half moon", es: "cerca de cuarto" } };

// → [{ title, lines: [string], count }] — overall first, then per species with ≥3 logged catches.
export function findPatterns(catches, matchSpecies, lang) {
  const withCond = catches.filter(c => c.cond);
  const groups = [{ key: "all", title: T(lang, "すべての釣果", "All catches", "Todas las capturas"), list: withCond }];
  const bySpecies = {};
  for (const c of withCond) {
    const f = matchSpecies(c.fish);
    const k = f ? f.id : c.fish;
    (bySpecies[k] ||= { title: f ? (lang === "ja" ? f.name : lang === "es" ? (f.nameEs || f.nameEn) : f.nameEn) : c.fish, list: [] }).list.push(c);
  }
  Object.values(bySpecies).filter(g => g.list.length >= MIN).sort((a, b) => b.list.length - a.list.length).forEach(g => groups.push(g));

  const out = [];
  for (const g of groups) {
    if (g.list.length < MIN) continue;
    const lines = [];
    const tod = topOf(g.list.map(c => c.cond.tod));
    if (tod && tod.count >= 2) lines.push(`${TOD[tod.key].icon} ${T(lang, `${TOD[tod.key].ja}が一番釣れている（${tod.of}匹中${tod.count}匹）`, `${TOD[tod.key].en} is your best time (${tod.count} of ${tod.of})`, `${TOD[tod.key].es} es tu mejor hora (${tod.count} de ${tod.of})`)}`);
    const tides = g.list.map(c => c.cond.tide).filter(Boolean);
    const tide = tides.length >= MIN ? topOf(tides) : null;
    if (tide && tide.count >= 2) lines.push(`${TIDE[tide.key].icon} ${T(lang, `${TIDE[tide.key].ja}に強い（${tide.of}匹中${tide.count}匹）`, `${TIDE[tide.key].en} works best (${tide.count} of ${tide.of})`, `${TIDE[tide.key].es} funciona mejor (${tide.count} de ${tide.of})`)}`);
    const wt = g.list.map(c => c.cond.waterTemp).filter(v => v != null).sort((a, b) => a - b);
    if (wt.length >= MIN) {
      const lo = wt[Math.floor(wt.length * 0.2)], hi = wt[Math.ceil(wt.length * 0.8) - 1];
      lines.push(`🌡 ${T(lang, `水温 ${lo}〜${hi}℃ で釣れている`, `Water ${lo}–${hi}°C`, `Agua ${lo}–${hi}°C`)}`);
    }
    const mg = topOf(g.list.map(c => moonGroup(c.cond.moon)));
    if (mg && mg.count >= 2 && mg.count / mg.of >= 0.5) lines.push(`${mg.key === "full" ? "🌕" : mg.key === "new" ? "🌑" : "🌓"} ${T(lang, `${MOON_GROUP[mg.key].ja}が多い（${mg.of}匹中${mg.count}匹）`, `Mostly ${MOON_GROUP[mg.key].en} (${mg.count} of ${mg.of})`, `Sobre todo ${MOON_GROUP[mg.key].es} (${mg.count} de ${mg.of})`)}`);
    if (lines.length) out.push({ title: g.title, count: g.list.length, lines });
  }
  return out;
}
