export default function TestimonialsSection() {
  return (
    <section className="testimonials reveal" id="reviews">
      <div className="testimonials__head">
        <span className="section-eyebrow">Głosy z wybrzeża</span>
        <h2 className="section-title">Co goście zabierają ze sobą</h2>
      </div>
      <div className="testimonials__grid">
        <figure className="tm">
          <div className="tm__mark">"</div>
          <blockquote className="tm__quote">Spacer przez mangrowce i najlepszy zachód słońca w życiu. Dziękujemy zespołowi: tyle ciepła i troski trudno opisać.</blockquote>
          <div className="tm__foot"><img className="tm__avatar" src="/assets/images/testimonials/isa.webp" alt="" width="100" height="100" loading="lazy" decoding="async" /><div><div className="tm__name">Isa Jua</div><div className="tm__trip">Mangrowce i zachód słońca</div></div><div className="tm__stars">★★★★★</div></div>
        </figure>
        <figure className="tm">
          <div className="tm__mark">"</div>
          <blockquote className="tm__quote">Nasz przewodnik był świetnie przygotowany, pogodny i bardzo przyjazny. Dhow był piękny, laguna niezapomniana. Zarezerwowaliśmy kolejną wycieczkę jeszcze przed wyjazdem.</blockquote>
          <div className="tm__foot"><img className="tm__avatar" src="/assets/images/testimonials/arturo.webp" alt="" width="100" height="100" loading="lazy" decoding="async" /><div><div className="tm__name">Arturo García</div><div className="tm__trip">Safari Blue Dhow</div></div><div className="tm__stars">★★★★★</div></div>
        </figure>
        <figure className="tm">
          <div className="tm__mark">"</div>
          <blockquote className="tm__quote">Wąchaliśmy każdą przyprawę, zadaliśmy chyba sto pytań, a zespół odpowiedział na wszystko z ogromnym zaangażowaniem. Najlepszy dzień naszej podróży.</blockquote>
          <div className="tm__foot"><img className="tm__avatar" src="/assets/images/testimonials/coleman.webp" alt="" width="100" height="100" loading="lazy" decoding="async" /><div><div className="tm__name">Coleman Reid</div><div className="tm__trip">Przyprawy i kultura</div></div><div className="tm__stars">★★★★★</div></div>
        </figure>
      </div>
    </section>
  );
}
