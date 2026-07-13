/**
 * Kawaii Daily - Service Worker
 * Provides offline support for the PWA on GitHub Pages subpath.
 *
 * Important deploy rule:
 * - Navigations are network-first so users receive the latest Vite app shell after a Pages deploy.
 * - Cached index.html is only used as an offline fallback.
 */

const CACHE_PREFIX = 'kawaii-daily-';
const CACHE_NAME = `${CACHE_PREFIX}v2`;
const BASE = self.location.pathname.replace(/service-worker\.js$/, '');

// Core app shell files to precache (relative to SW scope)
const APP_SHELL_FILES = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}manifest.json`,
  // Icons and hashed Vite assets are cached on first successful fetch.
];

function offlineFallback() {
  return new Response(
    '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;text-align:center;"><h1>Offline</h1><p>Kawaii Daily is offline. Your tasks are saved locally.</p><p>Reconnect to sync or reload.</p></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  );
}

// Install: precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching app shell');
      return cache.addAll(APP_SHELL_FILES.filter(Boolean));
    })
  );
  self.skipWaiting();
});

// Activate: clean up only this app's old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch handler: network-first for app shell, cache-first for versioned/static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle same-origin requests under this PWA scope.
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) {
    return;
  }

  // Navigation requests must be network-first so fresh deploys show up.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(`${BASE}index.html`, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match(`${BASE}index.html`).then((cachedResponse) => cachedResponse || offlineFallback()))
    );
    return;
  }

  // For assets, scripts, styles, images: cache first, then network, update cache.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          // Don't cache non-200 or non-basic responses.
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          console.log('[SW] Offline fetch failed for:', request.url);
        });
    })
  );
});

// === Notification Platform (Kisuke) ===
// Handle clicks on our notifications to focus/open the PWA
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const scope = self.location.pathname.replace(/service-worker\.js$/, '');
  const urlToOpen = self.location.origin + scope;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientsArr) => {
        // Focus existing client if open.
        for (const client of clientsArr) {
          if (client.url.startsWith(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window.
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Receive SHOW_NOTIFICATION messages from the app.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options = {} } = event.data;
    const iconPath = `${self.location.pathname.replace(/service-worker\.js$/, '')}icon-192.jpg`;
    self.registration.showNotification(title, {
      icon: iconPath,
      badge: iconPath,
      tag: options.tag || 'kawaii-daily-reminder',
      renotify: false,
      requireInteraction: false,
      ...options,
    });
  }
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker loaded for Kawaii Daily PWA');
