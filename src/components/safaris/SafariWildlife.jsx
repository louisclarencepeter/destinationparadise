import { useTranslation } from 'react-i18next';
import { WILDLIFE_CATEGORIES, safariImg } from '../../data/safarisPageContent.js';

export default function SafariWildlife() {
  const { t } = useTranslation('safaris');
  return (
    <section className="wildlife reveal" id="wildlife">
      <header className="wildlife__head">
        <span className="section-eyebrow">{t('wildlife.eyebrow')}</span>
        <h2 className="section-title">{t('wildlife.title')}</h2>
        <p className="section-lead">{t('wildlife.lead')}</p>
      </header>

      {WILDLIFE_CATEGORIES.map((category) => (
        <div className="wildlife__cat" key={category.rowMod}>
          <h3 className="wildlife__cat-title">
            <span>{t(`wildlife.categories.${category.rowMod}.title`, category.title)}</span>
            <em>{t(`wildlife.categories.${category.rowMod}.sub`, category.sub)}</em>
          </h3>
          <div className={`wildlife__row wildlife__row--${category.rowMod}`}>
            {category.tiles.map((tile) => (
              <figure
                className={`wildlife__tile${tile.mod ? ` wildlife__tile--${tile.mod}` : ''}`}
                key={tile.src}
              >
                <img src={safariImg(tile.src)} alt={t(`wildlife.categories.${category.rowMod}.tiles.${tile.src}.alt`, tile.alt)} loading="lazy" />
                <figcaption>{t(`wildlife.categories.${category.rowMod}.tiles.${tile.src}.cap`, tile.cap)}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
