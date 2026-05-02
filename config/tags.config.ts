/**
 * Suggested tags for market creation and category filtering.
 */
export const SUGGESTED_TAGS = [
  "sports",
  "crypto",
  "defi",
  "politics",
  "finance",
  "economy",
  "elections",
  "geopolitics",
  "entertainment",
  "science",
  "technology",
  "business",
  "world",
  "culture",
  "mentions",
] as const;

export const MAX_TAGS = 5;

export interface CategoryConfig {
  id: string;
  label: string;
  matchTags: string[];
}

export const CATEGORIES: CategoryConfig[] = [
  { id: "politics", label: "Politics", matchTags: ["politics"] },
  { id: "sports", label: "Sports", matchTags: ["sports"] },
  { id: "crypto", label: "Crypto", matchTags: ["crypto", "defi"] },
  { id: "finance", label: "Finance", matchTags: ["finance", "defi"] },
  { id: "geopolitics", label: "Geopolitics", matchTags: ["geopolitics"] },
  { id: "technology", label: "Tech", matchTags: ["technology"] },
  { id: "culture", label: "Culture", matchTags: ["culture"] },
  { id: "economy", label: "Economy", matchTags: ["economy"] },
  { id: "elections", label: "Elections", matchTags: ["elections"] },
  { id: "mentions", label: "Mentions", matchTags: ["mentions"] },
];

export type SortMode = "trending" | "new";

export interface SortModeConfig {
  id: SortMode;
  label: string;
  sortBy: "volume" | "created";
}

export const SORT_MODES: SortModeConfig[] = [
  { id: "trending", label: "Trending", sortBy: "volume" },
  { id: "new", label: "New", sortBy: "created" },
];
