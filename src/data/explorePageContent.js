import { EXCURSIONS } from './excursionsData.js';
import { destinationParadisePackages } from './destinationParadisePackages.js';
import { destinationParadiseSafariPricing } from './safariPricing.js';

export const EXPLORE_HERO_IMAGE = '/assets/images/home/stone-town-waterfront.webp';
export const EXPLORE_CTA_IMAGE = '/assets/images/safaris/buffalo-herd-close.webp';

export const EXPLORE_PATHS = [
  {
    eyebrow: 'Pakiety',
    title: 'Chcę mieć całą podróż ułożoną',
    text: 'Hotele, safari, wycieczki, transfery i wyjątkowe momenty połączone w jeden plan.',
    to: '/packages',
    image: '/assets/images/safaris/zebra-herd-on-track.webp',
  },
  {
    eyebrow: 'Wycieczki',
    title: 'Jestem już na wyspie',
    text: 'Wycieczki jednodniowe, rejsy dhow, Stone Town, farmy przypraw, Jozani, snorkeling, kultura i dni nad oceanem.',
    to: '/excursions',
    image: '/assets/images/excursions/safari-blue-sandbank.webp',
  },
  {
    eyebrow: 'Safari',
    title: 'Chcę dzikiej Tanzanii',
    text: 'Ikony północy, dzikie południe, zachodnie trasy z szympansami, szybkie fly-in, Kilimandżaro i przystanki kulturowe.',
    to: '/safaris',
    image: '/assets/images/safaris/male-lion-in-grass.webp',
  },
  {
    eyebrow: 'Planer podróży',
    title: 'Potrzebuję pomocy w wyborze',
    text: 'Podaj planerowi AI daty, tempo, budżet i styl podróży. My zamienimy szkic w realną wycenę.',
    to: '/trip-planner',
    image: '/assets/images/safaris/crowned-crane-close.webp',
  },
];

