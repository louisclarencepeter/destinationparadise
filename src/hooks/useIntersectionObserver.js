// hooks/useIntersectionObserver.js
import { useState, useEffect } from 'react';

export const useIntersectionObserver = (options = {}) => {
  const [elements, setElements] = useState([]);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver((observedEntries) => {
      setEntries(observedEntries);
    }, options);

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [elements, options]);

  const ref = (element) => {
    if (element && !elements.includes(element)) {
      setElements((prevElements) => [...prevElements, element]);
    }
  };

  return [ref, entries];
};