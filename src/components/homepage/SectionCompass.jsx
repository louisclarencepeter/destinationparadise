import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

const SECTION_ITEMS = [
  { id: 'hero', labelKey: 'hero' },
  { id: 'excursions', labelKey: 'excursions' },
  { id: 'safaris', labelKey: 'safaris' },
  { id: 'packages', labelKey: 'packages' },
  { id: 'transfers', labelKey: 'transfers' },
  { id: 'planner', labelKey: 'planner' },
  { id: 'why', labelKey: 'why' },
  { id: 'map', labelKey: 'map' },
  { id: 'weather', labelKey: 'weather' },
  { id: 'gallery', labelKey: 'gallery' },
  { id: 'reviews', labelKey: 'reviews' },
  { id: 'about-intro', labelKey: 'about' },
  { id: 'contact', labelKey: 'contact' },
  { id: 'newsletter', labelKey: 'newsletter' },
];

/**
 * @param {string} id
 * @returns {HTMLElement | null}
 */
function findSectionAnchor(id) {
  const directTarget = document.getElementById(id);
  if (directTarget) return directTarget;

  const deferredTarget = document.querySelector(`[data-deferred-anchor="${id}"]`);
  return deferredTarget instanceof HTMLElement ? deferredTarget : null;
}

/** @param {string} id */
function focusSectionWhenReady(id) {
  let frameId = 0;
  let attempts = 0;

  const focusTarget = () => {
    const anchor = findSectionAnchor(id);
    const headingNode = anchor?.querySelector('h1, h2');
    const heading = headingNode instanceof HTMLElement ? headingNode : null;
    const target = heading || (attempts >= 90 ? anchor : null);

    if (target) {
      const hadTabIndex = target.hasAttribute('tabindex');

      if (!hadTabIndex) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });

      if (!hadTabIndex) {
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
      return;
    }

    attempts += 1;
    if (attempts < 180) frameId = window.requestAnimationFrame(focusTarget);
  };

  frameId = window.requestAnimationFrame(focusTarget);
  return () => window.cancelAnimationFrame(frameId);
}

export default function SectionCompass() {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const compassRef = useRef(/** @type {HTMLElement | null} */ (null));
  const [activeId, setActiveId] = useState(SECTION_ITEMS[0].id);
  const keyboardFocusCleanupRef = useRef(/** @type {null | (() => void)} */ (null));

  const updatePosition = useCallback(() => {
    const doc = document.documentElement;
    const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;

    compassRef.current?.style.setProperty('--section-compass-progress', `${progress * 100}%`);

    const navHeight = Number.parseFloat(
      window.getComputedStyle(doc).getPropertyValue('--nav-height'),
    ) || 66;
    const readingLine = window.scrollY + navHeight + Math.min(window.innerHeight * 0.32, 280);
    let nextActiveId = SECTION_ITEMS[0].id;

    SECTION_ITEMS.forEach((item) => {
      const anchor = findSectionAnchor(item.id);
      if (!anchor) return;

      const anchorTop = anchor.getBoundingClientRect().top + window.scrollY;
      if (anchorTop <= readingLine) nextActiveId = item.id;
    });

    if (maxScroll > 0 && window.scrollY >= maxScroll - 4) {
      nextActiveId = SECTION_ITEMS[SECTION_ITEMS.length - 1].id;
    }

    setActiveId((current) => (current === nextActiveId ? current : nextActiveId));
  }, []);

  useEffect(() => {
    let frameId = 0;
    const scheduleUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updatePosition();
      });
    };

    updatePosition();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(scheduleUpdate);
    if (resizeObserver) resizeObserver.observe(document.body);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [updatePosition]);

  useEffect(() => () => {
    keyboardFocusCleanupRef.current?.();
  }, []);

  const handleLinkClick = (event, id) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    keyboardFocusCleanupRef.current?.();
    navigate({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: `#${id}`,
    });


    // Pointer activation closes the temporary label panel. For keyboard
    // activation, move focus to the destination once it has mounted.
    if (event.detail !== 0) {
      if (event.currentTarget instanceof HTMLElement) event.currentTarget.blur();
      return;
    }

    keyboardFocusCleanupRef.current = focusSectionWhenReady(id);
  };

  return (
    <nav
      className="section-compass"
      aria-label={t('section_nav.aria')}
      ref={compassRef}
    >
      <div className="section-compass__panel">
        <span className="section-compass__track" aria-hidden="true">
          <span className="section-compass__progress" />
          <span className="section-compass__progress-head" />
        </span>

        <ol className="section-compass__list">
          {SECTION_ITEMS.map((item, index) => {
            const label = t(`section_nav.items.${item.labelKey}`);
            const isActive = activeId === item.id;

            return (
              <li className="section-compass__item" key={item.id}>
                <a
                  className="section-compass__link"
                  href={`#${item.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  aria-label={t('section_nav.item_aria', {
                    label,
                    current: index + 1,
                    total: SECTION_ITEMS.length,
                  })}
                  onClick={(event) => handleLinkClick(event, item.id)}
                >
                  <span className="section-compass__dot" aria-hidden="true" />
                  <span className="section-compass__number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="section-compass__label">{label}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
