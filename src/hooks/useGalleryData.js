// src/hooks/useGalleryData.js
import { useState, useCallback, useEffect } from 'react';

const initialItems = [
  // Video: Paradise Resort Panorama
  { 
    id: 1, 
    type: 'video',
    videoId: 'iq-NDeo_33k',
    title: 'Paradise Resort Panorama' 
  },
  // Image break for visual variety
  { 
    id: 2, 
    type: 'image', 
    src: '/galleryimages/1.jpg', 
    placeholderSrc: '/galleryimages/1-placeholder.jpg', 
    alt: 'Resort Image 1' 
  },
  // Video: Quick Resort Overview
  { 
    id: 3, 
    type: 'video',
    videoId: 'CV1kZngopa4',
    title: 'Quick Resort Overview' 
  },
  // Video: Resort Amenities Tour
  { 
    id: 4, 
    type: 'video',
    videoId: 'Dh_oJvHz1Dc',
    title: 'Resort Amenities Tour' 
  },
  // Image break
  { 
    id: 5, 
    type: 'image', 
    src: '/galleryimages/2.jpg', 
    placeholderSrc: '/galleryimages/2-placeholder.jpg', 
    alt: 'Resort Image 2' 
  },
  // Video: Resort Experience Highlight
  { 
    id: 6, 
    type: 'video',
    videoId: 'roDvGTjHdxc',
    title: 'Resort Experience Highlight' 
  },
  // Video: Detailed Resort Tour
  { 
    id: 7, 
    type: 'video',
    videoId: 'lfm1i7r4Pck',
    title: 'Detailed Resort Tour' 
  },
  // Image break
  { 
    id: 8, 
    type: 'image', 
    src: '/galleryimages/3.jpg', 
    placeholderSrc: '/galleryimages/3-placeholder.jpg', 
    alt: 'Resort Image 3' 
  },
  // Video: Resort Activities Showcase
  { 
    id: 9, 
    type: 'video',
    videoId: 'phzWxJQDe3Y',
    title: 'Resort Activities Showcase' 
  },
  // Video: Resort Evening Experience
  { 
    id: 10, 
    type: 'video',
    videoId: 'cdEycr-WT3U',
    title: 'Resort Evening Experience' 
  }
];

export const useGalleryData = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAdditionalPhotos = useCallback(() => {
    const additionalPhotos = [];
    for (let i = 4; i <= 15; i++) {
      additionalPhotos.push({
        id: i + 10,  // Offset to avoid ID conflicts with initial items
        type: 'image',
        src: `/galleryimages/${i}.jpg`,
        placeholderSrc: `/galleryimages/${i}-placeholder.jpg`,
        alt: `Resort Image ${i}`,
      });
    }
    return additionalPhotos;
  }, []);

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

  return { galleryItems, isLoading };
};