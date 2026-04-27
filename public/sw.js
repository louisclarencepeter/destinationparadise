const CACHE_NAME = 'destination-paradise-shell-v1'
const APP_SHELL = ['/', '/site.webmanifest', '/brand-logo.png', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/')),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse
        }

        const responseToCache = networkResponse.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return networkResponse
      })
    }),
  )
})
