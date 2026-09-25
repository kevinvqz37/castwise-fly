// Lightweight first-party analytics (Firestore only — no third-party trackers).
// Writes: stats/{YYYY-MM-DD} counters, presence/{sessionId} heartbeat, events/{id} recent feed.
import { doc, setDoc, deleteDoc, increment, serverTimestamp } from "firebase/firestore";

let DB = null, SID = null, REF = "direct", LANG = "ja", beat = null;

const jstDay = (d = new Date()) => new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 10);
const safe = p => p.catch(e => console.warn("analytics:", e?.message));

export function initAnalytics(db, lang = "ja") {
  if (DB) return;
  DB = db; LANG = lang;
  try {
    const q = new URLSearchParams(window.location.search).get("ref");
    if (q) localStorage.setItem("cw_ref", q.slice(0, 24).replace(/[^a-zA-Z0-9_-]/g, ""));
    REF = localStorage.getItem("cw_ref") || (document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "").slice(0, 40) : "direct");
    SID = sessionStorage.getItem("cw_sid");
    if (!SID) {
      SID = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("cw_sid", SID);
      track("visit");                                   // one per browser session
      if (!localStorage.getItem("cw_seen")) { localStorage.setItem("cw_seen", "1"); track("new_user"); }
    }
  } catch { /* private mode */ }
  heartbeat();
  beat = setInterval(heartbeat, 45000);
  window.addEventListener("pagehide", () => { clearInterval(beat); if (DB && SID) safe(deleteDoc(doc(DB, "presence", SID))); });
}

function heartbeat() {
  if (!DB || !SID || document.visibilityState === "hidden") return;
  safe(setDoc(doc(DB, "presence", SID), { lastSeen: Date.now(), ref: REF, lang: LANG, at: serverTimestamp() }));
}

// Counts an event: bumps today's counters and drops a row in the live feed.
export function track(name, extra = {}) {
  if (!DB) return;
  const day = jstDay();
  const payload = { [name]: increment(1), day, updatedAt: serverTimestamp() };
  if (name === "visit") payload[`refs.${REF}`] = increment(1);
  safe(setDoc(doc(DB, "stats", day), payload, { merge: true }));
  safe(setDoc(doc(DB, "events", `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
    { name, ref: REF, lang: LANG, t: Date.now(), ...extra }));
}
