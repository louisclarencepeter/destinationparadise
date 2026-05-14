import { useEffect } from 'react';

export function useRevealOnScroll(rootRef, selector = '.reveal:not(.is-visible)') {
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
    }, { threshold: 0.12 });

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [rootRef, selector]);
}
