import type { FormattedMarket } from "./market";
import type { FormattedMarketGroup } from "@/features/market-groups/types";
import type { FormattedPriceMarketSeries } from "@/features/price-market-series/types";

export type UnifiedFeedItem =
  | { type: "standalone"; data: FormattedMarket }
  | { type: "group"; data: FormattedMarketGroup }
  | { type: "series"; data: FormattedPriceMarketSeries };
