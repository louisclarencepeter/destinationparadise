import { aboutDestinations } from '../../data/aboutPageData.js';

export default function AboutDestinations() {
  return (
    <section className="ab-press reveal" id="destinations">
      <div className="ab-press__head">
        <div>
          <span className="ab-story__eyebrow">Dokąd jedziemy</span>
          <h2>Z Ungui, <em>dalej</em>.</h2>
        </div>
        <p>Zaczynamy w Ungui na Zanzibarze — miejscu, w którym ta podróż się zaczęła — oraz na kontynencie Tanzanii, gdzie opowieść rozciąga się szerzej. Pemba i Mafia Island dołączą w swoim właściwym czasie.</p>
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
