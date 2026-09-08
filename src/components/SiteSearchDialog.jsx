import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

const MAX_RESULTS = 8;
const EMPTY_RESULTS = [];
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

export default function SiteSearchDialog({ onClose }) {
  const { t, i18n, ready } = useTranslation(['common', 'catalog', 'packages', 'transfers', 'excursions', 'safaris']);
  const [query, setQuery] = useState('');
  const catalogLanguage = ready ? i18n.resolvedLanguage : '';
  const [searchData, setSearchData] = useState({
    language: '',
    index: /** @type {any[]} */ ([]),
    popular: /** @type {string[]} */ ([]),
  });
  const searchIndex = catalogLanguage && searchData.language === catalogLanguage ? searchData.index : EMPTY_RESULTS;
  const popularSearches = catalogLanguage && searchData.language === catalogLanguage ? searchData.popular : EMPTY_RESULTS;
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const restoreFocusRef = useRef(/** @type {Element | null} */ (null));

  const results = useMemo(() => {
    if (!searchIndex.length) return [];

    const terms = tokenize(query);
    if (!terms.length) {
      return searchIndex.filter((item) => item.featured);
    }

    return searchIndex
      .map((item) => ({ item, score: scoreResult(item, terms) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
      .slice(0, MAX_RESULTS)
      .map((entry) => entry.item);
  }, [query, searchIndex]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    restoreFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 30);

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        panelRef.current?.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])') || [],
      ).filter((element) => element instanceof HTMLElement && element.offsetParent !== null);

      if (!focusable.length) return;
      const first = /** @type {HTMLElement} */ (focusable[0]);
      const last = /** @type {HTMLElement} */ (focusable[focusable.length - 1]);

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener('keydown', handleKey);
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus();
      }
    };
  }, [onClose]);

  useEffect(() => {
    if (!catalogLanguage) return undefined;

    let disposed = false;
    import('../data/siteSearchIndex.js').then((module) => {
      if (disposed) return;
      setSearchData({
        language: catalogLanguage,
        index: module.buildSiteSearchIndex(t),
        popular: module.buildSiteSearchPopular(t),
      });
    });

    return () => {
      disposed = true;
    };
  }, [t, catalogLanguage]);

  return (
    <div className="site-search" role="dialog" aria-modal="true" aria-label={t('search.dialog_label')}>
      <button className="site-search__backdrop" type="button" aria-label={t('search.close_backdrop')} onClick={onClose} />
      <div className="site-search__panel" ref={panelRef}>
        <div className="site-search__field">
          <SearchIcon size={22} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder={t('search.placeholder')}
            aria-label={t('search.query_label')}
          />
          {query && (
            <button
              type="button"
              className="site-search__clear"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              {t('search.clear')}
            </button>
          )}
          <button type="button" className="site-search__close" onClick={onClose}>{t('search.close')}</button>
        </div>

        {!query.trim() && (
          <div className="site-search__chips" aria-label={t('search.popular_label')}>
            {popularSearches.map((term) => (
              <button type="button" key={term} onClick={() => setQuery(term)}>{term}</button>
            ))}
          </div>
        )}

        <div className="site-search__results" aria-label={t('search.results_label')}>
          <div className="visually-hidden" role="status" aria-live="polite">
            {query.trim()
              ? t('search.results_count', { count: results.length, defaultValue: `${results.length} search results` })
              : ''}
          </div>
          {!searchIndex.length && (
            <div className="site-search__loading">{t('search.loading')}</div>
          )}

          {results.map((item) => (
            <Link className="site-search__result" to={item.to} key={item.id} onClick={onClose}>
              <span className="site-search__result-main">
                <span className="site-search__category">{item.category}</span>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>
              <ArrowIcon />
            </Link>
          ))}

          {searchIndex.length > 0 && query.trim() && results.length === 0 && (
            <div className="site-search__empty">
              <strong>{t('search.empty_title')}</strong>
              <span>{t('search.empty_body')}</span>
              <Link className="btn" to="/trip-planner" onClick={onClose}>{t('search.open_planner')}</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
