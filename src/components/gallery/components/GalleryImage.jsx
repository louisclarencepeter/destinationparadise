// src/components/gallery/components/GalleryImage.jsx
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { ErrorState } from './ErrorState';
import './GalleryImage.scss';

export const GalleryImage = memo(({ src, placeholderSrc, alt, fallbackSrc }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  useEffect(() => {
    if (imgRef.current && imgRef.current.dataset.src === src) {
      setIsLoaded(true);
    }
  }, [src]);

  const handleError = useCallback(() => {
    if (!imgRef.current) return;

    const retryCount = parseInt(imgRef.current.dataset.retryCount) || 0;

    if (retryCount < 3) {
      imgRef.current.dataset.retryCount = retryCount + 1;
      imgRef.current.src = src;
    } else {
      if (fallbackSrc) {
        imgRef.current.src = fallbackSrc;
      }
      setError(true);
    }
  }, [src, fallbackSrc]);

  return (
    <div className={`image-container ${isLoaded ? 'loaded' : ''}`}>
      {!isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          className="gallery-image placeholder"
        />
      )}
      {error ? (
        <ErrorState onRetry={() => setError(false)} />
      ) : (
        <img
          ref={imgRef}
          data-src={src}
          srcSet={`${src}?w=300 300w, ${src}?w=600 600w, ${src}?w=900 900w`}
          sizes="(max-width: 600px) 300px, (max-width: 900px) 600px, 900px"
          alt={alt}
          className={`gallery-image ${isLoaded ? 'loaded' : ''}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
});

GalleryImage.propTypes = {
  src: PropTypes.string.isRequired,
  placeholderSrc: PropTypes.string.isRequired,
  alt: PropTypes.string,
  fallbackSrc: PropTypes.string,
};
