import { useState, useEffect, useRef } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import './MyImageGallery.scss';

const MyImageGallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const galleryRef = useRef(null);

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
      setGalleryImages(importedImages);
    };

    loadImages();
  }, []);

  useEffect(() => {
    const revealElements = () => {
      const reveals = galleryRef.current.querySelectorAll(".reveal");
      const windowHeight = window.innerHeight;

      reveals.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
          element.classList.add("active");
        }
      });
    };


    if (galleryImages.length > 0) {
      setTimeout(revealElements, 100); // Small delay to ensure DOM is updated
    }
  }, [galleryImages]);

  return (
    <div className="gallery" ref={galleryRef}>
      <h2 className="reveal">Gallery</h2>
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <Masonry>
          {galleryImages.map((image) => (
            <div key={image.id} className="reveal">
              <img
                src={image.src}
                className="image"
                alt={image.alt}
              />
            </div>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
};

export default MyImageGallery;