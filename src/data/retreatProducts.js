// Retreats offered on /retreats and exposed to the booking flow as selectable
// products. Prices are authored in USD (converted/formatted for EUR/PLN at
// display time). `departures` are fixed start/end dates when the product uses
// scheduled groups; flexible products can be requested without a fixed date.
export const RETREAT_PRODUCTS = [
  {
    slug: 'yoga-safari-retreat',
    title: 'Yoga & Safari Retreat',
    duration: '14 days · Zanzibar + safari',
    price: 4890,
    priceSub: 'per person',
    // First (inaugural) retreat departs early December 2026, just before peak
    // season; subsequent departures spread across 2027.
    departures: [
      { start: '2026-12-01', end: '2026-12-14' },
      { start: '2027-02-07', end: '2027-02-20' },
      { start: '2027-06-05', end: '2027-06-18' },
      { start: '2027-09-04', end: '2027-09-17' },
      { start: '2027-12-01', end: '2027-12-14' },
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
    slug: 'private-teacher-led-retreat',
    title: 'Private Teacher-Led Retreat',
    duration: '3 - 10 days · custom dates',
    price: 390,
    priceSub: 'from per day',
    departures: [],
  },
];
