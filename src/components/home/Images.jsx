// Images.jsx
import { useState, useEffect } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import "./Images.scss";

const Images = () => {
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const loadImages = async () => {
      const importedImages = [];

      for (let i = 1; i <= 6; i++) {
        const imagePath = `/gallery/${i}.jpg`;
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

  return (
    <div className="gallery">
      <h2 className="gallery__title">Gallery</h2>
      <ResponsiveMasonry
        columnsCountBreakPoints={{
          350: 1,
          750: 2,
          900: 3,
        }}
      >
        <Masonry>
          {galleryImages.map((image) => (
            <img
              key={image.id}
              src={image.src}
              alt={image.alt}
              className="gallery__image reveal"
            />
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
};

export default Images;