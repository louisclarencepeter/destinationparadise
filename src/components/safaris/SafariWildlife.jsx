import { WILDLIFE_CATEGORIES, safariImg } from '../../data/safarisPageContent.js';

export default function SafariWildlife() {
  return (
    <section className="wildlife reveal" id="wildlife">
      <header className="wildlife__head">
        <span className="section-eyebrow">From our last season</span>
        <h2 className="section-title">What you might see.</h2>
        <p className="section-lead">Real photos from real game drives, taken by our guides this past season — Ngorongoro and Serengeti, mostly. No stock library.</p>
      </header>

      {WILDLIFE_CATEGORIES.map((category) => (
        <div className="wildlife__cat" key={category.title}>
          <h3 className="wildlife__cat-title">
            <span>{category.title}</span>
            <em>{category.sub}</em>
          </h3>
          <div className={`wildlife__row wildlife__row--${category.rowMod}`}>
            {category.tiles.map((tile) => (
              <figure
                className={`wildlife__tile${tile.mod ? ` wildlife__tile--${tile.mod}` : ''}`}
                key={tile.src}
              >
                <img src={safariImg(tile.src)} alt={tile.alt} loading="lazy" />
                <figcaption>{tile.cap}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
