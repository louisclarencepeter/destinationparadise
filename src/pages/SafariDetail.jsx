import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { ALL_SAFARI_PRODUCTS, INCLUDED_LIST } from '../data/safariPageData.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

const PRACTICAL = [
  { h: 'Co zawsze jest w cenie', items: ['Bush flights i transfery', 'Opłaty parkowe i conservation fees', 'Profesjonalny przewodnik safari', 'Pełne wyżywienie w campie lub lodge'] },
  { h: 'Poza ceną', items: ['Loty międzynarodowe', 'Ubezpieczenie podróżne', 'Napiwki dla przewodników i obsługi campu', 'Napoje premium, jeśli nie wskazano inaczej'] },
  { h: 'Rezerwacja i płatność', items: ['Najlepiej rezerwować 2-6 miesięcy wcześniej', 'Zaliczka potwierdza lodge i loty', 'Saldo końcowe przed podróżą', 'Akceptujemy USD, EUR, GBP i TZS'] },
];

function cleanInclude(item = '') {
  return item.replace(/^✓\s*/, '').trim();
}

export default function SafariDetail() {
  const { id } = useParams();
  const safari = ALL_SAFARI_PRODUCTS.find((item) => item.id === id);

  useEffect(() => {
    if (safari) {
      document.title = `${safari.title} · Destination Paradise`;
    } else {
      document.title = 'Safari nie znalezione · Destination Paradise';
    }
  }, [safari]);

  if (!safari) {
    return (
      <main className="safaris-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">Safari</span>
            <h1 className="section-title">Nie znaleziono safari</h1>
            <p className="section-lead">Tej trasy nie ma na aktualnej liście. Zobacz dostępne safari poniżej.</p>
            <Link className="btn btn--ghost-dark" to="/safaris" style={{ marginTop: '1.5rem' }}>Wróć do safari →</Link>
          </div>
        </section>
      </main>
    );
  }

  const included = safari.includesList || safari.highlights || safari.includes.split('·').map(cleanInclude);
  const price = safari.publicPrice;
  const upsells = safari.upsells || [];

  return (
    <main className="safaris-page exc-detail saf-detail">
      <nav className="exc-detail__crumbs" aria-label="Breadcrumb">
        <Link to="/">Strona główna</Link>
        <span aria-hidden="true">→</span>
        <Link to="/safaris">Safari</Link>
        <span aria-hidden="true">→</span>
        <span>{safari.title}</span>
      </nav>

      <article id={safari.id} className="exc-block exc-block--detail">
        <div className="exc-block__img">
          <ResponsiveImage src={safari.image} alt={safari.alt || safari.title} />
          <span className="exc-block__cat">{safari.categoryLabel || safari.category}</span>
          {safari.feature && <span className="exc-block__season">Najpopularniejsze</span>}
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow">{safari.rib}</span>
          <h1 className="exc-block__title">{safari.title}</h1>
          <p className="exc-block__desc">{safari.intro}</p>
          <dl className="exc-block__facts">
            <div><dt>Czas trwania</dt><dd>{safari.duration}<small>Długość trasy</small></dd></div>
            <div><dt>Start</dt><dd>{safari.from}<small>Loty można dopasować</small></dd></div>
            <div><dt>Styl</dt><dd>{safari.positioning || safari.categoryLabel || safari.category}<small>Typ safari</small></dd></div>
            <div>
              <dt>Cena</dt>
              <dd>
                ${price ? price.lowSeason.toLocaleString() : safari.price.toLocaleString()}
                {price && `-$${price.peakSeason.toLocaleString()}`}
                <small>{price?.unit || safari.priceSub}</small>
              </dd>
            </div>
          </dl>
          <div className="exc-block__cols">
            <div className="exc-block__col">
              <h4>{safari.productType ? 'Najważniejsze punkty' : 'W cenie tej trasy'}</h4>
              <ul>{included.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="exc-block__col">
              <h4>{safari.idealFor?.length ? 'Idealne dla' : 'Typowe elementy safari'}</h4>
              <ul>{(safari.idealFor?.length ? safari.idealFor : INCLUDED_LIST.slice(0, 4)).map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          {upsells.length > 0 && (
            <div className="exc-block__cols">
              <div className="exc-block__col">
                <h4>Opcjonalne ulepszenia</h4>
                <ul>{upsells.map((item) => <li key={item.name}>{item.name} · +${item.price.toLocaleString()}</li>)}</ul>
              </div>
            </div>
          )}
          <div className="exc-block__actions">
            <span className="exc-block__price">
              ${price ? price.lowSeason.toLocaleString() : safari.price.toLocaleString()}
              <small>{price ? `niski sezon · wysoki od $${price.peakSeason.toLocaleString()}` : safari.priceSub}</small>
            </span>
            <span className="exc-block__price-note">Finalna cena zależy od sezonu, poziomu campu i dostępności lotów.</span>
            <Link className="btn" to={`/booking?type=safari&item=${encodeURIComponent(safari.id)}`}>Zarezerwuj tę trasę →</Link>
            <Link className="btn btn--ghost-dark" to="/safaris">Wszystkie safari</Link>
          </div>
        </div>
      </article>

      {safari.days?.length > 0 && (
        <section className="exc-day" id="route">
          <div className="exc-day__head">
            <span className="section-eyebrow">Dzień po dniu</span>
            <h2 className="section-title">Typowy przebieg trasy</h2>
            <p className="section-lead">To aktualny szkic podróży. Loty, campy i tempo dopasowujemy do Twoich dat oraz stylu podróżowania.</p>
          </div>
          <div className="exc-day__timeline">
            {safari.days.map((day) => (
              <div className="exc-day__row" key={day.d}>
                <div className="exc-day__time">{day.d}</div>
                <div className="exc-day__what"><strong>{day.h}</strong><p>{day.p}</p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="exc-prac">
        <div className="exc-prac__grid">
          {PRACTICAL.map((col) => (
            <div className="exc-prac__col" key={col.h}>
              <h4>{col.h}</h4>
              <ul>
                {col.items.map((item) => (
                  <li key={item}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="saf-cta">
        <div className="saf-cta__bg">
          <ResponsiveImage src={safari.image} alt="" />
        </div>
        <div className="saf-cta__inner">
          <h2>Gotowi zaplanować {safari.title}?</h2>
          <p>Podaj daty, wielkość grupy i preferowany poziom komfortu. Wrócimy w 24 godziny z realnym planem i realną ceną.</p>
          <div className="saf-cta__btns">
            <Link className="btn btn--lg btn--accent" to={`/booking?type=safari&item=${encodeURIComponent(safari.id)}`}>Poproś o wycenę →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Porozmawiaj z planerem AI</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
