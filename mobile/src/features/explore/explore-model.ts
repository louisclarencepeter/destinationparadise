import type { Destination } from "@/src/data/content";
export const categories = [
  { id: "all", label: "All" },
  { id: "beach", label: "Beach & ocean" },
  { id: "culture", label: "Culture & food" },
  { id: "wildlife", label: "Wildlife" },
  { id: "family", label: "Family" },
] as const;
export type Category = (typeof categories)[number]["id"];
const tags: Record<string, Category[]> = {
  "stone-town": ["culture", "family"],
  fumba: ["beach"],
  kizimkazi: ["beach", "wildlife"],
  jozani: ["wildlife", "family"],
  nungwi: ["beach", "family"],
  matemwe: ["beach"],
  paje: ["beach"],
  serengeti: ["wildlife"],
  ngorongoro: ["wildlife", "family"],
  tarangire: ["wildlife", "family"],
  manyara: ["wildlife", "family"],
  "lake-natron": ["wildlife"],
  olduvai: ["culture"],
  maasai: ["culture", "family"],
  materuni: ["culture", "family"],
  mikumi: ["wildlife", "family"],
  selous: ["wildlife"],
  saadani: ["wildlife", "beach"],
  ruaha: ["wildlife"],
  mahale: ["wildlife"],
  katavi: ["wildlife"],
};
export function filterDestinations(
  items: Destination[],
  filters: {
    region: Destination["region"];
    category: Category;
    query: string;
    savedOnly: boolean;
    savedIds: string[];
  },
): Destination[] {
  const terms = filters.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter(
    (item) =>
      item.region === filters.region &&
      (filters.category === "all" ||
        tags[item.id]?.includes(filters.category)) &&
      (!filters.savedOnly || filters.savedIds.includes(item.id)) &&
      terms.every((term) =>
        `${item.name} ${item.desc} ${item.type} ${item.text} ${item.bestFor.join(" ")}`
          .toLowerCase()
          .includes(term),
      ),
  );
}
export function websiteUrl(path: string): string | null {
  try {
    const url = new URL(path, "https://yournexttriptoparadise.com");
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      url.hostname === "yournexttriptoparadise.com"
      ? url.href
      : null;
  } catch {
    return null;
  }
}
