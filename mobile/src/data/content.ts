import snapshot from './generated-content.json';

export const WEBSITE_URL = 'https://yournexttriptoparadise.com';
export type DestinationRegion = 'Zanzibar' | 'Mainland';
export interface ExperienceLink { label: string; to: string }
export interface Destination {
  id: string;
  number: number;
  region: DestinationRegion;
  name: string;
  lat: number;
  lng: number;
  desc: string;
  type: string;
  text: string;
  bestFor: string[];
  image: string;
  imageIsRepresentative: boolean;
  imageLabel: string;
  excursions: ExperienceLink[];
  safaris: ExperienceLink[];
  packages: ExperienceLink[];
}
export interface FoodPlace {
  id: string;
  name: string;
  occasion: string;
  description: string;
  mapUrl: string;
}
export interface FoodArea {
  id: string;
  label: string;
  hint: string;
  mapLabel: string;
  image: string;
  places: FoodPlace[];
}
export interface GuideEvent {
  id: string;
  name: string;
  when: string;
  where: string;
  description: string;
  url: string;
}
export interface MonthlySeason {
  month: string;
  shortName: string;
  monthIndex: number;
  temperature: number;
  season: 'peak' | 'high' | 'low';
  score: number;
}

/** Regenerate with npm run content:sync; never edit the generated JSON by hand. */
export const destinations = snapshot.destinations as Destination[];
export const foodAreas = snapshot.foodAreas as FoodArea[];
export const guideEvents = snapshot.guideEvents as GuideEvent[];
export const monthlySeasons = snapshot.monthlySeasons as MonthlySeason[];
export const guideCopy = snapshot.guideCopy;
export const seasonLegend = snapshot.seasonLegend;
export const contentProvenance = snapshot.provenance;

export const destinationById = Object.fromEntries(destinations.map((destination) => [destination.id, destination]));
export function websiteUrl(path: string): string {
  return new URL(path, WEBSITE_URL).href;
}
