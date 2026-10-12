// Daily bite-alert job. Runs from Vercel Cron (vercel.json) once per region each morning:
//   /api/cron-alerts?region=jp  → ~05:00–06:00 JST     /api/cron-alerts?region=pr → ~05:00–06:00 AST
// For each subscription: scores the chosen spots for today's morning/evening windows from the
// official data (JMA / NOAA / NWS / USGS) and pushes one notification if a spot reaches the
// subscriber's threshold — or a safety notice if a flood/storm warning is in effect there.
// Env: CRON_SECRET (Vercel sends it as "Authorization: Bearer <CRON_SECRET>"), VAPID_*, FIREBASE_SERVICE_ACCOUNT
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { sendPush, vapidKeys } from "./_lib/webpush.js";
import { getWeather, getTides, getRiver, CREDIT } from "./_lib/gov.js";
import { scoreSpot, safetyOf } from "./_lib/score.js";

export const maxDuration = 60;

const T = (lang, ja, en, es) => (lang === "ja" ? ja : lang === "es" ? (es || en) : en);

// One fetch per ~1 km cell per run, shared by every subscriber.
function makeLoader(offsetH) {
  const memo = new Map();
  const date = new Date(Date.now() + offsetH * 3600e3).toISOString().slice(0, 10);
  return (spot) => {
    const lat = +spot.lat.toFixed(2), lng = +spot.lng.toFixed(2), k = `${lat},${lng},${spot.kind}`;
    if (!memo.has(k)) memo.set(k, (async () => {
      const [weather, tides, river] = await Promise.all([
        getWeather(lat, lng),
        spot.kind === "salt" ? getTides(lat, lng, date) : null,
        getRiver(lat, lng),
      ]);
      return { weather, tides, river };
    })().catch(() => ({})));
    return memo.get(k);
  };
}

export function buildMessage(sub, results) {
  const lang = sub.lang || "en";
  const danger = results.filter(r => r.safety);
  if (danger.length) {
    const r = danger[0];
    const w = r.safety.warnings[0];
    const what = w ? (lang === "ja" ? w.ja : w.en) : T(lang, "増水のおそれ", "High water likely", "Posible crecida");
    return {
      title: T(lang, `⚠ ${r.spot.name}：${what}`, `⚠ ${r.spot.name}: ${what}`, `⚠ ${r.spot.name}: ${what}`),
      body: T(lang, "今日は川・海に近づかないでください。最新の情報を確認してから出かけましょう。", "Stay away from the water today. Check the latest warnings before heading out.", "Hoy mantente lejos del agua. Revisa los avisos antes de salir."),
      url: "/?tab=Weather", tag: "safety", urgency: "high",
    };
  }
  const good = results.filter(r => r.score && r.score.score >= (sub.minScore || 80)).sort((a, b) => b.score.score - a.score.score);
  if (!good.length) return null;
  // Don't nag: after a bite alert, the next one within ~2 days needs an exceptional score.
  if (sub.lastBite && Date.now() - sub.lastBite < 44 * 3600e3 && good[0].score.score < 92) return null;
  const top = good[0], s = top.score, w = s.best;
  const bits = [];
  if (w.tide) bits.push(T(lang, `${w.tide.type === "high" ? "満潮" : "干潮"} ${w.tide.time}`, `${w.tide.type === "high" ? "High" : "Low"} tide ${w.tide.time}`, `${w.tide.type === "high" ? "Pleamar" : "Bajamar"} ${w.tide.time}`));
  for (const n of s.notes.slice(0, 2)) bits.push(lang === "ja" ? n.ja : n.en);
  if (s.temp != null) bits.push(`${s.temp}℃`);
  const more = good.length > 1 ? T(lang, ` ほか${good.length - 1}か所`, ` +${good.length - 1} more`, ` +${good.length - 1} más`) : "";
  return {
    title: T(lang, `🎣 今日は${top.spot.name}が狙い目（${w.ja} ${s.score}点）`, `🎣 ${top.spot.name} looks good today (${w.en} ${s.score})`, `🎣 ${top.spot.name} pinta bien hoy (${w.es} ${s.score})`),
    body: bits.join(" · ") + more,
    url: "/?tab=Map", tag: "bite",
  };
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: "unauthorized" });
  if (!vapidKeys() || !process.env.FIREBASE_SERVICE_ACCOUNT) return res.status(503).json({ error: "not configured" });
  if (!getApps().length) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  const db = getFirestore();

  const region = req.query.region === "pr" ? "pr" : "jp";
  const offsetH = region === "jp" ? 9 : -4;
  const month = new Date(Date.now() + offsetH * 3600e3).getUTCMonth() + 1;
  const load = makeLoader(offsetH);
  const dry = req.query.dry === "1";

  const snap = await db.collection("pushSubs").where("region", "==", region).get();
  const stats = { region, subs: snap.size, sent: 0, safety: 0, quiet: 0, removed: 0, failed: 0 };
  const docs = snap.docs;
  const preview = [];

  // Small worker pool so a few hundred subscribers stay well inside the time limit.
  let i = 0;
  async function worker() {
    while (i < docs.length) {
      const doc = docs[i++], sub = doc.data();
      try {
        const results = await Promise.all((sub.spots || []).map(async spot => {
          const d = await load(spot);
          return { spot, score: d.weather ? scoreSpot({ spot, ...d, month }) : null, safety: safetyOf(d.river, spot.kind) };
        }));
        const msg = buildMessage(sub, results);
        if (!msg) { stats.quiet++; continue; }
        if (dry) { preview.push(msg); continue; }
        const { urgency, ...data } = msg;
        const r = await sendPush(sub.sub, { ...data, credit: sub.region === "jp" ? CREDIT.jma.ja : CREDIT.us.en }, { urgency: urgency || "normal", ttl: 4 * 3600 });
        if (r.gone) { await doc.ref.delete(); stats.removed++; }
        else if (r.ok) { msg.tag === "safety" ? stats.safety++ : stats.sent++; await doc.ref.update({ lastSent: Date.now(), lastTag: msg.tag, ...(msg.tag === "bite" ? { lastBite: Date.now() } : {}) }); }
        else stats.failed++;
      } catch (e) {
        console.warn("cron-alerts:", e?.message);
        stats.failed++;
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));
  return res.status(200).json(dry ? { ...stats, preview: preview.slice(0, 20) } : stats);
}
