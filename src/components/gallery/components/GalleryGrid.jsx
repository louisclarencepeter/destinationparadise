// src/components/gallery/components/GalleryGrid.jsx
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { GalleryImage } from './GalleryImage';
import { GalleryVideo } from './GalleryVideo';
import './GalleryGrid.scss';

export const GalleryGrid = ({ items }) => {
  const observer = useRef();

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
      { rootMargin: '100px' }
    );

    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item) => observer.current.observe(item));

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [items]);

  const renderGalleryItem = (item) => {
    if (item.type === 'video') {
      return <GalleryVideo videoId={item.videoId} title={item.title} />;
    }
    return (
      <GalleryImage
        src={item.src}
        placeholderSrc={item.placeholderSrc}
        alt={item.alt}
      />
    );
  };

  return (
    <div className="gallery-grid">
      {items.map((item) => (
        <div key={item.id} className="gallery-item">
          {renderGalleryItem(item)}
        </div>
      ))}
    </div>
  );
};

GalleryGrid.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.oneOf(['image', 'video']).isRequired,
      src: PropTypes.string,
      placeholderSrc: PropTypes.string,
      alt: PropTypes.string,
      videoId: PropTypes.string,
      title: PropTypes.string,
    })
  ).isRequired,
};