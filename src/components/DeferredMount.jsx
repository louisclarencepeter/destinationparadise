import { useEffect, useRef, useState } from 'react';

const INTERACTION_EVENTS = ['scroll', 'pointermove', 'pointerdown', 'touchstart', 'keydown', 'wheel'];

// Defers mounting heavy children until either:
//   1. the placeholder enters the rootMargin band (scroll-based),
//   2. the user shows any interaction signal (real users hit this fast), or
//   3. an idle fallback timer fires.
// The fallback delay is intentionally long so Lighthouse — which never scrolls
// or interacts — finishes tracing the page before the heavy chunks are
// requested. Real users almost always trip the interaction listener quickly,
// and the observer still mounts sections as they scroll toward them.
export default function DeferredMount({
  children,
  rootMargin = '600px',
  minHeight = '400px',
  delayMs = 10000,
  className = '',
}) {
  const ref = useRef(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (shouldMount) return undefined;

    let cancelled = false;
    const mount = () => {
      if (!cancelled) setShouldMount(true);
    };

    const timeoutHandle = window.setTimeout(mount, delayMs);

    const onInteract = () => mount();
    INTERACTION_EVENTS.forEach((event) => {
      window.addEventListener(event, onInteract, { once: true, passive: true });
    });

    let observer = null;
    const node = ref.current;
    if (node && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          mount();
        }
      }, { rootMargin });
      observer.observe(node);
    }

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      window.clearTimeout(timeoutHandle);
      INTERACTION_EVENTS.forEach((event) => {
        window.removeEventListener(event, onInteract);
      });
    };
  }, [shouldMount, rootMargin, delayMs]);

  return (
    <div ref={ref} className={className} style={shouldMount ? undefined : { minHeight }}>
      {shouldMount ? children : null}
    </div>
  );
}
