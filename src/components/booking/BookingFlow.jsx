import { useTranslation } from 'react-i18next';

export default function BookingFlow() {
  const { t } = useTranslation('booking');
  const steps = t('flow.steps', {
    returnObjects: true,
    defaultValue: [
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
    ],
  });

  return (
    <section className="booking-flow" aria-label={t('flow.aria', { defaultValue: 'Booking process' })}>
      {Array.isArray(steps) && steps.map((step, i) => (
        <article className="reveal dp-lift" key={step.number} style={{ '--reveal-index': i }}>
          <span>{step.number}</span>
          <h2>{step.title}</h2>
          <p>{step.text}</p>
        </article>
      ))}
    </section>
  );
}
