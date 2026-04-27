const DAY_START_HOUR = 6
const NIGHT_START_HOUR = 18
const THEME_STORAGE_KEY = 'destination-paradise-theme'
const THEME_CHANGE_EVENT = 'destination-paradise:theme-change'

const root = document.documentElement
const darkQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
const lightQuery = window.matchMedia?.('(prefers-color-scheme: light)')

function setTheme(theme, source) {
  root.dataset.theme = theme
  root.dataset.themeSource = source
  root.style.colorScheme = theme === 'night' ? 'dark' : 'light'
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme, source } }))
}

function getSystemTheme() {
  if (darkQuery?.matches) {
    return 'night'
  }

  if (lightQuery?.matches) {
    return 'day'
  }

  return null
}

function getLocalTimeTheme(date = new Date()) {
  const hour = date.getHours()
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? 'day' : 'night'
}

function getLocationTheme(latitude, longitude, date = new Date()) {
  const dayOfYear = getDayOfYear(date)
  const solarDeclination = 0.409 * Math.sin((2 * Math.PI * dayOfYear) / 365 - 1.39)
  const latRad = toRadians(latitude)
  const sunsetHourAngle = Math.acos(-Math.tan(latRad) * Math.tan(solarDeclination))

  if (Number.isNaN(sunsetHourAngle)) {
    return getLocalTimeTheme(date)
  }

  const daylightHours = (24 / Math.PI) * sunsetHourAngle
  const solarNoon = 12 - longitude / 15 + getTimezoneOffsetHours(date)
  const sunrise = solarNoon - daylightHours / 2
  const sunset = solarNoon + daylightHours / 2
  const currentHour = date.getHours() + date.getMinutes() / 60

  return currentHour >= sunrise && currentHour < sunset ? 'day' : 'night'
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000
  return Math.floor(diff / 86400000)
}

function getTimezoneOffsetHours(date) {
  return -date.getTimezoneOffset() / 60
}

function toRadians(value) {
  return (value * Math.PI) / 180
}

function requestLocationTheme() {
  if (getStoredTheme()) {
    return
  }

  if (!navigator.geolocation) {
    setTheme(getLocalTimeTheme(), 'local-time')
    return
  }

  setTheme(getLocalTimeTheme(), 'local-time')

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      setTheme(getLocationTheme(coords.latitude, coords.longitude), 'location')
    },
    () => {
      setTheme(getLocalTimeTheme(), 'local-time')
    },
    {
      enableHighAccuracy: false,
      maximumAge: 1000 * 60 * 60 * 6,
      timeout: 3500,
    },
  )
}

function syncSystemTheme() {
  if (getStoredTheme()) {
    return true
  }

  const systemTheme = getSystemTheme()

  if (systemTheme) {
    setTheme(systemTheme, 'system')
    return true
  }

  return false
}

function getStoredTheme() {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    return storedTheme === 'day' || storedTheme === 'night' ? storedTheme : null
  } catch {
    return null
  }
}

function applyStoredTheme() {
  const storedTheme = getStoredTheme()

  if (!storedTheme) {
    return false
  }

  setTheme(storedTheme, 'manual')
  return true
}

export function getCurrentTheme() {
  return root.dataset.theme === 'night' ? 'night' : 'day'
}

export function setManualTheme(theme) {
  const nextTheme = theme === 'night' ? 'night' : 'day'

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  } catch {
    // The visual override should still work when storage is unavailable.
  }

  setTheme(nextTheme, 'manual')
}

export function toggleManualTheme() {
  const nextTheme = getCurrentTheme() === 'night' ? 'day' : 'night'
  setManualTheme(nextTheme)
}

export function onThemeChange(callback) {
  const handleThemeChange = (event) => {
    callback(event.detail.theme, event.detail.source)
  }

  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange)

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange)
  }
}

if (!applyStoredTheme() && !syncSystemTheme()) {
  requestLocationTheme()
}

darkQuery?.addEventListener('change', () => {
  if (!syncSystemTheme()) {
    requestLocationTheme()
  }
})

lightQuery?.addEventListener('change', () => {
  if (!syncSystemTheme()) {
    requestLocationTheme()
  }
})
