import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';
import '../styles/safaris.css';

const safariImg = (file) => `/assets/images/safaris/${file}`;

const PARKS = [
  {
    label: 'Park 01',
    area: '14,750 km²',
    name: 'Serengeti National Park',
    blurb: 'The endless plains. Home to the great migration — 1.5 million wildebeest and 250,000 zebra moving in lockstep with the rains.',
    tags: ['Migration', 'Big Five', 'Hot-air balloon'],
    image: safariImg('zebra-herd-on-track.jpg'),
    size: 'lg',
  },
  {
    label: 'Park 02',
    area: '260 km²',
    name: 'Ngorongoro Crater',
    blurb: 'A collapsed volcano, now a self-contained ecosystem with the densest concentration of predators in Africa. Black rhino still roam.',
    tags: ['Black rhino', 'Big Five', 'Crater rim lodges'],
    image: safariImg('rhino-on-plains.jpg'),
    size: 'lg',
  },
  {
    label: 'Park 03',
    area: '2,850 km²',
    name: 'Tarangire National Park',
    blurb: 'Elephant capital. Ancient baobabs and a year-round river that draws giant herds in the dry season. Wildly underrated.',
    tags: ['Elephants', 'Baobabs', 'Quiet roads'],
    image: safariImg('eland-herd-plains.jpg'),
  },
  {
    label: 'Park 04',
    area: '30,893 km²',
    name: 'Nyerere (Selous)',
    blurb: 'Africa’s largest game reserve. Boat safaris on the Rufiji, walking with armed rangers, fly-camping under impossible stars.',
    tags: ['Boat safari', 'Walking safari', 'Wild dog'],
    image: safariImg('buffalo-and-egret.jpg'),
  },
  {
    label: 'Park 05',
    area: '330 km²',
    name: 'Lake Manyara',
    blurb: 'Tree-climbing lions, alkaline flats stained pink with flamingos, and one of East Africa’s great birding spots — 400+ species.',
    tags: ['Tree-climbing lions', 'Flamingos', 'Birding'],
    image: safariImg('yellow-weaver-on-rail.jpg'),
  },
];

