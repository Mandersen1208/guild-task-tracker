/**
 * Kawaii Daily - Service Worker
 * Provides offline support for the PWA on GitHub Pages subpath.
 * Caches app shell and core assets for full offline functionality (tasks via localStorage, clock, UI).
 */

const CACHE_NAME = 'kawaii-daily-v1';
const BASE = self.location.pathname.replace(/service-worker\.js$/, '');

// Core app shell files to precache (relative to SW scope)
const APP_SHELL_FILES = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}manifest.json`,
  // Icons will be cached on first use
];

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

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch handler: cache-first for offline support
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Special handling for navigation requests (SPA fallback to index.html)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(`${BASE}index.html`).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).catch(() => {
          // If completely offline and no cache, serve a minimal offline page
          return new Response(
            '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;text-align:center;"><h1>Offline</h1><p>Kawaii Daily is offline. Your tasks are saved locally.</p><p>Reconnect to sync or reload.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        });
      })
    );
    return;
  }

  // For assets, scripts, styles, images: Cache first, then network, update cache
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          // Don't cache non-200 or non-basic responses
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Cache the response for future offline use
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Offline: if not cached, request fails (e.g. external images)
          // Could add specific fallbacks here if needed
          console.log('[SW] Offline fetch failed for:', request.url);
        });
    })
  );
});

// Optional: message handler for skip waiting from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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
        // Focus existing client if open
        for (const client of clientsArr) {
          if (client.url.startsWith(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Receive SHOW_NOTIFICATION messages from the app (for EOD reminders via SW)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options = {} } = event.data;
    const iconPath = `${self.location.pathname.replace(/service-worker\.js$/, '')}icon-192.jpg`;
    self.registration.showNotification(title, {
      icon: iconPath,
      badge: iconPath,
      tag: 'eod-reminder',
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
