/**
 * SellGST Pro — Cloudflare Pages 0.1s Instant Cache-Healing Service Worker
 * Fixes stuck JS cache and Chrome ERR_FAILED redirects on sellgst-pro.pages.dev
 * File: /sw.js
 */

const CACHE_NAME = "sellgst-pro-clean-v7.2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Purge ALL old caches on sellgst-pro.pages.dev immediately
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Never intercept HTML or JS module requests on Cloudflare Pages so Edge serves fresh files in 0.1s
  if (
    event.request.mode === "navigate" ||
    event.request.destination === "document" ||
    event.request.destination === "script" ||
    event.request.url.endsWith(".html") ||
    event.request.url.includes("/assets/js/")
  ) {
    return;
  }
});
