/**
 * Schedule non-critical work after the initial page is loaded and the browser
 * has an idle window.
 *
 * @param {() => void} callback
 * @param {number} [timeout]
 */
export function afterPageLoad(callback, timeout = 2000) {
  if (typeof window === 'undefined') return () => {};

  let cancelled = false;
  let idleHandle;
  let timeoutHandle;

  const run = () => {
    if (!cancelled) callback();
  };
  const scheduleWhenIdle = () => {
    if ('requestIdleCallback' in window) {
      idleHandle = window.requestIdleCallback(run, { timeout });
    } else {
      timeoutHandle = globalThis.setTimeout(run, 0);
    }
  };

  if (document.readyState === 'complete') {
    scheduleWhenIdle();
  } else {
    window.addEventListener('load', scheduleWhenIdle, { once: true });
  }

  return () => {
    cancelled = true;
    window.removeEventListener('load', scheduleWhenIdle);
    if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
    if (timeoutHandle !== undefined) globalThis.clearTimeout(timeoutHandle);
  };
}
