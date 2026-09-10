import test from "node:test";
import assert from "node:assert/strict";
import { Script } from "node:vm";
import {
  MAP_CHANNEL,
  MAP_BASE_URL,
  isAttributionLink,
  isMapDocument,
  isMapUserLocation,
  type MapData,
  parseMapEvent,
  serializeForScript,
} from "./map-protocol";
import { createMapDocument } from "./map-document";
const token = "test-session";
const ids = new Set(["stone-town"]);
const event = (payload: unknown) =>
  JSON.stringify({ channel: MAP_CHANNEL, token, ...(payload as object) });

test("only authenticated known destination selections reach native UI", () => {
  assert.deepEqual(
    parseMapEvent(event({ type: "select", id: "stone-town" }), token, ids),
    { type: "select", id: "stone-town" },
  );
  assert.equal(
    parseMapEvent(event({ type: "select", id: "unknown" }), token, ids),
    null,
  );
  assert.equal(
    parseMapEvent(
      event({ type: "select", id: "stone-town", token: "other-session" }),
      token,
      ids,
    ),
    null,
  );
  assert.equal(
    parseMapEvent(
      event({ type: "select", id: "stone-town", channel: "other-frame" }),
      token,
      ids,
    ),
    null,
  );
  assert.equal(parseMapEvent("{bad-json", token, ids), null);
  assert.equal(parseMapEvent("x".repeat(4001), token, ids), null);
});
test("navigation and links reject arbitrary origins, javascript, credentials and lookalike hosts", () => {
  assert.equal(isMapDocument(MAP_BASE_URL), true);
  assert.equal(
    isMapDocument("https://yournexttriptoparadise.com/unexpected"),
    false,
  );
  assert.equal(
    isAttributionLink("https://www.openstreetmap.org/copyright"),
    true,
  );
  for (const url of [
    "javascript:alert(1)",
    "http://openstreetmap.org",
    "https://openstreetmap.org.evil.test",
    "https://user@openstreetmap.org",
  ]) {
    assert.equal(isAttributionLink(url), false);
    assert.equal(parseMapEvent(event({ type: "link", url }), token, ids), null);
  }
});
test("inline configuration cannot escape a script tag, and bundled map scripts parse", () => {
  const name = "</script><script>window.compromised=true</script>";
  assert.ok(!serializeForScript({ name }).includes("<"));
  const html = createMapDocument(
    token,
    {
      pins: [{ id: "stone-town", number: 1, name, lat: -6, lng: 39 }],
      selectedId: null,
      fitKey: "Zanzibar",
      reducedMotion: false,
    },
    "http://localhost:8081",
  );
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
  assert.equal(scripts.length, 2);
  for (const script of scripts)
    assert.doesNotThrow(() => new Script(script[1]));
  assert.equal(html.includes("<script src="), false);
});