const ITINERARIES = [
  {
    rib: 'Most popular · 5 nights · From $2,640 pp',
    title: 'Ngorongoro & Tarangire',
    intro: 'Descend the crater for the Big Five at first light, then move to Tarangire’s elephant herds and baobabs. A classic Northern Circuit pairing.',
    days: [
      { d: 'Day 1', h: 'Fly to Arusha → Tarangire', p: 'Drive 2hrs to camp. Evening game drive among the baobabs.' },
      { d: 'Day 2', h: 'Tarangire elephants', p: 'Full-day drive along the Tarangire River. Hundreds of elephants in the dry months.' },
      { d: 'Day 3', h: 'Transfer to crater rim', p: 'Drive via Lake Manyara (optional stop for tree-climbing lions). Lodge perched on the crater edge.' },
      { d: 'Day 4', h: 'Crater floor', p: 'Pre-dawn descent. Black rhino, lion prides, flamingo flats. Picnic at Ngoitokitok Springs.' },
      { d: 'Day 5', h: 'Olduvai & back', p: 'Visit Olduvai Gorge (Leakey’s "cradle of mankind"). Fly back to Zanzibar.' },
    ],
    includes: '✓ All flights & transfers · ✓ Lodge upgrades · ✓ Crater fees · ✓ Cultural visit included',
    feature: true,
  },
  {
    rib: '3 nights · From $1,890 pp',
    title: 'Serengeti Migration',
    intro: 'Track the great wildebeest crossing on the Mara River. Tented camps, dawn game drives, sundowners on the kopjes.',
    days: [
      { d: 'Day 1', h: 'Fly Zanzibar → Seronera', p: 'Bush flight via Arusha. Afternoon game drive in the central Serengeti.' },
      { d: 'Day 2', h: 'Mara River crossing', p: 'Full-day drive following the migration. Picnic lunch on the plains. Optional balloon at dawn.' },
      { d: 'Day 3', h: 'Western corridor & back', p: 'Predator territory — lion, cheetah, hyena clans. Fly back to Zanzibar at sunset.' },
    ],
    includes: '✓ Bush flights · ✓ All meals · ✓ Park fees · ✓ Pro guide',
  },
  {
    rib: '4 nights · From $2,180 pp',
    title: 'Nyerere (Selous) Wild',
    intro: 'Boat safaris on the Rufiji, walking with armed rangers, fly-camping under the stars. The road less travelled.',
    days: [
      { d: 'Day 1', h: 'Zanzibar → Selous', p: '50-min flight to Mtemere airstrip. Afternoon boat safari at sunset.' },
      { d: 'Day 2', h: 'Walking safari', p: 'Morning bush walk with ranger. Afternoon game drive — wild dog territory.' },
      { d: 'Day 3', h: 'Fly camp', p: 'Move to a fly-camp deeper in the reserve. Camp fire, no fences, full stars.' },
      { d: 'Day 4', h: 'Rufiji to Zanzibar', p: 'Final boat safari at dawn (hippos, crocs, fish eagles). Fly back midday.' },
    ],
    includes: '✓ Boat & walking safaris · ✓ Fly-camping kit · ✓ All gear & meals · ✓ Ranger fees',
  },
  {
    rib: '3 nights · From $2,090 pp',
    title: 'Ruaha Big-Cat Trail',
    intro: 'A southern-circuit favourite for lion prides, leopard sightings, and fewer vehicles than the northern parks.',
    days: [
      { d: 'Day 1', h: 'Zanzibar → Ruaha', p: 'Morning bush flight into Ruaha. Evening game drive along the Great Ruaha River.' },
      { d: 'Day 2', h: 'Predator tracking', p: 'Full-day drive through prime lion and leopard habitat with bush lunch in the park.' },
      { d: 'Day 3', h: 'Baobabs & return', p: 'Sunrise game drive among baobab valleys, then afternoon flight back to Zanzibar.' },
    ],
    includes: '✓ Bush flights · ✓ Full board · ✓ Park fees · ✓ Professional guide',
  },
  {
    rib: '4 nights · From $2,860 pp',
    title: 'Mahale Chimp & Lake Tanganyika',
    intro: 'Track wild chimpanzees in Mahale Mountains and unwind on the white-sand shores of Lake Tanganyika.',
    days: [
      { d: 'Day 1', h: 'Zanzibar → Kigoma → Mahale', p: 'Flight west to Kigoma, then boat transfer to camp on the lakefront.' },
      { d: 'Day 2', h: 'Chimpanzee trekking', p: 'Morning forest trek with trackers. Afternoon swim and kayak on Tanganyika.' },
      { d: 'Day 3', h: 'Second chimp trek', p: 'Another guided trek for better chimp encounters and optional village visit.' },
      { d: 'Day 4', h: 'Lake morning & return', p: 'Sunrise on the beach, boat to Kigoma, and flight connection back.' },
    ],
    includes: '✓ Internal flights · ✓ Boat transfers · ✓ Chimp permits · ✓ Full board',
  },
  {
    rib: '5 nights · From $3,290 pp',
    title: 'Katavi Remote Frontier',
    intro: 'For seasoned safari travellers: dramatic dry-season game concentrations in one of Tanzania’s wildest, least-visited parks.',
    days: [
      { d: 'Day 1', h: 'Zanzibar → Katavi', p: 'Multi-leg bush flight to western Tanzania, with sunset game drive on arrival.' },
      { d: 'Day 2', h: 'Floodplain herds', p: 'Track buffalo super-herds and lion coalitions across Katavi floodplains.' },
      { d: 'Day 3', h: 'Hippo pools & riverbeds', p: 'Explore seasonal riverbeds packed with hippos and crocodiles.' },
      { d: 'Day 4', h: 'Full wilderness day', p: 'Deep-park game drives with picnic lunch and optional night drive.' },
      { d: 'Day 5', h: 'Final drive & fly out', p: 'Morning game loop before return flights east and onward transfer.' },
    ],
    includes: '✓ Bush flights · ✓ Luxury fly-camp · ✓ Park fees · ✓ Expert guide team',
  },
  {
    rib: 'Last-minute · 2 nights · From $1,190 pp',
    title: 'Tarangire + Ngorongoro Short Circuit',
    intro: 'The best-value short safari: elephants and baobabs in Tarangire, then the crater’s dense predator zones.',
    days: [
      { d: 'Day 1', h: 'Fly to Arusha → Tarangire', p: 'Transfer to park, afternoon game drive, overnight near Tarangire.' },
      { d: 'Day 2', h: 'Crater rim transfer', p: 'Morning drive, transfer to Ngorongoro highlands, evening at lodge.' },
      { d: 'Day 3', h: 'Crater game drive & return', p: 'Early crater descent and wildlife tracking before return flight to Zanzibar.' },
    ],
    includes: '✓ Flights · ✓ 2 lodge nights · ✓ Park & crater fees · ✓ Guide',
  },
  {
    rib: 'Last-minute · 1 night · From $790 pp',
    title: 'Ngorongoro Overnight',
    intro: 'Perfect when you can spare one night: crater wildlife at first light plus a lodge stay on the rim.',
    days: [
      { d: 'Day 1', h: 'Zanzibar → Arusha → crater rim', p: 'Morning flight, transfer to the highlands, evening sundowner at the lodge.' },
      { d: 'Day 2', h: 'Crater floor & fly back', p: 'Early descent for Big Five tracking, picnic lunch, return flight to Zanzibar.' },
    ],
    includes: '✓ Flights & transfers · ✓ Lodge stay · ✓ Crater fees · ✓ Guide',
  },
  {
    rib: 'Last-minute · 1 day · From $390 pp',
    title: 'Tarangire Express Day Safari',
    intro: 'A fast, high-impact one-day option for guests already in Zanzibar who want a real mainland game drive without overnighting.',
    days: [
      { d: 'Day 1', h: 'Zanzibar ↔ Arusha/Tarangire', p: 'Early flight out, full-day game drive in Tarangire, sunset return flight to Zanzibar.' },
    ],
    includes: '✓ Return flights · ✓ Park fees · ✓ Picnic lunch · ✓ Pro guide',
  },
];

