# Destination Paradise Content Inventory

This document captures the current `development` website content before a redesign. Use it as the source map for preserving words, routes, booking flows, data modules, and assets while changing the visual design.

## Current Routes

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `src/components/home/Home.jsx` | Homepage with hero, featured excursions, unique experiences, gallery preview, testimonials, and map |
| `/excursions` | `src/components/excursions/ToursPage.jsx` | All Zanzibar excursions and tours |
| `/excursions/:id` | `src/components/excursions/TourDetails.jsx` | Detail page for a selected excursion |
| `/dream-dhow` | `src/components/unique/experiences/dreamdhow/DreamDhow.jsx` | Dream Dhow partner experience page |
| `/safaris` | `src/components/safaris/Safaris.jsx` | Tanzania safari overview and packages |
| `/book-now` | `src/components/safaris/BookNow.jsx` | Safari package booking page |
| `/aboutus` | `src/components/aboutus/AboutPage.jsx` | Company story, founder pitch, partner, and map |
| `/gallery` | `src/components/gallery/MyImageGallery.jsx` | Image and YouTube gallery |
| `/booking` | `src/components/store/Store.jsx` | Booking request form for excursions and Dream Dhow |
| `/cookies-policy` | `src/components/cookies/PolicyInfo.jsx` | Policy page scrolled to cookies section |
| `/privacy-policy` | `src/components/cookies/PolicyInfo.jsx` | Policy page scrolled to privacy section |
| `/terms-of-service` | `src/components/cookies/PolicyInfo.jsx` | Policy page scrolled to terms section |

## Navigation

Header menu items come from `src/components/header/components/MenuList.jsx`:

- Home: `/`
- Excursions: `/excursions`
- Safaris: `/safaris`
- About Us: `/aboutus`
- Gallery: `/gallery`
- Booking Request: `/booking`

The global layout wraps every route with header, main content, footer, cookie consent, and chatbot in `src/components/layout/Layout.jsx`.

## Global Brand And Contact

- Brand name: Destination Paradise
- Motto: `your next trip to Paradise...`
- Core destination: Zanzibar, Tanzania
- Email: `info@yournexttriptoparadise.com`
- Phone in footer: `+255 768 779 517`
- WhatsApp: `https://wa.me/message/YCOQDKJSDMXFD1`
- Footer location: Zanzibar, Tanzania
- Facebook: `https://www.facebook.com/yournexttriptoparadise/`
- Instagram: `https://www.instagram.com/yournexttriptoparadise/`
- YouTube: `https://www.youtube.com/@destinationparadisezanzibar`
- X/Twitter: `https://x.com/destinationxpar`

Note: `PolicyInfo.jsx` currently lists phone `+255 748 352 657`, which differs from the footer phone number.

## Homepage Content

Source: `src/components/home/Home.jsx`

Sections:

- Hero
- Roaming Retreats / featured excursions
- Unique Experiences
- Gallery preview
- Testimonials
- Map

Hero copy from `src/components/home/Hero.jsx`:

- H1: Destination Paradise
- Motto: your next trip to Paradise...
- Body: Welcome to your gateway to the enchanting Zanzibar Island! Imagine a place where each day is an adventure, and every horizon promises new discoveries.

Hero assets:

- Placeholder image: `/images/boat.jpg`
- Video assets:
  - `src/assets/videos/background_h.mp4`
  - `src/assets/videos/background_v.mp4`

Featured excursions from `src/assets/data/excursionsData.js`:

- Stone Town Heritage Walk: Embark on a journey through the timeless Stone Town, a place where history resonates in every alley.
- Dhow & Snorkeling Safari Blue: Experience the authentic and unrivaled Safari Blue - a full-day excursion aboard traditional, locally-crafted sailing dhows.
- Zanzibar Spice & Culture Tour: Embark on a half-day journey through Central Zanzibar, exploring the rich history shaped by cloves, nutmeg, cinnamon, and pepper.

Homepage gallery preview:

- Title: Gallery
- CTA: View More
- Mixes `/galleryimages/1.jpg`, `/galleryimages/2.jpg`, `/galleryimages/3.jpg` with YouTube videos.

Testimonials section:

- Title: Testimonials
- CTA: Book Now
- Data source: `src/assets/data/testimonials-data.js`

## Excursions

Main data source: `src/assets/data/tours.js`

Supporting copy/data modules:

