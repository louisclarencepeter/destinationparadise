export default function GallerySection() {
  const photos = [
    { src: '/assets/images/home/mizingani-waterfront.webp', caption: 'Mizingani waterfront', className: 'gallery-tile gallery-tile--tall' },
    { src: '/assets/images/safaris/zebra-mare-and-foal.webp', caption: 'Zebra on safari', className: 'gallery-tile gallery-tile--tall' },
    { src: '/assets/images/excursions/dolphin-snorkeling.webp', caption: 'Dolphin snorkel', className: 'gallery-tile gallery-tile--wide' },
    { src: '/assets/images/safaris/lioness-and-cub-resting.webp', caption: 'Lioness and cub', className: 'gallery-tile' },
    { src: '/assets/images/excursions/stone-town-old-fort.webp', caption: 'Stone Town Old Fort', className: 'gallery-tile' },
    { src: '/assets/images/safaris/rhino-on-plains.webp', caption: 'Ngorongoro rhino', className: 'gallery-tile' },
    { src: '/assets/images/excursions/safari-blue-sandbank.webp', caption: 'Safari Blue sandbank', className: 'gallery-tile gallery-tile--tall' },
    { src: '/assets/images/safaris/crowned-cranes-in-grass.webp', caption: 'Crowned cranes', className: 'gallery-tile gallery-tile--wide' },
    { src: '/assets/images/excursions/jozani-red-colobus.webp', caption: 'Jozani red colobus', className: 'gallery-tile' },
    { src: '/assets/images/safaris/wildebeest-grazing.webp', caption: 'Migration plains', className: 'gallery-tile' },
    { src: '/assets/images/excursions/spice-tour-nutmeg.webp', caption: 'Spice farm detail', className: 'gallery-tile gallery-tile--wide' },
    { src: '/assets/images/safaris/male-lion-in-grass.webp', caption: 'Serengeti lion', className: 'gallery-tile' },
  ];

  return (
    <section className="gallery-section reveal" id="gallery">
      <div className="gallery-head">
        <span className="section-eyebrow">A Glimpse</span>
        <h2 className="section-title">Moments from shore to safari</h2>
        <p className="section-lead">A wider look at Zanzibar and Tanzania: dhows, old streets, forest, spice farms, sandbanks, and mainland wildlife.</p>
      </div>
      <div className="gallery-strip">
        {photos.map((photo) => (
          <figure className={photo.className} key={photo.src}>
            <img src={photo.src} alt="" loading="lazy" />
            <figcaption className="gallery-tile__caption">{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
