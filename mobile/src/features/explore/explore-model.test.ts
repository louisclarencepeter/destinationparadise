import test from "node:test";
import assert from "node:assert/strict";
import { destinations } from "../../data/content";
import { filterDestinations, websiteUrl } from "./explore-model";
const base = {
  region: "Zanzibar" as const,
  category: "all" as const,
  query: "",
  savedOnly: false,
  savedIds: [],
};
test("regions, categories, search and saved filters compose without leaking other places", () => {
  assert.equal(filterDestinations(destinations, base).length, 7);
  assert.equal(
    filterDestinations(destinations, { ...base, region: "Mainland" }).length,
    17,
  );
  assert.deepEqual(
    filterDestinations(destinations, { ...base, query: "stone town" }).map(
      (p) => p.id,
    ),
    ["stone-town"],
  );
  assert.deepEqual(
    filterDestinations(destinations, { ...base, category: "culture" }).map(
      (p) => p.id,
    ),
    ["stone-town"],
  );
  assert.deepEqual(
    filterDestinations(destinations, {
      ...base,
      savedOnly: true,
      savedIds: ["paje", "serengeti"],
    }).map((p) => p.id),
    ["paje"],
  );
  assert.equal(
    filterDestinations(destinations, { ...base, savedOnly: true }).length,
    0,
  );
});
test("destination links remain on the HTTPS website", () => {
  assert.equal(
    websiteUrl("/excursions?destination=stone-town"),
    "https://yournexttriptoparadise.com/excursions?destination=stone-town",
  );
  assert.equal(websiteUrl("https://evil.test"), null);
  assert.equal(websiteUrl("javascript:alert(1)"), null);
});
