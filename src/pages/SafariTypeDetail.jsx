import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { ALL_SAFARI_PRODUCTS, SAFARI_TYPES } from '../data/safariPageData.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

export default function SafariTypeDetail() {
  const { typeId } = useParams();
  const type = SAFARI_TYPES.find((item) => item.id === typeId);

  useEffect(() => {
    if (type) {
      document.title = `${type.title} · Destination Paradise`;
    } else {
      document.title = 'Typ safari nie znaleziony · Destination Paradise';
    }
  }, [type]);

  if (!type) {
    return (
      <main className="safaris-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">Style safari</span>
            <h1 className="section-title">Nie znaleziono typu safari</h1>
            <p className="section-lead">Tego stylu nie ma na aktualnej liście. Zobacz dostępne style safari poniżej.</p>
            <Link className="btn btn--ghost-dark" to="/safaris#safari-types" style={{ marginTop: '1.5rem' }}>Wróć do stylów safari →</Link>
          </div>
        </section>
      </main>
    );
  }

  const routes = ALL_SAFARI_PRODUCTS.filter((route) => type.routeIds.includes(route.id));

  return (
    <main className="safaris-page exc-detail saf-type-detail">
      <nav className="exc-detail__crumbs" aria-label="Breadcrumb">
        <Link to="/">Strona główna</Link>
        <span aria-hidden="true">→</span>
        <Link to="/safaris">Safari</Link>
        <span aria-hidden="true">→</span>
        <span>{type.title}</span>
      </nav>

      <article className="exc-block exc-block--detail">
        <div className="exc-block__img">
          <ResponsiveImage src={type.image} alt={type.alt || type.title} />
          <span className="exc-block__cat">Styl safari</span>
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow">Najlepsze dla: {type.bestFor}</span>
          <h1 className="exc-block__title">{type.title}</h1>
          <p className="exc-block__desc">{type.desc}</p>
          <div className="exc-block__cols">
            <div className="exc-block__col">
              <h4>Dlaczego ten styl</h4>
              <ul>{type.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="exc-block__col">
              <h4>Najlepiej pasujące trasy</h4>
              <ul>{routes.map((route) => <li key={route.id}>{route.title}</li>)}</ul>
            </div>
          </div>
          <div className="exc-block__actions">
            <Link className="btn btn--ghost-dark" to={`/booking?type=custom&title=${encodeURIComponent(type.title)}`}>Poproś o wycenę →</Link>
            <Link className="btn btn--ghost-dark" to="/safaris">Wszystkie safari</Link>
          </div>
        </div>
      </article>

      <section className="itineraries reveal">
        <header className="itineraries__head">
          <span className="section-eyebrow">Polecane trasy</span>
          <h2 className="section-title">Zacznij od jednego z tych safari.</h2>
          <p className="section-lead">Te trasy najlepiej pasują do wybranego stylu. Każda prowadzi do szczegółów i planu dzień po dniu.</p>
        </header>
        <div className="exc-grid saf-route-grid">
          {routes.map((route) => (
            <Link key={route.id} to={`/safaris/${route.id}`} className="exc-card saf-route-card" aria-label={`Zobacz ${route.title}`}>
              <div className="exc-card__img">
                <img src={route.image} alt={route.alt || route.title} loading="lazy" />
                <span className="exc-card__cat">{route.categoryLabel || route.category}</span>
                {route.feature && <span className="exc-card__season">Najpopularniejsze</span>}
              </div>
              <div className="exc-card__body">
                <span className="exc-card__eyebrow">{route.rib}</span>
                <h3 className="exc-card__title">{route.title}</h3>
                <p className="exc-card__desc">{route.intro}</p>
                <div className="exc-card__meta">
                  <span>{route.duration}</span>
                  <span>{route.from}</span>
                </div>
                <div className="exc-card__foot">
                  <span className="exc-card__price">Od <strong>${route.price.toLocaleString()}</strong> {route.priceSub}</span>
                  <span className="exc-card__cta">Zobacz →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="saf-cta">
        <div className="saf-cta__bg">
          <ResponsiveImage src={type.image} alt="" />
        </div>
        <div className="saf-cta__inner">
          <h2>To jest Twój styl safari?</h2>
          <p>Podaj daty, budżet i wielkość grupy. W 24 godziny dopasujemy parki, campy i loty.</p>
          <div className="saf-cta__btns">
            <Link className="btn btn--lg btn--accent" to={`/booking?type=custom&title=${encodeURIComponent(type.title)}`}>Poproś o wycenę →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Zaplanuj z AI</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