function runMapRuntime(overrides: Partial<MapData> = {}) {
  const initial: MapData = {
    pins: [
      { id: "stone-town", number: 1, name: "Stone Town", lat: -6, lng: 39 },
    ],
    selectedId: null as string | null,
    fitKey: "Zanzibar",
    reducedMotion: false,
    ...overrides,
  };
  const html = createMapDocument(token, initial);
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)][1][1];
  const stats = { maps: 0, markers: 0, fits: 0, stops: 0, icons: 0 };
  type Layer = {
    point: number[];
    options: Record<string, unknown>;
    label?: string;
    tooltipOptions?: Record<string, unknown>;
    added: boolean;
    on: () => Layer;
    addTo: () => Layer;
    setZIndexOffset: () => Layer;
    setIcon: () => void;
    setLatLng: (point: number[]) => Layer;
    bindTooltip: (label: string, options: Record<string, unknown>) => Layer;
    setRadius: (radius: number) => Layer;
  };
  const layers: Layer[] = [];
  const fitCalls: { points: number[][]; options: Record<string, unknown> }[] = [];
  const viewCalls: { point: number[]; zoom: number }[] = [];
  const posted: Record<string, unknown>[] = [];
  function layer(point: number[], options: Record<string, unknown>): Layer {
    const value: Layer = {
      point, options, added: false,
      on: () => value,
      addTo: () => { value.added = true; return value; },
      setZIndexOffset: () => value,
      setIcon: () => { stats.icons++; },
      setLatLng: (next) => { value.point = next; return value; },
      bindTooltip: (label, options) => { value.label = label; value.tooltipOptions = options; return value; },
      setRadius: (radius) => { value.options.radius = radius; return value; },
    };
    layers.push(value);
    return value;
  }
  const attributes: Record<string, string> = {};
  let onMediaChange: (() => void) | undefined;
  const media = {
    matches: false,
    addEventListener: (_event: string, listener: () => void) => {
      onMediaChange = listener;
    },
    removeEventListener: () => undefined,
  };
  const map = {
    options: {} as Record<string, unknown>,
    attributionControl: { setPrefix: () => undefined },
    setView: (point: number[], zoom: number) => {
      viewCalls.push({ point, zoom });
      return map;
    },
    fitBounds: (points: number[][], options: Record<string, unknown>) => {
      stats.fits++;
      fitCalls.push({ points, options });
    },
    stop: () => {
      stats.stops++;
    },
    invalidateSize: () => undefined,
    remove: () => undefined,
    removeLayer: (layer: Layer) => { layer.added = false; },
    setZoom: () => undefined,
    getZoom: () => 9,
  };
  const tiles = { on: () => tiles, addTo: () => tiles };
  const window = {
    dpMap: undefined as undefined | { receive: (command: unknown) => void },
    ReactNativeWebView: { postMessage: (message: string) => { posted.push(JSON.parse(message)); } },
    addEventListener: () => undefined,
    matchMedia: () => media,
  };
  const sandbox = {
    window,
    document: {
      documentElement: {
        setAttribute: (key: string, value: string) => {
          attributes[key] = value;
        },
      },
      addEventListener: () => undefined,
      getElementById: () => ({}),
    },
    setTimeout: () => 1,
    clearTimeout: () => undefined,
    L: {
      map: (_id: string, options: Record<string, unknown>) => {
        stats.maps++;
        map.options = options;
        return map;
      },
      tileLayer: () => tiles,
      latLngBounds: (bounds: unknown) => bounds,
      divIcon: (icon: unknown) => icon,
      marker: (point: number[], options: Record<string, unknown>) => {
        stats.markers++;
        return layer(point, options);
      },
      circle: layer,
    },
  };
  new Script(script).runInNewContext(sandbox);
  return {
    initial,
    stats,
    attributes,
    map,
    window,
    media,
    changeMedia: () => onMediaChange?.(),
    layers,
    fitCalls,
    viewCalls,
    posted,
  };
}

test("map motion preference and pin selection update in place without refitting the viewport", () => {
  const runtime = runMapRuntime();
  const initialFits = runtime.stats.fits;
  assert.equal(runtime.attributes["data-reduced-motion"], "false");
  assert.equal(runtime.map.options.inertia, true);
  runtime.window.dpMap!.receive({
    type: "update",
    data: { ...runtime.initial, selectedId: "stone-town", reducedMotion: true },
  });
  assert.equal(runtime.attributes["data-reduced-motion"], "true");
  assert.equal(runtime.map.options.inertia, false);
  assert.equal(runtime.stats.maps, 1);
  assert.equal(runtime.stats.markers, 1);
  assert.equal(runtime.stats.fits, initialFits);
  assert.equal(runtime.stats.icons, 1);
  assert.ok(runtime.stats.stops > 0);
  runtime.window.dpMap!.receive({
    type: "update",
    data: { ...runtime.initial, selectedId: "stone-town" },
  });
  assert.equal(runtime.attributes["data-reduced-motion"], "false");
  assert.equal(
    runtime.stats.icons,
    1,
    "unchanged selection must not replay label entrance",
  );
  assert.equal(runtime.stats.fits, initialFits);
});

test("map also respects live browser reduced-motion changes without a new document", () => {
  const runtime = runMapRuntime();
  const initialFits = runtime.stats.fits;
  runtime.media.matches = true;
  runtime.changeMedia();
  assert.equal(runtime.attributes["data-reduced-motion"], "true");
  assert.equal(runtime.map.options.inertia, false);
  assert.equal(runtime.stats.maps, 1);
  assert.equal(runtime.stats.fits, initialFits);
});

test("a foreground fix displays an approximate marker, accuracy circle and nearby pins", () => {
  const userLocation = { latitude: -6.2, longitude: 39.2, accuracy: 75 };
  const runtime = runMapRuntime({ userLocation });
  const origin = runtime.layers.find((layer) => layer.label === "Your approximate location");
  const circle = runtime.layers.find((layer) => layer.options.radius === 75);
  assert.ok(origin?.added);
  assert.deepEqual(Array.from(origin.point), [-6.2, 39.2]);
  assert.equal(origin.options.title, "Your approximate location");
  assert.notEqual(origin.tooltipOptions?.permanent, true, "location label must not cover nearby pins until focused or tapped");
  assert.ok(circle?.added);
  assert.equal(circle.options.interactive, false);
  const fit = runtime.fitCalls.at(-1)!;
  const latitudes = fit.points.map((point) => point[0]);
  const longitudes = fit.points.map((point) => point[1]);
  assert.equal((Math.max(...latitudes) + Math.min(...latitudes)) / 2, userLocation.latitude);
  assert.equal((Math.max(...longitudes) + Math.min(...longitudes)) / 2, userLocation.longitude);
  assert.equal(fit.options.maxZoom, 13);
  assert.equal(fit.options.animate, false);
  assert.ok(fit.points.some((point) => point[0] === -6 && point[1] === 39));
  for (const event of runtime.posted) {
    assert.ok(["ready", "status"].includes(event.type as string));
    assert.equal("latitude" in event || "longitude" in event || "userLocation" in event, false);
  }
});

