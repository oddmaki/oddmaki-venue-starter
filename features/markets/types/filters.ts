import type { MarketStatus } from "./market";

/**
 * Market filter and sorting options
 */
export interface MarketFilters {
  status?: MarketStatus;
  sortBy?: "volume" | "created" | "updated";
  sortOrder?: "asc" | "desc";
}
