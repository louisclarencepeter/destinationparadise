import { useEffect, useRef, useCallback } from 'react';

function MyMap() {
  const mapRef = useRef(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const initializeMap = useCallback(() => {
    const mapOptions = {
      center: { lat: -6.163657188415527, lng: 39.18870162963867 },
      zoom: 14,
      mapId: 'f9d217ab22987daf',
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);

    if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
      new window.google.maps.marker.AdvancedMarkerElement({
        position: mapOptions.center,
        map: map,
        title: 'My location',
      });
    } else {
      console.error('AdvancedMarkerElement is not available in this version of the Google Maps API.');
    }
  }, []);

  const loadGoogleMapsScript = useCallback(() => {
    const scriptId = 'google-maps-script';
    const existingScript = document.getElementById(scriptId);

    if (window.google?.maps) {
      initializeMap();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener('load', initializeMap);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);
  }, [apiKey, initializeMap]);

  useEffect(() => {
    if (!apiKey) {
      console.error('Google Maps API key is missing');
      return;
    }

    loadGoogleMapsScript();
  }, [apiKey, loadGoogleMapsScript]);

  return <div style={{ height: '50vh', width: '100%' }} ref={mapRef} className="reveal"></div>;
}

export default MyMap;