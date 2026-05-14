export default function SafariIntro() {
  return (
    <section className="saf-intro reveal">
      <div className="saf-intro__grid">
        <div className="saf-intro__copy">
          <span className="section-eyebrow">Nasze podejście</span>
          <h2 className="section-title">Przewodnicy z Tanzanii, którzy znają bush i wyspy.</h2>
          <p className="section-lead">
            Prowadzimy północny szlak, czyli Serengeti, Ngorongoro i Tarangire, z bush flightami, żeby więcej czasu zostało na game drive, a mniej na długie przejazdy. Możesz dodać kilka dni na wybrzeżu Zanzibaru albo zostać przy samym safari. Każdy camp wybieramy ręcznie, a każdy przewodnik ma certyfikat Silver-level lub wyższy.
          </p>
        </div>
        <ul className="saf-intro__bullets">
          <li>
            <span className="saf-intro__num">01</span>
            <div>
              <strong>Małe samochody</strong>
              <p>Maksymalnie 4 gości w Land Cruiserze, każde miejsce przy oknie. Bez minibusów.</p>
            </div>
          </li>
          <li>
            <span className="saf-intro__num">02</span>
            <div>
              <strong>Bush flights</strong>
              <p>Omijasz 8-godzinną jazdę. Cessny łączą parki często w mniej niż godzinę.</p>
            </div>
          </li>
          <li>
            <span className="saf-intro__num">03</span>
            <div>
              <strong>Opłaty ochronne w cenie</strong>
              <p>Opłaty parkowe, wynagrodzenie rangerów i lokalne opłaty ochronne są uwzględnione od razu.</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
