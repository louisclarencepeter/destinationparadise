// Retreats offered on /retreats and exposed to the booking flow as selectable
// products. Prices are authored in USD (converted/formatted for EUR/PLN at
// display time). `departures` are fixed start/end dates when the product uses
// scheduled groups; flexible products can be requested without a fixed date.
const YOGA_SAFARI_DEPARTURES = [
  { start: '2026-12-01', end: '2026-12-14' },
  { start: '2027-02-07', end: '2027-02-20' },
  { start: '2027-06-05', end: '2027-06-18' },
  { start: '2027-09-04', end: '2027-09-17' },
  { start: '2027-12-01', end: '2027-12-14' },
];

const ZANZIBAR_ONLY_DEPARTURES = [
  { start: '2026-12-01', end: '2026-12-09' },
  { start: '2027-02-07', end: '2027-02-15' },
  { start: '2027-06-05', end: '2027-06-13' },
  { start: '2027-09-04', end: '2027-09-12' },
  { start: '2027-12-01', end: '2027-12-09' },
];

const SAFARI_ONLY_DEPARTURES = [
  { start: '2026-12-05', end: '2026-12-09' },
  { start: '2027-02-11', end: '2027-02-15' },
  { start: '2027-06-09', end: '2027-06-13' },
  { start: '2027-09-08', end: '2027-09-12' },
  { start: '2027-12-05', end: '2027-12-09' },
];

export const RETREAT_PRODUCTS = [
  {
    slug: 'yoga-safari-retreat',
    title: 'Yoga & Safari Retreat',
    duration: '14 days · Zanzibar + safari',
    price: 4890,
    priceSub: 'per person',
    // First (inaugural) retreat departs early December 2026, just before peak
    // season; subsequent departures spread across 2027.
    departures: YOGA_SAFARI_DEPARTURES,
    options: [
      {
        slug: 'full-retreat',
        label: 'Full retreat',
        duration: '14 days · Zanzibar + safari',
        price: 4890,
        priceSub: 'per person',
        departures: YOGA_SAFARI_DEPARTURES,
      },
      {
        slug: 'zanzibar-only',
        label: 'Zanzibar-only',
        duration: '9 days · Zanzibar coast',
        price: 2490,
        priceSub: 'per person',
        departures: ZANZIBAR_ONLY_DEPARTURES,
      },
      {
        slug: 'safari-only',
        label: 'Safari-only',
        duration: '5 days · mainland safari block',
        price: 2400,
        priceSub: 'per person',
        departures: SAFARI_ONLY_DEPARTURES,
      },
    ],
  },
  {
    slug: 'coastal-reset-week',
    title: 'Coastal Reset Week',
    duration: '7 days · Zanzibar coast',
    price: 1890,
    priceSub: 'per person',
    departures: [
      { start: '2026-10-04', end: '2026-10-10' },
      { start: '2027-03-07', end: '2027-03-13' },
      { start: '2027-08-08', end: '2027-08-14' },
    ],
  },
  {
    slug: 'awham-thaivedic-flow-retreat',
    title: 'Awham Thaivedic Flow Retreat',
    duration: '6 days · Awham-led coastal retreat',
    price: 2290,
    priceSub: 'per person',
    departures: [],
  },
  {
    slug: 'private-teacher-led-retreat',
    title: 'Private Teacher-Led Retreat',
    duration: '3 - 10 days · custom dates',
    price: 390,
    priceSub: 'from per day',
    departures: [],
  },
];
