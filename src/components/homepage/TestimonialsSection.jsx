export default function TestimonialsSection() {
  return (
    <section className="testimonials reveal" id="reviews">
      <div className="testimonials__head">
        <span className="section-eyebrow">Voices from the Shore</span>
        <h2 className="section-title">What guests take home</h2>
      </div>
      <div className="testimonials__grid">
        <figure className="tm">
          <div className="tm__mark">"</div>
          <blockquote className="tm__quote">You can walk the mangroves and enjoy the best sunset ever. Thanks to the team — the warmth and care were unreal.</blockquote>
          <div className="tm__foot"><img className="tm__avatar" src="/assets/images/testimonials/isa.jpg" alt="" /><div><div className="tm__name">Isa Jua</div><div className="tm__trip">Mangroves &amp; Sunset</div></div><div className="tm__stars">★★★★★</div></div>
        </figure>
        <figure className="tm">
          <div className="tm__mark">"</div>
          <blockquote className="tm__quote">Our guide was knowledgeable, upbeat and friendly. The dhow was beautiful, the lagoon unforgettable. Booked again before leaving.</blockquote>
          <div className="tm__foot"><img className="tm__avatar" src="/assets/images/testimonials/arturo.jpg" alt="" /><div><div className="tm__name">Arturo García</div><div className="tm__trip">Safari Blue Dhow</div></div><div className="tm__stars">★★★★★</div></div>
        </figure>
        <figure className="tm">
          <div className="tm__mark">"</div>
          <blockquote className="tm__quote">We smelled every spice, asked a hundred questions, and the team went above and beyond to answer them all. Best day of our trip.</blockquote>
          <div className="tm__foot"><img className="tm__avatar" src="/assets/images/testimonials/coleman.jpg" alt="" /><div><div className="tm__name">Coleman Reid</div><div className="tm__trip">Spice &amp; Culture Tour</div></div><div className="tm__stars">★★★★★</div></div>
        </figure>
      </div>
    </section>
  );
}
