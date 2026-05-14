import { useEffect } from 'react';

export function usePinnedTimelinePhoto(rootRef) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const root = rootRef.current;
    if (!root) return undefined;

    const timeline = root.querySelector('.ab-timeline');
    const wrap = root.querySelector('.ab-timeline__photo-wrap');
    const photo = wrap?.querySelector('.ab-timeline__photo');
    if (!timeline || !wrap || !photo) return undefined;

    const desktopMQ = window.matchMedia('(min-width: 981px)');
    const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;

    function tick() {
      raf = 0;
      if (!desktopMQ.matches || reduceMQ.matches) {
        wrap.classList.remove('js-pin');
        wrap.style.removeProperty('--pin-y');
        return;
      }

      wrap.classList.add('js-pin');
      const rect = timeline.getBoundingClientRect();
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 66;
      const offset = navH + 24;
      const maxY = Math.max(0, wrap.offsetHeight - photo.offsetHeight);
      const y = Math.max(0, Math.min(offset - rect.top, maxY));
      wrap.style.setProperty('--pin-y', `${y}px`);
    }

    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    }

    tick();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    const onMQ = () => schedule();
    desktopMQ.addEventListener?.('change', onMQ);
    reduceMQ.addEventListener?.('change', onMQ);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      desktopMQ.removeEventListener?.('change', onMQ);
      reduceMQ.removeEventListener?.('change', onMQ);
      wrap.classList.remove('js-pin');
      wrap.style.removeProperty('--pin-y');
    };
  }, [rootRef]);
}
