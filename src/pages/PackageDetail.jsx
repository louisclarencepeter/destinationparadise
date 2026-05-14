import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { PACKAGES } from './Packages.jsx';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

export default function PackageDetail() {
  const { id } = useParams();
  const pkg = PACKAGES.find((item) => item.id === id);

  useEffect(() => {
    document.title = pkg
      ? `${pkg.title} · Destination Paradise`
      : 'Pakiet nie znaleziony · Destination Paradise';
  }, [pkg]);

  if (!pkg) {
    return (
      <main className="excursions-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">Pakiety</span>
            <h1 className="section-title">Nie znaleziono pakietu</h1>
            <p className="section-lead">Tego pakietu nie ma na aktualnej liście. Zobacz wszystkie pakiety poniżej.</p>
            <Link className="btn btn--ghost-dark" to="/packages" style={{ marginTop: '1.5rem' }}>Wróć do pakietów →</Link>
          </div>
        </section>
      </main>
    );
  }

  const audience = pkg.targetAudience || pkg.idealFor || [];
  const upsells = pkg.upsells || [];
  const routeItems = pkg.route || pkg.destinations || [];
  const contextItems = [
    pkg.split && `Podział podróży: ${pkg.split}`,
    pkg.focus && `Fokus: ${pkg.focus}`,
    pkg.season && `Sezon: ${pkg.season}`,
    pkg.benchmark,
  ].filter(Boolean);

  return (
    <main className="excursions-page exc-detail package-detail">
      <nav className="exc-detail__crumbs" aria-label="Breadcrumb">
        <Link to="/">Strona główna</Link>
        <span aria-hidden="true">→</span>
        <Link to="/packages">Pakiety</Link>
        <span aria-hidden="true">→</span>
        <span>{pkg.title}</span>
      </nav>

      <article id={pkg.id} className="exc-block exc-block--detail">
        <div className="exc-block__img">
          <ResponsiveImage src={pkg.image} alt="" />
          <span className="exc-block__cat">{pkg.category}</span>
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow">{pkg.duration}</span>
          <h1 className="exc-block__title">{pkg.title}</h1>
          <p className="exc-block__desc">{pkg.description}</p>
          <dl className="exc-block__facts">
            <div><dt>Czas trwania</dt><dd>{pkg.duration}<small>Elastyczne tempo</small></dd></div>
            <div><dt>Kategoria</dt><dd>{pkg.category}<small>Styl pakietu</small></dd></div>
            <div><dt>Cena</dt><dd>{pkg.priceLabel}<small>{pkg.priceSub}</small></dd></div>
            <div><dt>Wycena</dt><dd>24h<small>Indywidualna propozycja</small></dd></div>
          </dl>
          <div className="exc-block__cols">
            <div className="exc-block__col">
              <h4>W cenie</h4>
              <ul>{pkg.includes.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="exc-block__col">
              <h4>{audience.length ? 'Idealne dla' : 'Uwagi o trasie'}</h4>
              <ul>{(audience.length ? audience : routeItems).map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          {(pkg.priceTiers || routeItems.length > 0 || contextItems.length > 0 || upsells.length > 0) && (
            <div className="exc-block__cols">
              {pkg.priceTiers && (
                <div className="exc-block__col">
                  <h4>Ceny startowe</h4>
                  <ul>{pkg.priceTiers.map((tier) => <li key={tier.label}>{tier.label}: ${tier.price.toLocaleString()}{tier.suffix || ''}</li>)}</ul>
                </div>
              )}
              {routeItems.length > 0 && audience.length > 0 && (
                <div className="exc-block__col">
                  <h4>{pkg.destinations ? 'Opcje miejsc' : 'Trasa'}</h4>
                  <ul>{routeItems.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              )}
              {contextItems.length > 0 && (
                <div className="exc-block__col">
                  <h4>Uwagi planistyczne</h4>
                  <ul>{contextItems.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              )}
              {upsells.length > 0 && (
                <div className="exc-block__col">
                  <h4>Opcjonalne ulepszenia</h4>
                  <ul>{upsells.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              )}
            </div>
          )}
          <div className="exc-block__actions">
            <span className="exc-block__price">{pkg.priceLabel}<small>{pkg.priceSub}</small></span>
            <span className="exc-block__price-note">Finalna cena pakietu zależy od dat, poziomu hoteli, transferów i dostępności.</span>
            <Link className="btn" to={`/booking?type=package&item=${encodeURIComponent(pkg.slug)}`}>Zbuduj ten pakiet →</Link>
            <Link className="btn btn--ghost-dark" to="/packages">Wszystkie pakiety</Link>
          </div>
        </div>
      </article>

      <section className="exc-cta">
        <div className="exc-cta__bg"><ResponsiveImage src={pkg.image} alt="" /></div>
        <div className="exc-cta__inner">
          <h2>Gotowi zaplanować {pkg.title}?</h2>
          <p>Podaj daty, liczbę gości i poziom komfortu. Dopasujemy pakiet i uczciwie go wycenimy.</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg btn--accent" to={`/booking?type=package&item=${encodeURIComponent(pkg.slug)}`}>Poproś o wycenę →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Zaplanuj z AI</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
