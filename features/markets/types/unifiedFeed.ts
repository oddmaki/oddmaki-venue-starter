import type { FormattedMarket } from "./market";
import type { FormattedMarketGroup } from "@/features/market-groups/types";

export type UnifiedFeedItem =
  | { type: "standalone"; data: FormattedMarket }
  | { type: "group"; data: FormattedMarketGroup };
