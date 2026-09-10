import { useEffect, useRef, useState } from 'react';
import { isPrerender } from '../utils/prerender.js';

const PRERENDER_MOUNT_EVENT = 'dp-prerender-mount';

// Load heavy sections shortly before they enter the viewport. Explicit actions
// can force a section open, and prerendering always captures the complete page.
// The fallback also exposes the content if an observer never reports visibility.
export default function DeferredMount({
  children,
  rootMargin = '600px',
  minHeight = '400px',
  delayMs = 30000,
  className = '',
  anchorId,
  force = false,
}) {
  const ref = useRef(null);
  const [shouldMount, setShouldMount] = useState(() => force || isPrerender());

  useEffect(() => {
    if (force) setShouldMount(true);
  }, [force]);

  useEffect(() => {
    if (shouldMount) return undefined;

    let cancelled = false;
    const mount = () => {
      if (!cancelled) setShouldMount(true);
    };

    const timeoutHandle = window.setTimeout(mount, delayMs);

    window.addEventListener(PRERENDER_MOUNT_EVENT, mount, { once: true });

    let observer = null;
    const node = ref.current;
    if (node && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0)) {
          mount();
        }
      }, { rootMargin });
      observer.observe(node);
    } else {
      mount();
    }

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      window.clearTimeout(timeoutHandle);
      window.removeEventListener(PRERENDER_MOUNT_EVENT, mount);
    };
  }, [shouldMount, rootMargin, delayMs]);

  const deferredStyle = {
    '--deferred-intrinsic-size': minHeight,
    ...(shouldMount ? {} : { minHeight }),
  };

  return (
    <div
      ref={ref}
      className={`deferred-mount ${className}`.trim()}
      data-deferred-anchor={anchorId}
      style={deferredStyle}
    >
      {shouldMount ? children : null}
    </div>
  );
}
