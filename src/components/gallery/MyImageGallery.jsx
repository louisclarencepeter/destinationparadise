// src/components/gallery/MyImageGallery.jsx
import { useGalleryData } from '../../hooks/useGalleryData';
import { GalleryGrid } from './components/GalleryGrid';
import { LoadingState } from './components/LoadingState';
import './MyImageGallery.scss';
import SEO from '../SEO.jsx';

const MyImageGallery = () => {
  const { galleryItems, isLoading } = useGalleryData();

  return (
    <div className="gallery-wrapper">
      <SEO
        title="Gallery | Destination Paradise Zanzibar"
        description="Explore our gallery and discover the breathtaking views of Zanzibar."/>
      <h2 className="gallery-title">Explore Paradise Through Our Lens</h2>
      {isLoading ? <LoadingState /> : <GalleryGrid items={galleryItems} />}
    </div>
  );
};

export default MyImageGallery;
