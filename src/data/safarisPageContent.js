export const safariImg = (file) => `/assets/images/safaris/${file}`;

export const WILDLIFE_CATEGORIES = [
  {
    title: 'Wielkie koty',
    sub: 'Drapieżniki',
    rowMod: 'cats',
    tiles: [
      { src: 'male-lion-in-grass.webp', alt: 'Lew odpoczywający w trawie', cap: 'Lew · Krater Ngorongoro', mod: 'wide' },
      { src: 'serval-in-grass.webp', alt: 'Serwal w trawie', cap: 'Serwal · rzadkie spotkanie za dnia' },
      { src: 'lion-cub-in-grass.webp', alt: 'Lwiątko w trawie', cap: 'Lwiątko · około dziesięciu tygodni' },
      { src: 'lioness-and-cub-resting.webp', alt: 'Lwica z młodym podczas odpoczynku', cap: 'Lwica z młodym · wieczorny spokój', mod: 'wide' },
    ],
  },
  {
    title: 'Kopytni giganci',
    sub: 'Stada sawanny',
    rowMod: 'ungulates',
    tiles: [
      { src: 'zebra-mare-and-foal.webp', alt: 'Klacz zebry z młodym', cap: 'Zebra · mama z młodym', mod: 'tall' },
      { src: 'zebra-herd-on-track.webp', alt: 'Stado zebr na drodze', cap: 'Stado przed decyzją', mod: 'wide' },
      { src: 'wildebeest-grazing.webp', alt: 'Pasący się gnu pręgowany', cap: 'Gnu pręgowane' },
      { src: 'eland-grazing.webp', alt: 'Pasący się eland', cap: 'Eland · największa antylopa' },
      { src: 'eland-herd-plains.webp', alt: 'Stado elandów', cap: 'Stado elandów · Ngorongoro', mod: 'wide' },
      { src: 'warthog-on-plains.webp', alt: 'Guziec na równinie', cap: 'Guziec · sawanna z bliska' },
    ],
  },
  {
    title: 'Waga ciężka',
    sub: 'Duże i rzadkie',
    rowMod: 'heavy',
    tiles: [
      { src: 'buffalo-herd-close.webp', alt: 'Stado bawołów afrykańskich z bliska', cap: 'Bawoły afrykańskie · mocne charaktery', mod: 'wide' },
      { src: 'buffalo-and-egret.webp', alt: 'Bawół z czaplą złotawą', cap: 'Bawół i czapla · dobrana para', mod: 'wide' },
      { src: 'rhino-on-plains.webp', alt: 'Czarny nosorożec na równinie', cap: 'Czarny nosorożec · mniej niż 30 w kraterze', mod: 'full' },
    ],
  },
  {
    title: 'Ptaki',
    sub: '400+ gatunków',
    rowMod: 'birds',
    tiles: [
      { src: 'crowned-crane-close.webp', alt: 'Koronnik szary z bliska', cap: 'Koronnik szary', mod: 'tall' },
      { src: 'crowned-cranes-in-grass.webp', alt: 'Para koronników szarych', cap: 'Para · najczęściej razem' },
      { src: 'yellow-weaver-on-rail.webp', alt: 'Żółty wikłacz na poręczy', cap: "Wikłacz Spekego · stały gość lodge'u" },
      { src: 'raptor-on-log.webp', alt: 'Sokół skalny na skale', cap: 'Sokół skalny · z ofiarą', mod: 'wide' },
    ],
  },
];

export const SEASONS = [
  {
    mod: 'peak',
    months: 'Jun · Jul · Aug · Sep · Oct',
    title: 'Sucho i klasycznie',
    blurb: 'Zwierzęta trzymają się wodopojów, a przeprawy przez rzekę Mara zwykle wypadają od lipca do września. Złote trawy, chłodniejsze poranki i najbardziej pocztówkowy klimat. Rezerwacje znikają nawet 6+ miesięcy wcześniej.',
    rating: '★★★★★',
  },
  {
    mod: 'good',
    months: 'Dec · Jan · Feb',
    title: 'Sezon narodzin',
    blurb: 'W lutym na południowych równinach Serengeti rodzą się setki tysięcy młodych gnu. Drapieżniki są bardzo aktywne, krajobraz jest bujny, a parki spokojniejsze.',
    rating: '★★★★☆',
  },
  {
    mod: 'shoulder',
    months: 'Nov · Mar',
    title: 'Zielono i korzystniej',
    blurb: 'Krótki sezon deszczowy daje dramatyczne niebo, mniej aut w parkach i ceny niższe o 20-30%. Listopad jest świetny na ptaki, choć część dróg potrafi być błotnista.',
    rating: '★★★☆☆',
  },
  {
    mod: 'avoid',
    months: 'Apr · May',
    title: 'Długie deszcze',
    blurb: 'Wiele campów się zamyka, a drogi bywają zalane. To opcja głównie dla łowców okazji, choć w tym czasie często proponujemy gościom inne rozwiązania.',
    rating: '★★☆☆☆',
  },
];

