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
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker support is progressive enhancement for installability.
    })
  })
}
