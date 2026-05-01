export default function GallerySection() {
  return (
    <section className="gallery-section reveal">
      <div className="gallery-head">
        <span className="section-eyebrow">A Glimpse</span>
        <h2 className="section-title">Moments from the shore</h2>
        <p className="section-lead">Real photos from recent trips. No stock, no filters — just the island as we found it.</p>
      </div>
      <div className="gallery-strip">
        <figure className="gallery-tile gallery-tile--tall"><img src="/assets/images/excursions/dream-dhow-sunset.jpeg" alt="" /><figcaption className="gallery-tile__caption">Dream Dhow sunset</figcaption></figure>
        <figure className="gallery-tile"><img src="/assets/images/excursions/stone-town-old-fort.jpg" alt="" /><figcaption className="gallery-tile__caption">Stone Town Old Fort</figcaption></figure>
        <figure className="gallery-tile gallery-tile--wide"><img src="/assets/images/excursions/dolphin-snorkeling.jpg" alt="" /><figcaption className="gallery-tile__caption">Dolphin snorkel</figcaption></figure>
        <figure className="gallery-tile"><img src="/assets/images/home/mizingani-waterfront.jpg" alt="" /><figcaption className="gallery-tile__caption">Mizingani morning</figcaption></figure>
        <figure className="gallery-tile gallery-tile--tall"><img src="/assets/images/excursions/safari-blue-sandbank.jpg" alt="" /><figcaption className="gallery-tile__caption">Safari Blue sandbank</figcaption></figure>
      </div>
    </section>
  );
}
