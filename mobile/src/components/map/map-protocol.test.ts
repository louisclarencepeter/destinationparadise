import test from "node:test";
import assert from "node:assert/strict";
import { Script } from "node:vm";
import {
  MAP_CHANNEL,
  MAP_BASE_URL,
  isAttributionLink,
  isMapDocument,
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
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 2);
  for (const script of scripts)
    assert.doesNotThrow(() => new Script(script[1]));
  assert.equal(html.includes("<script src="), false);
});

function runMapRuntime() {
  const initial = {
    pins: [
      { id: "stone-town", number: 1, name: "Stone Town", lat: -6, lng: 39 },
    ],
    selectedId: null as string | null,
    fitKey: "Zanzibar",
    reducedMotion: false,
  };
  const html = createMapDocument(token, initial);
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][1][1];
  const stats = { maps: 0, markers: 0, fits: 0, stops: 0, icons: 0 };
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
    setView: () => map,
    fitBounds: () => {
      stats.fits++;
    },
    stop: () => {
      stats.stops++;
    },
    invalidateSize: () => undefined,
    remove: () => undefined,
    removeLayer: () => undefined,
    setZoom: () => undefined,
    getZoom: () => 9,
  };
  const tiles = { on: () => tiles, addTo: () => tiles };
  const window = {
    dpMap: undefined as undefined | { receive: (command: unknown) => void },
    ReactNativeWebView: { postMessage: () => undefined },
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
      marker: () => {
        stats.markers++;
        const marker = {
          on: () => marker,
          addTo: () => marker,
          setZIndexOffset: () => marker,
          setIcon: () => {
            stats.icons++;
          },
        };
        return marker;
      },
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
