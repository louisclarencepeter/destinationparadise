const steps = [
  {
    number: '01',
    title: 'Send the request',
    text: 'Choose a package, excursion, safari, transfer, or custom route and share your dates.',
  },
  {
    number: '02',
    title: 'We confirm it',
    text: 'Our team checks availability, vehicles, transfers, guides, routes, and final pricing.',
  },
  {
    number: '03',
    title: 'Pay securely',
    text: 'When everything is approved, we send a secure online payment link.',
  },
];

export default function BookingFlow() {
  return (
    <section className="booking-flow" aria-label="Booking process">
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
