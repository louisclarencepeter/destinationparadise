import { useState, useEffect } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import './MyImageGallery.scss';

const MyImageGallery = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const loadImages = () => {
      const importedImages = [];
      for (let i = 1; i <= 26; i++) {
        const imagePath = `/galleryimages/${i}.jpg`;
        importedImages.push({
          id: i,
          src: imagePath,
          alt: `Image ${i}`,
        });
      }
      setImagesLoaded(true);
      setGalleryImages(importedImages);
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (imagesLoaded) {
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach((reveal) => {
        reveal.classList.add('active');
      });
    }
  }, [imagesLoaded]);

  return (
    <div className="gallery">
      <h1>Gallery</h1>
      {imagesLoaded && (
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
          <Masonry>
            {galleryImages.map((image) => (
              <img
                key={image.id}
                src={image.src}
                className="image reveal"
                alt={image.alt}
              />
            ))}
          </Masonry>
        </ResponsiveMasonry>
      )}
    </div>
  );
};

export default MyImageGallery;
