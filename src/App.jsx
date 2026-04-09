import logo from './assets/DPL.pngG1.png'
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

function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Destination Paradise home">
          <img className="brand__logo" src={logo} alt="" />
          <span className="brand__lockup">
            <span className="brand__name">Destination Paradise</span>
            <span className="brand__tagline">Your next trip to paradise</span>
          </span>
        </a>
        <p className="site-status">Website update in progress</p>
      </header>

      <main className="construction">
        <section className="construction__copy">
          <p className="construction__eyebrow">Under Construction</p>
          <h1>We&rsquo;re building something beautiful for your next escape.</h1>
          <p className="construction__body">
            Destination Paradise is getting a fresh new online home. We&rsquo;re
            behind the scenes shaping the experience, and the full site will be
            live soon.
          </p>

          <div className="social-links" aria-label="Social media links">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit our ${link.label} page`}
                className="social-links__link"
              >
                <span className="social-links__icon" aria-hidden="true">
                  <SocialIcon type={link.icon} />
                </span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          <div className="construction__highlights" aria-label="What is coming">
            <span className="construction__pill">Tailored island itineraries</span>
            <span className="construction__pill">Stay and safari planning</span>
            <span className="construction__pill">A polished booking experience</span>
          </div>
        </section>

        <aside
          className="construction__card"
          aria-label="Destination Paradise coming soon"
        >
          <img
            className="construction__logo"
            src={logo}
            alt="Destination Paradise logo"
          />
          <p className="construction__card-title">Coming soon</p>
          <ContactInfo />
        </aside>
      </main>

      <footer className="site-footer">
        <div className="site-footer__brand">
          <img className="site-footer__logo" src={logo} alt="" />
          <span>Destination Paradise</span>
        </div>
        <p className="site-footer__copy">
          Under construction, but already on brand.
        </p>
      </footer>
    </div>
  )
}

export default App
