import { aboutPillars } from '../../data/aboutPageData.js';

const pillarIcons = {
  people: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3" /><circle cx="17" cy="11" r="3" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M14 21v-1a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1" /></svg>
  ),
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V8l7-5 7 5v13" /><path d="M9 21v-6h6v6" /></svg>
  ),
  network: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="18" r="2.5" /><circle cx="12" cy="12" r="2.5" /><path d="M8 7l3 4M16 7l-3 4M8 17l3-4M16 17l-3-4" /></svg>
  ),
  layers: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 7l8 5 8-5-8-5z" /><path d="M4 12l8 5 8-5" /><path d="M4 17l8 5 8-5" /></svg>
  ),
};

export default function AboutCommunity() {
  return (
    <section className="ab-sus reveal" id="community">
      <div className="ab-sus__inner">
        <div className="ab-sus__head">
          <div>
            <span className="ab-story__eyebrow ab-sus__eyebrow">Community</span>
            <h2>Built as a <em>network</em>, not a closed system.</h2>
          </div>
          <p>Destination Paradise is not only about travel. We believe tourism should also create real opportunities for the people who host you. From day one we are working hand-in-hand with local drivers, guides, hotels, restaurants and service providers — building something the wider community grows with, not around.</p>
        </div>

        <div className="ab-sus__grid">
          <div className="ab-sus__pillars">
            {aboutPillars.map((pillar, index) => (
              <div className="ab-pillar reveal" key={pillar.title} style={{ transitionDelay: `${index * 90}ms` }}>
                <div className="ab-pillar__icon">{pillarIcons[pillar.icon]}</div>
                <h4>{pillar.title}</h4>
                <p>{pillar.body}</p>
              </div>
            ))}
          </div>

          <aside className="ab-sus__quote">
            <p className="ab-sus__quote-text">&ldquo;Every destination has a story. Every island has its own culture, energy and hidden beauty waiting to be experienced.</p>
            <p className="ab-sus__quote-text">This wasn&rsquo;t built for scale. It was built for the moments — a slow morning at the reef, a story told in the back of a Land Cruiser, the first time you see the Serengeti go quiet at dusk.</p>
            <p className="ab-sus__quote-text">We hope, in time, you&rsquo;ll have a story of your own to add.&rdquo;</p>
            <div className="ab-sus__quote-who">
              <img
                className="ab-sus__quote-avatar"
                src="/assets/images/aboutus/louis-peter-portrait-144.webp"
                alt="Louis Peter, founder of Destination Paradise"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
              />
              <div>
                <strong>From our founding note</strong>
                <span>Destination Paradise · 2026</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
