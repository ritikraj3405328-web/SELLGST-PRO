/**
 * SellGST Pro — 0.1s Instant Stale-While-Revalidate Service Worker
 * Compatible with GitHub Pages (/SELLGST-PRO/), Cloudflare Pages & Vercel
 * File: /sw.js
 */

const CACHE_NAME = "sellgst-pro-v2.0.0";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./app.html",
  "./invoice.html",
  "./ecom-audit.html",
  "./gst-filing.html",
  "./admin.html",
  "./manifest.json",
  "./assets/js/security-core.js",
  "./assets/js/i18n.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  // Bypass cache for API or Firebase real-time requests
  if (
    url.pathname.includes("/api/") ||
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("identitytoolkit.googleapis.com")
  ) {
    return;
  }

  // 0.1s Instant Stale-While-Revalidate Strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && url.protocol.startsWith("http")) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