const WILDLIFE_CATEGORIES = [
  {
    title: 'Big cats',
    sub: 'Predators',
    rowMod: 'cats',
    tiles: [
      { src: 'male-lion-in-grass.jpg', alt: 'Male lion lying in grass', cap: 'Male lion · Ngorongoro Crater', mod: 'wide' },
      { src: 'serval-in-grass.jpg', alt: 'Serval cat in grass', cap: 'Serval · rare daylight sighting' },
      { src: 'lion-cub-in-grass.jpg', alt: 'Lion cub in grass', cap: 'Cub · ten weeks old' },
      { src: 'lioness-and-cub-resting.jpg', alt: 'Lioness with cub resting', cap: 'Lioness & cub · evening rest', mod: 'wide' },
    ],
  },
  {
    title: 'Hooved giants',
    sub: 'The grazers',
    rowMod: 'ungulates',
    tiles: [
      { src: 'zebra-mare-and-foal.jpg', alt: 'Zebra mare and foal', cap: 'Zebra · mare and foal', mod: 'tall' },
      { src: 'zebra-herd-on-track.jpg', alt: 'Zebra herd on track', cap: 'The herd, deciding', mod: 'wide' },
      { src: 'wildebeest-grazing.jpg', alt: 'Blue wildebeest grazing', cap: 'Blue wildebeest' },
      { src: 'eland-grazing.jpg', alt: 'Eland grazing', cap: 'Eland · the largest antelope' },
      { src: 'eland-herd-plains.jpg', alt: 'Eland herd', cap: 'Eland herd · Ngorongoro', mod: 'wide' },
      { src: 'warthog-on-plains.jpg', alt: 'Warthog', cap: 'Warthog · Pumbaa, in person' },
    ],
  },
  {
    title: 'Heavyweights',
    sub: 'Big & rare',
    rowMod: 'heavy',
    tiles: [
      { src: 'buffalo-herd-close.jpg', alt: 'Cape buffalo herd close-up', cap: 'Cape buffalo · the dagga boys', mod: 'wide' },
      { src: 'buffalo-and-egret.jpg', alt: 'Buffalo with cattle egret', cap: 'Buffalo & egret · partners', mod: 'wide' },
      { src: 'rhino-on-plains.jpg', alt: 'Black rhino on plains', cap: 'Black rhino · <30 left in the crater', mod: 'full' },
    ],
  },
  {
    title: 'Birds',
    sub: '400+ species',
    rowMod: 'birds',
    tiles: [
      { src: 'crowned-crane-close.jpg', alt: 'Grey crowned crane close-up', cap: 'Grey crowned crane', mod: 'tall' },
      { src: 'crowned-cranes-in-grass.jpg', alt: 'Pair of crowned cranes', cap: 'The pair · always two' },
      { src: 'yellow-weaver-on-rail.jpg', alt: 'Yellow weaver on rail', cap: "Speke's weaver · lodge regular" },
      { src: 'raptor-on-log.jpg', alt: 'Lanner falcon on rock', cap: 'Lanner falcon · with prey', mod: 'wide' },
    ],
  },
];

