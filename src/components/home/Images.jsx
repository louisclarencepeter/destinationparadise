import { useState, useEffect } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Link } from "react-router-dom";
import "./Images.scss";

const Images = () => {
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const loadImages = async () => {
      const importedImages = [];

      for (let i = 1; i <= 6; i++) {
        const imagePath = `/gallery/${i}.jpg`;
        const img = new Image();
        img.src = imagePath;

        await new Promise((resolve) => {
          img.onload = () => {
            importedImages.push({
              id: i,
              src: imagePath,
              alt: `Image ${i}`,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
            resolve();
          };
        });
      }

      setGalleryImages(importedImages);
    };

    loadImages();
  }, []);

  return (
    <div className="gallery">
      <h2 className="gallery__title reveal">Gallery</h2>
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
              width={image.width}
              height={image.height}
            />
          ))}
        </Masonry>
      </ResponsiveMasonry>
      <div className="gallery__more reveal">
        <Link to="/gallery" className="gallery__more-link">
          <span>View More Pictures</span>
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default Images;