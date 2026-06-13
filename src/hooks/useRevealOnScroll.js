import { useEffect } from 'react';

/**
 * @param {React.RefObject<Element | null>} rootRef
 * @param {string} [selector]
 * @param {unknown} [refreshKey]
 * @param {number} [threshold]
 */
export function useRevealOnScroll(rootRef, selector = '.reveal:not(.is-visible)', refreshKey = 0, threshold = 0.12) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const items = root.querySelectorAll(selector);
    if (items.length === 0) return undefined;

    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold });

    items.forEach((item) => observer.observe(item));

    const revealAlreadyVisible = () => {
      items.forEach((item) => {
        if (item.classList.contains('is-visible')) return;
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * (1 - threshold) && rect.bottom > 0) {
          item.classList.add('is-visible');
          observer.unobserve(item);
        }
      });
    };

    const frame = window.requestAnimationFrame(revealAlreadyVisible);
    const timeout = window.setTimeout(revealAlreadyVisible, 120);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      observer.disconnect();
    };
  }, [refreshKey, rootRef, selector, threshold]);
}