- Descriptions: `src/assets/data/tripsdata/tourDescriptions.js`
- Images: `src/assets/data/tripsdata/tourImages.js`
- Activities: `src/assets/data/tripsdata/tourActivities.js`
- Inclusions: `src/assets/data/tripsdata/tourInclusion.js`
- What to bring: `src/assets/data/tripsdata/whatToBring.js`
- FAQs: `src/assets/data/tripsdata/tourFaqs.js`

Excursions page heading:

- Title: Excursions
- Subtitle: Unforgettable trips and tours in paradise

Excursion inventory:

| Tour | URL id | Duration | From price | Image |
| --- | --- | --- | --- | --- |
| Spice Tour | `zanzibar-spice-culture-tour` | Half-day | $60 | `/images/spicetour/spice.jpg` |
| Stone Town Tour | `stone-town-heritage-walk` | Half-day | $50 | `/images/stonetown/stonetown.jpg` |
| Prison Island Tour | `prison-island-boat-trip` | Half-day | $70 | `/images/prisonisland/prison.jpg` |
| Jozani Forest Tour | `jozani-forest-tour` | Half-day | $65 | `/images/jozaniforest/jozani.jpg` |
| Dolphin Tour | `dolphin-tour` | Half-day | $75 | `/images/dolphintour/dolphins.jpg` |
| Mnemba Snorkeling & Northern Zanzibar Trip | `mnemba-snorkeling-trip-north` | Full-day | $90 | `/images/mnemba/mnemba.jpg` |
| Safari Blue | `dhow-snorkeling-safari-blue` | Full-day | $85 | `/images/safariblue/safari-blue.jpg` |
| Local Fishing Adventure | `local-game-fishing` | Half-day | $60 | `/images/fishing/fishing.jpg` |
| Trip to Maalum Cave | `swimming-cave` | Half-day | $35 | `/images/cave/maalum.jpg` |
| Sandbank Picnic | `sandbank-picnic` | Half-day or Full-day | $75 | `/images/sandbank/sandbank.jpg` |
| Fishing in Kizimkazi | `kizimkazi-fishing` | Half-day or Full-day | $60 | `/images/kizimkazi-fishing/fishing.jpg` |
| Trip to Nungwi | `nungwi-trip` | Half-day or Full-day | $50 | `/images/nungwi/nungwi.jpg` |
| Quad Adventure: Local Villages, The Rock Restaurant, and Sunset | `quad-adventure` | 3.5 hours | $120 | `/images/quad/quadtour.jpg` |
| Sunset Experience: Michamvi Beach & The Rock Restaurant | `sunset-experience` | 3 hours | $50 | `/images/sunsetrock/sunsetrock.jpg` |
| Sunset Sailing: A Serene Evening on the Water | `sunset-sailing` | 3 hours | $60 | `/images/sunsetsailing/sunsetsail.jpg` |

Tour detail pages include:

- Main image
- Title and description
- Itinerary
- Activities
- Inclusions
- What to Bring
- FAQs
- Other Tours You Might Like
- Book Now button that routes to `/booking` with the tour pre-selected

## Unique Experiences

Data source: `src/assets/data/uniqueData.js`

- Dream Dhow Cruise: traditional dhow cruise along Zanzibar's coastline and waters.
- Zanzibar Cave Exploration: ancient limestone caves, history, and natural formations.
- Stand-Up Paddling Adventure: paddleboarding on Zanzibar waters.

Only Dream Dhow currently has a dedicated route: `/dream-dhow`.

## Dream Dhow Page

Source: `src/components/unique/experiences/dreamdhow/DreamDhow.jsx`

Hero:

- Title: Dream Dhow Zanzibar
- Slogan: Sail into Paradise, feel the ocean breeze, and make your Zanzibar story one to remember.

Sections:

- Experience the Dream
- Destination Paradise x DreamDhow
- Book Now CTA
- Our Tour Packages
- Gallery

Value propositions from `src/components/unique/experiences/dreamdhow/constants/tourData.js`:

- Best-in-Class Partners
- Unlock Exclusive Savings
- Seamless One-Stop Planning

Packages:

- Mnemba Island (Best Seller)
- Tumbatu Island
- Romantic Sunset Cruise

Primary assets:

- `/dreamdhow/mnemba/*`
- `/dreamdhow/sunset/*`
- `/dreamdhow/tumbatu/*`
- Partner logo: `src/assets/partners/unique-touch-logo.png`

## Safaris

Overview source: `src/assets/data/safarisdata/safariData.js`

Page intro:

