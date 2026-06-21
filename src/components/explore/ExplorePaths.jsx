import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ExplorePaths({ paths }) {
  const { t } = useTranslation('explore');
  return (
    <section className="saf-compare" id="paths">
      <header className="saf-compare__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('paths.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('paths.title')}</h2>
        <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('paths.lead')}</p>
      </header>
      <div className="explore-path-grid">
        {paths.map((path, index) => (
          <Link className="explore-path-card reveal" style={{ '--reveal-index': index }} to={path.to} key={path.title}>
            <img src={path.image} alt="" loading="lazy" />
            <div>
              <span>{path.eyebrow}</span>
              <h3>{path.title}</h3>
              <p>{path.text}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
