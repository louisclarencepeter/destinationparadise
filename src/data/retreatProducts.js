// The yoga & safari retreat offered on /retreats, exposed to the booking flow
// as a selectable product. Prices are authored in USD (converted/formatted for
// EUR/PLN at display time). `departures` are the fixed 14-day start/end dates
// guests choose from instead of an open date picker.
export const RETREAT_PRODUCTS = [
  {
    slug: 'yoga-safari-retreat',
    title: 'Yoga & Safari Retreat',
    duration: '14 days · Zanzibar + safari',
    price: 4890,
    priceSub: 'per person',
    departures: [
      { start: '2026-07-04', end: '2026-07-17' },
      { start: '2026-09-05', end: '2026-09-18' },
      { start: '2026-10-03', end: '2026-10-16' },
      { start: '2027-02-06', end: '2027-02-19' },
      { start: '2027-06-05', end: '2027-06-18' },
      { start: '2027-09-04', end: '2027-09-17' },
    ],
  },
];