const SEASONS = [
  {
    mod: 'peak',
    months: 'Jun · Jul · Aug · Sep · Oct',
    title: 'Dry & classic',
    blurb: 'Animals cluster at waterholes. The Mara River crossings happen July–September. Cool, golden grass, picture-postcard. Books out 6+ months ahead.',
    rating: '★★★★★',
  },
  {
    mod: 'good',
    months: 'Dec · Jan · Feb',
    title: 'Calving season',
    blurb: 'Wildebeest drop half a million calves on the southern Serengeti plains in February. Predator action peaks. Hot, but lush. Quieter parks.',
    rating: '★★★★☆',
  },
  {
    mod: 'shoulder',
    months: 'Nov · Mar',
    title: 'Green & cheap',
    blurb: 'Short rains. Skies are dramatic, parks empty, prices drop 20–30%. Birding peaks in November. Some bush roads can muddy.',
    rating: '★★★☆☆',
  },
  {
    mod: 'avoid',
    months: 'Apr · May',
    title: 'Long rains',
    blurb: 'Many camps close. Roads flood. Bargain-hunters only — and even then, we usually steer guests elsewhere this season.',
    rating: '★★☆☆☆',
  },
];

const INCLUDED_LIST = [
  'Bush flights between parks (Cessna)',
  'All park & conservation fees',
  'Silver-level certified guide',
  'Full board at every camp',
  'Sundowners & bush picnics',
  'Airport pickups in Zanzibar & Arusha',
  'Bottled water & drinks at lodge',
  '24/7 concierge on WhatsApp',
];

