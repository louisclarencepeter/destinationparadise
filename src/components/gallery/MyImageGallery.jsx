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
    function reveal() {
      const reveals = document.querySelectorAll(".reveal");
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add("active");
        } else {
          reveals[i].classList.remove("active");
        }
      }
    }

    window.addEventListener("scroll", reveal);

    reveal();

    return () => {
      window.removeEventListener("scroll", reveal);
    };
  }, []);

  return (
    <div className="gallery">
      <h2 className="reveal">Gallery</h2>
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
