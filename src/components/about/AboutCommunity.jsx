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
            <span className="ab-story__eyebrow ab-sus__eyebrow">Społeczność</span>
            <h2>Zbudowane jako <em>sieć</em>, nie zamknięty system.</h2>
          </div>
          <p>Destination Paradise to nie tylko podróże. Wierzymy, że turystyka powinna tworzyć realne możliwości dla ludzi, którzy goszczą podróżnych. Od pierwszego dnia pracujemy ramię w ramię z lokalnymi kierowcami, przewodnikami, hotelami, restauracjami i usługodawcami — budując coś, z czym szersza społeczność rośnie razem, a nie obok.</p>
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
            <p className="ab-sus__quote-text">&ldquo;Każdy kierunek ma swoją historię. Każda wyspa ma własną kulturę, energię i ukryte piękno, które czeka, aż ktoś je przeżyje.</p>
            <p className="ab-sus__quote-text">Nie zbudowaliśmy tego dla samej skali. Zbudowaliśmy to dla chwil: powolnego poranka przy rafie, historii opowiedzianej z tyłu Land Cruisera, pierwszego momentu, gdy Serengeti cichnie o zmierzchu.</p>
            <p className="ab-sus__quote-text">Mamy nadzieję, że z czasem dodasz tu własną historię.&rdquo;</p>
            <div className="ab-sus__quote-who">
              <img
                className="ab-sus__quote-avatar"
                src="/assets/images/aboutus/louis-peter-portrait-144.webp"
                alt="Louis Peter, założyciel Destination Paradise"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
              />
              <div>
                <strong>Z naszej notatki założycielskiej</strong>
                <span>Destination Paradise · 2026</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
