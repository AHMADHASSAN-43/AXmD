// Service worker: ultra fast opening, even on very slow networks.
// - page: shown INSTANTLY from the saved copy, refreshed quietly in the background
// - fonts / icons from CDNs: saved after the first load
// - /api/* is never cached (stats and codes must always be live)
const CACHE = 'ahmad-md-v10';
const CDN = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const PRECACHE = [
  '/',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return;
    if (req.mode === 'navigate') {
      e.respondWith((async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match('/');
        const net = fetch(url.search ? '/' : req).then(r => { if (r && r.ok) cache.put('/', r.clone()); return r; });
        if (hit) { e.waitUntil(net.catch(() => {})); return hit; }   // instant
        return net;                                                    // first ever visit
      })());
    }
    return;
  }

  if (CDN.includes(url.hostname)) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) cache.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    })());
  }
});
