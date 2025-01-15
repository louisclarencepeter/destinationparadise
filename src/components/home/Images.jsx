import React, { useState, useEffect } from "react";
import "./Images.scss";

const Images = () => {
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    const loadItems = () => {
      const items = [
        { id: 1, type: "image", src: "/galleryimages/1.jpg", alt: "Image 1" },
        { id: 2, type: "video", videoId: "iq-NDeo_33k", alt: "Video 1: Zanzibar Beaches" },
        { id: 3, type: "image", src: "/galleryimages/2.jpg", alt: "Image 2" },
        { id: 4, type: "video", videoId: "qYBauN6rzfI", alt: "Video 2: Zanzibar Culture" },
        { id: 6, type: "video", videoId: "X8UgUg8a0Rc", alt: "Video 3: Exploring Stone Town" },
        { id: 8, type: "video", videoId: "CV1kZngopa4", alt: "Video 4: Zanzibar Shorts" },
        { id: 9, type: "image", src: "/galleryimages/5.jpg", alt: "Image 5" },
        { id: 10, type: "video", videoId: "c22eXs1BzbM", alt: "Video 5: New Zanzibar Tour" },
        { id: 11, type: "image", src: "/galleryimages/6.jpg", alt: "Image 6" },
      ];
      setGalleryItems(items);
    };

    loadItems();
  }, []);

  return (
    <div className="images-gallery">
      <h2 className="gallery__title">Gallery</h2>
      <div className="gallery-grid">
        {galleryItems.map((item) => (
          <div key={item.id} className="gallery__item">
            {item.type === "image" ? (
              <img src={item.src} alt={item.alt} className="gallery-image reveal" />
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${item.videoId}`}
                title={item.alt}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="gallery-video reveal"
              ></iframe>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Images;