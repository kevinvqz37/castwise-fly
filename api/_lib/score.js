// Server-side bite score for one spot, for today's morning and evening windows.
// Same ideas as the app's calcSpotScore (time of day, temp, wind, rain, season, moon, tide),
// but built from the official data in gov.js and scored per window instead of "right now".
const MOON_REF = Date.UTC(2024, 0, 11, 11, 57), MOON_CYCLE = 29.530588 * 864e5;
export function moonPhase(t = Date.now()) { return ((((t - MOON_REF) % MOON_CYCLE) + MOON_CYCLE) % MOON_CYCLE) / MOON_CYCLE; }

const WINDOWS = [
  { key: "morning", ja: "朝マズメ", en: "Morning bite", es: "Mañana", from: 5 * 60, to: 8 * 60 + 30, bonus: 10 },
  { key: "evening", ja: "夕マズメ", en: "Evening bite", es: "Tarde", from: 16 * 60 + 30, to: 19 * 60 + 30, bonus: 8 },
];
const mins = t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

// spot: { kind: "salt" | "fresh" | "river" }, month: 1-12 (local), weather/tides/river from gov.js
export function scoreSpot({ spot, weather, tides, river, month, t = Date.now() }) {
  const day = weather?.week?.[0] || {};
  const temps = [day.max, day.min, weather?.current?.temp].filter(v => typeof v === "number");
  const temp = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
  const wind = weather?.current?.windMs ?? null;
  const pop = day.pop ?? null;
  const ph = moonPhase(t);

  // Calibrated so 80+ needs a good-weather day in season PLUS a tide turn, moon or fresh water.
  let base = 35;
  const notes = [];
  if (temp != null) {
    if (temp >= 15 && temp <= 25) base += 10; else if (temp >= 10 && temp <= 30) base += 5; else base -= 10;
  }
  if (wind != null) {
    if (wind < 3) { base += 8; notes.push({ ja: `風 ${wind.toFixed(1)}m/s`, en: `Wind ${wind.toFixed(1)} m/s` }); }
    else if (wind < 6) base += 3;
    else { base -= 15; notes.push({ ja: `強風 ${wind.toFixed(0)}m/s`, en: `Strong wind ${wind.toFixed(0)} m/s` }); }
  }
  if (pop != null) {
    if (pop >= 70) base -= 15; else if (pop >= 40) base -= 5; else if (pop < 20) { base += 5; notes.push({ ja: "晴れ予報", en: "Dry forecast" }); }
  }
  if (spot.kind === "river") {
    if (month >= 6 && month <= 9) base += 10; else if (month >= 3 && month <= 5) base += 7;
  } else if (spot.kind === "salt") {
    if ((month >= 4 && month <= 6) || (month >= 9 && month <= 11)) base += 10;
  } else if (month >= 4 && month <= 10) base += 8;
  if (ph < 0.05 || ph > 0.95) { base += 8; notes.push({ ja: "新月", en: "New moon" }); }
  else if (ph > 0.45 && ph < 0.55) { base += 7; notes.push({ ja: "満月", en: "Full moon" }); }

  // River level: muddy high water fishes badly; rising slightly after light rain can help.
  if (river?.status === "rising" && spot.kind === "river") { base += 6; notes.push({ ja: "雨後の増水気味", en: "Fresh water after rain" }); }
  else if (river?.status === "high") base -= 20;
  else if (river?.status === "danger") base -= 40;

  const events = spot.kind === "salt" ? tides?.today?.events || [] : [];
  const windows = WINDOWS.map(w => {
    let s = base + w.bonus;
    // Tide turning inside the window = moving water around the change.
    const ev = events.find(e => { const m = mins(e.time); return m >= w.from - 30 && m <= w.to + 30; });
    if (ev) s += ev.type === "high" ? 10 : 5;
    return { ...w, score: Math.max(10, Math.min(99, Math.round(s))), tide: ev || null };
  });
  const best = windows.reduce((a, b) => (b.score > a.score ? b : a));
  return { score: best.score, best, windows, notes, temp: temp != null ? Math.round(temp) : null, wind, pop };
}

// Safety: anything that should be pushed regardless of the score (free for everyone).
// River spots: flood / heavy-rain warnings and high water. Sea & lake spots: storm, wave,
// storm-surge and heavy-rain warnings (advisories alone don't trigger a push).
const SEA_CODES = new Set(["03", "05", "07", "08", "33", "35", "37", "38"]);
export function safetyOf(river, kind = "river") {
  if (!river) return null;
  const all = river.warnings || [];
  if (kind === "river") {
    const warn = all.filter(w => w.river);
    if (river.status === "danger" || warn.some(w => w.level !== "advisory")) return { level: "danger", warnings: warn };
    if (river.status === "high") return { level: "high", warnings: warn };
    return null;
  }
  const warn = all.filter(w => /^\d\d$/.test(w.code || "")
    ? w.level !== "advisory" && SEA_CODES.has(w.code)                                         // JMA
    : w.level === "warning" && /Marine|Surf|Rip|Hurricane|Tropical|Storm|Gale|Wind|Flood|Coastal/i.test(w.code || "")); // NWS
  return warn.length ? { level: "danger", warnings: warn } : null;
}
