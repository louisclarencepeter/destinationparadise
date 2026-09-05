/** Builds a deterministic mobile snapshot from the website's editorial sources. */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { runInNewContext } from 'node:vm';
import { DESTINATION_MAP_PINS } from '../../src/data/destinationMapPins.js';
import { DESTINATION_HUBS } from '../../src/data/explorePageContent.js';
import { EXCURSIONS } from '../../src/data/excursionsData.js';
import { ALL_SAFARI_PRODUCTS, PARKS } from '../../src/data/safariPageData.js';
import { buildLocalizedPackages } from '../../src/data/packagePresentation.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const website = 'https://yournexttriptoparadise.com';
const sourcePaths = [
  'src/data/destinationMapPins.js', 'src/data/explorePageContent.js',
  'src/data/excursionsData.js', 'src/data/safariPageData.js',
  'src/data/nextLevelSafariProducts.js', 'src/data/safariPricing.js',
  'src/data/packagePresentation.js', 'src/data/destinationParadisePackages.js',
  'src/utils/productImages.js',
  'src/components/explore/ExploreLocalGuide.jsx', 'src/locales/en/explore.json',
  'src/locales/en/home.json', 'src/pages/Homepage.jsx',
];
const sourceText = Object.fromEntries(await Promise.all(sourcePaths.map(async (path) => [path, await readFile(resolve(root, path), 'utf8')])));
const explore = JSON.parse(sourceText['src/locales/en/explore.json']);
const home = JSON.parse(sourceText['src/locales/en/home.json']);
const localGuideSource = sourceText['src/components/explore/ExploreLocalGuide.jsx'];
function constantFromSource(source, name, pattern) {
  const match = source.match(new RegExp(`const ${name} = (${pattern});`));
  if (!match) throw new Error(`Could not read website constant ${name}; update the sync adapter for the new source structure.`);
  // Only the matched static literal in our own source is evaluated, without imports or host globals.
  return JSON.parse(JSON.stringify(runInNewContext(`(${match[1]})`, Object.create(null), { timeout: 100 })));
}
const areaKeys = constantFromSource(localGuideSource, 'AREA_KEYS', '\\[[^;]+\\]');
const areaImages = constantFromSource(localGuideSource, 'AREA_IMAGES', '\\{[^;]+\\}');
const eventLinks = constantFromSource(localGuideSource, 'EVENT_LINKS', '\\{[^;]+\\}');
const months = constantFromSource(sourceText['src/pages/Homepage.jsx'], 'MONTHS', '\\[[^;]+\\]');
const scores = constantFromSource(sourceText['src/pages/Homepage.jsx'], 'SCORES', '\\[[^;]+\\]');
const packages = buildLocalizedPackages((_key, options) => options?.defaultValue ?? {});
const experienceImages = new Map([
  ...EXCURSIONS.map((item) => [`/excursions/${item.id}`, item.originalImage || item.image]),
  ...ALL_SAFARI_PRODUCTS.map((item) => [`/safaris/${item.id}`, item.originalImage || item.image]),
  ...packages.map((item) => [`/packages/${item.id}`, item.originalImage || item.image]),
]);
const experienceImageLabels = new Map([
  ...EXCURSIONS.map((item) => [`/excursions/${item.id}`, item.alt || item.title]),
  ...ALL_SAFARI_PRODUCTS.map((item) => [`/safaris/${item.id}`, item.alt || item.title]),
]);
const absoluteImage = async (path) => {
  if (!path?.startsWith('/assets/')) throw new Error(`Expected a website-owned image: ${path}`);
  await access(resolve(root, 'public', path.slice(1)));
  return new URL(path, website).href;
};
const destinations = await Promise.all(DESTINATION_MAP_PINS.map(async (pin, index) => {
  const hub = DESTINATION_HUBS[pin.id];
  if (!hub) throw new Error(`Missing destination hub for ${pin.id}`);
  const related = [...(hub.excursions || []), ...(hub.safaris || []), ...(hub.packages || [])];
  const park = PARKS.find((item) => item.name.toLowerCase().includes(pin.name.toLowerCase()));
  const imageExperience = related.find((item) => experienceImages.get(item.to)?.startsWith('/assets/'));
  const image = park?.image || experienceImages.get(imageExperience?.to);
  // Website park/safari photos show animals without confirmed exact-location provenance.
  // Zanzibar excursion photography has explicit source alt text identifying its locality;
  // Fumba/Matemwe depict the linked Menai Bay/Mnemba outings, labelled as those places.
  const imageIsRepresentative = pin.region === 'Mainland';
  const imageLabel = imageIsRepresentative
    ? 'Tanzania safari inspiration · representative photo'
    : experienceImageLabels.get(imageExperience?.to) || hub.title;
  return {
    ...pin, number: index + 1, type: hub.type, text: hub.text, bestFor: hub.bestFor,
    image: await absoluteImage(image), imageIsRepresentative, imageLabel,
    excursions: hub.excursions || [], safaris: hub.safaris || [], packages: hub.packages || [],
  };
}));
const mapUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
const foodAreas = await Promise.all(areaKeys.map(async (id) => {
  const area = explore.local_guide.areas[id];
  return {
    id, label: area.label, hint: area.hint, mapLabel: area.map_label,
    image: await absoluteImage(`/assets/images/excursions/trips/${areaImages[id]}-600w.webp`),
    places: area.places.map((place, index) => ({
      id: `${id}-${index + 1}`, ...place,
      mapUrl: mapUrl(`${place.name} ${area.map_label} Zanzibar`),
    })),
  };
}));
const guideEvents = explore.local_guide.events.items.map((event) => ({
  ...event,
  url: eventLinks[event.id] ? new URL(eventLinks[event.id], website).href : mapUrl(`${event.where} Zanzibar`),
}));
const monthlySeasons = months.map((month, monthIndex) => ({
  month: new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, monthIndex, 1))),
  shortName: month.m, monthIndex, temperature: month.t, season: month.season, score: scores[monthIndex],
}));
if (destinations.length !== 24 || foodAreas.length !== 8 || foodAreas.flatMap((area) => area.places).length !== 32 || guideEvents.length !== 6 || monthlySeasons.length !== 12) {
  throw new Error('Website content counts changed; review the mobile contract before syncing.');
}
const snapshot = {
  provenance: {
    website, language: 'en', guideReviewed: explore.local_guide.reviewed,
    seasonalValues: 'Website editorial guide; typical monthly temperatures and hotel seasons, not a weather forecast.',
    destinationImages: 'Website park photographs or photographs from related excursion/safari products. Mainland photographs may be representative of safari experiences rather than the exact destination.',
    sources: sourcePaths.map((path) => ({ path, sha256: createHash('sha256').update(sourceText[path]).digest('hex') })),
  },
  destinations, foodAreas, guideEvents, monthlySeasons,
  guideCopy: {
    title: explore.local_guide.title, lead: explore.local_guide.lead, reviewed: explore.local_guide.reviewed,
    eventTitle: explore.local_guide.events.title, eventLead: explore.local_guide.events.lead,
  },
  seasonLegend: home.weather.legend,
};
const output = resolve(root, 'mobile/src/data/generated-content.json');
const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (await readFile(output, 'utf8') !== serialized) throw new Error('Mobile content is out of date. Run npm run content:sync inside mobile.');
  console.log('Mobile content matches website sources: 24 destinations, 32 food places, 6 events, 12 months.');
} else {
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, serialized);
  console.log('Synced 24 destinations, 32 food places, 6 events and 12 months from website sources.');
}
