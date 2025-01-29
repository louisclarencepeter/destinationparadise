import PropTypes from 'prop-types';
import zanzibarmap from "../../../assets/map/zanzibar.png";


export const Map = ({ isVisible, mapRef }) => (
    <div 
      ref={mapRef}
      className={`map-container ${isVisible ? 'visible' : ''}`}
    >
      <h3 className="map-title">Map of Unguja Zanzibar</h3>
      <img 
        src={zanzibarmap} 
        alt="Zanzibar Map" 
        className="map-image"
        loading="lazy"
      />
    </div>
  );
  
  Map.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    mapRef: PropTypes.func.isRequired,
  };