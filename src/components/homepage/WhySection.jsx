export default function WhySection() {
  return (
    <section className="why reveal" id="why">
      <div className="why__head">
        <span className="section-eyebrow">Dlaczego Destination Paradise</span>
        <h2 className="section-title">Lokalnie, elastycznie i naprawdę po Twojemu</h2>
      </div>
      <div className="why__grid">
        <article className="why-card">
          <span className="why-card__num">01</span>
          <span className="why-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </span>
          <h3 className="why-card__title">Lokalna wiedza</h3>
          <p className="why-card__text">Pracujemy z ludźmi, którzy znają Zanzibar i Tanzanię z codziennego życia, nie tylko z folderów. Podpowiedzą, gdzie dobrze zjeść, kiedy ruszyć na rafę i jak ułożyć dzień, żeby miał sens w realnych warunkach.</p>
        </article>
        <article className="why-card">
          <span className="why-card__num">02</span>
          <span className="why-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 4 13c0-4 3-9 9-11 0 6 0 10-2 14-1 2-3 4-5 5z" transform="translate(2 0)" />
              <path d="M2 22c4-4 7-6 12-8" />
            </svg>
          </span>
          <h3 className="why-card__title">Grupowo albo prywatnie</h3>
          <p className="why-card__text">Wspólne dni na dhow z nowymi znajomymi albo prywatna wycieczka, pakiet lub safari ułożone tylko dla Was. Ta sama troska, Twoje tempo.</p>
        </article>
        <article className="why-card">
          <span className="why-card__num">03</span>
          <span className="why-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.2.6-.6.5-1.1z" /></svg>
          </span>
          <h3 className="why-card__title">Wszystko dopięte</h3>
          <p className="why-card__text">Odbiór z lotniska, transfery hotelowe, diety, zmiany w ostatniej chwili. Napisz do nas, a my się tym zajmiemy.</p>
        </article>
      </div>
    </section>
  );
}
