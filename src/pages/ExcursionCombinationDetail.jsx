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
    if (combo) document.title = `${combo.title} · Excursion Combination · Destination Paradise`;
  }, [combo]);

  if (!combo) {
    return (
      <main className="excursions-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">Excursion combinations</span>
            <h1 className="section-title">Combination not found</h1>
            <p className="section-lead">That combination is not in our current list. Browse all excursions below.</p>
            <Link className="btn" to="/excursions" style={{ marginTop: '1.5rem' }}>Back to excursions →</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="excursions-page exc-detail">
      <nav className="exc-detail__crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">→</span>
        <Link to="/excursions">Excursions</Link>
        <span aria-hidden="true">→</span>
        <span>{combo.title}</span>
      </nav>

      <article id={combo.id} className="exc-block exc-block--detail">
        <div className="exc-block__img">
          <ResponsiveImage src={heroImage} alt="" />
          <span className="exc-block__cat">Combination</span>
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow">{combo.combo.join(' + ')}</span>
          <h1 className="exc-block__title">{combo.title}</h1>
          <p className="exc-block__desc">{combo.desc}</p>
          <dl className="exc-block__facts">
            <div><dt>Length</dt><dd>{combo.length}<small>Sequenced for one trip</small></dd></div>
            <div><dt>Stops</dt><dd>{combo.combo.length}<small>{combo.combo.join(' + ')}</small></dd></div>
            <div><dt>Style</dt><dd>Private plan<small>Best as a tailored day</small></dd></div>
            <div><dt>Quote</dt><dd>24h<small>Final timing and price</small></dd></div>
          </dl>
          <div className="exc-block__cols">
            <div className="exc-block__col">
              <h4>Included experiences</h4>
              <ul>{combo.combo.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="exc-block__col">
              <h4>Ideal for</h4>
              <ul>{combo.idealFor.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          <div className="exc-block__cols">
            <div className="exc-block__col">
              <h4>Open each stop</h4>
              <ul>
                {excursions.map((item) => (
                  <li key={item.id}><Link to={`/excursions/${item.id}`}>{item.title}</Link></li>
                ))}
              </ul>
            </div>
            <div className="exc-block__col">
              <h4>Planning note</h4>
              <ul>
                <li>Pickup time depends on hotel location, tides, and daylight.</li>
                <li>Some combinations work best privately so the pacing stays comfortable.</li>
                <li>We confirm the final route, meals, guide, and transfers before booking.</li>
              </ul>
            </div>
          </div>
          <div className="exc-block__actions">
            {minPrice > 0 ? (
              <span className="exc-block__price">${minPrice}<small>estimated from listed stops</small></span>
            ) : (
              <span className="exc-block__price-note">Price on request</span>
            )}
            <span className="exc-block__price-note">Final combination price depends on transfers, private guide, meals, and pickup area.</span>
            <Link className="btn" to={`/booking?type=custom&title=${encodeURIComponent(combo.title)}`}>Book this combination →</Link>
            <Link className="btn btn--ghost-dark" to="/excursions">All excursions</Link>
          </div>
        </div>
      </article>

      <section className="exc-day" id="sequence">
        <div className="exc-day__head">
          <span className="section-eyebrow">Suggested sequence</span>
          <h2 className="section-title">How the day flows</h2>
          <p className="section-lead">This is the cleanest order for the combination. We adjust the timing around your hotel, tide, and weather.</p>
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
          <h2>Ready to book {combo.title}?</h2>
          <p>Tell us your hotel, date, and group size. We’ll confirm the best timing, pickup, guide, and final combination price.</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg" to={`/booking?type=custom&title=${encodeURIComponent(combo.title)}`}>Get in touch →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Plan with AI</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
