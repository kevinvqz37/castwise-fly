// api/stats.js — owner-only dashboard data: live users, daily counters, PRO subscribers, revenue.
// Auth: Firebase ID token of the owner account (OWNER_EMAIL), or ?key=STATS_KEY for cron/email jobs.
import Stripe from "stripe";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const maxDuration = 30;
const OWNERS = (process.env.OWNER_EMAIL || "kevin@shigematsutech.com,kevinvqz@gmail.com").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

function admin() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null;
  if (!getApps().length) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  return { auth: getAuth(), db: getFirestore() };
}
const jstDay = (offsetDays = 0) =>
  new Date(Date.now() + 9 * 3600e3 - offsetDays * 86400e3).toISOString().slice(0, 10);

export default async function handler(req, res) {
  const fb = admin();
  if (!fb) return res.status(500).json({ error: "server not configured" });

  // --- auth ---
  const key = req.query.key;
  if (!(key && process.env.STATS_KEY && key === process.env.STATS_KEY)) {
    const token = (req.headers.authorization || "").replace(/^Bearer /, "");
    if (!token) return res.status(401).json({ error: "login required" });
    try {
      const u = await fb.auth.verifyIdToken(token);
      if (!OWNERS.includes((u.email || "").toLowerCase())) return res.status(403).json({ error: "not the owner" });
    } catch { return res.status(401).json({ error: "bad token" }); }
  }

  const db = fb.db;
  const days = [...Array(14)].map((_, i) => jstDay(i));
  const out = { days: [], today: {}, live: 0, liveRefs: {}, totals: {}, pro: {}, recent: [] };

  // --- daily counters ---
  const snaps = await db.getAll(...days.map(d => db.collection("stats").doc(d)));
  out.days = snaps.map((s, i) => ({ day: days[i], ...(s.exists ? s.data() : {}) }))
    .map(d => ({ day: d.day, visits: d.visit || 0, newUsers: d.new_user || 0, ai: d.ai_use || 0, catches: d.catch_logged || 0, proClicks: d.pro_click || 0, refs: d.refs || {} }))
    .reverse();
  out.today = out.days[out.days.length - 1] || {};

  // --- live right now (heartbeat in the last 5 minutes) ---
  const cut = Date.now() - 5 * 60e3;
  const pres = await db.collection("presence").where("lastSeen", ">", cut).get();
  out.live = pres.size;
  pres.forEach(d => { const r = d.data().ref || "direct"; out.liveRefs[r] = (out.liveRefs[r] || 0) + 1; });

  // --- totals ---
  const [users, pros, catches] = await Promise.all([
    db.collection("users").count().get().catch(() => null),
    db.collection("pros").count().get().catch(() => null),
    db.collection("catches").count().get().catch(() => null),
  ]);
  out.totals = { users: users?.data().count ?? null, pro: pros?.data().count ?? null, catches: catches?.data().count ?? null };

  // --- recent activity feed ---
  const ev = await db.collection("events").orderBy("t", "desc").limit(25).get();
  out.recent = ev.docs.map(d => d.data());

  // --- Stripe subscriptions & revenue ---
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const subs = await stripe.subscriptions.list({ status: "active", limit: 100, expand: ["data.items.data.price"] });
      let mrr = 0;
      subs.data.forEach(su => su.items.data.forEach(it => {
        const amt = it.price.unit_amount || 0;
        mrr += it.price.recurring?.interval === "year" ? amt / 12 : amt;
      }));
      const trials = await stripe.subscriptions.list({ status: "trialing", limit: 100 });
      out.pro = { active: subs.data.length, trialing: trials.data.length, mrrJpy: Math.round(mrr) };
    } catch (e) { out.pro = { error: e.message }; }
  }

  // housekeeping: drop stale presence rows and events older than 7 days
  try {
    const stale = await db.collection("presence").where("lastSeen", "<", Date.now() - 3600e3).limit(200).get();
    const old = await db.collection("events").where("t", "<", Date.now() - 7 * 86400e3).limit(300).get();
    if (stale.size || old.size) {
      const batch = db.batch();
      stale.forEach(x => batch.delete(x.ref));
      old.forEach(x => batch.delete(x.ref));
      await batch.commit();
    }
  } catch (e) { console.warn("cleanup:", e.message); }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(out);
}
