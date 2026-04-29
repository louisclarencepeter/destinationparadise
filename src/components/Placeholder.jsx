import { Link } from 'react-router-dom';
import '../styles/homepage.css';

export default function Placeholder({ title, eyebrow, lead }) {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', background: 'var(--dp-bg-1)' }}>
      <div style={{ maxWidth: 640, textAlign: 'center' }}>
        <span className="section-eyebrow">{eyebrow || 'Destination Paradise'}</span>
        <h1 className="section-title" style={{ marginTop: '1rem' }}>{title}</h1>
        <p className="section-lead" style={{ marginBottom: '2rem' }}>
          {lead || "This page is part of the rebuild and isn't designed yet. The homepage matches the Claude design 1:1 — request another design when you're ready and we'll port it the same way."}
        </p>
        <Link className="btn" to="/">← Back to home</Link>
      </div>
    </main>
  );
}
