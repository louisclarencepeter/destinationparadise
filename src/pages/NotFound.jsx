import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';
import '../styles/homepage.css';

export default function NotFound() {
  usePageMeta({
    title: 'Page Not Found · Destination Paradise',
    description: "That page isn't on the map. Head back to the homepage and pick a route through Zanzibar and Tanzania.",
    noindex: true,
  });

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        background: 'var(--page-bg)',
      }}
    >
      <div style={{ maxWidth: 640, textAlign: 'center' }}>
        <span className="section-eyebrow">404</span>
        <h1 className="section-title" style={{ marginTop: '1rem' }}>Lost at sea</h1>
        <p className="section-lead" style={{ marginBottom: '2rem' }}>
          That page isn&apos;t on the map. Head back to the homepage and pick a route.
        </p>
        <Link className="btn" to="/">← Back to home</Link>
      </div>
    </main>
  );
}
