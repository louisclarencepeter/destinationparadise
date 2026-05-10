import { useEffect, useRef, useState } from 'react';

// Defers mounting heavy children until after the initial paint, so they
// don't block first paint or LCP. Uses requestIdleCallback when available,
// falls back to setTimeout. An IntersectionObserver is also wired up so
// users who scroll quickly hit the section in time.
export default function DeferredMount({
  children,
  rootMargin = '600px',
  minHeight = '400px',
  delayMs = 1500,
  className,
}) {
  const ref = useRef(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (shouldMount) return undefined;

    let cancelled = false;
    const mount = () => {
      if (!cancelled) setShouldMount(true);
    };

    let idleHandle = 0;
    let timeoutHandle = 0;
    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(mount, { timeout: delayMs });
    } else {
      timeoutHandle = window.setTimeout(mount, delayMs);
    }

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
      if (idleHandle && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle) window.clearTimeout(timeoutHandle);
    };
  }, [shouldMount, rootMargin, delayMs]);

  return (
    <div ref={ref} className={className} style={shouldMount ? undefined : { minHeight }}>
      {shouldMount ? children : null}
    </div>
  );
}
