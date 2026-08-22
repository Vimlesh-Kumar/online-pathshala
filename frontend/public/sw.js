/**
 * Online Pathshala service worker.
 *
 * Hand-written rather than generated, so it stays dependency-free and the
 * caching rules are explicit:
 *
 *   - navigations      network first, falling back to the cached SPA shell
 *   - hashed assets    cache first (the filename changes when the file does)
 *   - fonts / icons    stale-while-revalidate
 *   - API GETs         network first, falling back to the last good response
 *
 * API responses are per-learner, so the page deletes that cache on logout
 * (see src/utils/pwa.ts). Nothing is ever cached for a non-GET request.
 */
const VERSION = 'v1';
const SHELL_CACHE = `pathshala-shell-${VERSION}`;
const ASSET_CACHE = `pathshala-assets-${VERSION}`;
const API_CACHE = `pathshala-api-${VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, ASSET_CACHE, API_CACHE];

/** Enough to boot the app with no network at all. */
const SHELL_URLS = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/icon-192.png',
    '/icon-512.png',
    '/favicon.ico'
];

/** Last-resort page when even the shell is missing from the cache. */
const OFFLINE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Offline — Online Pathshala</title>
<style>
  body { margin:0; min-height:100vh; display:grid; place-items:center; background:#0b1020; color:#e2e8f0;
         font-family: Inter, system-ui, sans-serif; text-align:center; padding:2rem; }
  h1 { font-size:1.5rem; margin:0 0 .75rem; }
  p { color:#94a3b8; margin:0 0 1.5rem; }
  button { border:0; border-radius:999px; padding:.75rem 1.75rem; font-weight:700; color:#fff; cursor:pointer;
           background:linear-gradient(135deg,#7c3aed,#6366f1,#06b6d4); }
</style></head>
<body><div><h1>You are offline</h1>
<p>Pages you have already opened are still available.</p>
<button onclick="location.reload()">Try again</button></div></body></html>`;

const isFontRequest = (url) =>
    url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

const isSameOrigin = (url) => url.origin === self.location.origin;

/** Vite emits content-hashed files under /assets, so they can be cached forever. */
const isHashedAsset = (url) => isSameOrigin(url) && url.pathname.startsWith('/assets/');

const isStaticFile = (url) =>
    isSameOrigin(url) && /\.(png|svg|ico|webmanifest|jpg|jpeg|webp)$/.test(url.pathname);

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE)
            // One missing file must not fail the whole install, so each is added on its own.
            .then((cache) => Promise.allSettled(SHELL_URLS.map((url) => cache.add(url))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key.startsWith('pathshala-') && !CURRENT_CACHES.includes(key))
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('message', (event) => {
    if (event.data === 'skip-waiting') self.skipWaiting();
});

const cacheFirst = async (request, cacheName) => {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
    }
    return response;
};

const staleWhileRevalidate = async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const network = fetch(request)
        .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
        })
        .catch(() => cached);

    return cached || network;
};

/**
 * Network first, cache as backup. Used for API reads so the app always prefers
 * live data but still renders something useful on a dead connection.
 */
const networkFirst = async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    try {
        const response = await fetch(request);
        // Only successful, non-opaque responses are worth keeping.
        if (response.ok && response.type !== 'opaque') cache.put(request, response.clone());
        return response;
    } catch (error) {
        const cached = await cache.match(request);
        if (cached) return cached;
        throw error;
    }
};

const handleNavigation = async (request) => {
    try {
        const response = await fetch(request);
        const cache = await caches.open(SHELL_CACHE);
        cache.put('/index.html', response.clone());
        return response;
    } catch (error) {
        // The SPA shell can render any route once it boots, so it is the right
        // fallback for every navigation, not just the one that was cached.
        const shell = (await caches.match('/index.html')) || (await caches.match('/'));
        return shell || new Response(OFFLINE_HTML, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(request));
        return;
    }

    if (isHashedAsset(url)) {
        event.respondWith(cacheFirst(request, ASSET_CACHE));
        return;
    }

    if (isFontRequest(url) || isStaticFile(url)) {
        event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
        return;
    }

    // Anything else cross-origin is the API this app talks to.
    if (url.origin !== self.location.origin) {
        event.respondWith(networkFirst(request, API_CACHE));
    }
});
