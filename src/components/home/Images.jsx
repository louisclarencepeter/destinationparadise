import React, { useState, useEffect } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import './Images.scss';

const Images = () => {
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    const loadItems = () => {
      const items = [
        { id: 1, type: 'image', src: '/galleryimages/1.jpg', alt: 'Image 1' },
        { id: 2, type: 'video', videoId: 'iq-NDeo_33k', alt: 'Video 1: Zanzibar Beaches' },
        { id: 3, type: 'image', src: '/galleryimages/2.jpg', alt: 'Image 2' },
        { id: 4, type: 'video', videoId: 'qYBauN6rzfI', alt: 'Video 2: Zanzibar Culture' },
        { id: 5, type: 'image', src: '/galleryimages/3.jpg', alt: 'Image 3' },
        { id: 6, type: 'video', videoId: 'X8UgUg8a0Rc', alt: 'Video 3: Exploring Stone Town' },
      ];

      setGalleryItems(items);
    };

    loadItems();
  }, []);

  return (
    <div className="images-gallery">
      <h2 className="gallery__title">Gallery</h2>
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <Masonry>
          {galleryItems.map((item) => (
            <div key={item.id} className="gallery-item reveal">
              {item.type === 'image' ? (
                <img src={item.src} alt={item.alt} className="gallery-image" />
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${item.videoId}`}
                  title={item.alt}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="gallery-video"
                ></iframe>
              )}
            </div>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
};

export default Images;