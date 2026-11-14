// Service worker: faster opening on slow networks.
// - page: try network for 3s, otherwise show the last saved copy instantly
// - fonts / icons / axios from CDNs: cached after the first load
// - /api/* is never cached (stats and codes must always be live)
const CACHE = 'ahmad-md-v1';
const CDN = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function timeout(ms) { return new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)); }

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return;
    if (req.mode === 'navigate') {
      e.respondWith((async () => {
        const cache = await caches.open(CACHE);
        const fresh = fetch(req).then(r => { if (r && r.ok) cache.put('/', r.clone()); return r; });
        try { return await Promise.race([fresh, timeout(3000)]); }
        catch (err) {
          const cached = await cache.match('/');
          return cached || fresh;
        }
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
