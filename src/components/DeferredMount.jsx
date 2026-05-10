import { useEffect, useRef, useState } from 'react';

export default function DeferredMount({ children, rootMargin = '600px', minHeight = '400px', className }) {
  const ref = useRef(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (shouldMount) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldMount(true);
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setShouldMount(true);
        observer.disconnect();
      }
    }, { rootMargin });

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldMount, rootMargin]);

  return (
    <div ref={ref} className={className} style={shouldMount ? undefined : { minHeight }}>
      {shouldMount ? children : null}
    </div>
  );
}
