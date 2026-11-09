// Offline-first shell for Movement Evaluation Studio. Version this key for every release.
const CACHE_NAME = 'movement-evaluation-studio-shell-v33';
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
  './rom-guides/guide-19.png',
  './joint-actions/exercise-00.jpg',
  './joint-actions/exercise-00.mp4',
  './joint-actions/exercise-01.jpg',
  './joint-actions/exercise-01.mp4',
  './joint-actions/exercise-02.jpg',
  './joint-actions/exercise-02.mp4',
  './joint-actions/exercise-03.jpg',
  './joint-actions/exercise-03.mp4',
  './joint-actions/exercise-04.jpg',
  './joint-actions/exercise-04.mp4',
  './joint-actions/exercise-05.jpg',
  './joint-actions/exercise-05.mp4',
  './joint-actions/exercise-06.jpg',
  './joint-actions/exercise-06.mp4',
  './joint-actions/exercise-07.jpg',
  './joint-actions/exercise-07.mp4',
  './joint-actions/exercise-08.jpg',
  './joint-actions/exercise-08.mp4',
  './joint-actions/exercise-09.jpg',
  './joint-actions/exercise-09.mp4',
  './joint-actions/exercise-10.jpg',
  './joint-actions/exercise-10.mp4'
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
  // Safari/iOS commonly requests MP4 clips using Range. CacheStorage keeps
  // whole files, so serve the requested byte range from the offline copy.
  if (/\/joint-actions\/exercise-\d{2}\.mp4$/.test(url.pathname) && event.request.headers.has('range')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(url.href);
      if (!cached) return fetch(event.request);
      const blob = await cached.blob();
      const range = /^bytes=(\d+)-(\d*)$/i.exec(event.request.headers.get('range') || '');
      if (!range) return cached;
      const start = Number(range[1]);
      if (!Number.isSafeInteger(start) || start >= blob.size)
        return new Response(null, {status: 416, headers: {'Content-Range': 'bytes */' + blob.size}});
      const requestedEnd = range[2] ? Number(range[2]) : blob.size - 1;
      const end = Math.min(blob.size - 1, requestedEnd);
      if (!Number.isSafeInteger(end) || end < start)
        return new Response(null, {status: 416, headers: {'Content-Range': 'bytes */' + blob.size}});
      return new Response(blob.slice(start, end + 1, 'video/mp4'), {
        status: 206,
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': String(end - start + 1),
          'Content-Range': `bytes ${start}-${end}/${blob.size}`,
          'Accept-Ranges': 'bytes'
        }
      });
    })());
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