export const DESTINATION_HUBS = {
  'stone-town': {
    title: 'Stone Town',
    type: 'Centrum kultury',
    text: 'Najlepsze dla gości, którzy chcą historii, jedzenia, rzeźbionych drzwi, targów, dachów, przypraw i spokojnego pierwszego dnia na Zanzibarze.',
    bestFor: ['Kultura', 'Jedzenie', 'Pierwszy dzień', 'Dobre na deszcz'],
    excursions: [
      { label: 'Historyczny spacer po mieście', to: '/excursions/stone-town' },
      { label: 'Wycieczka przyprawowa', to: '/excursions/spice-tour' },
      { label: 'Stone Town i Prison Island', to: '/excursions/combinations/tortoises-alleys' },
    ],
    packages: [
      { label: '9 dni: safari, Zanzibar i kultura', to: '/packages/nine-day-safari-zanzibar-culture' },
      { label: 'Stone Town i doświadczenie kulturowe', to: '/packages/stone-town-culture-experience' },
    ],
  },
  fumba: {
    title: 'Fumba',
    type: 'Oceaniczna baza',
    text: 'Klasyczny punkt startowy na rejs dhow, sandbanki, snorkeling, lunch z owocami morza i spokojne dni w Menai Bay.',
    bestFor: ['Rejs dhow', 'Piknik na sandbanku', 'Snorkeling', 'Pary'],
    excursions: [
      { label: 'Safari Blue: dhow i snorkeling', to: '/excursions/safari-blue' },
      { label: 'Rafa i namorzyny', to: '/excursions/combinations/reef-mangrove' },
    ],
    packages: [
      { label: 'Pakiet przygoda i ocean na Zanzibarze', to: '/packages/zanzibar-adventure-marine-package' },
      { label: '6 dni safari i Zanzibar', to: '/packages/six-day-safari-zanzibar-escape' },
    ],
  },
  kizimkazi: {
    title: 'Kizimkazi',
    type: 'Południowe wybrzeże',
    text: 'Najlepsze na poranne wyprawy na delfiny i spokojniejszy rytm południa, często łączone z Jozani albo lunchem na plaży.',
    bestFor: ['Delfiny', 'Wczesny start', 'Natura', 'Południe'],
    excursions: [
      { label: 'Wycieczka na delfiny', to: '/excursions/dolphins' },
      { label: 'Natura południowego wybrzeża', to: '/excursions/combinations/south-coast-nature' },
    ],
    packages: [
      { label: 'Pakiet przygoda i ocean na Zanzibarze', to: '/packages/zanzibar-adventure-marine-package' },
    ],
  },
  jozani: {
    title: 'Jozani Forest',
    type: 'Przystanek natury',
    text: 'Lekki kontakt z naturą: gerezy rude, kładki w namorzynach i chwila lasu między plażą a dniem kulturowym.',
    bestFor: ['Rodziny', 'Natura', 'Zwierzęta', 'Pół dnia'],
    excursions: [
      { label: 'Jozani Forest Tour', to: '/excursions/jozani' },
      { label: 'Las i przyprawy', to: '/excursions/combinations/forest-spice' },
    ],
    packages: [
      { label: 'Pakiet przygoda i ocean na Zanzibarze', to: '/packages/zanzibar-adventure-marine-package' },
      { label: '9 Days Safari, Zanzibar & Culture', to: '/packages/nine-day-safari-zanzibar-culture' },
    ],
  },
  nungwi: {
    title: 'Nungwi',
    type: 'Północna plaża',
    text: 'Najwygodniejsza baza na północy: szerokie plaże, zachody słońca, żółwie, stocznie dhow i dni snorkelingowe przy Mnemba.',
    bestFor: ['Plaża', 'Zachód słońca', 'Snorkeling', 'Podróż poślubna'],
    excursions: [
      { label: 'Północ wyspy · Nungwi', to: '/excursions/north-nungwi' },
      { label: 'Mnemba snorkeling i północ wyspy', to: '/excursions/mnemba' },
      { label: 'Cały dzień na północnym wybrzeżu', to: '/excursions/combinations/north-coast-all-day' },
    ],
    packages: [
      { label: '7 Days Honeymoon Safari & Zanzibar', to: '/packages/seven-day-honeymoon-safari-zanzibar' },
      { label: '10 Days Classic Safari & Zanzibar', to: '/packages/ten-day-classic-safari-zanzibar' },
    ],
  },
  matemwe: {
    title: 'Matemwe',
    type: 'Wybrzeże raf',
    text: 'Spokojniejsza baza na północnym wschodzie: rafy, snorkeling przy Mnemba, butikowe pobyty i ocean bez najbardziej ruchliwego rytmu plaż.',
    bestFor: ['Snorkeling', 'Spokojna plaża', 'Rafy', 'Pary'],
    excursions: [
      { label: 'Mnemba snorkeling i północ wyspy', to: '/excursions/mnemba' },
      { label: 'Cały dzień na północnym wybrzeżu', to: '/excursions/combinations/north-coast-all-day' },
    ],
    packages: [
      { label: '7 Days Honeymoon Safari & Zanzibar', to: '/packages/seven-day-honeymoon-safari-zanzibar' },
      { label: 'Pakiet przygoda i ocean na Zanzibarze', to: '/packages/zanzibar-adventure-marine-package' },
    ],
  },
  paje: {
    title: 'Paje',
    type: 'Wschodnie wybrzeże',
    text: 'Wietrzna baza na kitesurfing, spacery po lagunie, swobodne plażowe pobyty i aktywne dni nad oceanem.',
    bestFor: ['Kitesurfing', 'Plaża', 'Przygoda', 'Dłuższy pobyt'],
    excursions: [
      { label: 'Lekcje kitesurfingu', to: '/excursions/kitesurfing' },
      { label: 'Pakiet przygoda i ocean na Zanzibarze', to: '/packages/zanzibar-adventure-marine-package' },
    ],
    packages: [
      { label: 'Zanzibar dla digital nomadów', to: '/packages/digital-nomad-zanzibar-stay' },
      { label: 'Pakiet przygoda i ocean na Zanzibarze', to: '/packages/zanzibar-adventure-marine-package' },
    ],
  },
  arusha: {
    title: 'Arusha',
    type: 'Brama safari',
    text: 'Główny punkt startowy safari w północnej Tanzanii, dodatków pod Kilimandżaro i wygodnych połączeń do Tarangire, Manyara, Ngorongoro oraz Serengeti.',
    bestFor: ['Start safari', 'Lotnisko', 'Północny szlak', 'Kilimandżaro'],
    safaris: [
      { label: 'Ngorongoro i Tarangire', to: '/safaris/ngorongoro-tarangire' },
      { label: 'Migracja w Serengeti', to: '/safaris/serengeti-migration' },
      { label: 'Jednodniowe Kilimandżaro', to: '/safaris/kilimanjaro-day-hike' },
    ],
    packages: [
      { label: '10 Days Classic Safari & Zanzibar', to: '/packages/ten-day-classic-safari-zanzibar' },
      { label: 'Kilimandżaro + safari + Zanzibar', to: '/packages/kilimanjaro-safari-zanzibar-expedition' },
    ],
  },
  serengeti: {
    title: 'Serengeti',
    type: 'Szlak safari',
    text: 'Najbardziej rozpoznawalna kotwica safari: równiny migracji, drapieżniki, loty balonem i trasy fly-in z Zanzibaru.',
    bestFor: ['Migracja', 'Wielkie koty', 'Fotografia', 'Luksusowe campy'],
    safaris: [
      { label: 'Migracja w Serengeti', to: '/safaris/serengeti-migration' },
      { label: '3 Days Serengeti Fly-In Safari', to: '/packages/three-day-serengeti-fly-in-safari' },
    ],
    packages: [
      { label: 'Luksusowy pakiet Wielkiej Migracji', to: '/packages/great-migration-luxury-package' },
      { label: '12 Days Serengeti & Zanzibar', to: '/packages/twelve-day-serengeti-zanzibar' },
    ],
  },
  ngorongoro: {
    title: 'Ngorongoro',
    type: 'Safari w kraterze',
    text: 'Duże zagęszczenie zwierząt, krajobrazy krateru, szanse na czarnego nosorożca i świetny wybór na krótsze safari w Tanzanii.',
    bestFor: ['Wielka Piątka', 'Krótkie safari', 'Pierwszy raz', 'Widoki krateru'],
    safaris: [
      { label: 'Ngorongoro z noclegiem', to: '/safaris/ngorongoro-overnight' },
      { label: 'Ngorongoro i Tarangire', to: '/safaris/ngorongoro-tarangire' },
    ],
    packages: [
      { label: '8 Days Tanzania Parks & Zanzibar', to: '/packages/eight-day-tanzania-parks-zanzibar' },
      { label: '10 Days Classic Safari & Zanzibar', to: '/packages/ten-day-classic-safari-zanzibar' },
    ],
  },
  tarangire: {
    title: 'Tarangire',
    type: 'Kraina słoni',
    text: 'Mocny wybór na krótkie safari: słonie, baobaby i proste połączenie z Ngorongoro.',
    bestFor: ['Słonie', 'Baobaby', 'Krótkie safari', 'Dobra wartość'],
    safaris: [
      { label: 'Tarangire Express Day Safari', to: '/safaris/tarangire-day-trip' },
      { label: 'Krótki szlak Tarangire + Ngorongoro', to: '/safaris/tarangire-ngorongoro-short' },
    ],
    packages: [
      { label: '6 Days Safari & Zanzibar Escape', to: '/packages/six-day-safari-zanzibar-escape' },
      { label: '8 Days Tanzania Parks & Zanzibar', to: '/packages/eight-day-tanzania-parks-zanzibar' },
    ],
  },
  manyara: {
    title: 'Lake Manyara',
    type: 'Jeziorny park północy',
    text: 'Kompaktowy przystanek północnego szlaku: widoki na jezioro, ptaki, las i łagodny dzień safari między Tarangire a Ngorongoro.',
    bestFor: ['Ptaki', 'Rodziny', 'Krótki game drive', 'Północny szlak'],
    safaris: [
      { label: 'Ngorongoro i Tarangire', to: '/safaris/ngorongoro-tarangire' },
      { label: 'Krótki szlak Tarangire + Ngorongoro', to: '/safaris/tarangire-ngorongoro-short' },
    ],
    packages: [
      { label: '10 Days Classic Safari & Zanzibar', to: '/packages/ten-day-classic-safari-zanzibar' },
    ],
  },
  'lake-natron': {
    title: 'Lake Natron',
    type: 'Jezioro przygody',
    text: 'Odległe krajobrazy sodowego jeziora, lęgowiska flamingów, gorące źródła, wioski Masajów i wulkaniczne widoki przy Ol Doinyo Lengai.',
    bestFor: ['Flamingi', 'Odległe krajobrazy', 'Fotografia', 'Przygoda'],
    safaris: [
      { label: 'Lake Natron i flamingi', to: '/safaris/lake-natron-expedition' },
      { label: 'Autentyczna wyprawa do Masajów', to: '/safaris/maasai-cultural-expedition' },
    ],
  },
  olduvai: {
    title: 'Olduvai Gorge',
    type: 'Przystanek historii',
    text: 'Miejsce początków człowieka między Ngorongoro a Serengeti, dobre dla gości, którzy chcą archeologii i kontekstu obok safari.',
    bestFor: ['Początki człowieka', 'Historia', 'Dodatek do Ngorongoro', 'Kultura'],
    safaris: [
      { label: 'Olduvai Gorge i początki człowieka', to: '/safaris/olduvai-gorge' },
      { label: 'Ngorongoro i Tarangire', to: '/safaris/ngorongoro-tarangire' },
    ],
    packages: [
      { label: '9 Days Safari, Zanzibar & Culture', to: '/packages/nine-day-safari-zanzibar-culture' },
    ],
  },
  maasai: {
    title: 'Maasai Villages',
    type: 'Safari kulturowe',
    text: 'Warstwa kulturowa dla osób, które chcą czasu w wiosce, tradycji Masajów, lokalnego gotowania i bardziej ludzkiej historii północnego szlaku.',
    bestFor: ['Kultura', 'Rodziny', 'Fotografia', 'Dodatek do północy'],
    safaris: [
      { label: 'Autentyczna wyprawa do Masajów', to: '/safaris/maasai-cultural-expedition' },
      { label: 'Lake Natron i flamingi', to: '/safaris/lake-natron-expedition' },
    ],
    packages: [
      { label: '9 Days Safari, Zanzibar & Culture', to: '/packages/nine-day-safari-zanzibar-culture' },
    ],
  },
  kilimanjaro: {
    title: 'Mount Kilimanjaro',
    type: 'Górska przygoda',
    text: 'Górska ikona Tanzanii, dostępna jako jednodniowe doświadczenie albo jako główny punkt dłuższej kombinacji: wejście, safari i Zanzibar.',
    bestFor: ['Widoki gór', 'Trekking', 'Lista marzeń', 'Przygoda'],
    safaris: [
      { label: 'Jednodniowe Kilimandżaro', to: '/safaris/kilimanjaro-day-hike' },
      { label: 'Wodospady Materuni i kawa', to: '/safaris/materuni-waterfalls-coffee' },
    ],
    packages: [
      { label: 'Kilimandżaro + safari + Zanzibar', to: '/packages/kilimanjaro-safari-zanzibar-expedition' },
    ],
  },
  materuni: {
    title: 'Materuni',
    type: 'Górska wioska',
    text: 'Łagodniejszy dzień u stóp Kilimandżaro: spacer do wodospadu, farmy kawy, kultura Chagga i górskie krajobrazy.',
    bestFor: ['Wodospad', 'Kawa', 'Kultura', 'Lekka przygoda'],
    safaris: [
      { label: 'Wodospady Materuni i kawa', to: '/safaris/materuni-waterfalls-coffee' },
      { label: 'Jednodniowe Kilimandżaro', to: '/safaris/kilimanjaro-day-hike' },
    ],
    packages: [
      { label: 'Kilimandżaro + safari + Zanzibar', to: '/packages/kilimanjaro-safari-zanzibar-expedition' },
    ],
  },
  mikumi: {
    title: 'Mikumi National Park',
    type: 'Szybkie safari fly-in',
    text: 'Jedna z najszybszych opcji safari z Zanzibaru: lwy, żyrafy, bawoły, zebry i prosta logistyka na krótki pobyt.',
    bestFor: ['Krótki pobyt', 'Dobra wartość', 'Pierwsze safari', 'Goście z Zanzibaru'],
    safaris: [
      { label: 'Mikumi fly-in z Zanzibaru', to: '/safaris/mikumi-flyin' },
      { label: '2 dni fly-in safari z Zanzibaru', to: '/packages/two-day-fly-in-safari-zanzibar' },
    ],
    packages: [
      { label: '2 dni fly-in safari z Zanzibaru', to: '/packages/two-day-fly-in-safari-zanzibar' },
    ],
  },
  selous: {
    title: 'Nyerere National Park',
    type: 'Safari południa',
    text: 'Dzikszy południowy wybór: safari łodzią, piesze safari, mniej samochodów i szybkie opcje fly-in z Zanzibaru.',
    bestFor: ['Safari łodzią', 'Piesze safari', 'Fly-in', 'Dzicz'],
    safaris: [
      { label: 'Dzika Nyerere (Selous)', to: '/safaris/nyerere-selous' },
      { label: '2 dni fly-in safari z Zanzibaru', to: '/packages/two-day-fly-in-safari-zanzibar' },
    ],
    packages: [
      { label: '2 dni fly-in safari z Zanzibaru', to: '/packages/two-day-fly-in-safari-zanzibar' },
      { label: '14 Days Ultimate Tanzania & Zanzibar', to: '/packages/fourteen-day-ultimate-tanzania-zanzibar' },
    ],
  },
  saadani: {
    title: 'Saadani National Park',
    type: 'Safari przy plaży',
    text: 'Rzadkie safari nad Oceanem Indyjskim, gdzie spotykają się plaża, rzeka i bush. Dobre dla osób szukających innej, nadmorskiej dziczy.',
    bestFor: ['Plaża + bush', 'Safari łodzią', 'Żółwie', 'Nietypowe trasy'],
    safaris: [
      { label: 'Saadani: plaża i safari', to: '/safaris/saadani-beach-safari' },
      { label: 'Dzika Nyerere (Selous)', to: '/safaris/nyerere-selous' },
    ],
  },
  udzungwa: {
    title: 'Udzungwa Mountains',
    type: 'Trekkingowa dzicz',
    text: 'Trekking w lesie deszczowym, wodospady, rzadkie naczelne i górski kontrapunkt dla Mikumi lub południowych tras safari.',
    bestFor: ['Trekking', 'Wodospady', 'Rzadkie naczelne', 'Natura'],
    safaris: [
      { label: 'Trekkingowe safari w Udzungwa', to: '/safaris/udzungwa-hiking-safari' },
      { label: 'Mikumi fly-in z Zanzibaru', to: '/safaris/mikumi-flyin' },
    ],
  },
  ruaha: {
    title: 'Ruaha National Park',
    type: 'Wielkie koty południa',
    text: 'Odległy park południa znany z wielkich kotów, dolin baobabów, mniejszej liczby aut i mocniejszego poczucia dziczy niż klasyczna północ.',
    bestFor: ['Wielkie koty', 'Odległe safari', 'Powracający goście', 'Fotografia'],
    safaris: [
      { label: 'Ruaha szlakiem wielkich kotów', to: '/safaris/ruaha-big-cat' },
      { label: 'Dzika Nyerere (Selous)', to: '/safaris/nyerere-selous' },
    ],
    packages: [
      { label: '14 Days Ultimate Tanzania & Zanzibar', to: '/packages/fourteen-day-ultimate-tanzania-zanzibar' },
    ],
  },
  mahale: {
    title: 'Mahale Mountains & Lake Tanganyika',
    type: 'Zachodni szlak szympansów',
    text: 'Zachodni szlak premium: trekking do dzikich szympansów, odległe lodge nad jeziorem, spacery po lesie i odpoczynek nad Tanganiką.',
    bestFor: ['Szympansy', 'Jezioro Tanganika', 'Odległy luksus', 'Przygoda'],
    safaris: [
      { label: 'Mahale, szympansy i Lake Tanganyika', to: '/safaris/mahale-chimp' },
      { label: 'Ekspedycja do szympansów', to: '/safaris/chimpanzee-trekking' },
    ],
  },
  katavi: {
    title: 'Katavi National Park',
    type: 'Odległy frontier',
    text: 'Dzicz dalekiego zachodu dla doświadczonych podróżników safari: stada na równinach zalewowych, koalicje lwów, baseny hipopotamów i bardzo mało samochodów.',
    bestFor: ['Odległa dzicz', 'Stada bawołów', 'Doświadczeni w safari', 'Fly-in'],
    safaris: [
      { label: 'Katavi: dziki frontier', to: '/safaris/katavi-frontier' },
      { label: 'Mahale, szympansy i Lake Tanganyika', to: '/safaris/mahale-chimp' },
    ],
  },
};

export const MIN_PACKAGE_PRICE = Math.min(...destinationParadisePackages.map((item) => item.pricing.from));
export const MIN_SAFARI_PRICE = Math.min(...destinationParadiseSafariPricing.map((item) => item.recommendedPublicPrice.lowSeason));
export const MIN_EXPLORE_EXCURSION_PRICE = Math.min(...EXCURSIONS.map((item) => item.price).filter((price) => typeof price === 'number'));

export function plannerHrefForHub(hub) {
  const params = new URLSearchParams({
    place: hub.title,
    type: hub.type,
    context: hub.text,
    bestFor: hub.bestFor.join(', '),
  });

  return `/trip-planner?${params.toString()}#planner`;
}
