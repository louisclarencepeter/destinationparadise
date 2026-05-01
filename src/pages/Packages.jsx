import '../styles/homepage.css';

const PACKAGES = [
  {
    title: 'Island Essentials',
    nights: '7 nights',
    lead: 'Stone Town heritage, beach days in Matemwe, one full-day Safari Blue dhow.',
    price: '$2,490',
  },
  {
    title: 'Bush & Beach',
    nights: '10 nights',
    lead: 'Serengeti and Ngorongoro wildlife, then a private Zanzibar beach stay.',
    price: '$5,790',
  },
  {
    title: 'Honeymoon Hideaway',
    nights: '5 nights',
    lead: 'A quiet northern villa, private excursions, and a candle-lit dhow dinner for two.',
    price: '$3,180',
  },
];

export default function Packages() {
  return (
    <main className="standalone-page">
      <section className="standalone-page__section">
        <header className="standalone-page__head">
          <span className="section-eyebrow">All-in-One</span>
          <h1 className="section-title">Packages</h1>
          <p className="section-lead">
            Hotels, safaris, excursions, and transfers arranged as one trip. These are starting points we tailor around your dates.
          </p>
        </header>
        <div className="standalone-card-grid">
          {PACKAGES.map((pkg) => (
            <article className="standalone-card" key={pkg.title}>
              <span className="standalone-card__eyebrow">{pkg.nights}</span>
              <h2>{pkg.title}</h2>
              <p>{pkg.lead}</p>
              <div className="standalone-card__foot">
                <span>From <strong>{pkg.price}</strong> pp</span>
                <a href="/#contact">Build this trip</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
