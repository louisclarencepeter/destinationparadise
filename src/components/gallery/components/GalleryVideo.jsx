// src/components/gallery/components/GalleryVideo.jsx
import PropTypes from 'prop-types';
import './GalleryVideo.scss';

export const GalleryVideo = ({ videoId, title }) => {
  return (
    <div className="video-container">
      <iframe
        className="gallery-video"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

GalleryVideo.propTypes = {
  videoId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};