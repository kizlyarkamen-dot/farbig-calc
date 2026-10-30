// РћС„Р»Р°Р№РЅ-СЂРµР¶РёРј: С„Р°Р№Р»С‹ СЃР°Р№С‚Р°, С€СЂРёС„С‚С‹ Рё Р±РёР±Р»РёРѕС‚РµРєР° Excel РєР»Р°РґСѓС‚СЃСЏ РІ РєСЌС€.
// РџСЂРё РёР·РјРµРЅРµРЅРёРё С„Р°Р№Р»РѕРІ СЃР°Р№С‚Р° СѓРІРµР»РёС‡СЊС‚Рµ РЅРѕРјРµСЂ РІРµСЂСЃРёРё, С‡С‚РѕР±С‹ С‚РµР»РµС„РѕРЅС‹ РїРѕР»СѓС‡РёР»Рё РѕР±РЅРѕРІР»РµРЅРёРµ.
const VERSION = "farbig-v3";
const FILES = [
  "./", "manifest.webmanifest", "privacy.html", "help/",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
];
// Р§СѓР¶РёРµ Р°РґСЂРµСЃР°, РєРѕС‚РѕСЂС‹Рµ РјРѕР¶РЅРѕ Р±СЂР°С‚СЊ РёР· РєСЌС€Р° Р±РµР· СЃРµС‚Рё (С€СЂРёС„С‚С‹ Рё Р±РёР±Р»РёРѕС‚РµРєР°)
const CACHE_HOSTS = ["cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// РЎРЅР°С‡Р°Р»Р° СЃРµС‚СЊ (С‡С‚РѕР±С‹ РІРёРґРµС‚СЊ СЃРІРµР¶СѓСЋ РІРµСЂСЃРёСЋ), Р±РµР· СЃРµС‚Рё вЂ” РёР· РєСЌС€Р°.
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
