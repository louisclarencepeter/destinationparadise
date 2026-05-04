import { useEffect, useState } from 'react'
import logo from './assets/logo-ui.png'
import ContactInfo from './components/ContactInfo'
import { SocialIcon } from './components/SocialIcons'
import { getCurrentTheme, onThemeChange, toggleManualTheme } from './themeLayer'
import './App.css'

const socialLinks = [
  {
    href: 'https://www.facebook.com/yournexttriptoparadise/',
    label: 'Facebook',
    icon: 'facebook',
  },
  {
    href: 'https://www.instagram.com/yournexttriptoparadise/',
    label: 'Instagram',
    icon: 'instagram',
  },
  {
    href: 'https://www.youtube.com/@destinationparadisezanzibar',
    label: 'YouTube',
    icon: 'youtube',
  },
  {
    href: 'https://x.com/destinationxpar',
    label: 'X',
    icon: 'x',
  },
]

const highlights = [
  { icon: 'compass', label: 'Private island tours' },
  { icon: 'suitcase', label: 'Tanzania safari planning' },
  { icon: 'sparkle', label: 'Zanzibar & Tanzania experiences' },
]

const contactLinks = [
  {
    href: 'https://wa.me/message/YCOQDKJSDMXFD1',
    label: 'Chat on WhatsApp',
    icon: 'whatsapp',
    primary: true,
  },
  {
    href: 'mailto:info@yournexttriptoparadise.com',
    label: 'Email us',
    icon: 'mail',
  },
]

function App() {
  const [theme, setTheme] = useState(getCurrentTheme)
  const nextTheme = theme === 'night' ? 'light' : 'dark'

  useEffect(() => onThemeChange((updatedTheme) => {
    setTheme(updatedTheme)
  }), [])

  return (
    <div className="site-shell">
      <div className="aurora" aria-hidden="true">
        <span className="aurora__grain" />
      </div>

      <header className="site-header">
        <a className="brand" href="/" aria-label="Destination Paradise home">
          <img
            className="brand__logo"
            src={logo}
            alt=""
            width="360"
            height="360"
            fetchPriority="high"
            decoding="async"
          />
          <span className="brand__lockup">
            <span className="brand__name">Destination Paradise</span>
            <span className="brand__tagline">Your next trip to paradise</span>
          </span>
        </a>
        <p className="site-status">
          <span className="site-status__dot" aria-hidden="true" />
          Bookings remain open
        </p>
      </header>

      <main className="construction">
        <section className="construction__copy">
          <p className="construction__eyebrow">
            <span className="construction__eyebrow-icon" aria-hidden="true">
              <SocialIcon type="sparkle" />
            </span>
            Coming Soon
          </p>
          <h1>
            A new home for{' '}
            <span className="construction__accent">unforgettable</span>{' '}
            Zanzibar &amp; Tanzania adventures.
          </h1>
          <p className="construction__body">
            Destination Paradise is refreshing its online experience. While the
            full site is being prepared, our team is still arranging tours,
            transfers, stays, and tailored experiences across Zanzibar and
            Tanzania's finest safari destinations.
          </p>

          <div className="construction__actions" aria-label="Contact options">
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`construction__button ${
                  link.primary ? 'construction__button--primary' : ''
                }`}
              >
                <span className="construction__button-icon" aria-hidden="true">
                  <SocialIcon type={link.icon} />
                </span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          <div className="construction__highlights" aria-label="What is coming">
            {highlights.map((item) => (
              <span key={item.label} className="construction__pill">
                <span className="construction__pill-icon" aria-hidden="true">
                  <SocialIcon type={item.icon} />
                </span>
                {item.label}
              </span>
            ))}
          </div>

          <div className="social-links" aria-label="Social media links">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-links__link"
              >
                <span className="social-links__icon" aria-hidden="true">
                  <SocialIcon type={link.icon} />
                </span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </section>

        <aside
          className="construction__card"
          aria-label="Destination Paradise coming soon"
        >
          <div className="construction__card-glow" aria-hidden="true" />
          <img
            className="construction__logo"
            src={logo}
            alt="Destination Paradise logo"
            width="360"
            height="360"
            decoding="async"
          />
          <p className="construction__card-eyebrow">Travel desk</p>
          <p className="construction__card-title">Plan your visit now</p>
          <p className="construction__card-copy">
            Send your dates, group size, and dream itinerary. We&rsquo;ll help
            shape the details while the new site is getting ready.
          </p>
          <ContactInfo />
        </aside>
      </main>

      <footer className="site-footer">
        <div className="site-footer__brand">
          <img
            className="site-footer__logo"
            src={logo}
            alt=""
            width="360"
            height="360"
            loading="lazy"
            decoding="async"
          />
          <span>Destination Paradise</span>
        </div>
        <div className="site-footer__actions">
          <p className="site-footer__copy">
            &copy; {new Date().getFullYear()} Destination Paradise &middot; Crafted in
            Zanzibar
          </p>
          <button
            type="button"
            className="theme-switch"
            role="switch"
            aria-checked={theme === 'night'}
            aria-label={`Switch to ${nextTheme} theme`}
            onClick={toggleManualTheme}
          >
            <span className="theme-switch__option" aria-hidden="true"><SocialIcon type="sun" /></span>
            <span className="theme-switch__option" aria-hidden="true"><SocialIcon type="moon" /></span>
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App
