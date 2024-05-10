import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useState, useEffect } from "react";
import "./Gallery.scss";

const Gallery = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const loadImages = () => {
      const importedImages = [];
  
      for (let i = 1; i <= 6; i++) {
        // Direct URL path from the public folder
        const imagePath = `/gallery/${i}.jpg`;
  
        importedImages.push({
          id: i,
          src: imagePath,
          alt: `Image ${i}`,
        });
      }
  
      // Set the state of the component
      setImagesLoaded(true);
      setGalleryImages(importedImages);
    };
  
    loadImages();
  }, []);
  
  return (
    <div className="gallery-container">
      <h2 className="reveal">Gallery</h2>
      {imagesLoaded && (
        <ResponsiveMasonry
          className="gallery-masonry"
          columnsCountBreakPoints={{
            350: 1,
            750: 2,
            900: 3,
          }}
        >
          <Masonry className="gallery-images-container">
            {galleryImages.map((image) => (
              <img
                className="gallery-image reveal"
                key={image.id}
                src={image.src}
                alt={image.alt}
              />
            ))}
          </Masonry>
        </ResponsiveMasonry>
      )}
    </div>
  );
};

export default Gallery;