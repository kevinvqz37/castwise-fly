// Service Worker — 釣りナビ PRO offline support
const CACHE = "castwise-v1";
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
  const url = new URL(e.request.url);

  // Always go to network for API calls, Firestore, Firebase Storage
  if (url.hostname.includes("firestore") ||
      url.hostname.includes("storage.googleapis") ||
      url.hostname.includes("anthropic") ||
      url.hostname.includes("open-meteo") ||
      url.hostname.includes("nominatim") ||
      url.hostname.includes("openstreetmap") ||
      url.pathname.startsWith("/api/")) {
    return;
  }

  // Cache-first for app shell (HTML, CSS, JS)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && e.request.method === "GET") {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match("/index.html"));
    })
  );
});