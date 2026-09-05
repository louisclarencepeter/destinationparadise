# Review notes draft

Use after the release gates in `README.md` have been closed and the final signed candidate has been checked. Replace unresolved fields in the store form; do not paste internal blockers as though they were implemented.

## Notes for the reviewer

Destination Paradise is a Zanzibar and Tanzania travel discovery and itinerary-planning app. It supports phones and tablets in both orientations. No account or login is required.

The current provisional Apple listing is **Destination Paradise Zanzibar** (app `6809042574`); Google Play and the installed app use **Destination Paradise**. Both use bundle/package `com.yournexttriptoparadise.mobile` under the confirmed Louis Peter publisher.

1. Open **Explore** to view the real interactive destination map. Switch between Zanzibar and mainland Tanzania, tap a numbered pin, save a destination, or switch to the list on a phone. Tablets show the destination sidebar next to the map. **Plan a trip around…** opens Planner with that destination.
2. In **Planner**, choose a month, length, party size, pace and budget. The app asks for explicit permission before sending trip preferences and messages to Destination Paradise's backend and Anthropic. Start planning and enter an ordinary travel request, for example: “A relaxed nine-night Zanzibar trip for two adults in September, with Stone Town and beach time.” AI content is labelled as suggestions.
3. Review the draft and full transcript through the review flow. **Send to the team** opens the contact step. It requires name, email and a separate sharing checkbox; phone is optional. **Send quote request** is the action that sends the request to the travel team. Chat alone does not send an email, take payment or confirm a booking. This is a live service, so use contact details controlled by the reviewer if testing delivery.
4. Open **Weather** for current Zanzibar conditions supplied by Apple Weather through Destination Paradise's WeatherKit proxy, and the seasonal guide. Selecting a month can open Planner with that month. The illustrative weather motion has a Pause/Play control and obeys system reduced-motion preferences. The monthly guide describes typical seasons, not a forecast for an exact future date. Sea temperature is unavailable from this provider.
5. App information includes the [mobile privacy policy](https://destination-paradise-mobile.netlify.app/mobile-privacy.html), service attributions and a confirmation-based control to clear locally saved trip preferences and places.
6. Use **Report reply** under an AI response to open **Report AI reply**. Select a reason, optionally add notes, review the selected reply and confirm sharing before tapping **Submit report**. The app sends only that selected reply, reason and notes to the team for review; it does not attach the remaining conversation or separate contact fields. The endpoint must be live for this release; submission creates a real team report email.

Map tiles, photos, AI and live weather require internet access. Map and weather failures show recovery controls. There are no digital subscriptions or in-app purchases. Links to excursions, safari packages, food venues and events open external pages. Any purchases are for travel services consumed outside the app.

The app does not request the device's location. Pins represent supplied destination coordinates and weather uses a fixed Zanzibar location. It is a discovery map, not navigation or an emergency weather service.

Weather and AI reply reports use `https://destination-paradise-mobile.netlify.app`. Planner chat and quote sending use `https://yournexttriptoparadise.com`, which also hosts the main travel website and support links.

## Complete before submission

- The backend and privacy page are deployed; weather/availability checks are recorded in `README.md`. Confirm final-candidate reporting interaction and controlled production delivery before using the notes above for submission. GET/invalid POST probes and mocked tests do not establish live report receipt.
- App Review contact is already saved and visually verified: Louis Peter, `louisclarencepeters@gmail.com`, `+255768779517`. Keep this reachable during review; a delivery/call test was not performed by this documentation task.
- Confirm the reviewed build's version/build number, working weather/report APIs on `destination-paradise-mobile.netlify.app`, working Planner/quote APIs on `yournexttriptoparadise.com`, and the published mobile privacy page at `https://destination-paradise-mobile.netlify.app/mobile-privacy.html`.
- Recheck external service availability during the review window. Apple expects complete metadata, working backend services and reviewer access. [Review preparation](https://developer.apple.com/app-store/review/guidelines/#before-you-submit)

Corrected iOS `1.0.0 (3)` has completed its upload and is **Ready to Test** in the owner-only TestFlight group; the owner is **Invited**, automatic distribution is off, and acceptance/install is not yet verified. Corrected Android code `4` passed bounded exact-AAB-derived standalone phone/tablet regression; the published internal track remains code `3` pending a verified corrected upload. See [PUBLISH_STATUS.md](PUBLISH_STATUS.md) for exact build, submission and artifact evidence.

Apple privacy is published; contact, copyright, Travel category, 13+ rating, URLs and zero-price equivalents are saved. Final Apple name, DSA choice and country availability remain pending. Google IARC ratings and 18+ audience are saved; all ten Data Safety types and the preview are filled, but saving failed with `5C897C1E` and a fresh dashboard returned 403. Saved persistence is not verified. Authentic seven-inch Android captures are ready locally, not yet uploaded. Apple App Store version build `3` selection is saved and verified after navigating to App Information and back; the build/version row remained and Save was disabled. No App Review was submitted.

Google production access is not granted. A qualifying closed test needs at least 12 continuously opted-in testers for 14 days before applying for production access. Internal testing alone does not satisfy it. Remaining physical-device, TestFlight/Play-delivered runtime and controlled service checks remain distinct from the passed emulator regression.

## TestFlight / internal-test focus

Test map gestures and tablet orientation, phone keyboard visibility, saved data after relaunch, consent revocation, cancellation/error recovery, reporting, and accessibility settings. Report weather condition plus the displayed data time when noting a mismatch. Use test-owned contact details for any explicitly planned quote-delivery test; submission produces real email and should not be used as an automatic smoke test.
