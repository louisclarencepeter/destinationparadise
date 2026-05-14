import ResponsiveImage from '../ResponsiveImage.jsx';

export default function GallerySection() {
  const photos = [
    { src: '/assets/images/home/mizingani-waterfront.webp', caption: 'Nabrzeże Mizingani', className: 'gallery-tile gallery-tile--tall' },
    { src: '/assets/images/safaris/zebra-mare-and-foal.webp', caption: 'Zebry na safari', className: 'gallery-tile gallery-tile--tall' },
    { src: '/assets/images/excursions/dolphin-snorkeling.webp', caption: 'Snorkeling z delfinami', className: 'gallery-tile gallery-tile--wide' },
    { src: '/assets/images/safaris/lioness-and-cub-resting.webp', caption: 'Lwica z młodym', className: 'gallery-tile' },
    { src: '/assets/images/excursions/stone-town-old-fort.webp', caption: 'Stary Fort w Stone Town', className: 'gallery-tile' },
    { src: '/assets/images/safaris/rhino-on-plains.webp', caption: 'Nosorożec w Ngorongoro', className: 'gallery-tile' },
    { src: '/assets/images/excursions/safari-blue-sandbank.webp', caption: 'Ławica piasku Safari Blue', className: 'gallery-tile gallery-tile--tall' },
    { src: '/assets/images/safaris/crowned-cranes-in-grass.webp', caption: 'Żurawie koroniaste', className: 'gallery-tile gallery-tile--wide' },
    { src: '/assets/images/excursions/jozani-red-colobus.webp', caption: 'Gereza ruda w Jozani', className: 'gallery-tile' },
    { src: '/assets/images/safaris/wildebeest-grazing.webp', caption: 'Równiny migracji', className: 'gallery-tile' },
    { src: '/assets/images/excursions/spice-tour-nutmeg.webp', caption: 'Detale farmy przypraw', className: 'gallery-tile gallery-tile--wide' },
    { src: '/assets/images/safaris/male-lion-in-grass.webp', caption: 'Lew w Serengeti', className: 'gallery-tile' },
  ];

  return (
    <section className="gallery-section reveal" id="gallery">
      <div className="gallery-head">
        <span className="section-eyebrow">Z bliska</span>
        <h2 className="section-title">Chwile od brzegu po safari</h2>
        <p className="section-lead">Szersze spojrzenie na Zanzibar i Tanzanię: dhow, stare uliczki, lasy, farmy przypraw, ławice piasku i dzika przyroda kontynentu.</p>
      </div>
      <div className="gallery-strip">
        {photos.map((photo) => (
          <figure className={photo.className} key={photo.src}>
            <ResponsiveImage src={photo.src} alt="" loading="lazy" decoding="async" sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 320px" />
            <figcaption className="gallery-tile__caption">{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
