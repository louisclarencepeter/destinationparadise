import { useEffect, useState, useRef } from "react";

/**
 * Hook for observing element visibility using IntersectionObserver
 * Enhanced version with animate class pattern
 * @param {Object} options - Observer options
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {boolean} options.triggerOnce - Whether to trigger only once
 * @returns {Array} [ref, isVisible] - Ref to attach to element and visibility state
 */
export const useElementVisibility = (
  options = { threshold: 0.1, triggerOnce: true }
) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!options.triggerOnce) {
          setIsVisible(false);
        }
      },
      options
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);

  return [ref, isVisible];
};

/**
 * Alias for useElementVisibility with "animate" naming convention
 * Matches the pattern used in Excursions component
 * @param {Object} options - Observer options
 * @returns {Array} [ref, isAnimating] - Ref and animation state
 */
export const useAnimateOnScroll = (options = { threshold: 0.1, triggerOnce: true }) => {
  return useElementVisibility(options);
};

/**
 * Hook for creating an automatic slideshow when card is visible
 * @param {Object} cardRef - Ref of the card element
 * @param {Array} imageList - List of image paths
 * @param {number} intervalTime - Time between slides in milliseconds
 * @returns {string} currentImage - Current image path
 */
export const useCardSlideshow = (cardRef, imageList, intervalTime) => {
  const [currentImage, setCurrentImage] = useState(imageList[0]);
  const [isVisible, setIsVisible] = useState(false);
  const currentImageRef = useRef(imageList[0]);

  useEffect(() => {
    currentImageRef.current = currentImage;
  }, [currentImage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const currentRef = cardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [cardRef]);

  useEffect(() => {
    let intervalId = null;
    if (isVisible && imageList.length > 1) {
      intervalId = setInterval(() => {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * imageList.length);
        } while (
          imageList.length > 1 &&
          imageList[randomIndex] === currentImageRef.current
        );

        setCurrentImage(imageList[randomIndex]);
      }, intervalTime);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isVisible, imageList, intervalTime]);

  return currentImage;
};