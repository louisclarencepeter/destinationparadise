import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const MAX_RESULTS = 8;
const FALLBACK_POPULAR = [
  'Airport transfer',
  'Safari Blue',
  'Honeymoon package',
  'Serengeti',
  'Stone Town',
  'Paje',
];

const tokenize = (query) => query
  .toLowerCase()
  .trim()
  .split(/\s+/)
  .filter(Boolean);

const scoreResult = (item, terms) => {
  if (!terms.length) return 0;

  const title = item.title.toLowerCase();
  const category = item.category.toLowerCase();
  let score = 0;

  terms.forEach((term) => {
    if (title === term) score += 90;
    if (title.startsWith(term)) score += 45;
    if (title.includes(term)) score += 28;
    if (category.includes(term)) score += 18;
    if (item.searchText.includes(term)) score += 8;
  });

  if (terms.every((term) => item.searchText.includes(term))) score += 30;
  return score;
};

const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export function SearchButton({ className = '', onClick, label = 'Search' }) {
  return (
    <button className={className} type="button" aria-label="Search the website" onClick={onClick}>
      <SearchIcon />
      <span>{label}</span>
    </button>
  );
}

export default function SiteSearch({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState([]);
  const [popularSearches, setPopularSearches] = useState(FALLBACK_POPULAR);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    if (!searchIndex.length) return [];

    const terms = tokenize(query);
    if (!terms.length) {
      return searchIndex.filter((item) => (
        ['Transfers', 'Packages', 'Safaris', 'Excursions', 'Booking', 'Trip Planner'].includes(item.title)
      ));
    }

    return searchIndex
      .map((item) => ({ item, score: scoreResult(item, terms) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
      .slice(0, MAX_RESULTS)
      .map((entry) => entry.item);
  }, [query, searchIndex]);

  useEffect(() => {
    if (!open) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => inputRef.current?.focus(), 30);

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  useEffect(() => {
    if (!open || searchIndex.length) return undefined;

    let disposed = false;
    import('../data/siteSearchIndex.js').then((module) => {
      if (disposed) return;
      setSearchIndex(module.SITE_SEARCH_INDEX || []);
      setPopularSearches(module.SITE_SEARCH_POPULAR || FALLBACK_POPULAR);
    });

    return () => {
      disposed = true;
    };
  }, [open, searchIndex.length]);

  if (!open) return null;

  return (
    <div className="site-search" role="dialog" aria-modal="true" aria-label="Search the website">
      <button className="site-search__backdrop" type="button" aria-label="Close search" onClick={onClose} />
      <div className="site-search__panel">
        <div className="site-search__field">
          <SearchIcon size={22} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder="Search safaris, transfers, packages, Stone Town..."
            aria-label="Search query"
          />
          <button type="button" className="site-search__close" onClick={onClose}>Close</button>
        </div>

        {!query.trim() && (
          <div className="site-search__chips" aria-label="Popular searches">
            {popularSearches.map((term) => (
              <button type="button" key={term} onClick={() => setQuery(term)}>{term}</button>
            ))}
          </div>
        )}

        <div className="site-search__results" role="list">
          {!searchIndex.length && (
            <div className="site-search__loading">Preparing the site index...</div>
          )}

          {results.map((item) => (
            <Link className="site-search__result" to={item.to} key={item.id} onClick={onClose} role="listitem">
              <span className="site-search__result-main">
                <span className="site-search__category">{item.category}</span>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>
              <ArrowIcon />
            </Link>
          ))}

          {query.trim() && results.length === 0 && (
            <div className="site-search__empty">
              <strong>No exact match yet.</strong>
              <span>Try a destination, activity, package style, safari park, transfer route, or send us a custom request.</span>
              <Link className="btn" to="/trip-planner" onClick={onClose}>Open trip planner</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
