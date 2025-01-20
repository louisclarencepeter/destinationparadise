import { useState, useEffect, useRef, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import './MyImageGallery.scss';

const GalleryImage = memo(({ src, placeholderSrc, alt, fallbackSrc }) => {
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
        <div className="error-state">
          <button onClick={() => setError(false)}>Retry</button>
        </div>
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

const MyImageGallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const observer = useRef();

  const initialItems = [
    { id: 1, type: 'image', src: '/galleryimages/1.jpg', placeholderSrc: '/galleryimages/1-placeholder.jpg', alt: 'Image 1' },
    { id: 2, type: 'image', src: '/galleryimages/2.jpg', placeholderSrc: '/galleryimages/2-placeholder.jpg', alt: 'Image 2' },
    { id: 3, type: 'image', src: '/galleryimages/3.jpg', placeholderSrc: '/galleryimages/3-placeholder.jpg', alt: 'Image 3' },
  ];

  const loadAdditionalPhotos = useCallback(() => {
    const additionalPhotos = [];
    for (let i = 4; i <= 20; i++) {
      additionalPhotos.push({
        id: i,
        type: 'image',
        src: `/galleryimages/${i}.jpg`,
        placeholderSrc: `/galleryimages/${i}-placeholder.jpg`,
        alt: `Image ${i}`,
      });
    }
    return additionalPhotos;
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        const additionalPhotos = loadAdditionalPhotos();
        setGalleryItems([...initialItems, ...additionalPhotos]);
      } catch (error) {
        console.error('Error loading gallery items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [loadAdditionalPhotos]);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.current.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px',
      }
    );

    const items = document.querySelectorAll('.gallery-item');
    items.forEach((item) => observer.current.observe(item));

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [galleryItems]);

  return (
    <div className="gallery-wrapper">
      <h2 className="gallery-title">Explore Paradise Through Our Lens</h2>

      {isLoading && (
        <div className="gallery-loading">
          <div className="loading-content">
            <span className="loading-text">Preparing your visual journey...</span>
            <div className="loading-progress">Loading amazing moments from paradise</div>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="gallery-grid">
          {galleryItems.map((item) => (
            <div key={item.id} className="gallery-item">
              <GalleryImage
                src={item.src}
                placeholderSrc={item.placeholderSrc}
                alt={item.alt}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyImageGallery;
