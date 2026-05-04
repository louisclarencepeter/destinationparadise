const CACHE_NAME = 'destination-paradise-shell-v1'
const APP_SHELL = ['/', '/site.webmanifest', '/brand-logo.png', '/icon-192.png', '/icon-512.png']
const IS_LOCALHOST = ['localhost', '127.0.0.1', '::1'].includes(self.location.hostname)

self.addEventListener('install', (event) => {
  if (IS_LOCALHOST) {
    self.skipWaiting()
    return
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  if (IS_LOCALHOST) {
    event.waitUntil((async () => {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('destination-paradise-shell'))
          .map((cacheName) => caches.delete(cacheName)),
      )

      await self.registration.unregister()
      const clients = await self.clients.matchAll({ type: 'window' })
      clients.forEach((client) => client.navigate(client.url))
    })())
    return
  }

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
  if (IS_LOCALHOST) {
    return
  }

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
      }).catch(() => new Response('', { status: 504, statusText: 'Offline' }))
    }),
  )
})
