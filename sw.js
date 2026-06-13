/*
  Pokémon Solar Eclipse Wiki — Service Worker
  Strategy: NETWORK-FIRST for app code/data, CACHE-FIRST for sprites/images.

  Network-first for code/data means online users always get the freshest deploy
  immediately; the cache is only a fallback for when the network is unavailable
  (offline). This avoids the "I deployed but it still shows the old version"
  problem. Images never change once added (a new sprite is a new filename), so
  they are served cache-first for instant, offline-friendly loading.

  Bump CACHE_VERSION only if you change this file itself or want to force a hard
  cache reset for every client. Normal content updates do NOT need a bump.
*/

const CACHE_VERSION = 'solar-eclipse-v1';
const APP_CACHE = CACHE_VERSION + '-app';
const IMG_CACHE = CACHE_VERSION + '-img';

// App shell precached on install so the site can boot offline. Sprites are NOT
// listed here — they are cached lazily as requested (there are 900+ of them).
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './fonts.css',
  './wiki/data-dex.js',
  './wiki/data-locations.js',
  './wiki/compat-game.js',
  './wiki/ui.jsx',
  './wiki/view-pokedex.jsx',
  './wiki/view-detail.jsx',
  './wiki/view-bosses.jsx',
  './wiki/view-types.jsx',
  './wiki/view-abilities.jsx',
  './wiki/view-moves.jsx',
  './wiki/view-items.jsx',
  './wiki/view-tms.jsx',
  './wiki/view-team.jsx',
  './wiki/view-damage.jsx',
  './wiki/view-nuzlocke.jsx',
  './wiki/view-locations.jsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then((cache) => Promise.all(
        // add individually so one missing file doesn't fail the whole install
        PRECACHE_URLS.map((url) => cache.add(url).catch(() => {}))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== APP_CACHE && key !== IMG_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // let POSTs (e.g. Supabase) pass through

  const url = new URL(req.url);

  // Never touch cross-origin (React/Babel CDN, Google Fonts, etc.).
  if (url.origin !== self.location.origin) return;

  const isImage =
    req.destination === 'image' ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname);

  if (isImage) {
    // cache-first
    event.respondWith(
      caches.open(IMG_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req)
            .then((resp) => {
              if (resp && resp.ok) cache.put(req, resp.clone());
              return resp;
            })
            .catch(() => cached);
        })
      )
    );
    return;
  }

  // everything else: network-first, fall back to cache
  event.respondWith(
    fetch(req)
      .then((resp) => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(APP_CACHE).then((cache) => cache.put(req, copy));
        }
        return resp;
      })
      .catch(() =>
        caches.match(req).then((cached) => {
          if (cached) return cached;
          if (req.mode === 'navigate') return caches.match('./index.html');
          return undefined;
        })
      )
  );
});
