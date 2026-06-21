import { useRef } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import '../styles/homepage.css';

export default function NotFound() {
  const pageRef = useRef(null);
  useRevealOnScroll(pageRef, '.reveal:not(.is-visible)', 1);

  usePageMeta({
    title: 'Page Not Found · Destination Paradise',
    description: "That page isn't on the map. Head back to the homepage and pick a route through Zanzibar and Tanzania.",
    noindex: true,
  });

  return (
    <main
      ref={pageRef}
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
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>404</span>
        <h1 className="section-title reveal" style={{ marginTop: '1rem', '--reveal-index': 1 }}>Lost at sea</h1>
        <p className="section-lead reveal" style={{ marginBottom: '2rem', '--reveal-index': 2 }}>
          That page isn&apos;t on the map. Head back to the homepage and pick a route.
        </p>
        <Link className="btn reveal" to="/" style={{ '--reveal-index': 3 }}>← Back to home</Link>
      </div>
    </main>
  );
}
