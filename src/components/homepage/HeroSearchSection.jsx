import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const dateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HeroSearchSection({ handleHeroSearch }) {
  const { t } = useTranslation('home');
  const popularPackages = t('hero.search.popular_packages', { returnObjects: true });
  const tanzaniaSafaris = t('hero.search.tanzania_safaris', { returnObjects: true });
  const zanzibarExcursions = t('hero.search.zanzibar_excursions', { returnObjects: true });
  const guestsOptions = t('hero.search.guests_options', { returnObjects: true });
  const guestsDefault = t('hero.search.guests_default');
  const anyOption = t('hero.search.any_option');

  const defaultTripDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return dateInputValue(date);
  }, []);
  const earliestTripDate = useMemo(() => dateInputValue(new Date()), []);

  return (
    <section className="hero-search-section reveal" id="hero-search">
      <form className="hero__search" onSubmit={handleHeroSearch}>
        <div className="hero__search-field">
          <label htmlFor="hero-experience">{t('hero.search.experience_label')}</label>
          <select id="hero-experience" name="excursion" defaultValue={anyOption} autoComplete="off">
            <option>{anyOption}</option>
            <optgroup label={t('hero.search.popular_packages_group')}>
              {popularPackages.map((opt) => <option key={opt}>{opt}</option>)}
            </optgroup>
            <optgroup label={t('hero.search.tanzania_safaris_group')}>
              {tanzaniaSafaris.map((opt) => <option key={opt}>{opt}</option>)}
            </optgroup>
            <optgroup label={t('hero.search.zanzibar_excursions_group')}>
              {zanzibarExcursions.map((opt) => <option key={opt}>{opt}</option>)}
            </optgroup>
          </select>
        </div>
        <div className="hero__search-field">
          <label htmlFor="hero-date">{t('hero.search.date_label')}</label>
          <input id="hero-date" type="date" name="date" defaultValue={defaultTripDate} min={earliestTripDate} autoComplete="off" />
        </div>
        <div className="hero__search-field">
          <label htmlFor="hero-guests">{t('hero.search.guests_label')}</label>
          <select id="hero-guests" name="guests" defaultValue={guestsDefault} autoComplete="off">
            {guestsOptions.map((opt) => <option key={opt}>{opt}</option>)}
          </select>
        </div>
        <button className="hero__search-submit" type="submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          {t('hero.search.submit')}
        </button>
      </form>
    </section>
  );
}
