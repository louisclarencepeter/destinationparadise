# Review notes draft

Use after the release gates in `README.md` have been closed and the final signed candidate has been checked. Replace unresolved fields in the store form; do not paste internal blockers as though they were implemented.

## Notes for the reviewer

Destination Paradise is a Zanzibar and Tanzania travel discovery and itinerary-planning app. It supports phones and tablets in both orientations. No account or login is required.

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
- Add the named App Review contact, reachable phone/email and any operational explanation required by the final store forms. `info@yournexttriptoparadise.com` is source-backed company support, not a verified individual App Review contact.
- Confirm the reviewed build's version/build number, working weather/report APIs on `destination-paradise-mobile.netlify.app`, working Planner/quote APIs on `yournexttriptoparadise.com`, and the published mobile privacy page at `https://destination-paradise-mobile.netlify.app/mobile-privacy.html`.
- Recheck external service availability during the review window. Apple expects complete metadata, working backend services and reviewer access. [Review preparation](https://developer.apple.com/app-store/review/guidelines/#before-you-submit)

At the 5 September 2026, 21:00 UTC status record, the iOS Simulator build had finished, been downloaded and installed on iPhone 17 Pro and iPad Pro 11-inch (M5). Standalone map/sidebar, Paje details, live Apple weather and pause/play checks passed as documented in `../VALIDATION.md`. Android production remained in progress at its last supplied snapshot. No store submission had been made, and the publisher answer was pending. The Simulator artifact is for testing and cannot replace a signed iOS store build; final store assets and physical-device/Android visual checks remain open.

## TestFlight / internal-test focus

Test map gestures and tablet orientation, phone keyboard visibility, saved data after relaunch, consent revocation, cancellation/error recovery, reporting, and accessibility settings. Report weather condition plus the displayed data time when noting a mismatch. Use test-owned contact details for any explicitly planned quote-delivery test; submission produces real email and should not be used as an automatic smoke test.
