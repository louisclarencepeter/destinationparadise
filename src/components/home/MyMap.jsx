import { useEffect, useRef } from "react";

let googleMapsPromise;
let googleMapsResolve;

function loadGoogleMaps(apiKey) {
    if (googleMapsPromise) return googleMapsPromise;

    googleMapsPromise = new Promise((resolve, reject) => {
        googleMapsResolve = resolve;

        if (document.getElementById("google-maps-script")) {
            resolve(window.google.maps);
            return;
        }

        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;

        script.onerror = () => {
            console.error("Failed to load Google Maps script.");
            googleMapsPromise = null;
            reject("Google Maps script failed to load.");
        };

        document.head.appendChild(script);
    });

    return googleMapsPromise;
}

window.initGoogleMaps = () => {
    if (googleMapsResolve) {
        googleMapsResolve(window.google.maps);
    }
};

function MyMap() {
    const mapRef = useRef(null);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        async function initializeMap() {
            if (!apiKey) {
                console.error("Google Maps API key is missing.");
                if (mapRef.current) {
                    mapRef.current.innerHTML = "<p>Google Maps API key is missing.</p>";
                }
                return;
            }

            try {
                await loadGoogleMaps(apiKey);

                const mapOptions = {
                    center: { lat: -6.163657188415527, lng: 39.18870162963867 },
                    zoom: 14,
                    mapId: "f9d217ab22987daf",
                };

                const map = new window.google.maps.Map(mapRef.current, mapOptions);

                if (window.google.maps.marker?.AdvancedMarkerElement) {
                    new window.google.maps.marker.AdvancedMarkerElement({
                        position: mapOptions.center,
                        map: map,
                        title: "My location",
                    });
                } else {
                    console.error("AdvancedMarkerElement is not available.");
                }
            } catch (error) {
                console.error("Error initializing map:", error);
                if (mapRef.current) {
                    mapRef.current.innerHTML = "<p>Failed to load the map. Please try again later.</p>";
                }
            }
        }

        initializeMap();
    }, [apiKey]);

    return <div style={{ height: "50vh", width: "100%" }} ref={mapRef} className="reveal"></div>;
}

export default MyMap;
