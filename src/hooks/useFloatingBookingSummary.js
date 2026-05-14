import { useEffect, useState } from 'react';

export function useFloatingBookingSummary(layoutRef, summarySlotRef, summaryRef, refreshKey) {
  const [summaryFloat, setSummaryFloat] = useState({ mode: 'normal', left: 0, width: 0 });

  useEffect(() => {
    let frame = 0;

    const updateSummaryFloat = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const layout = layoutRef.current;
        const slot = summarySlotRef.current;
        const summary = summaryRef.current;

        if (!layout || !slot || !summary || window.innerWidth < 820) {
          setSummaryFloat((current) => (current.mode !== 'normal' ? { mode: 'normal', left: 0, width: 0 } : current));
          return;
        }

        const rootStyles = window.getComputedStyle(document.documentElement);
        const navHeight = Number.parseFloat(rootStyles.getPropertyValue('--nav-height')) || 66;
        const topOffset = navHeight + 20;
        const layoutRect = layout.getBoundingClientRect();
        const slotRect = slot.getBoundingClientRect();
        const summaryHeight = summary.offsetHeight;
        const shouldFloat = layoutRect.top <= topOffset && layoutRect.bottom > topOffset + summaryHeight;
        const shouldParkAtBottom = layoutRect.top <= topOffset && layoutRect.bottom <= topOffset + summaryHeight;

        setSummaryFloat((current) => {
          const next = {
            mode: shouldFloat ? 'floating' : shouldParkAtBottom ? 'bottom' : 'normal',
            left: shouldFloat ? slotRect.left : 0,
            width: shouldFloat ? slotRect.width : 0,
          };

          if (
            current.mode === next.mode &&
            Math.abs(current.left - next.left) < 0.5 &&
            Math.abs(current.width - next.width) < 0.5
          ) {
            return current;
          }

          return next;
        });
      });
    };

    updateSummaryFloat();
    window.addEventListener('scroll', updateSummaryFloat, { passive: true });
    window.addEventListener('resize', updateSummaryFloat);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateSummaryFloat);
      window.removeEventListener('resize', updateSummaryFloat);
    };
  }, [layoutRef, refreshKey, summaryRef, summarySlotRef]);

  return summaryFloat;
}
