import ResponsiveImage from '../ResponsiveImage.jsx';
import { ABOUT_STORY_IMAGE, aboutTimeline } from '../../data/aboutPageData.js';

export default function AboutStory() {
  return (
    <section className="ab-story reveal" id="story">
      <div className="ab-story__head">
        <div>
          <span className="ab-story__eyebrow">Nasza historia</span>
          <h2 className="ab-story__title">Zaczęło się od <em>marzenia</em>, daleko od domu.</h2>
        </div>
        <div className="ab-story__lead">
          <p>Destination Paradise zaczęło się jako pomysł na kartce i cicha obietnica złożona miejscu, które dało tak wiele. Lata temu, podczas pracy w hotelu na wschodnim wybrzeżu Zanzibaru, pojawiła się pierwsza wizja. Potrzebowała wielu zakrętów i wielu lat, zanim mogła stać się czymś prawdziwym.</p>
          <p>To, co widzisz dzisiaj, jest wynikiem cierpliwości, rodziny, straty, nauki i decyzji, by nie puścić tej idei. Jesteśmy młodą firmą z długą historią za sobą — i dopiero zaczynamy.</p>
        </div>
      </div>

      <div className="ab-timeline">
        <div className="ab-timeline__rail">
          {aboutTimeline.map((item, index) => (
            <div className="ab-tl-item reveal" key={item.year} style={{ transitionDelay: `${index * 80}ms` }}>
              <div className="ab-tl-item__year">{item.year}</div>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
        <div className="ab-timeline__photo-wrap">
          <div className="ab-timeline__photo">
            <ResponsiveImage src={ABOUT_STORY_IMAGE} alt="Tradycyjna dhow na wybrzeżu Zanzibaru" loading="lazy" />
            <div className="ab-timeline__caption">Od pomysłu na kartce do prawdziwej firmy — Zanzibar, gdzie wszystko się zaczęło.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
