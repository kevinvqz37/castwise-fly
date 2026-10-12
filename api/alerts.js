// Bite alerts (Web Push) — subscription management.
//   GET                                   → { publicKey, enabled }
//   POST { subscription, spots, lang }    → save / update (free: 1 spot, PRO: up to 10)
//   POST { action: "test", subscription } → send a test notification now
//   POST { action: "unsubscribe", endpoint }
// The daily job that actually sends the alerts is api/cron-alerts.js.
// Env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, FIREBASE_SERVICE_ACCOUNT
import crypto from "node:crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { vapidKeys, sendPush } from "./_lib/webpush.js";
import { inJapan } from "./_lib/gov.js";

export const FREE_SPOTS = 1, PRO_SPOTS = 10;
const KINDS = new Set(["salt", "fresh", "river"]);

function admin() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null;
  if (!getApps().length) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  return { auth: getAuth(), db: getFirestore() };
}
const docId = endpoint => crypto.createHash("sha256").update(endpoint).digest("hex").slice(0, 40);
// Only the browsers' real push services — so nobody can make our server POST to their own URL.
const PUSH_HOSTS = /^(fcm\.googleapis\.com|android\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9-]+\.push\.apple\.com|web\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)$/i;
const pushHost = u => { try { const x = new URL(u); return x.protocol === "https:" && PUSH_HOSTS.test(x.hostname); } catch { return false; } };
const validSub = s => s && typeof s.endpoint === "string" && s.endpoint.length < 1000 && pushHost(s.endpoint)
  && typeof s.keys?.p256dh === "string" && s.keys.p256dh.length < 200 && typeof s.keys?.auth === "string" && s.keys.auth.length < 100;

// 20 requests / 10 min per IP (Upstash, same as /api/claude). Fails open if Redis is down.
let limiter = null;
async function limited(req) {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) return false;
    if (!limiter) {
      const [{ Ratelimit }, { Redis }] = await Promise.all([import("@upstash/ratelimit"), import("@upstash/redis")]);
      limiter = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(20, "600 s"), prefix: "rl:alerts" });
    }
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
    return !(await limiter.limit(ip)).success;
  } catch { return false; }
}

async function proUid(fb, req) {
  const token = String(req.headers.authorization || "").replace(/^Bearer /, "");
  if (!token) return { uid: null, pro: false };
  try {
    const { uid } = await fb.auth.verifyIdToken(token);
    const p = await fb.db.collection("pros").doc(uid).get();
    return { uid, pro: p.exists };
  } catch { return { uid: null, pro: false }; }
}

export default async function handler(req, res) {
  const keys = vapidKeys();
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "public, s-maxage=3600");
    return res.status(200).json({ publicKey: keys?.publicKey || null, enabled: !!keys, freeSpots: FREE_SPOTS, proSpots: PRO_SPOTS });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const fb = admin();
  if (!keys || !fb) return res.status(503).json({ error: "Alerts are not configured yet" });

  if (await limited(req)) return res.status(429).json({ error: "Too many requests" });
  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {}; } catch { return res.status(400).json({ error: "bad json" }); }
  const col = fb.db.collection("pushSubs");

  if (body.action === "unsubscribe") {
    if (typeof body.endpoint !== "string") return res.status(400).json({ error: "endpoint required" });
    await col.doc(docId(body.endpoint)).delete().catch(() => {});
    return res.status(200).json({ ok: true });
  }

  if (!validSub(body.subscription)) return res.status(400).json({ error: "bad subscription" });
  const sub = { endpoint: body.subscription.endpoint, keys: { p256dh: body.subscription.keys.p256dh, auth: body.subscription.keys.auth } };
  const lang = ["ja", "en", "es"].includes(body.lang) ? body.lang : "en";

  if (body.action === "test") {
    const r = await sendPush(sub, {
      title: lang === "ja" ? "🎣 通知テスト" : lang === "es" ? "🎣 Alerta de prueba" : "🎣 Test alert",
      body: lang === "ja" ? "釣れる日の朝にこんな感じで届きます。" : lang === "es" ? "Así llegarán las alertas en los días buenos." : "This is how bite alerts will arrive on good mornings.",
      url: "/", tag: "test",
    }, { ttl: 600 }).catch(e => ({ ok: false, status: 0, error: e.message }));
    return res.status(r.ok ? 200 : 502).json(r);
  }

  const { uid, pro } = await proUid(fb, req);
  const limit = pro ? PRO_SPOTS : FREE_SPOTS;
  const spots = (Array.isArray(body.spots) ? body.spots : [])
    .map(s => ({ id: String(s.id ?? "").slice(0, 40), name: String(s.name || "").slice(0, 60), lat: Number(s.lat), lng: Number(s.lng), kind: KINDS.has(s.kind) ? s.kind : "salt" }))
    .filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lng) && Math.abs(s.lat) <= 90 && Math.abs(s.lng) <= 180)
    .slice(0, limit);
  if (!spots.length) return res.status(400).json({ error: "pick at least one spot" });

  const region = inJapan(spots[0].lat, spots[0].lng) ? "jp" : "pr";
  const ref = col.doc(docId(sub.endpoint));
  const prev = await ref.get();
  await ref.set({
    sub, spots, lang, region, uid, pro,
    minScore: Math.min(95, Math.max(60, Number(body.minScore) || 80)),
    updated: Date.now(), created: prev.exists ? prev.data().created || Date.now() : Date.now(),
  });
  return res.status(200).json({ ok: true, saved: spots.length, limit, pro });
}
