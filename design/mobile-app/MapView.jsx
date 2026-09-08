/* Leaflet map for the Destination Paradise mobile prototype.
   Real geometry only: coordinates come from the site's destinationMapPins data.
   Dark CARTO basemap over OpenStreetMap data, numbered pins, working zoom controls. */
const { useEffect, useRef, useState, useCallback } = React;

/* Website pin treatment: white disc, coral ring, coral number.
   Selected: solid coral disc, white number, coral halo, navy label above. */
function makeIcon(pin, active) {
  const base = 'display:flex;align-items:center;justify-content:center;border-radius:50%;'
    + 'font:700 12px/1 var(--dp-font-sans,sans-serif);box-sizing:border-box;';

  if (!active) {
    return window.L.divIcon({
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      html: '<span style="' + base + 'width:28px;height:28px;background:#fff;border:2px solid #FF6F61;'
        + 'color:#FF6F61;box-shadow:0 4px 12px rgba(0,0,0,.5)">' + pin.n + '</span>',
    });
  }

  return window.L.divIcon({
    className: '',
    iconSize: [150, 64],
    iconAnchor: [75, 47],
    html:
      '<div style="display:flex;flex-direction:column;align-items:center;width:150px">'
      + '<span style="max-width:150px;padding:5px 11px;border-radius:9px;white-space:nowrap;overflow:hidden;'
      + 'text-overflow:ellipsis;background:#16425C;border:1px solid rgba(255,255,255,.16);color:#fff;'
      + 'font:700 10.5px/1.35 var(--dp-font-sans,sans-serif);letter-spacing:.09em;text-transform:uppercase;'
      + 'box-shadow:0 6px 16px rgba(0,0,0,.45)">' + pin.name + '</span>'
      + '<span style="' + base + 'width:34px;height:34px;margin-top:7px;background:#FF6F61;color:#fff;'
      + 'font-size:13.5px;box-shadow:0 0 0 9px rgba(255,111,97,.22),0 0 26px 6px rgba(255,111,97,.35),'
      + '0 8px 18px rgba(0,0,0,.45)">' + pin.n + '</span>'
      + '</div>',
  });
}

function MapView({ pins = [], selectedId, onSelect, fitKey }) {
  const holder = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const markers = useRef({});
  const pinsRef = useRef(pins);
  const selRef = useRef(selectedId);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('loading');
  const [zoom, setZoom] = useState(9);

  pinsRef.current = pins;
  selRef.current = selectedId;

  const paint = useCallback(() => {
    if (!map.current || !layer.current || !window.L) return;
    layer.current.clearLayers();
    markers.current = {};
    pinsRef.current.forEach((p) => {
      const mk = window.L.marker([p.lat, p.lng], {
        icon: makeIcon(p, p.id === selRef.current),
        zIndexOffset: p.id === selRef.current ? 1000 : 0,
        title: p.name,
        alt: p.name + ' — ' + p.desc,
        riseOnHover: true,
        keyboard: true,
      });
      mk.on('click', () => onSelect && onSelect(p.id));
      mk.addTo(layer.current);
      markers.current[p.id] = mk;
    });
  }, [onSelect]);

  // boot Leaflet (may load async) and build the map once
  useEffect(() => {
    let dead = false;
    let tries = 0;
    const boot = () => {
      if (dead) return;
      if (!window.L) {
        if (++tries > 100) setStatus('unavailable');
        else setTimeout(boot, 100);
        return;
      }
      if (!holder.current || map.current) return;

      const m = window.L.map(holder.current, {
        zoomControl: false,
        attributionControl: true,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        minZoom: 3,
        maxZoom: 16,
      }).setView([-6.2, 39.3], 9);

      let loaded = 0;
      let errors = 0;
      // Keyless OSM raster tiles, filtered to the site's dark charcoal basemap.
      const pane = m.getPane('tilePane');
      pane.style.filter = 'invert(1) hue-rotate(185deg) brightness(.72) contrast(1.05) saturate(.45)';
      const tiles = window.L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 16, attribution: '© OpenStreetMap contributors' }
      );
      tiles.on('loading', () => { if (!dead && loaded === 0) setStatus('loading'); });
      tiles.on('tileload', () => { loaded++; if (!dead) setStatus('ready'); });
      tiles.on('tileerror', () => {
        errors++;
        if (!dead && loaded === 0 && errors >= 6) setStatus('unavailable');
      });
      tiles.addTo(m);

      layer.current = window.L.layerGroup().addTo(m);
      m.on('zoomend', () => { if (!dead) setZoom(m.getZoom()); });
      map.current = m;
      setZoom(m.getZoom());
      if (!dead) setReady(true);
    };
    boot();
    return () => {
      dead = true;
      if (map.current) { map.current.remove(); map.current = null; }
    };
  }, []);

  // keep the canvas correct when the phone frame or tab layout changes
  useEffect(() => {
    if (!ready || !holder.current || !map.current) return;
    const fix = () => map.current && map.current.invalidateSize();
    fix();
    const t1 = setTimeout(fix, 120);
    const t2 = setTimeout(fix, 500);
    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(fix);
      ro.observe(holder.current);
    }
    window.addEventListener('resize', fix);
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', fix);
    };
  }, [ready]);

  // pins + region fit
  useEffect(() => {
    if (!ready) return;
    paint();
    if (!pins.length || !map.current) return;
    const b = window.L.latLngBounds(pins.map((p) => [p.lat, p.lng]));
    map.current.invalidateSize();
    map.current.fitBounds(b, { padding: [46, 46], maxZoom: 11, animate: false });
  }, [ready, fitKey, paint]);

  // selection + label threshold
  useEffect(() => {
    if (!ready) return;
    paint();
    if (selectedId && markers.current[selectedId] && map.current) {
      map.current.panTo(markers.current[selectedId].getLatLng(), { animate: true });
    }
  }, [ready, selectedId, paint]);

  const btn = {
    width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 0, background: 'transparent', color: '#fff', fontSize: 20, lineHeight: 1, cursor: 'pointer',
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0b2839' }}>
      <div ref={holder} style={{ position: 'absolute', inset: 0 }} aria-label="Map of Destination Paradise destinations" />

      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 500,
        display: 'flex', flexDirection: 'column',
        borderRadius: 12, overflow: 'hidden',
        background: 'rgba(7,28,43,.88)', border: '1px solid rgba(255,255,255,.16)',
        boxShadow: '0 8px 20px rgba(0,0,0,.4)', backdropFilter: 'blur(8px)',
      }}>
        <button type="button" aria-label="Zoom in" style={btn}
          onClick={() => map.current && map.current.zoomIn()}>+</button>
        <span style={{ height: 1, background: 'rgba(255,255,255,.16)' }} />
        <button type="button" aria-label="Zoom out" style={btn}
          onClick={() => map.current && map.current.zoomOut()}>−</button>
      </div>

      {status !== 'ready' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 450, display: 'flex', flexDirection: 'column',
          gap: 10, alignItems: 'center', justifyContent: 'center', background: '#0b2839',
          color: '#C7D8E2', fontFamily: 'var(--dp-font-sans)', fontSize: 12.5, letterSpacing: '.02em',
        }}>
          {status === 'loading' ? (
            <>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', border: '2px solid rgba(255,255,255,.25)',
                borderTopColor: '#FF6F61', animation: 'dpaSpin .9s linear infinite',
              }} />
              Loading map…
            </>
          ) : (
            <span style={{ maxWidth: 230, textAlign: 'center', lineHeight: 1.55 }}>
              Map tiles could not load. Switch to List to browse the same destinations.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

module.exports = { MapView };
