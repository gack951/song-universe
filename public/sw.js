const CACHE = "song-universe-shell-v11";
const SHELL = ["/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/worklets/spessasynth_processor.min.js"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("song-universe-shell-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;
  if (new URL(event.request.url).pathname.startsWith("/soundfonts/")) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => { if (response.ok) event.waitUntil(caches.open(CACHE).then(cache => cache.put("/", response.clone()))); return response; }).catch(() => caches.match("/").then(response => response ?? Response.error())));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached ?? fetch(event.request).then(response => { if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone())); return response; })));
});