const SAFARI_TYPES = [
  {
    title: 'Classic game-drive safaris',
    desc: 'Private or small-group Land Cruiser drives across Serengeti, Ngorongoro, Tarangire, and Lake Manyara with expert local guides.',
    bestFor: 'First-time safari travellers',
    image: safariImg('male-lion-in-grass.jpg'),
    alt: 'Lion resting in grass on a classic game drive',
  },
  {
    title: 'Fly-in safaris',
    desc: 'Skip long road transfers and connect key parks by bush flight from Zanzibar, Arusha, or Dar es Salaam.',
    bestFor: 'Limited time, maximum game time',
    image: safariImg('eland-herd-plains.jpg'),
    alt: 'Open plains landscape viewed on a fly-in safari route',
  },
  {
    title: 'Walking safaris',
    desc: 'Guided bush walks with armed rangers in wilderness areas like Nyerere and Ruaha for a close-to-nature experience.',
    bestFor: 'Adventure and tracking lovers',
    image: safariImg('warthog-on-plains.jpg'),
    alt: 'Warthog spotted during a walking safari experience',
  },
  {
    title: 'Boat safaris',
    desc: 'River and lake safaris in Nyerere (Selous) and western circuits where wildlife is viewed from the water.',
    bestFor: 'Unique wildlife angles and birding',
    image: safariImg('buffalo-and-egret.jpg'),
    alt: 'Buffalo and egret near wetlands, ideal for boat safari viewing',
  },
  {
    title: 'Family safaris',
    desc: 'Family-friendly itineraries with shorter drives, flexible pacing, and lodges suited for children and multi-gen travel.',
    bestFor: 'Families with kids',
    image: safariImg('zebra-mare-and-foal.jpg'),
    alt: 'Zebra mare and foal, a family-friendly wildlife sighting',
  },
  {
    title: 'Luxury lodge & tented safaris',
    desc: 'High-comfort stays, premium camps, and curated service while staying close to migration routes and big-cat territory.',
    bestFor: 'Honeymoons and premium trips',
    image: safariImg('lioness-and-cub-resting.jpg'),
    alt: 'Lioness and cub resting in golden light near luxury camps',
  },
  {
    title: 'Budget camping safaris',
    desc: 'Value-focused routes using well-run camps and essential comforts without compromising guiding quality.',
    bestFor: 'Backpackers and budget-conscious travellers',
    image: safariImg('wildebeest-grazing.jpg'),
    alt: 'Wildebeest herd on open plains for budget camping routes',
  },
  {
    title: 'Bush + beach combinations',
    desc: 'Seamless Tanzania mainland safari paired with Zanzibar beach stays, with all flights and transfers coordinated.',
    bestFor: 'Safari + relaxation in one trip',
    image: safariImg('crowned-cranes-in-grass.jpg'),
    alt: 'Crowned cranes in grasslands representing bush and beach combo journeys',
  },
];

const FAQS = [
  {
    q: 'How many days do I need on safari?',
    a: 'Three nights is the absolute minimum and only worth it if you fly between parks. Five nights is the sweet spot. Anything over seven and you’ll start to crave the beach — which is why most guests pair safari with Zanzibar.',
    open: true,
  },
  {
    q: 'Is it safe to bring kids?',
    a: 'Yes — most camps welcome children 7+. We pick "family" lodges with pools and flexible game drives. For kids under 7, we suggest Tarangire (shorter drives, big elephant sightings) over Serengeti.',
  },
  {
    q: 'What about malaria?',
    a: 'Tanzania is a malaria area. Speak to your travel doctor about prophylaxis. Camps provide repellent, mosquito nets, and most have screened tents.',
  },
  {
    q: 'Big Five — guaranteed?',
    a: 'In the Ngorongoro Crater, you’ll usually tick four of five in a single day. Leopard is the wildcard — sometimes the same morning, sometimes never. We don’t promise sightings; the bush isn’t a zoo. We do promise we’ll work hard to find them.',
  },
  {
    q: 'What kind of camera should I bring?',
    a: 'A 200mm zoom minimum if you want frame-fillers. Most of our guests now shoot phones with a small clip-on telephoto and they do great. Bring a dust-blower — every camp’s nightmare is sand on the sensor.',
  },
  {
    q: 'Can I extend with Zanzibar?',
    a: 'Yes — and you should. We design every safari to flow into a beach stay. See our Bush & Beach package for a 10-night example.',
    extendLink: true,
  },
];