export const SAFARI_COMPARISON = [
  { label: 'Najlepszy krótki smak safari', pick: 'Tarangire Express Day Safari', slug: 'tarangire-day-trip', note: 'Najmniejsze zobowiązanie i prawdziwe zwierzęta lądu stałego w jeden dzień.' },
  { label: 'Najlepsze krótkie safari', pick: 'Ngorongoro Overnight', slug: 'ngorongoro-overnight', note: 'Jedna noc, ogromne zagęszczenie zwierząt i krater o pierwszym świetle.' },
  { label: 'Najlepsza trasa na pierwszy raz', pick: 'Ngorongoro & Tarangire', slug: 'ngorongoro-tarangire', note: 'Klasyczne krajobrazy Wielkiej Piątki, słonie i baobaby.' },
  { label: 'Najlepsze na migrację', pick: 'Serengeti Migration', slug: 'serengeti-migration', note: 'Na sezon przepraw rzecznych i wielki spektakl otwartych równin.' },
  { label: 'Najlepsza dzika odsłona', pick: 'Nyerere, Ruaha, Katavi', slug: 'nyerere-selous', note: 'Mniej samochodów, bardziej dzikie campy i mocniejszy smak przygody.' },
  { label: 'Najlepszy dodatek premium', pick: 'Mahale Chimp & Lake Tanganyika', slug: 'mahale-chimp', note: 'Rzadki trekking do szympansów z odpoczynkiem nad jeziorem.' },
];

export const BOOKING_STEPS = [
  { step: '01', title: 'Wybierz trasę', text: 'Zacznij od jednej z propozycji albo wyślij daty, a my dobierzemy najlepsze safari do budżetu.' },
  { step: '02', title: 'Liczymy realną podróż', text: 'Sprawdzamy loty, dostępność campów, opłaty parkowe i sezon, zanim wyślemy finalną wycenę.' },
  { step: '03', title: 'Zaliczka potwierdza rezerwację', text: 'Zaliczka blokuje loty, przewodnika, campy i transfery. Resztę opłacasz przed podróżą.' },
];

export const INITIAL_SAFARI_COUNT = 9;
export const SAFARI_BATCH_COUNT = 9;

export const SAFARI_FILTERS = [
  { key: 'all', label: 'Wszystkie', match: () => true },
  {
    key: 'classic',
    label: 'Klasyczne trasy',
    match: (item) => ['Northern Circuit', 'Migration Safari', 'Last-minute Safari', 'Day Safari'].includes(item.category),
  },
  {
    key: 'southern',
    label: 'Parki południa',
    match: (item) => ['Southern Circuit', 'Quick Safari', 'Beach & Safari', 'Hiking & Nature'].includes(item.category),
  },
  {
    key: 'western',
    label: 'Zachód i odludne trasy',
    match: (item) => ['Western Circuit', 'Wildlife'].includes(item.category) || ['katavi-frontier', 'mahale-chimp', 'chimpanzee-trekking'].includes(item.id),
  },
  {
    key: 'short',
    label: '1-3 dni',
    match: (item) => /1 Day|1 - 2 Days|1 - 3 Days|1 night|2 nights/i.test(item.duration),
  },
  {
    key: 'culture',
    label: 'Kultura i natura',
    match: (item) => ['Culture', 'History & Safari', 'Nature & Culture', 'Nature & Adventure', 'Mountain Adventure'].includes(item.category),
  },
  {
    key: 'luxury',
    label: 'Luksus i prywatnie',
    match: (item) => ['Luxury', 'Luxury & Wellness', 'Ultra Luxury'].includes(item.category),
  },
  {
    key: 'special',
    label: 'Specjalne zainteresowania',
    match: (item) => ['Photography', 'Birding', 'Adventure', 'Migration', 'Family'].includes(item.category),
  },
  {
    key: 'combo',
    label: 'Safari i plaża',
    match: (item) => ['Combo', 'Beach & Safari', 'Multi Country'].includes(item.category),
  },
];

export const FAQS = [
  {
    q: 'Ile dni warto przeznaczyć na safari?',
    a: 'Trzy noce to absolutne minimum i ma sens głównie przy przelotach między parkami. Pięć nocy to najwygodniejszy balans. Powyżej siedmiu zwykle zaczyna się tęsknić za plażą, dlatego większość gości łączy safari z Zanzibarem.',
    open: true,
  },
  {
    q: 'Czy można zabrać dzieci?',
    a: 'Tak, wiele campów przyjmuje dzieci od 7. roku życia. Dobieramy rodzinne lodge z basenem i elastycznym planem przejazdów. Dla młodszych dzieci częściej polecamy Tarangire niż Serengeti: krótsze dystanse i świetne szanse na słonie.',
  },
  {
    q: 'Co z malarią?',
    a: 'Tanzania leży w strefie malarycznej. Przed wyjazdem porozmawiaj z lekarzem medycyny podróży o profilaktyce. Campy zapewniają repelenty, moskitiery, a wiele namiotów ma dodatkowe siatki.',
  },
  {
    q: 'Wielka Piątka jest gwarantowana?',
    a: 'W kraterze Ngorongoro często udaje się zobaczyć cztery z pięciu gatunków jednego dnia. Lampart jest największą niewiadomą. Nie obiecujemy konkretnych spotkań, bo sawanna nie jest zoo. Obiecujemy za to, że przewodnik zrobi wszystko, żeby ich poszukać.',
  },
  {
    q: 'Jaki aparat zabrać?',
    a: 'Jeśli zależy Ci na bliskich kadrach, minimum to zoom 200 mm. Wielu gości robi dziś świetne zdjęcia telefonem z małym teleobiektywem. Warto zabrać gruszkę do czyszczenia: kurz na safari pojawia się błyskawicznie.',
  },
  {
    q: 'Czy mogę połączyć safari z Zanzibarem?',
    a: 'Tak, i to bardzo dobry pomysł. Projektujemy safari tak, żeby naturalnie przechodziło w pobyt na plaży. Zobacz pakiet Safari i plaża jako przykład 10 nocy.',
    extendLink: true,
  },
];
