# Destination Paradise — Design System

A branded design system for **Destination Paradise**, a Zanzibar-based travel
company that sells guided excursions (Stone Town, Safari Blue dhow trips, spice
tours, dolphin snorkeling, Dream Dhow sunset cruises, etc.). The system is
extracted directly from the production React + Vite + Sass codebase so designs
made against it match the live site.

## Sources

- **Codebase:** <https://github.com/louisclarencepeter/destinationparadise>
  (React 18, Vite, Sass, Netlify Functions, FontAwesome, Lucide-react).
  - `src/styles/_variables.scss` — color, gradient, radius, shadow, breakpoint tokens
  - `src/styles/base.scss` — element base styles (h1/h2/button/body)
  - `src/styles/_mixins.scss` — button/card/flex/scrollbar mixins
  - `src/styles/_container.scss` — container width scale
  - `src/styles/components/_card.scss` — `@mixin dp-card` canonical card skin
  - `src/components/home/Hero.scss`, `Excursions.scss`, `Testimonials.scss`
  - `src/assets/data/*` — real product copy (excursion titles, testimonials)
- **Uploaded:** `uploads/destination-paradise-logo-primary.png` (logo),
  Playfair Display, Montserrat, and Kaushan Script TTFs (all OFL).
- **Live theme color:** `index.html` pins `theme-color=#0d6b73` (teal) but the
  stylesheet ships the navy `#1A4D6E` everywhere. **We follow the stylesheet**
  (and the logo, which uses navy + coral). Flag for the owner.

## Index — what's in this folder

| Path | Purpose |
|---|---|
| `colors_and_type.css` | Single CSS file exporting all brand tokens — colors, gradients, fonts, type scale, spacing, radii, shadows, motion. Import this in any new work. |
| `components/` | The exported React components (see the list below). |
| `fonts/` | The three brand TTFs: Playfair Display, Montserrat, Kaushan Script. |
| `assets/` | Logos, icons, and a curated set of Zanzibar photography used across the site. |
| `preview/` | Small HTML "cards" rendering each design-system concept, surfaced in the Design System tab. |
| `ui_kits/marketing-site/` | JSX recreation of the marketing site (navigation, hero, excursion cards, testimonials, footer, buttons, inputs). `index.html` is an interactive home-page mock. |
| `SKILL.md` | Cross-compatible skill manifest — describes how an agent should use this system. |

## Components

Exported on `window.DestinationParadiseDesignSystem_aac304`:

- **ArrowIcon** — the canonical CTA arrow (1.5 stroke, rounded caps, `currentColor`).
- **Badge** — uppercase pill label; the frosted `white` tone is the canonical on-photography variant.
- **Button** — navy→coral gradient primary plus a bordered `ghost` variant; text warms to coral on hover.
- **ExcursionCard** — the signature card: 6px coral→navy top bar, frosted duration badge, hover lift and image zoom.
- **SectionPanel** — rounded 32px section shell with the coral→navy top bar, radial coral wash, and centred script heading.
- **TestimonialCard** — quote card with circular avatar and coral star rating.

## Products in scope

Destination Paradise ships **one** public surface: a marketing site + booking
flow. No native app, no separate admin UI. So this kit has one UI kit:
`ui_kits/marketing-site/`.

---

## CONTENT FUNDAMENTALS

### Voice & tone
Warm, aspirational, sensory. Copy leans into Zanzibar's romance — spices,
dhows, Stone Town alleys, Indian Ocean sunsets — without becoming purple.
Short sentences sit next to long evocative ones. The brand talks **to** the
reader in second person ("your gateway," "your next trip"), **about** the
destination in third person. "We" appears only when referring to the company
operationally; most copy avoids first person entirely.

### Casing
- **Sentence case** for body copy, buttons, and in-card descriptions.
- **Title Case** for section titles ("Roaming Retreats", "View More Excursions").
- **lowercase italic script** for the brand motto (`your next trip to paradise...`).
- **UPPERCASE + 0.08em letter-spacing** for tiny utility labels only: duration
  badges ("HALF DAY", "FULL DAY"), eyebrow kickers.

### Punctuation & style
- Ellipses end emotional lines — `your next trip to Paradise...`.
- Em-dashes separate clauses; no oxford comma pattern is strictly enforced in
  the existing copy but we lean toward it in new copy.
- Exclamation points exist in testimonials (user-generated) but the brand
  itself uses them sparingly — max one per page.
- No hashtags. No marketing buzzwords ("unlock", "leverage", "game-changer").

### Tone examples from the live site
- Hero: "Welcome to your gateway to the enchanting Zanzibar Island! Imagine a
  place where each day is an adventure, and every horizon promises new
  discoveries."
