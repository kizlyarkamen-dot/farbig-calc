// Офлайн-режим: файлы сайта, шрифты и библиотека Excel кладутся в кэш.
// При изменении файлов сайта увеличьте номер версии, чтобы телефоны получили обновление.
const VERSION = "farbig-v3";
const FILES = [
  "./", "manifest.webmanifest", "privacy.html", "help/",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
];
// Чужие адреса, которые можно брать из кэша без сети (шрифты и библиотека)
const CACHE_HOSTS = ["cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Сначала сеть (чтобы видеть свежую версию), без сети — из кэша.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin !== location.origin && !CACHE_HOSTS.includes(url.hostname)) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); } return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: url.origin === location.origin }))
  );
});
