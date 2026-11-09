// Offline-first shell for Movement Evaluation Studio. Version this key for every release.
const CACHE_NAME = 'movement-evaluation-studio-shell-v30';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest?v=29',
  './icon-192.png?v=29',
  './icon-512.png?v=29',
  './icon-maskable-512.png?v=29',
  './apple-touch-icon.png?v=29',
  './rom-guides-v30.css?v=30',
  './rom-guides-v30.js?v=30',
  './rom-guides/guide-00.png',
  './rom-guides/guide-01.png',
  './rom-guides/guide-02.png',
  './rom-guides/guide-03.png',
  './rom-guides/guide-04.png',
  './rom-guides/guide-05.png',
  './rom-guides/guide-06.png',
  './rom-guides/guide-07.png',
  './rom-guides/guide-08.png',
  './rom-guides/guide-09.png',
  './rom-guides/guide-10.png',
  './rom-guides/guide-11.png',
  './rom-guides/guide-12.png',
  './rom-guides/guide-13.png',
  './rom-guides/guide-14.png',
  './rom-guides/guide-15.png',
  './rom-guides/guide-16.png',
  './rom-guides/guide-17.png',
  './rom-guides/guide-18.png',
  './rom-guides/guide-19.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('movement-evaluation-studio-shell-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;

  // Fetch the current HTML online; fall back to cached HTML when offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
        }
        return response;
      }).catch(async () => (await caches.match('./index.html')) || Response.error())
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
