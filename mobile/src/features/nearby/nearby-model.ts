import type { Destination, DestinationRegion, ExperienceLink } from '../../data/content';
import { filterDestinations, websiteUrl, type Category } from '../explore/explore-model';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type NearbyExperienceKind = 'excursion' | 'safari' | 'package';

export interface NearbyDestination {
  destination: Destination;
  /** Straight-line distance to this catalog destination, never a pickup point. */
  distanceKm: number;
}

export interface NearbyExperience extends NearbyDestination {
  /** Canonical catalog route; shared links appear only once. */
  id: string;
  kind: NearbyExperienceKind;
  label: string;
  to: string;
}

export interface NearbyOptions {
  region?: DestinationRegion;
  category?: Category;
  query?: string;
  savedOnly?: boolean;
  savedIds?: readonly string[];
  maxDistanceKm?: number;
  destinationLimit?: number;
  experienceLimit?: number;
  experienceKinds?: readonly NearbyExperienceKind[];
}

export interface NearbyRecommendations {
  status: 'ready' | 'outside-coverage' | 'no-matches' | 'invalid-location';
  destinations: NearbyDestination[];
  experiences: NearbyExperience[];
  /** Closest catalog destination before filters; does not infer the user's region. */
  nearestDestination: NearbyDestination | null;
  radiusKm: number;
  distanceNotice: string;
  transferNotice: string;
}

export const MAX_NEARBY_RADIUS_KM = 150;
const EARTH_RADIUS_KM = 6371.0088;
const DISTANCE_NOTICE = 'Distances are approximate straight-line distances to destinations, not tour starting points, pickup points or travel times.';
const TRANSFER_NOTICE = 'Straight-line distance can cross water. Zanzibar–mainland trips may require a boat or flight; confirm transfers and pickup when enquiring.';

export function isValidCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== 'object') return false;
  const point = value as Partial<Coordinates>;
  return typeof point.latitude === 'number' && Number.isFinite(point.latitude) &&
    point.latitude >= -90 && point.latitude <= 90 &&
    typeof point.longitude === 'number' && Number.isFinite(point.longitude) &&
    point.longitude >= -180 && point.longitude <= 180;
}

/** Pure on-device haversine calculation. Invalid input never produces a ranking. */
export function distanceKmBetween(from: Coordinates, to: Coordinates): number | null {
  if (!isValidCoordinates(from) || !isValidCoordinates(to)) return null;
  const radians = Math.PI / 180;
  const latitudeDelta = (to.latitude - from.latitude) * radians;
  const longitudeDelta = (to.longitude - from.longitude) * radians;
  const a = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(from.latitude * radians) * Math.cos(to.latitude * radians) *
    Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.max(0, Math.min(1, a))));
}

function boundedPositive(value: number | undefined, fallback: number, maximum: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.min(value, maximum)
    : fallback;
}

function compareIds(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareDestinations(a: NearbyDestination, b: NearbyDestination): number {
  return a.distanceKm - b.distanceKm || compareIds(a.destination.id, b.destination.id);
}

function linkedExperience(link: ExperienceLink): { id: string; kind: NearbyExperienceKind } | null {
  const safeUrl = websiteUrl(link.to);
  if (!safeUrl || !link.label.trim()) return null;
  const id = new URL(safeUrl).pathname.replace(/\/+$/, '');
  const route = /^\/(excursions|safaris|packages)\/[^/]+(?:\/[^/]+)*$/.exec(id);
  if (!route) return null;
  const kinds = { excursions: 'excursion', safaris: 'safari', packages: 'package' } as const;
  return { id, kind: kinds[route[1] as keyof typeof kinds] };
}

/**
 * Rank existing destination pins, then attach their existing experience links.
 * No request, geocoding, coordinate persistence or tour availability inference.
 * Sparse catalog pins cannot determine which side of water the user is on.
 */
export function recommendNearby(
  items: readonly Destination[],
  origin: Coordinates | null | undefined,
  options: NearbyOptions = {},
): NearbyRecommendations {
  const radiusKm = boundedPositive(options.maxDistanceKm, MAX_NEARBY_RADIUS_KM, MAX_NEARBY_RADIUS_KM);
  const destinationLimit = Math.max(1, Math.floor(boundedPositive(options.destinationLimit, 4, 24)));
  const experienceLimit = Math.max(1, Math.floor(boundedPositive(options.experienceLimit, 8, 40)));
  const result: NearbyRecommendations = {
    status: 'invalid-location', destinations: [], experiences: [], nearestDestination: null,
    radiusKm, distanceNotice: DISTANCE_NOTICE, transferNotice: TRANSFER_NOTICE,
  };
  if (!isValidCoordinates(origin)) return result;

  const ranked = items.flatMap((destination): NearbyDestination[] => {
    const distanceKm = distanceKmBetween(origin, { latitude: destination.lat, longitude: destination.lng });
    return distanceKm === null ? [] : [{ destination, distanceKm }];
  }).sort(compareDestinations);
  result.nearestDestination = ranked[0] ?? null;
  if (!result.nearestDestination || result.nearestDestination.distanceKm > radiusKm) {
    result.status = 'outside-coverage';
    return result;
  }

  const nearby = ranked.filter((item) => item.distanceKm <= radiusKm);
  const regions: DestinationRegion[] = options.region ? [options.region] : ['Zanzibar', 'Mainland'];
  const matchingIds = new Set(regions.flatMap((region) => filterDestinations(
    nearby.map((item) => item.destination),
    {
      region,
      category: options.category ?? 'all',
      query: options.query ?? '',
      savedOnly: options.savedOnly ?? false,
      savedIds: [...(options.savedIds ?? [])],
    },
  )).map((destination) => destination.id));

  result.destinations = nearby.filter((item) => matchingIds.has(item.destination.id)).slice(0, destinationLimit);
  if (!result.destinations.length) {
    result.status = 'no-matches';
    return result;
  }

  const experiences = new Map<string, NearbyExperience>();
  for (const item of result.destinations) {
    const links = [...item.destination.excursions, ...item.destination.safaris, ...item.destination.packages];
    for (const link of links) {
      const experience = linkedExperience(link);
      if (!experience || experiences.has(experience.id) ||
        (options.experienceKinds && !options.experienceKinds.includes(experience.kind))) continue;
      // Destinations are nearest-first, so a shared trip inherits the distance
      // of its closest associated pin, never invented tour/meeting coordinates.
      experiences.set(experience.id, { ...item, ...experience, label: link.label, to: link.to });
    }
  }
  result.experiences = [...experiences.values()].slice(0, experienceLimit);
  result.status = 'ready';
  return result;
}
