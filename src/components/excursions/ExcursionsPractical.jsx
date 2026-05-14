import { EXCURSION_PRACTICAL } from '../../data/excursionsPageContent.js';

function Icon({ kind }) {
  if (kind === 'check') {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
  }
  if (kind === 'x') {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
  }
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}

export default function ExcursionsPractical() {
  return (
    <section className="exc-prac">
      <div className="exc-prac__grid">
        {EXCURSION_PRACTICAL.map((col) => (
          <div className="exc-prac__col" key={col.h}>
            <h4>{col.h}</h4>
            <ul>
              {col.items.map((it) => (
                <li key={it}><Icon kind={col.icon} />{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