Tanzania is one of the best safari destinations in the world, offering a variety of incredible wildlife experiences. From the vast plains of the Serengeti to the lush landscapes of Ngorongoro Crater, here are some of the top safaris you can experience in Tanzania.

Safari destinations:

| Safari | Subtitle | Location | Duration | Price | Image |
| --- | --- | --- | --- | --- | --- |
| Serengeti National Park | The Endless Plains | Northern Tanzania | 3-5 Days | $1,500 | `/images/serengeti.jpg` |
| Ngorongoro Crater | Africa's Eden | Arusha Region | 1-2 Days | 800 | `/images/ngorongoro.jpg` |
| Tarangire National Park | Home of the Giants | Manyara Region | 1-2 Days | $600 | `/images/tarangire.jpg` |

Safari experience types listed on the page:

- Game Drive Safaris
- Walking Safaris
- Hot Air Balloon Safaris
- Boat Safaris
- Chimpanzee Trekking

Package source: `src/components/safaris/components/packages/safariPackageData.js`

Safari packages:

| Package | Duration | Destinations | Price bands |
| --- | --- | --- | --- |
| Classic Northern Circuit Safari | 6 Days / 5 Nights | Tarangire, Lake Manyara, Serengeti, Ngorongoro | Budget $1,900, Mid $2,500, Luxury $4,000 |
| The Great Migration Safari | 8 Days / 7 Nights | Serengeti, Ngorongoro | Budget $2,500, Mid $3,500, Luxury $5,500 |
| Tanzania & Zanzibar Safari | 10 Days / 9 Nights | Tarangire, Serengeti, Ngorongoro, Zanzibar | Mid $3,800, Luxury $6,000 |
| Short Safari from Zanzibar | 3 Days / 2 Nights | Serengeti or Nyerere/Selous | Mid $1,500, Luxury $2,800 |
| Southern Tanzania Safari | 7 Days / 6 Nights | Nyerere/Selous and Ruaha | Mid $3,200, Luxury $5,000 |
| Chimpanzee Trekking & Safari | 7 Days / 6 Nights | Mahale Mountains, Katavi | Mid $4,500, Luxury $7,000 |
| Serengeti National Park - Day Safari from Zanzibar | 1 Day | Serengeti | Budget $800, Luxury $1,500 |
| Nyerere National Park (Selous) - Day Safari from Zanzibar | 1 Day | Nyerere/Selous | Budget $600, Luxury $1,200 |
| Mikumi National Park - Day Safari from Zanzibar | 1 Day | Mikumi | Budget $500, Luxury $1,000 |

Asset note: the safari overview image paths reference `/images/serengeti.jpg`, `/images/ngorongoro.jpg`, and `/images/tarangire.jpg`. These are not present in the current `public/images` listing and should be replaced or added during the redesign.

## About Page

Source: `src/components/aboutus/AboutPage.jsx`

Main copy from `src/components/aboutus/components/ContentSection.jsx`:

- Welcome to Destination Paradise
- Destination Paradise is a premier travel agency specializing in unforgettable trips and tours on Zanzibar Island, with plans to expand throughout Tanzania.
- Motto: for your next trip to paradise...
- The agency provides tours that showcase stunning locations, cultural richness, landscapes, and adventures across Zanzibar and Tanzania.
- Safari copy highlights Serengeti, Tarangire, Ngorongoro, Selous, and Mikumi.

Additional sections:

- Logo
- FounderPitch
- Partners
- Map

## Gallery

Source: `src/components/gallery/MyImageGallery.jsx`

Title: Explore Paradise Through Our Lens

Gallery hook: `src/hooks/useGalleryData.js`

Initial gallery includes:

- YouTube: `iq-NDeo_33k` - Paradise Resort Panorama
- `/galleryimages/1.jpg`
- YouTube: `CV1kZngopa4` - Quick Resort Overview
- YouTube: `Dh_oJvHz1Dc` - Resort Amenities Tour
- `/galleryimages/2.jpg`
- YouTube: `roDvGTjHdxc` - Resort Experience Highlight
- YouTube: `lfm1i7r4Pck` - Detailed Resort Tour
- `/galleryimages/3.jpg`
- YouTube: `phzWxJQDe3Y` - Resort Activities Showcase
- YouTube: `cdEycr-WT3U` - Resort Evening Experience

Additional gallery images are generated from `/galleryimages/4.jpg` through `/galleryimages/15.jpg`.

## Booking Request

