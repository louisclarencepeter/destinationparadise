import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import '../styles/homepage.css';

export default function NotFound() {
  const { t } = useTranslation('common');
  const pageRef = useRef(null);
  useRevealOnScroll(pageRef, '.reveal:not(.is-visible)', 1);

  usePageMeta({
    title: t('not_found.meta_title'),
    description: t('not_found.meta_description'),
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
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('not_found.eyebrow')}</span>
        <h1 className="section-title reveal" style={{ marginTop: '1rem', '--reveal-index': 1 }}>{t('not_found.title')}</h1>
        <p className="section-lead reveal" style={{ marginBottom: '2rem', '--reveal-index': 2 }}>
          {t('not_found.body')}
        </p>
        <Link className="btn reveal" to="/" style={{ '--reveal-index': 3 }}>{t('not_found.cta')}</Link>
      </div>
    </main>
  );
}
