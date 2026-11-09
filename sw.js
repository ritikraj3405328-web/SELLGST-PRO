/**
 * SellGST Pro — Cloudflare Pages 308-Redirect Safe Service Worker
 * Fixes Chrome ERR_FAILED ("moved permanently") permanently!
 * File: /sw.js
 */

const CACHE_NAME = "sellgst-pro-clean-v5";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Delete ALL old broken caches that stored redirected HTML responses
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // CRITICAL FIX FOR CLOUDFLARE PAGES:
  // Never intercept HTML page navigation requests (mode === 'navigate').
  // Let Cloudflare's 0.1s global edge handle /index.html, /app.html, /invoice.html redirects natively!
  if (
    event.request.mode === "navigate" ||
    event.request.destination === "document" ||
    event.request.url.endsWith(".html")
  ) {
    return;
  }
});
