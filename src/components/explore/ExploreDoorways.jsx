import {
  MIN_EXPLORE_EXCURSION_PRICE,
  MIN_PACKAGE_PRICE,
  MIN_SAFARI_PRICE,
} from '../../data/explorePageContent.js';

export default function ExploreDoorways() {
  return (
    <section className="saf-steps reveal">
      <header className="saf-steps__head">
        <span className="section-eyebrow">Szybki przewodnik</span>
        <h2 className="section-title">Wybierz właściwe wejście.</h2>
      </header>
      <div className="saf-steps__grid">
        <article className="saf-step"><span>01</span><h3>Pakiety</h3><p>Najlepsze, gdy chcesz jedną wycenę i całą podróż spiętą w plan. Od ${MIN_PACKAGE_PRICE.toLocaleString()} za osobę.</p></article>
        <article className="saf-step"><span>02</span><h3>Wycieczki</h3><p>Najlepsze, gdy hotel jest już wybrany, a potrzebujesz dni z atrakcjami. Od ${MIN_EXPLORE_EXCURSION_PRICE} za osobę.</p></article>
        <article className="saf-step"><span>03</span><h3>Safari</h3><p>Najlepsze, gdy dzika Tanzania ma być głównym punktem podróży. Główne trasy od ${MIN_SAFARI_PRICE.toLocaleString()} za osobę.</p></article>
      </div>
    </section>
  );
}
