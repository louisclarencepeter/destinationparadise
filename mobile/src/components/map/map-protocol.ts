export type MapPin = {
  id: string;
  number: number;
  name: string;
  lat: number;
  lng: number;
};
/** A foreground fix held in memory only; never sent back through map events. */
export type MapUserLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};
export type MapData = {
  pins: MapPin[];
  selectedId: string | null;
  fitKey: string;
  reducedMotion: boolean;
  userLocation?: MapUserLocation | null;
};
export type MapStatus = "loading" | "ready" | "error";
export type MapCommand =
  | { type: "update"; data: MapData }
  | { type: "zoom"; delta: 1 | -1 }
  | { type: "fit" }
  | { type: "recenter" }
  | { type: "ping" };
export type MapEvent =
  | { type: "ready" }
  | { type: "status"; status: MapStatus }
  | { type: "select"; id: string }
  | { type: "link"; url: string };
export const MAP_CHANNEL = "destination-paradise-map-v1";
export const MAP_BASE_URL = "https://yournexttriptoparadise.com/app-map/";

export function isMapUserLocation(value: unknown): value is MapUserLocation {
  if (!value || typeof value !== "object") return false;
  const point = value as Partial<MapUserLocation>;
  return (
    typeof point.latitude === "number" &&
    Number.isFinite(point.latitude) &&
    Math.abs(point.latitude) <= 90 &&
    typeof point.longitude === "number" &&
    Number.isFinite(point.longitude) &&
    Math.abs(point.longitude) <= 180 &&
    (point.accuracy == null ||
      (typeof point.accuracy === "number" &&
        Number.isFinite(point.accuracy) &&
        point.accuracy >= 0))
  );
}

export function serializeForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Both transports pass through this small, allow-listed protocol. */
export function parseMapEvent(
  raw: unknown,
  token: string,
  ids: ReadonlySet<string>,
): MapEvent | null {
  if (typeof raw !== "string" || raw.length > 4000) return null;
  try {
    const data = JSON.parse(raw);
    if (!data || data.channel !== MAP_CHANNEL || data.token !== token)
      return null;
    if (data.type === "ready") return { type: "ready" };
    if (
      data.type === "status" &&
      ["loading", "ready", "error"].includes(data.status)
    )
      return { type: "status", status: data.status };
    if (
      data.type === "select" &&
      typeof data.id === "string" &&
      ids.has(data.id)
    )
      return { type: "select", id: data.id };
    if (
      data.type === "link" &&
      typeof data.url === "string" &&
      isAttributionLink(data.url)
    )
      return { type: "link", url: data.url };
  } catch {
    /* Ignore malformed, unrelated, or untrusted bridge messages. */
  }
  return null;
}

export function isAttributionLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      !parsed.username &&
      !parsed.password &&
      ["www.openstreetmap.org", "openstreetmap.org", "leafletjs.com"].includes(
        parsed.hostname,
      )
    );
  } catch {
    return false;
  }
}

export function isMapDocument(url: string): boolean {
  return (
    url === "about:blank" || url === MAP_BASE_URL || url === "about:srcdoc"
  );
}
