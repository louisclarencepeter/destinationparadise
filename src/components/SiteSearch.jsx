import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const SiteSearchDialog = lazy(() => import('./SiteSearchDialog.jsx'));

const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export function SearchButton({ className = '', onClick, label = 'Search' }) {
  const { t } = useTranslation('common');
  return (
    <button className={className} type="button" aria-label={t('search.button_aria')} onClick={onClick}>
      <SearchIcon />
      <span>{label}</span>
    </button>
  );
}

export default function SiteSearch({ open, onClose }) {
  // The search-only catalog namespaces are requested when the dialog mounts.
  // Keeping this shell mounted in the nav does not load them on every page.
  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <SiteSearchDialog onClose={onClose} />
    </Suspense>
  );
}
