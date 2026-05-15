import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ExplorePaths({ paths }) {
  const { t } = useTranslation('explore');
  return (
    <section className="saf-compare reveal" id="paths">
      <header className="saf-compare__head">
        <span className="section-eyebrow">{t('paths.eyebrow')}</span>
        <h2 className="section-title">{t('paths.title')}</h2>
        <p className="section-lead">{t('paths.lead')}</p>
      </header>
      <div className="explore-path-grid">
        {paths.map((path) => (
          <Link className="explore-path-card" to={path.to} key={path.title}>
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
