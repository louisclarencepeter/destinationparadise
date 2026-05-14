import { aboutDestinations } from '../../data/aboutPageData.js';

export default function AboutDestinations() {
  return (
    <section className="ab-press reveal" id="destinations">
      <div className="ab-press__head">
        <div>
          <span className="ab-story__eyebrow">Where we go</span>
          <h2>From Unguja, <em>outward</em>.</h2>
        </div>
        <p>We begin in Unguja, Zanzibar — the place this journey started — and across mainland Tanzania, where the wider story unfolds. Pemba and Mafia Island will follow, each in the time it deserves.</p>
      </div>

      <div className="ab-dest__grid">
        {aboutDestinations.map((destination, index) => (
          <article className="ab-dest reveal" key={destination.name} style={{ transitionDelay: `${index * 90}ms` }}>
            <span className="ab-dest__tag">{destination.tag}</span>
            <h3 className="ab-dest__name">{destination.name}</h3>
            <p className="ab-dest__body">{destination.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
