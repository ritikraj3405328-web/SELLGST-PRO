/**
 * SellGST Pro — Cloudflare Pages Force Cache-Healer Service Worker v8.0
 * Automatically overwrites stuck immutable JS cache across all pages on sellgst-pro.pages.dev
 * File: /sw.js
 */

const CACHE_NAME = "sellgst-pro-clean-v8.0";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // CRITICAL FIX FOR CLOUDFLARE PAGES:
  // Force Chrome to bypass its old 1-year "immutable" disk cache for all JS modules & CSS assets
  // so app.html, invoice.html, label-studio.html, qr-studio.html & admin.html always get the latest code!
  if (url.pathname.includes("/assets/js/") || url.pathname.endsWith(".js")) {
    event.respondWith(
      fetch(new Request(event.request.url, { cache: "reload" })).catch(() => fetch(event.request))
    );
    return;
  }
});
