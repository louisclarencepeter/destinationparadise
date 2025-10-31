import { useEffect, useRef, useState } from "react";

/**
 * A custom hook to observe when an element becomes visible in the viewport.
 * @param {object} options - The IntersectionObserver options (e.g., threshold, root, rootMargin).
 * @returns {[React.RefObject, boolean]} - A ref to attach to the element and a boolean (isVisible).
 */
export const useAnimateOnScroll = (options = { threshold: 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the element is intersecting (visible)
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Stop observing once it's visible
          observer.unobserve(entry.target);
        }
      },
      options
    );

    if (element) {
      observer.observe(element);
    }

    // Cleanup function: unobserve the element when the component unmounts
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options]); // Re-run the effect if options change

  return [ref, isVisible];
};