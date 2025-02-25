import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

export const MapComponent = ({ isVisible, mapRef }) => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (isVisible && !mapInstanceRef.current) {
      const loadGoogleMaps = () => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initMap();
        };
        document.body.appendChild(script);
      };

      loadGoogleMaps();
    } else if (!isVisible && mapInstanceRef.current) {
      // Clean up map if hidden
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = '';
        }
      }
    }
  }, [isVisible, googleMapsApiKey]);

  const initMap = () => {
    if (mapContainerRef.current) {
      const map = new window.google.maps.Map(mapContainerRef.current, {});

      // Define bounds to include only Unguja Island
      const sw = new window.google.maps.LatLng(-6.35, 39.05);
      const ne = new window.google.maps.LatLng(-5.65, 39.65);
      const bounds = new window.google.maps.LatLngBounds(sw, ne);
      map.fitBounds(bounds);

      mapInstanceRef.current = map;

      // Optional: Marker at Stone Town
      new window.google.maps.Marker({
        position: { lat: -6.1659, lng: 39.2026 },
        map: map,
        title: 'Stone Town, Unguja',
      });
    }
  };

  return (
    <div
      ref={mapRef}
      className={`map-container ${isVisible ? 'visible' : ''}`}
      style={{ position: 'relative', height: '100vh', width: '100%' }}
    >
      <h3 className="map-title">Map of Unguja Island</h3>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

MapComponent.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  mapRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]).isRequired,
};

export default MapComponent;