Source: `src/components/store/Store.jsx`

Page title: Booking Request

Intro copy: Welcome to the booking request page. Please fill out the form below to make a new booking.

Slideshow assets:

- `/gallery/1.jpg`
- `/gallery/2.jpg`
- `/gallery/3.jpg`
- `/gallery/4.jpg`
- `/gallery/5.jpg`
- `/gallery/6.jpg`

Booking form source: `src/components/store/booking/BookingForm.jsx`

Form service: Formspree via `useForm("mlekgonz")`

Fields:

- Name
- Email
- Phone
- Preferred Date
- Select Tour
- Pick Up Location (Part of the Island)
- Message

Success message:

Thank you for your booking request! We will get back to you shortly.

Tour options:

- Spice Tour
- Historical City Tour
- Prison Island Boat Trip
- Jozani Forest Tour
- Dolphin Tour
- Sunset & The Rock Restaurant
- Snorkeling
- Village Tour
- Motorbike Renting
- Mnemba Snorkeling & Trip to the North
- Safari Blue
- Local Game Fishing
- Swimming in the Cave
- Sailing into the Sunset
- Quad Tour
- Mnemba Island (Best Seller)
- Tumbatu Island
- Romantic Sunset Cruise

Pickup locations:

- Stone Town
- Nungwi
- Kendwa
- Matemwe
- Pongwe
- Kiwengwa
- Uroa
- Chwaka
- Michamvi
- Bwejuu
- Pingwe
- Kizimkazi
- Fumba
- Paje
- Jambiani
- Makunduchi

## Footer And Newsletter

Source: `src/components/footer/Footer.jsx`

Newsletter title: Subscribe to our newsletter!

Newsletter endpoint: `/.netlify/functions/sendEmail`

Footer areas:

- Newsletter
- Contact Us
- Follow Us
- Legal links
- Copyright

## Policies

Source: `src/components/cookies/PolicyInfo.jsx`

Policy sections:

- Cookies Policy
- Privacy Policy
- Terms of Service
- Contact Information
- Frequently Asked Questions

Policy contact form is currently local-only and shows an alert; it does not submit to the Netlify or Formspree flows.

## Chatbot

Global component: `src/components/chatbot/Chatbot.jsx`

Function endpoint: `functions/chatbot.cjs`

Knowledge/training files:

- `chatbot/info.jsonl`
- `chatbot/Greeting and Introduction.txt`
- `chatbot/Zanzibar Trips and Excursions Info.txt`
- `chatbot/reformatted_chat_message_pairs.jsonl`
- `chatbot/reformatted_prompt_completion_pairs.jsonl`
- `chatbot/validation.jsonl`

## Netlify Functions And Integrations

- Newsletter/contact email: `functions/sendEmail.cjs`
- Chatbot API: `functions/chatbot.cjs`
- Google Maps API key helper: `functions/getGoogleMapsApiKey.cjs`
- Booking form: Formspree project id `mlekgonz`
- Netlify config: `netlify.toml`
- SPA redirects: `public/_redirects`

## Asset Library

Public assets:

- `public/dreamdhow`: 26 files
- `public/gallery`: 18 files
- `public/galleryimages`: 32 files
- `public/images`: 27 files
- `public/standuppaddling`: 3 files
- `public/zanzibarcave`: 13 files
- `public/robots.txt`
- `public/_redirects`

Source assets:

- Logos: `src/assets/logo/dlp.png`, `src/assets/logo/dlp1.png`, `src/assets/logo/DPL.pngG1.png`
- Partner logo: `src/assets/partners/unique-touch-logo.png`
- Map image: `src/assets/map/zanzibar.png`
- Videos: `src/assets/videos/background_h.mp4`, `src/assets/videos/background_v.mp4`
- Fonts:
  - `src/assets/fonts/Montserrat`
  - `src/assets/fonts/Kaushan_Script`
  - `src/assets/fonts/Playfair_Display`

## Redesign Preservation Notes

- Keep current route URLs where possible so existing links and SEO references do not break.
- Reuse the data modules for tours, safaris, unique experiences, testimonials, and gallery items.
- If the redesign changes public asset paths, update the data modules rather than hardcoding replacements in components.
- Fix or replace missing safari image paths during redesign.
- Unify contact phone numbers before launch.
- Preserve booking prefill behavior from tour detail and Dream Dhow pages into `/booking`.
- Preserve newsletter, chatbot, and Google Maps integrations unless intentionally removed.
