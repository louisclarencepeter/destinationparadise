import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';

const PHOTOS = [
  { src: '/assets/images/home/mizingani-waterfront.webp', key: 'mizingani-waterfront', className: 'gallery-tile gallery-tile--tall' },
  { src: '/assets/images/safaris/zebra-mare-and-foal.webp', key: 'zebra-mare-and-foal', className: 'gallery-tile gallery-tile--tall' },
  { src: '/assets/images/excursions/dolphin-snorkeling.webp', key: 'dolphin-snorkeling', className: 'gallery-tile gallery-tile--wide' },
  { src: '/assets/images/safaris/lioness-and-cub-resting.webp', key: 'lioness-and-cub-resting', className: 'gallery-tile' },
  { src: '/assets/images/excursions/stone-town-old-fort.webp', key: 'stone-town-old-fort', className: 'gallery-tile' },
  { src: '/assets/images/safaris/rhino-on-plains.webp', key: 'rhino-on-plains', className: 'gallery-tile' },
  { src: '/assets/images/excursions/safari-blue-sandbank.webp', key: 'safari-blue-sandbank', className: 'gallery-tile gallery-tile--tall' },
  { src: '/assets/images/safaris/crowned-cranes-in-grass.webp', key: 'crowned-cranes-in-grass', className: 'gallery-tile gallery-tile--wide' },
  { src: '/assets/images/excursions/jozani-red-colobus.webp', key: 'jozani-red-colobus', className: 'gallery-tile' },
  { src: '/assets/images/safaris/wildebeest-grazing.webp', key: 'wildebeest-grazing', className: 'gallery-tile' },
  { src: '/assets/images/excursions/spice-tour-nutmeg.webp', key: 'spice-tour-nutmeg', className: 'gallery-tile gallery-tile--wide' },
  { src: '/assets/images/safaris/male-lion-in-grass.webp', key: 'male-lion-in-grass', className: 'gallery-tile' },
];

export default function GallerySection() {
  const { t } = useTranslation('home');

  return (
    <section className="gallery-section" id="gallery">
      <div className="gallery-head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('gallery.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('gallery.title')}</h2>
        <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('gallery.lead')}</p>
      </div>
      <div className="gallery-strip">
        {PHOTOS.map((photo, i) => (
          <figure className={`${photo.className} reveal`} style={{ '--reveal-index': i }} key={photo.src}>
            <ResponsiveImage src={photo.src} alt="" loading="lazy" decoding="async" sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 320px" />
            <figcaption className="gallery-tile__caption">{t(`gallery.captions.${photo.key}`)}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
