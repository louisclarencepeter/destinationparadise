import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './themeLayer.js'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker support is progressive enhancement for installability.
      })
      return
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))

      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('destination-paradise-shell'))
            .map((cacheName) => caches.delete(cacheName)),
        )
      }
    } catch {
      // Ignore cleanup errors in development.
    }
  })
}