export default function Safaris() {
  const pageRef = useRef(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;

    const items = root.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);


  return (
    <main className="safaris-page" ref={pageRef}>
      {/* HERO */}
      <section className="saf-hero">
        <div className="saf-hero__bg">
          <img src={safariImg('male-lion-in-grass.jpg')} alt="" />
        </div>
        <div className="saf-hero__inner">
          <span className="saf-hero__eyebrow">Mainland Tanzania · the heart of what we do</span>
          <h1 className="saf-hero__title">Where the wild things <em>still</em> are.</h1>
          <p className="saf-hero__lead">
            From the Serengeti’s rolling plains to the Ngorongoro Crater’s lost world, we run small-group safaris with the rangers, pilots, and lodge owners we’ve known for years. No bus tours. No half-truths. Just the bush, well done.
          </p>
          <div className="saf-hero__cta">
            <a className="btn btn--lg" href="#itineraries">See itineraries</a>
            <Link className="btn btn--ghost btn--lg" to="/trip-planner">Plan with AI →</Link>
          </div>
          <div className="saf-hero__stats">
            <div><strong>5</strong><span>Parks</span></div>
            <div><strong>2.0M</strong><span>Wildebeest</span></div>
            <div><strong>$1,890</strong><span>From, per person</span></div>
            <div><strong>4.9★</strong><span>Tripadvisor</span></div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="saf-intro reveal">
        <div className="saf-intro__grid">
          <div className="saf-intro__copy">
            <span className="section-eyebrow">Our approach</span>
            <h2 className="section-title">Tanzania-bred guides who know the bush — and the islands.</h2>
            <p className="section-lead">
              We run the northern circuit — Serengeti, Ngorongoro, Tarangire — with bush flights so you spend more time on game drives and less in a Land Cruiser. Pair with a few days on Zanzibar’s coast, or stay pure bush. Every camp is hand-picked. Every guide is Silver-level certified or higher.
            </p>
          </div>
          <ul className="saf-intro__bullets">
            <li>
              <span className="saf-intro__num">01</span>
              <div>
                <strong>Small vehicles</strong>
                <p>Max 4 guests per Land Cruiser, every seat a window seat. No mini-buses.</p>
              </div>
            </li>
            <li>
              <span className="saf-intro__num">02</span>
              <div>
                <strong>Bush flights</strong>
                <p>Skip the 8-hour drive. Cessnas connect parks in under an hour.</p>
              </div>
            </li>
            <li>
              <span className="saf-intro__num">03</span>
              <div>
                <strong>Conservation fees built in</strong>
                <p>Park fees, ranger fees, community levies — never tacked on later.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* SAFARI TYPES */}
      <section className="saf-types reveal" id="safari-types">
        <header className="saf-types__head">
          <span className="section-eyebrow">What we offer across Tanzania</span>
          <h2 className="section-title">Different safari styles for different travellers.</h2>
          <p className="section-lead">From classic game drives and fly-in circuits to walking, boat, family, and bush-beach combinations — we tailor each route to your travel style.</p>
          <ul className="saf-types__modes">
            <li>
              <span className="saf-types__mode-tag">Dedicated safari</span>
              Safari-only booking: arrive in Arusha and we’ll pick you up for the northern or southern circuit.
            </li>
            <li>
              <span className="saf-types__mode-tag saf-types__mode-tag--accent">Last-minute</span>
              Already on Zanzibar? We can run 1 day, 1 night, 2 nights, or longer safari options — fast.
            </li>
            <li>
              <span className="saf-types__mode-tag">In a package</span>
              Combined with hotels and excursions in one seamless itinerary.
            </li>
          </ul>
        </header>
        <div className="saf-types__grid">
          {SAFARI_TYPES.map((item) => (
            <article className="saf-type-card" key={item.title}>
              <div className="saf-type-card__media">
                <img src={item.image} alt={item.alt} loading="lazy" />
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span className="saf-type-card__meta">Best for: {item.bestFor}</span>
            </article>
          ))}
        </div>
      </section>

      {/* PARKS */}
      <section className="parks reveal" id="parks">
        <header className="parks__head">
          <span className="section-eyebrow">The Northern Circuit & beyond</span>
          <h2 className="section-title">Five parks. Each its own world.</h2>
        </header>
        <div className="parks__grid">
          {PARKS.map((park) => (
            <article className={`park-card${park.size === 'lg' ? ' park-card--lg' : ''}`} key={park.name}>
              <div className="park-card__img"><img src={park.image} alt="" loading="lazy" /></div>
              <div className="park-card__body">
                <div className="park-card__meta"><span>{park.label}</span><span>{park.area}</span></div>
                <h3>{park.name}</h3>
                <p>{park.blurb}</p>
                <ul className="park-card__tags">
                  {park.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ITINERARIES */}
      <section className="itineraries reveal" id="itineraries">
        <header className="itineraries__head">
          <span className="section-eyebrow">Suggested routes</span>
          <h2 className="section-title">Itineraries — pick a starting point.</h2>
          <p className="section-lead">Every route is a sketch. Tell us your dates and we’ll re-plot the camps and flights around you.</p>
        </header>

        {ITINERARIES.map((it) => (
          <div className={`itin${it.feature ? ' itin--feature' : ''}`} key={it.title}>
            <div className={`itin__rib${it.feature ? ' itin__rib--gold' : ''}`}>{it.rib}</div>
            <div className="itin__head">
              <h3>{it.title}</h3>
              <p>{it.intro}</p>
            </div>
            <ol className="itin__days">
              {it.days.map((day) => (
                <li key={day.d}>
                  <span className="itin__day">{day.d}</span>
                  <div>
                    <strong>{day.h}</strong>
                    <p>{day.p}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="itin__foot">
              <span className="itin__includes">{it.includes}</span>
              <Link className="btn" to="/booking">Book this route →</Link>
            </div>
          </div>
        ))}
      </section>

      {/* WILDLIFE GALLERY */}
      <section className="wildlife reveal" id="wildlife">
        <header className="wildlife__head">
          <span className="section-eyebrow">From our last season</span>
          <h2 className="section-title">What you might see.</h2>
          <p className="section-lead">Real photos from real game drives, taken by our guides this past season — Ngorongoro and Serengeti, mostly. No stock library.</p>
        </header>

        {WILDLIFE_CATEGORIES.map((cat) => (
          <div className="wildlife__cat" key={cat.title}>
            <h3 className="wildlife__cat-title">
              <span>{cat.title}</span>
              <em>{cat.sub}</em>
            </h3>
            <div className={`wildlife__row wildlife__row--${cat.rowMod}`}>
              {cat.tiles.map((tile) => (
                <figure
                  className={`wildlife__tile${tile.mod ? ` wildlife__tile--${tile.mod}` : ''}`}
                  key={tile.src}
                >
                  <img src={safariImg(tile.src)} alt={tile.alt} loading="lazy" />
                  <figcaption>{tile.cap}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* WHEN TO GO */}
      <section className="when reveal" id="when">
        <header className="when__head">
          <span className="section-eyebrow">When to go</span>
          <h2 className="section-title">There’s no bad time. Just different ones.</h2>
        </header>
        <div className="when__grid">
          {SEASONS.map((s) => (
            <article className={`when-card when-card--${s.mod}`} key={s.title}>
              <div className="when-card__months">{s.months}</div>
              <h4>{s.title}</h4>
              <p>{s.blurb}</p>
              <span className="when-card__rating">{s.rating}</span>
            </article>
          ))}
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="included reveal">
        <div className="included__wrap">
          <div className="included__copy">
            <span className="section-eyebrow">What’s included</span>
            <h2 className="section-title">One price. Nothing surprise-charged.</h2>
            <p className="section-lead">We learnt a long time ago that "from $X" with twelve add-ons makes guests miserable. Our quotes include everything below.</p>
          </div>
          <ul className="included__list">
            {INCLUDED_LIST.map((item) => (
              <li key={item}><span>✓</span> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="saf-faq reveal" id="faq">
        <header className="saf-faq__head">
          <span className="section-eyebrow">FAQs</span>
          <h2 className="section-title">The questions everyone asks.</h2>
        </header>
        <div className="saf-faq__list">
          {FAQS.map((faq) => (
            <details className="saf-faq__item" key={faq.q} {...(faq.open ? { open: true } : {})}>
              <summary>{faq.q}</summary>
              <div className="saf-faq__body">
                {faq.extendLink ? (
                  <>
                    Yes — and you should. We design every safari to flow into a beach stay. See our{' '}
                    <Link to="/packages">Bush &amp; Beach package</Link> for a 10-night example.
                  </>
                ) : faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="saf-cta">
        <div className="saf-cta__bg">
          <img src={safariImg('lioness-and-cub-resting.jpg')} alt="" />
        </div>
        <div className="saf-cta__inner">
          <h2>Ready to plan?</h2>
          <p>Tell us when you’re free, who’s coming, and what you’re hoping for. We’ll come back within 24 hours with a real itinerary and a real price.</p>
          <div className="saf-cta__btns">
            <Link className="btn btn--lg btn--accent" to="/booking">Get a quote →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Or chat with our AI planner</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
