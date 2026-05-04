import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/page-scroll-cue.css';

export default function PageScrollCue() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const updateVisibility = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
      const nearBottom = maxScroll > 0 && window.scrollY >= maxScroll - 120;
      const hasScrollableRoom = maxScroll > 140;
      setIsVisible(hasScrollableRoom && !nearBottom);
    };

    const onScrollOrResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [location.pathname, location.hash]);

  return (
    <div className={`page-scroll-cue${isVisible ? '' : ' is-hidden'}`} aria-hidden="true">
      <span />
    </div>
  );
}
