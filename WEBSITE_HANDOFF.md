# Website reconciliation — 8 September 2026

The website work has been integrated on top of mobile reconciliation commit
`d03387fa` on `development`. This combines the pending catalog translations and
homepage section navigator with the current upstream website, rather than
replaying the old divergent checkout wholesale.

## Website changes

- Safari, package and excursion directories, plus related-trip cards, use matching
  background/text tokens in both themes. The white-on-white dark-mode defect is
  fixed, including hover and keyboard focus.
- English, German and Polish catalog content feeds excursion/safari listings,
  details, comparison cards, search and the preview store. Translation loading is
  accounted for on direct links and persisted-cart checkout. Localized editorial
  content retains source prices, IDs, imagery provenance and booking rules.
- The homepage section navigator works with deferred sections, direct hashes,
  repeat navigation and keyboard focus. Scroll settling stops when the user
  intervenes. Browsers without IntersectionObserver expose late-loaded content.
- Homepage sections and page-specific translations load on demand. Search code
  and catalog translations load when the search dialog opens. The restored font
  subsets retain German/Polish glyphs and save 124,780 WOFF2 bytes.
- Planner presentation and responsive styling are retained, including direct
  `/trip-planner` navigation. Homepage map descriptions use existing localized
  Explore content. Standard OpenStreetMap tiles replace the CARTO endpoint that
  returned API-key watermarks. Tiles retain browser caching and visible OSM
  attribution; the map is skipped during prerender and has no offline download.
  Provider reference: <https://operations.osmfoundation.org/policies/tiles/>.
- React 19 image-priority and translated-navigation key warnings are corrected.
  Compatible lockfile updates address the reported browserslist, fast-uri and
  nanoid advisories.
- Mobile generated content records the updated website source hashes; destination
  data and mobile runtime behavior remain unchanged.

## Historical source disposition

The nine pre-mobile local commits were reviewed individually. Accepted photo
assets/re-encodings and canonical-routing/challenge/CI fixes were already present
upstream. Rejected Chwaka/Mnemba image substitutions and old generated sitemap
merges were not replayed. Useful homepage, font, deferred-loading and planner work
from `c82a1256` was adapted to the current Router 8, Sentry and prerender setup.
Current upstream security/dependency changes were retained.

The original local history and all 137 modified/untracked file snapshots were
backed up before integration:

- Recovery directory:
  `/Users/louisclarencepetersgmail.com/Documents/Codex/2026-09-08/destination-paradise-website-backup`
- `local-development.bundle` preserves the old local branch history;
  `uncommitted-files.tar.gz`, `tracked-worktree.patch` and `workspace-sha256.json`
  preserve and identify the original files.
- Git stash `fca7f7e3db6299cfb5e4727cafa308a391978a91` preserves the original working
  state. The unrelated local `PROJECT_ISSUES_HANDOFF.md` is retained in place.

Use the reconciled `development` branch for subsequent work. Do not reapply the
entire old stash or bundle: its useful changes are already integrated, and it
also contains superseded website source.

## Validation and release boundary

Local validation passed ESLint, TypeScript, 207 website tests, 79 mobile tests,
mobile content consistency, a dependency audit with zero reported vulnerabilities,
and all 124 prerendered website routes. Browser regression coverage includes:

- Sixteen light/dark, desktop/mobile cases across the four directory/card views:
  no horizontal overflow, visible keyboard focus, body contrast at least 9.01:1
  and hover/focus contrast at least 4.86:1.
- German Rock excursion details, Polish birdwatching and translated Ngorongoro
  placeholders; language switching, mobile navigation and direct planner layout.
- German and Polish persisted checkout with catalog requests held for 1.8 seconds;
  the cart survives and checkout waits for the selected-language content.
- Safari upgrade prices render correctly after delayed catalog loads in English,
  German and Polish. All 94 source records per language retain their field shapes,
  numeric values and flags.
- Closed/open search loading, query results, focus trap, Escape restoration and
  reopening; no external write requests were sent.
- Direct/repeated homepage hash navigation, user interruption and the missing
  IntersectionObserver fallback (13 sections, 74 visible reveal elements).

Local browser evidence and reproducible checks are saved outside the repository:
`/Users/louisclarencepetersgmail.com/Documents/Codex/2026-09-08/dp-website-qa`.

The development preview is
<https://development--destinationparadisezanzibar.netlify.app>.
Confirm its Netlify commit and GitHub CI run against the final development HEAD;
local checks alone do not prove that a provider deployment is ready.

`main` and the public website are a separate release boundary. No
`development` → `main` pull request or production deployment is included in this
reconciliation. At the start of this work, production still served manual
Netlify deploy `6a8dbf35cb01b33e235abc4b` from 25 August. The store remains behind
its existing feature flag; payment processing and live booking submissions were
not enabled or exercised. This work creates no new signed mobile release.
