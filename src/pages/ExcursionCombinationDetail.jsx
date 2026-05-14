import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { EXCURSIONS } from '../data/excursionsData.js';
import { EXCURSION_COMBINATIONS } from '../data/excursionCombinations.js';
import '../styles/homepage.css';
import '../styles/excursions.css';

const fallbackImage = '/assets/images/excursions/safari-blue-sandbank.webp';

export default function ExcursionCombinationDetail() {
  const { id } = useParams();
  const combo = EXCURSION_COMBINATIONS.find((item) => item.id === id);
  const excursions = combo ? combo.excursionIds.map((excursionId) => EXCURSIONS.find((item) => item.id === excursionId)).filter(Boolean) : [];
  const heroExcursion = excursions.find((item) => !item.imageTBD) || excursions[0];
  const heroImage = heroExcursion && !heroExcursion.imageTBD ? heroExcursion.image : fallbackImage;
  const minPrice = excursions.reduce((total, item) => total + (typeof item.price === 'number' ? item.price : 0), 0);

  useEffect(() => {
    document.title = combo
      ? `${combo.title} · Kombinacja wycieczek · Destination Paradise`
      : 'Kombinacja wycieczek nie znaleziona · Destination Paradise';
  }, [combo]);

  if (!combo) {
    return (
      <main className="excursions-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">Kombinacje wycieczek</span>
            <h1 className="section-title">Nie znaleziono kombinacji</h1>
            <p className="section-lead">Tej kombinacji nie ma na aktualnej liście. Zobacz wszystkie wycieczki poniżej.</p>
            <Link className="btn" to="/excursions" style={{ marginTop: '1.5rem' }}>Wróć do wycieczek →</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="excursions-page exc-detail">
      <nav className="exc-detail__crumbs" aria-label="Breadcrumb">
        <Link to="/">Strona główna</Link>
        <span aria-hidden="true">→</span>
        <Link to="/excursions">Wycieczki</Link>
        <span aria-hidden="true">→</span>
        <span>{combo.title}</span>
      </nav>

      <article id={combo.id} className="exc-block exc-block--detail">
        <div className="exc-block__img">
          <ResponsiveImage src={heroImage} alt="" />
          <span className="exc-block__cat">Kombinacja</span>
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow">{combo.combo.join(' + ')}</span>
          <h1 className="exc-block__title">{combo.title}</h1>
          <p className="exc-block__desc">{combo.desc}</p>
          <dl className="exc-block__facts">
            <div><dt>Długość</dt><dd>{combo.length}<small>Ułożone jako jedna trasa</small></dd></div>
            <div><dt>Przystanki</dt><dd>{combo.combo.length}<small>{combo.combo.join(' + ')}</small></dd></div>
            <div><dt>Styl</dt><dd>Prywatny plan<small>Najlepiej jako dzień na miarę</small></dd></div>
            <div><dt>Wycena</dt><dd>24h<small>Finalny czas i cena</small></dd></div>
          </dl>
          <div className="exc-block__cols">
            <div className="exc-block__col">
              <h4>Doświadczenia w planie</h4>
              <ul>{combo.combo.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="exc-block__col">
              <h4>Idealne dla</h4>
              <ul>{combo.idealFor.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          <div className="exc-block__cols">
            <div className="exc-block__col">
              <h4>Otwórz każdy przystanek</h4>
              <ul>
                {excursions.map((item) => (
                  <li key={item.id}><Link to={`/excursions/${item.id}`}>{item.title}</Link></li>
                ))}
              </ul>
            </div>
            <div className="exc-block__col">
              <h4>Uwagi planistyczne</h4>
              <ul>
                <li>Godzina odbioru zależy od lokalizacji hotelu, pływów i światła dziennego.</li>
                <li>Część kombinacji najlepiej działa prywatnie, żeby tempo było wygodne.</li>
                <li>Przed rezerwacją potwierdzamy finalną trasę, posiłki, przewodnika i transfery.</li>
              </ul>
            </div>
          </div>
          <div className="exc-block__actions">
            {minPrice > 0 ? (
              <span className="exc-block__price">${minPrice}<small>szacunek z podanych przystanków</small></span>
            ) : (
              <span className="exc-block__price-note">Cena na zapytanie</span>
            )}
            <span className="exc-block__price-note">Finalna cena kombinacji zależy od transferów, prywatnego przewodnika, posiłków i miejsca odbioru.</span>
            <Link className="btn" to={`/booking?type=custom&title=${encodeURIComponent(combo.title)}`}>Zarezerwuj tę kombinację →</Link>
            <Link className="btn btn--ghost-dark" to="/excursions">Wszystkie wycieczki</Link>
          </div>
        </div>
      </article>

      <section className="exc-day" id="sequence">
        <div className="exc-day__head">
          <span className="section-eyebrow">Proponowana kolejność</span>
          <h2 className="section-title">Jak płynie dzień</h2>
          <p className="section-lead">To najczystsza kolejność dla tej kombinacji. Godziny dopasowujemy do hotelu, pływów i pogody.</p>
        </div>
        <div className="exc-day__timeline">
          {combo.rhythm.map(([time, title, text]) => (
            <div className="exc-day__row" key={`${time}-${title}`}>
              <div className="exc-day__time">{time}</div>
              <div className="exc-day__what"><strong>{title}</strong><p>{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="exc-cta">
        <div className="exc-cta__bg"><ResponsiveImage src={heroImage} alt="" /></div>
        <div className="exc-cta__inner">
          <h2>Gotowi zarezerwować {combo.title}?</h2>
          <p>Podaj hotel, datę i liczbę osób. Potwierdzimy najlepszą godzinę, odbiór, przewodnika i finalną cenę kombinacji.</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg" to={`/booking?type=custom&title=${encodeURIComponent(combo.title)}`}>Napisz do nas →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Zaplanuj z AI</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
