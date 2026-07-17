import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { CONTACT_INFO } from '../../constants/contactInfo.js';
import { arrayFromTranslation } from '../../utils/translationValues.js';

const AREA_KEYS = ['stone_town', 'north', 'north_east', 'pongwe', 'michamvi', 'jambiani', 'paje', 'south'];
const DEFAULT_AREA = 'stone_town';
const GUIDE_PARAM = 'guide';

const TRIP_IMAGES = '/assets/images/excursions/trips';
const EVENT_LINKS = {
  'sauti-busara': '/excursions/sauti-busara',
  ziff: '/excursions/ziff',
  'water-sports': '/excursions/water-sports-festival',
};
const AREA_IMAGES = {
  stone_town: 'forodhani-street-food',
  north: 'nungwi-coast',
  north_east: 'mnemba-snorkeling',
  pongwe: 'blue-lagoon-snorkeling',
  michamvi: 'the-rock-restaurant',
  jambiani: 'seaweed-cooperative',
  paje: 'kitesurfing-beach',
  south: 'kizimkazi-fishing-boat',
};

const MapArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export default function ExploreLocalGuide() {
  const { t } = useTranslation('explore');
  const { t: tBrand } = useTranslation('footer');
  const location = useLocation();
  const tabsRef = useRef(/** @type {(HTMLButtonElement | null)[]} */ ([]));
  const [activeArea, setActiveArea] = useState(() => {
    const requested = new URLSearchParams(location.search).get(GUIDE_PARAM);
    return AREA_KEYS.includes(requested) ? requested : DEFAULT_AREA;
  });

  const places = arrayFromTranslation(t(`local_guide.areas.${activeArea}.places`, { returnObjects: true }));
  const events = arrayFromTranslation(t('local_guide.events.items', { returnObjects: true }));
  const mapArea = t(`local_guide.areas.${activeArea}.map_label`);
  const areaImage = AREA_IMAGES[activeArea];
  const totalPlaces = useMemo(
    () => AREA_KEYS.reduce(
      (sum, area) => sum + arrayFromTranslation(t(`local_guide.areas.${area}.places`, { returnObjects: true })).length,
      0,
    ),
    [t],
  );

  const selectArea = (area) => {
    setActiveArea(area);
    // Mirror the selection into the URL without a router navigation: navigating
    // would re-run the layout's hash-scroll effect and jump the viewport.
    const params = new URLSearchParams(window.location.search);
    params.set(GUIDE_PARAM, area);
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params}${window.location.hash}`);
  };

  const handleTabKeyDown = (event, index) => {
    let nextIndex;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % AREA_KEYS.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + AREA_KEYS.length) % AREA_KEYS.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = AREA_KEYS.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    selectArea(AREA_KEYS[nextIndex]);
    tabsRef.current[nextIndex]?.focus();
  };

  return (
    <section className="local-guide" id="our-zanzibar-guide" aria-labelledby="local-guide-title">
      <div className="local-guide__inner">
        <header className="local-guide__head">
          <div className="local-guide__heading">
            <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('local_guide.eyebrow')}</span>
            <h2 className="local-guide__title reveal" id="local-guide-title" style={{ '--reveal-index': 1 }}>{t('local_guide.title')}</h2>
            <p className="local-guide__lead reveal" style={{ '--reveal-index': 2 }}>{t('local_guide.lead')}</p>
            <p className="local-guide__coverage reveal" style={{ '--reveal-index': 3 }}>
              {t('local_guide.coverage', { areas: AREA_KEYS.length, places: totalPlaces, events: events.length })}
            </p>
          </div>

          <aside className="local-guide__note reveal" style={{ '--reveal-index': 2 }}>
            <img src="/assets/brand/destination-paradise-logo-96.webp" alt="" width="52" height="52" loading="lazy" decoding="async" />
            <div>
              <p>{t('local_guide.note')}</p>
              <span>{t('local_guide.reviewed')}</span>
              <em>{tBrand('brand.typed_tagline')}</em>
            </div>
          </aside>
        </header>

        <label className="local-guide__mobile-select">
          <span>{t('local_guide.area_label')}</span>
          <select value={activeArea} onChange={(event) => selectArea(event.target.value)}>
            {AREA_KEYS.map((area) => (
              <option value={area} key={area}>{t(`local_guide.areas.${area}.label`)}</option>
            ))}
          </select>
        </label>

        <div className="local-guide__tabs" role="tablist" aria-label={t('local_guide.area_label')}>
          {AREA_KEYS.map((area, index) => {
            const selected = activeArea === area;
            return (
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`local-guide-panel-${area}`}
                id={`local-guide-tab-${area}`}
                className={selected ? 'is-active' : ''}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectArea(area)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                ref={(element) => { tabsRef.current[index] = element; }}
                key={area}
              >
                <strong>{t(`local_guide.areas.${area}.label`)}</strong>
                <span>{t(`local_guide.areas.${area}.hint`)}</span>
              </button>
            );
          })}
        </div>

        <div
          className="local-guide__body"
          role="tabpanel"
          id={`local-guide-panel-${activeArea}`}
          aria-labelledby={`local-guide-tab-${activeArea}`}
        >
          <figure className="local-guide__media" key={`media-${activeArea}`}>
            <img
              src={`${TRIP_IMAGES}/${areaImage}-600w.webp`}
              srcSet={`${TRIP_IMAGES}/${areaImage}-600w.webp 600w, ${TRIP_IMAGES}/${areaImage}.webp 1200w`}
              sizes="(max-width: 820px) 100vw, 420px"
              alt=""
              width="600"
              height="750"
              loading="lazy"
              decoding="async"
            />
            <span className="local-guide__media-badge">{t(`local_guide.areas.${activeArea}.label`)}</span>
            <figcaption>{mapArea} · Zanzibar</figcaption>
          </figure>

          <div className="local-guide__places" key={`places-${activeArea}`}>
            {places.map((place, index) => (
              <article className="local-guide__place" key={place.name}>
                <span className="local-guide__number">{String(index + 1).padStart(2, '0')}</span>
                <div className="local-guide__place-copy">
                  <span className="local-guide__occasion">{place.occasion}</span>
                  <h3>{place.name}</h3>
                  <p>{place.description}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${mapArea} Zanzibar`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t('local_guide.open_map')} <MapArrow />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>

        {events.length > 0 && (
          <div className="local-guide__events">
            <header className="local-guide__events-head">
              <span className="local-guide__events-label">{t('local_guide.events.label')}</span>
              <h3 className="local-guide__events-title">{t('local_guide.events.title')}</h3>
              <p className="local-guide__events-lead">{t('local_guide.events.lead')}</p>
            </header>
            <ol className="local-guide__events-list">
              {events.map((event) => (
                <li className="local-guide__event" key={event.id}>
                  <span className="local-guide__event-when">{event.when}</span>
                  <div className="local-guide__event-copy">
                    <h4>{event.name}</h4>
                    <span className="local-guide__event-where">{event.where}</span>
                    <p>{event.description}</p>
                    {EVENT_LINKS[event.id] ? (
                      <Link to={EVENT_LINKS[event.id]}>
                        {t('local_guide.events.details')} <MapArrow />
                      </Link>
                    ) : (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.where} Zanzibar`)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t('local_guide.open_map')} <MapArrow />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        <footer className="local-guide__footer">
          <div>
            <strong>{t('local_guide.footer_title')}</strong>
            <p>{t('local_guide.footer_text')}</p>
          </div>
          <a className="btn btn--accent" href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noreferrer">
            {t('local_guide.ask_us')}
          </a>
        </footer>
      </div>
    </section>
  );
}
