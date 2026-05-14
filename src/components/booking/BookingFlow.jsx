const steps = [
  {
    number: '01',
    title: 'Wyślij zapytanie',
    text: 'Wybierz pakiet, wycieczkę, safari, transfer albo trasę na miarę i podaj daty.',
  },
  {
    number: '02',
    title: 'Potwierdzamy szczegóły',
    text: 'Zespół sprawdza dostępność, pojazdy, transfery, przewodników, trasy i końcową cenę.',
  },
  {
    number: '03',
    title: 'Płacisz bezpiecznie',
    text: 'Gdy wszystko zaakceptujesz, wysyłamy bezpieczny link do płatności online.',
  },
];

export default function BookingFlow() {
  return (
    <section className="booking-flow" aria-label="Proces rezerwacji">
      {steps.map((step) => (
        <article key={step.number}>
          <span>{step.number}</span>
          <h2>{step.title}</h2>
          <p>{step.text}</p>
        </article>
      ))}
    </section>
  );
}
