import { useState, useEffect, useCallback, memo } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import './MyImageGallery.scss';

// Memoized Image Component
const GalleryImage = memo(({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`image-container ${isLoaded ? 'loaded' : ''}`}>
      {error ? (
        <div className="error-state">Failed to load image</div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`gallery-image ${isLoaded ? 'active' : ''}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
        />
      )}
    </div>
  );
});

// Memoized Video Component
const GalleryVideo = memo(({ videoId, title }) => (
  <div className="video-container">
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      title={title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="gallery-video"
      loading="lazy"
    />
  </div>
));

const MyImageGallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial gallery items
  const initialItems = [
    { id: 1, type: 'video', videoId: 'iq-NDeo_33k', alt: 'Video 1: Zanzibar Beaches' },
    { id: 2, type: 'image', src: '/galleryimages/1.jpg', alt: 'Image 1' },
    { id: 3, type: 'image', src: '/galleryimages/2.jpg', alt: 'Image 2' },
    { id: 4, type: 'video', videoId: 'qYBauN6rzfI', alt: 'Video 2: Zanzibar Culture' },
    { id: 5, type: 'image', src: '/galleryimages/3.jpg', alt: 'Image 3' },
    { id: 6, type: 'video', videoId: 'X8UgUg8a0Rc', alt: 'Video 3: Exploring Stone Town' },
    { id: 7, type: 'video', videoId: 'CV1kZngopa4', alt: 'Video 4: Zanzibar Shorts' },
    { id: 8, type: 'image', src: '/galleryimages/4.jpg', alt: 'Image 4' },
    { id: 9, type: 'video', videoId: 'c22eXs1BzbM', alt: 'Video 5: New Zanzibar Tour' },
    { id: 10, type: 'video', videoId: 'roDvGTjHdxc', alt: 'Video 6: Zanzibar Adventure Shorts' },
  ];

  // Load additional photos
  const loadAdditionalPhotos = useCallback(() => {
    const additionalPhotos = [];
    for (let i = 5; i <= 26; i++) {
      additionalPhotos.push({
        id: i + initialItems.length,
        type: 'image',
        src: `/galleryimages/${i}.jpg`,
        alt: `Image ${i}`,
      });
    }
    return additionalPhotos;
  }, []);

  // Load all gallery items
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

  // Loading state
  if (isLoading) {
    return <div className="gallery-loading">Loading gallery...</div>;
  }

  return (
    <div className="gallery-wrapper">
      <h2 className="gallery-title">Gallery</h2>
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <Masonry gutter="16px">
          {galleryItems.map((item) => (
            <div key={item.id} className="gallery-item">
              {item.type === 'image' ? (
                <GalleryImage src={item.src} alt={item.alt} />
              ) : (
                <GalleryVideo videoId={item.videoId} title={item.alt} />
              )}
            </div>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
};

export default MyImageGallery;