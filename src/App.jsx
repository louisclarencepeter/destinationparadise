import logo from './assets/logo-ui.png'
import ContactInfo from './components/ContactInfo'
import { SocialIcon } from './components/SocialIcons'
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
  { icon: '◷', label: 'Tailored island itineraries' },
  { icon: '☼', label: 'Stay & safari planning' },
  { icon: '✦', label: 'Polished booking experience' },
]

function App() {
  return (
    <div className="site-shell">
      <div className="aurora" aria-hidden="true">
        <span className="aurora__blob aurora__blob--teal" />
        <span className="aurora__blob aurora__blob--coral" />
        <span className="aurora__blob aurora__blob--sand" />
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
          Website update in progress
        </p>
      </header>

      <main className="construction">
        <section className="construction__copy">
          <p className="construction__eyebrow">
            <span aria-hidden="true">✦</span> Coming Soon
          </p>
          <h1>
            We&rsquo;re crafting something
            <span className="construction__accent"> beautiful</span> for your
            next escape.
          </h1>
          <p className="construction__body">
            Destination Paradise is getting a fresh new online home. Behind the
            scenes we&rsquo;re shaping a richer, smoother experience &mdash;
            and the full site will be live soon.
          </p>

          <div className="progress" aria-label="Launch progress">
            <div className="progress__track">
              <div className="progress__fill" style={{ width: '72%' }} />
            </div>
            <div className="progress__meta">
              <span>Build progress</span>
              <span className="progress__value">72%</span>
            </div>
          </div>

          <div className="construction__highlights" aria-label="What is coming">
            {highlights.map((item) => (
              <span key={item.label} className="construction__pill">
                <span className="construction__pill-icon" aria-hidden="true">
                  {item.icon}
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
          <p className="construction__card-eyebrow">In the meantime</p>
          <p className="construction__card-title">Let&rsquo;s plan together</p>
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
        <p className="site-footer__copy">
          &copy; {new Date().getFullYear()} Destination Paradise &middot; Crafted in
          Zanzibar
        </p>
      </footer>
    </div>
  )
}

export default App
