import { useTranslation } from 'react-i18next';

const TESTIMONIALS = [
  { key: 'isa', name: 'Isa Jua', avatar: '/assets/images/testimonials/isa.webp' },
  { key: 'arturo', name: 'Arturo García', avatar: '/assets/images/testimonials/arturo.webp' },
  { key: 'coleman', name: 'Coleman Reid', avatar: '/assets/images/testimonials/coleman.webp' },
];

export default function TestimonialsSection() {
  const { t } = useTranslation('home');
  return (
    <section className="testimonials" id="reviews">
      <div className="testimonials__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('testimonials.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('testimonials.title')}</h2>
      </div>
      <div className="testimonials__grid">
        {TESTIMONIALS.map((tm, i) => (
          <figure className="tm reveal" style={{ '--reveal-index': i }} key={tm.key}>
            <div className="tm__mark">"</div>
            <blockquote className="tm__quote">{t(`testimonials.quotes.${tm.key}.quote`)}</blockquote>
            <div className="tm__foot">
              <img className="tm__avatar" src={tm.avatar} alt="" width="100" height="100" loading="lazy" decoding="async" />
              <div>
                <div className="tm__name">{tm.name}</div>
                <div className="tm__trip">{t(`testimonials.quotes.${tm.key}.trip`)}</div>
              </div>
              <div className="tm__stars">★★★★★</div>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
