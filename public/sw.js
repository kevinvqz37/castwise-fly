// Service Worker — 釣りナビ PRO offline support
// Network-first for pages (so new deploys show up immediately), cache-first for hashed build assets.
const CACHE = "castwise-v2";
const PRECACHE = ["/", "/index.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Pages: network first, fall back to cache when offline
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html")) {
    e.respondWith(
      fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(req, clone));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match("/index.html")))
    );
    return;
  }

  // Hashed build assets, images, fonts: cache first
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res.ok) { const clone = res.clone(); caches.open(CACHE).then(c => c.put(req, clone)); }
      return res;
    }))
  );
});
