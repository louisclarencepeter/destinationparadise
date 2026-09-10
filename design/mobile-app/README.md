# Destination Paradise mobile app design

Retrieved from Claude Design on 5 September 2026 using Share → Project HTML → Project archive. Updated the same day after applying the website map style requested by the user.

- [Interactive prototype](https://claude.ai/design/p/6f114af7-4b45-4706-a32f-2d460d76f312?file=Destination+Paradise+-+Mobile+App.dc.html&present=1)
- Main design: `Destination Paradise - Mobile App.dc.html`
- Current export: `../../docs/Destination Paradise mobile app design - map update 2026-09-05.zip`
- Original export retained: `../../docs/Destination Paradise mobile app design.zip`
- Source mapping supplied by Claude: `github.md`

The current archive contains 42 files, including the design, map component, runtime support, design system, fonts, images, and the user's website reference screenshot. Its ZIP integrity check passed, and all 42 extracted files were verified byte-for-byte against the archive. All exported files are preserved without modification.

The design covers Explore, Planner, and Weather. Explore now opens on a real interactive map, with the website's white numbered pins, coral outlines, solid coral selected pin and halo, and navy uppercase place label. There are seven Zanzibar destinations and 17 Mainland destinations. List remains available as an alternate view.

The website's CARTO dark tile endpoint was checked live and returned a tile bearing an "API KEY REQUIRED" watermark. The mobile prototype therefore uses real OpenStreetMap tiles with a dark filter; the basemap is an approximation of the website palette, while the pin styling follows the supplied screenshot. OpenStreetMap attribution remains visible.

Executed browser checks: fresh load opens on the map with real geography and pins; zoom changes the map scale; region switching displays seven and 17 pins respectively; Stone Town and Serengeti open destination sheets; Stone Town's Plan around action reaches Planner with its context; returning to Explore restores the map; save/remove works for Serengeti; full details and Back work; List remains available. Visually checked the selected Stone Town pin, coral halo, navy label, and dark map. Touch pinch gestures and offline/failure states were not independently tested. Earlier month-consistency and weather fixes were not re-audited during this map update.

This is a design prototype. AI responses, current weather, and quote submission are demo features. Use the Claude preview to review the interactive design; a native phone app has not been built by this retrieval.

Current archive SHA-256: `f692728ec97e60aebc1401c5ec3c768e58c622bf337fb7237af1559714ab401b`
