import '../styles/homepage.css';

const PLACES = [
  'Stone Town',
  'Fumba',
  'Kizimkazi',
  'Jozani Forest',
  'Nungwi',
  'Matemwe',
  'Serengeti',
  'Ngorongoro',
  'Nyerere',
];

export default function Explore() {
  return (
    <main className="standalone-page">
      <section className="standalone-page__section">
        <header className="standalone-page__head">
          <span className="section-eyebrow">Explore</span>
          <h1 className="section-title">Zanzibar & Tanzania</h1>
          <p className="section-lead">
            A standalone overview for island stops, mainland safari circuits, and the routes we commonly combine.
          </p>
        </header>
        <div className="standalone-tag-grid">
          {PLACES.map((place) => (
            <a className="standalone-tag" href="/#map" key={place}>{place}</a>
          ))}
        </div>
      </section>
    </main>
  );
}
