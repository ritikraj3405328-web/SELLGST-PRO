/**
 * SellGST Pro — Service Worker (Offline Cache & PWA Asset Sync)
 * File: /sw.js
 */

const CACHE_NAME = "sellgst-pro-v1.2.0";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/app.html",
  "/invoice.html",
  "/ecom-audit.html",
  "/gst-filing.html",
  "/admin.html",
  "/manifest.json",
  "/assets/js/security-core.js",
  "/assets/js/i18n.js"
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
  const url = new URL(event.request.url);

  // Bypass cache for Vercel Serverless AI API proxy requests
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            if (event.request.method === "GET" && url.protocol.http) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
        .catch(() => {
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/app.html");
          }
        });
    })
  );
});