- Excursion card: "Embark on a journey through the timeless Stone Town, a
  place where history resonates in every alley."
- Motto (logo): "your next trip to paradise"
- Section headers are poetic, not functional: **Roaming Retreats** (not "Our
  Tours"), Dream Dhow, etc.

### You / we / I
- **You** — addressing the reader. Default.
- **We** — only for operational copy ("we'll send a confirmation").
- **I** — never in brand voice; appears only in user testimonials.

### Emoji & symbols
**No emoji** in brand voice. The existing codebase uses FontAwesome and
Lucide icons for UI; unicode arrows and ★ stars appear in testimonials
(5-star rating). Keep it that way.

---

## VISUAL FOUNDATIONS

### Color
Palette is small and deliberate:

- **Navy `#1A4D6E`** (primary) — body text, nav, icon fills, button-gradient
  start. This is the ocean.
- **Secondary navy `#215A7C`** — slightly lighter for H2 headings and accented
  text.
- **Coral `#FF6F61`** (accent) — the sunset, used for the script motto, card
  top-edge accents, and the end stop of the button gradient. Never fills large
  areas — it's a punctuation color.
- **Hover coral `#FF926B`** — hover-only, warmer variant.
- **Background `#FAFBFD`** — cool off-white. Most pages are 95%+ this color.
- **Border `#E1E6EB`** — barely-there dividers.
- **Black `#1A1A1A`** — rare, for max-contrast fine copy only.

The palette is **warm where the action is, cool where it isn't**. Photography
leans cool-blue (ocean) and warm-gold (sunset) — never desaturated and never
grainy. B&W is never used.

### Type
Three families, each with exactly one job:

- **Kaushan Script** — logo, hero H1 "Destination Paradise", the motto, and
  large section titles ("Roaming Retreats"). **Never** for body or buttons.
- **Playfair Display** — body copy, paragraphs, card descriptions, button
  labels. It's the default `body { font-family }`.
- **Montserrat** — UI labels: nav items, H3/H4/H5, card titles, footer, form
  inputs, duration badges. Sans-serif rhythm against serif body.

Type mixes within a single card: Montserrat for the card title, Playfair for
the description, Montserrat again for the CTA link.

### Spacing & layout
- Container widths come in 5 steps: 640 / 768 / 1000 / 1200 / 1400px.
  Most page content targets **1200px**.
- Section padding uses `clamp()` for fluid breathing room:
  `clamp(1.5rem, 5vw, 3rem)` vertical, `clamp(1rem, 3vw, 2rem)` horizontal.
- Grid gaps: `clamp(1.35rem, 2vw, 2rem)` between cards.
- Breakpoints: sm=767 md=1023 lg=1024.

### Backgrounds
- **Solid off-white** everywhere by default.
- **Section panels** use a layered radial + linear gradient to add depth
  without color: `radial-gradient(circle at top left, rgba(coral, 0.12),
  transparent 28%), linear-gradient(180deg, #fff 0.95, #fff 0.88)`.
- **Hero** uses full-bleed video (with a poster JPEG fallback) behind a
  vertically-scrimmed gradient so white type stays legible.
- **No repeating patterns, no textures, no illustrations.** Photography
  carries all the visual weight.

### Imagery — color vibe
Real photography, always. Warm coastal-tropical palette: turquoise water,
gold sand, coral sunsets, green palms. Faces are candid, not staged. No
grain, no duotones, no B&W. Images go edge-to-edge inside cards with a
vertical dark scrim at the bottom to bleed into the card surface.

### Cards
Canonical card (from `_card.scss`):
- Gradient fill: off-white 160° from 96% → 86% opacity layered over a
  coral×navy tint (4%→8%).
- Border: `1px solid rgba(navy-secondary, 0.08)` — barely visible.
- Radius: **28px desktop, 22px mobile**.
- Shadow: `0 20px 45px rgba(navy, 0.10)` plus inner top hairline
  `inset 0 1px 0 rgba(white, 0.88)`.
- **Top accent bar** (signature): a 6px gradient strip from coral → secondary
  navy, sitting at the top edge of the card. This is the system's most
  recognizable decoration.
- Image portion: no rounding at the top (the accent bar sits above), 230px
  tall desktop, 200px mobile.
- Hover: lift by `translateY(-6px)`, deepen shadow, image scales 1.05, title
  shifts from navy-secondary → dark-coral.

### Buttons
- Default: gradient navy→coral at 80% opacity, white text, 0.5rem radius.
- Hover: darker gradient + text color shifts **to coral** (unusual — the
  text warms up while the button darkens).
- Corner radius is small (`0.5rem`) — not pills, not sharp.
- Ghost variant (inferred): transparent bg, 1px border, navy text.

### Borders & shadows
- Borders are almost always 1px and very low alpha (`rgba(navy, 0.08)`).
- Shadows are ocean-tinted (navy-alpha), not neutral black.
- Inner top hairline (`inset 0 1px 0 rgba(white, 0.88)`) is added to cards
  and panels to simulate a soft highlight — subtle but consistent.

### Transparency & blur
- Duration badges use `rgba(white, 0.78)` + `backdrop-filter: blur(10px)` —
  the only place blur is used in the system. Keep it rare.
- No frosted-glass nav, no modal scrim blur by default.

### Corner radii
- Buttons: `0.5rem`
- Small pills/badges: `999px`
- Cards: `22px` (sm) → `28px` (md+)
- Section panels: `32px`
- Hero description pill: `10px`
- Inputs: `5px`
- Icon buttons: `50%` (circle)

### Animation
- **Easing** is `ease-in-out` on transitions (0.3s default), `ease-out` on
  one-shot reveals (0.6s).
- **On-scroll reveal** on every card and section: fade in + 20px rise.
- **Hero text** slides in from 20px below with staggered delays
  (0s → 0.5s → 1s).
- **Hover lift** on cards: `-6px` rise + shadow deepen.
- **Image zoom** on card hover: `scale(1.05)`, 450ms.
- **No bounces, no springs, no 3D transforms.** Motion is calm and horizon-like.
- Reduced-motion is respected (`@media (prefers-reduced-motion: reduce)` kills
  all transitions in Excursions.scss).

### Hover & press
- **Hover** on links: color shift navy → coral, `translateX(4–5px)` on CTAs,
  icon nudge right.
- **Press** states are not explicitly styled; rely on browser default
  (opacity dip) or the gradient-darken from `$gradient-hover`.
- Focus ring: not custom in the codebase — **this is a gap** we document and
  recommend adding (`outline: 2px solid var(--dp-accent); outline-offset: 2px`).

### Layout rules
- Hero is `100dvh + nav-height`, full-bleed, video behind white type.
- Section panels sit centered, 95% width capped at 1200px, with generous
  vertical whitespace (`clamp(1.5rem, 4vw, 3rem)` margin).
- On mobile, grids collapse to 1 column. On tablet+ they go 2-up. Three-item
  grids center the orphan `:last-child` at 50% width.

---

## ICONOGRAPHY

### What the codebase uses
- **FontAwesome 6 Free** (`@fortawesome/fontawesome-free`, `free-solid-svg-icons`)
  for social icons (WhatsApp, Facebook, Instagram), navigation, and chat UI.
- **Lucide-react** (`lucide-react` v0.468) for modern line icons in newer
  pages. Both live side-by-side.
- **Inline SVG** for bespoke cases — notably the right-arrow in the excursion
  card CTA (a stroked 1.5px arrow, `M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3`).
  This is the **canonical CTA arrow**. Reproduce it exactly.
- **Emoji:** never.
- **Unicode:** ★ for ratings in testimonials. Nothing else.

### What this design system ships
- FontAwesome and Lucide are not copied locally — they're CDN-friendly. For
  any prototype built against this kit, load them from CDN:
  - Lucide: `<script src="https://unpkg.com/lucide@latest"></script>`
  - FontAwesome: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css">`
- The custom CTA arrow SVG is inlined in the UI kit's `Button.jsx` /
  `CardLink.jsx` — don't redraw it.
- PWA icons (`icon-192`, `icon-512`, `apple-touch-icon`) and the main
  primary logo are in `assets/`.

### Stroke & fill rules
- Lucide's default **1.5px stroke, rounded linecaps** matches the codebase's
  hand-drawn arrow. Use `stroke-width="1.5"` consistently.
- Icon color inherits `currentColor` — never hardcode a hex.
- Sizes: 16px for inline / 20px for CTA / 24px for nav / 32px+ for feature icons.

---

## Substitutions & flags for the owner

- Fonts uploaded match the codebase one-to-one — **no substitution**.
- Logo provided is the primary (circular). A simplified single-color or
  horizontal variant does not exist in the repo. Flagging: **we'd benefit
  from a lockup variant (logo + wordmark horizontal) for nav usage at small
  sizes.**
- Theme-color `#0d6b73` in `index.html` disagrees with `$color-primary` in
  the Sass. We chose the Sass (and logo). Confirm which is intended.
- Focus-ring styling is absent from the live codebase. The kit adds
  `outline: 2px solid var(--dp-accent)` as a sensible default; please review.
- No dark mode exists. Not shipped here.
