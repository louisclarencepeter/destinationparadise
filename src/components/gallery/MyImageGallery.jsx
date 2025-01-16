import { useState, useEffect, useRef } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import './MyImageGallery.scss';

const MyImageGallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const galleryRef = useRef(null);

  useEffect(() => {
    const loadItems = () => {
      const mixedItems = [
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

      const additionalPhotos = [];
      for (let i = 5; i <= 26; i++) {
        additionalPhotos.push({
          id: i + mixedItems.length,
          type: 'image',
          src: `/galleryimages/${i}.jpg`,
          alt: `Image ${i}`,
        });
      }

      setGalleryItems([...mixedItems, ...additionalPhotos]);
    };

    loadItems();
  }, []);

  useEffect(() => {
    const preloadImages = () => {
      const images = document.querySelectorAll('.image');
      images.forEach((img) => {
        img.classList.add('active');
      });
    };

    preloadImages();
  }, [galleryItems]);

  return (
    <div className="gallery" ref={galleryRef}>
      <h2 className="reveal active">Gallery</h2>
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <Masonry>
          {galleryItems.map((item) => (
            <div key={item.id} className="reveal active">
              {item.type === 'image' ? (
                <img src={item.src} className="image" alt={item.alt} />
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${item.videoId}`}
                  title={item.alt}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="video"
                ></iframe>
              )}
            </div>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
};

export default MyImageGallery;