test("nearby view centers a location outside catalog coverage even without pins", () => {
  const userLocation = { latitude: 52.5, longitude: 13.4, accuracy: null };
  const runtime = runMapRuntime({ pins: [], userLocation });
  assert.equal(runtime.stats.markers, 1);
  assert.equal(runtime.layers.length, 1, "unknown accuracy must not invent a radius");
  const fit = runtime.fitCalls.at(-1)!;
  assert.ok(fit.points.some(([lat, lng]) => lat < userLocation.latitude && lng < userLocation.longitude));
  assert.ok(fit.points.some(([lat, lng]) => lat > userLocation.latitude && lng > userLocation.longitude));
  const initialFits = runtime.stats.fits;
  runtime.window.dpMap!.receive({ type: "recenter" });
  assert.equal(runtime.stats.fits, initialFits + 1);
  assert.equal(runtime.stats.markers, 1, "recentering must reuse the in-memory fix");
});

test("location refresh moves the marker and circle, refits, and opt-out removes both", () => {
  const runtime = runMapRuntime();
  const first = { ...runtime.initial, userLocation: { latitude: -6.2, longitude: 39.2, accuracy: 60 } };
  runtime.window.dpMap!.receive({ type: "update", data: first });
  const origin = runtime.layers.find((layer) => layer.label === "Your approximate location")!;
  const circle = runtime.layers.find((layer) => layer.options.radius === 60)!;
  const initialFits = runtime.stats.fits;
  const refreshed = { ...first, fitKey: "refresh-2", userLocation: { latitude: -6.21, longitude: 39.19, accuracy: 90 } };
  runtime.window.dpMap!.receive({ type: "update", data: refreshed });
  assert.equal(runtime.stats.fits, initialFits + 1);
  assert.deepEqual(Array.from(origin.point), [-6.21, 39.19]);
  assert.deepEqual(Array.from(circle.point), [-6.21, 39.19]);
  assert.equal(circle.options.radius, 90);
  assert.equal(runtime.stats.markers, 2);
  runtime.window.dpMap!.receive({ type: "update", data: { ...refreshed, fitKey: "refresh-3" } });
  assert.equal(runtime.stats.fits, initialFits + 2, "refresh should recenter even with an identical fix");
  runtime.window.dpMap!.receive({ type: "update", data: { ...refreshed, pins: [], userLocation: null } });
  assert.equal(origin.added, false);
  assert.equal(circle.added, false);
  assert.equal(runtime.layers.some((layer) => layer.added), false);
  assert.deepEqual(Array.from(runtime.viewCalls.at(-1)!.point), [-6.15, 39.3]);
});

test("invalid foreground fixes and malformed bridge updates leave the map unchanged", () => {
  const runtime = runMapRuntime({ userLocation: { latitude: -6.2, longitude: 39.2, accuracy: 50 } });
  const initialFits = runtime.stats.fits;
  const invalidLocations = [
    {}, { latitude: "-6", longitude: 39 }, { latitude: NaN, longitude: 39 },
    { latitude: 91, longitude: 39 }, { latitude: -6, longitude: 181 },
    { latitude: -6, longitude: Infinity }, { latitude: -6, longitude: 39, accuracy: -1 },
    { latitude: -6, longitude: 39, accuracy: NaN },
  ];
  for (const userLocation of invalidLocations) {
    assert.equal(isMapUserLocation(userLocation), false);
    runtime.window.dpMap!.receive({ type: "update", data: { ...runtime.initial, fitKey: "invalid", userLocation } });
  }
  for (const patch of [
    { pins: [{ ...runtime.initial.pins[0], lat: 91 }] },
    { pins: [{ ...runtime.initial.pins[0], lng: NaN }] },
    { fitKey: {} }, { selectedId: {} }, { reducedMotion: "false" },
  ]) runtime.window.dpMap!.receive({ type: "update", data: { ...runtime.initial, ...patch } });
  assert.equal(runtime.stats.fits, initialFits);
  assert.equal(runtime.layers.filter((layer) => layer.added).length, 3);
  assert.equal(isMapUserLocation({ latitude: -6, longitude: 39 }), true);
  assert.equal(isMapUserLocation({ latitude: -6, longitude: 39, accuracy: null }), true);
  assert.equal(isMapUserLocation({ latitude: -6, longitude: 39, accuracy: 0 }), true);
});
