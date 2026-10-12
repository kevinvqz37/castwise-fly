// Bite alerts on the client: Web Push subscription + the spots the user picked.
// The server side is api/alerts.js (save) and api/cron-alerts.js (daily send).
const LS = "cw_alert_spots";

export const pushSupported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
export const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
export const isStandalone = () => window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true;
// iOS only allows web push for apps added to the Home Screen (iOS 16.4+).
export const needsHomeScreen = () => isIOS() && !isStandalone();

export function savedAlertSpots() {
  try { return JSON.parse(localStorage.getItem(LS) || "null"); } catch { return null; }
}
function remember(v) {
  try { v ? localStorage.setItem(LS, JSON.stringify(v)) : localStorage.removeItem(LS); } catch { /* private mode */ }
}

function keyBytes(b64) {
  const s = (b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}
const sameKey = (a, b) => a && b && a.byteLength === b.byteLength && new Uint8Array(a).every((x, i) => x === b[i]);

async function registration() {
  return (await navigator.serviceWorker.getRegistration()) || navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then(() => navigator.serviceWorker.ready);
}

async function subscription(publicKey) {
  const reg = await registration();
  const want = keyBytes(publicKey);
  let sub = await reg.pushManager.getSubscription();
  if (sub && !sameKey(sub.options?.applicationServerKey, want)) { await sub.unsubscribe().catch(() => {}); sub = null; }
  return sub || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: want });
}

// → { ok, saved, limit, pro } or throws Error("denied" | "unsupported" | "not-configured" | message)
export async function enableAlerts({ spots, lang, headers = {} }) {
  if (!pushSupported()) throw new Error("unsupported");
  if ((await Notification.requestPermission()) !== "granted") throw new Error("denied");
  const cfg = await fetch("/api/alerts").then(r => r.json());
  if (!cfg.enabled || !cfg.publicKey) throw new Error("not-configured");
  const sub = await subscription(cfg.publicKey);
  const r = await fetch("/api/alerts", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify({ subscription: sub.toJSON(), spots, lang }) });
  const out = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(out.error || `HTTP ${r.status}`);
  remember(spots.slice(0, out.limit || spots.length).map(s => s.id));
  return out;
}

export async function sendTestAlert(lang) {
  const reg = await registration();
  const sub = await reg.pushManager.getSubscription();
  if (!sub) throw new Error("not-subscribed");
  const r = await fetch("/api/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "test", subscription: sub.toJSON(), lang }) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
}

export async function disableAlerts() {
  remember(null);
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await fetch("/api/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "unsubscribe", endpoint: sub.endpoint }) }).catch(() => {});
  await sub.unsubscribe().catch(() => {});
}
