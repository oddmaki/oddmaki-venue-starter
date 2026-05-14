"use client";

import type { Market, FormattedMarket, UnifiedFeedItem } from "../types";
import type {
  FormattedMarketGroup,
  FormattedGroupOutcome,
  MarketGroupStatus,
} from "@/features/market-groups/types";

import { useInfiniteQuery } from "@tanstack/react-query";
import { parseAncillaryData } from "@oddmaki-protocol/sdk";

import { calculateMarketPrices, formatVolume } from "../utils/formatting";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { getVenueId } from "@/config/venue.config";
import { queryKeys } from "@/lib/oddmaki/queryKeys";
import { formatPriceMarketSeries } from "@/features/price-market-series";

export const UNIFIED_FEED_PAGE_SIZE = 50;

/**
 * Transform raw standalone market to FormattedMarket
 * (same logic as useMarkets.ts formatMarket)
 */
function formatStandaloneMarket(market: Market): FormattedMarket {
  const { yesPrice, noPrice } = calculateMarketPrices(market);
  const { title } = parseAncillaryData(market.question);

  return {
    ...market,
    question: title,
    yesPrice,
    noPrice,
    volumeFormatted: formatVolume(market.totalVolume || "0", 6),
  };
}

/**
 * Transform SDK-formatted group data into FormattedMarketGroup
 */

function formatGroup(sdkFormatted: any, rawGroup: any): FormattedMarketGroup {
  const outcomes: FormattedGroupOutcome[] = (sdkFormatted.outcomes || []).map(
    (o: any) => ({
      marketId: o.marketId,
      name: o.name,
      question: o.question || "",
      probability: o.probability ? parseFloat(o.probability) * 100 : 0,
      status: o.status,
      totalVolume: o.totalVolume || "0",
      volumeFormatted: formatVolume(o.totalVolume || "0", 6),
      isPlaceholder: false,
    }),
  );

  // Sum volume across all child markets
  const totalVolume = (rawGroup.markets || [])
    .reduce(
      (sum: number, m: { totalVolume?: string }) =>
        sum + parseFloat(m.totalVolume || "0"),
      0,
    )
    .toString();

  return {
    groupId: sdkFormatted.groupId,
    marketQuestion: sdkFormatted.marketQuestion,
    status: sdkFormatted.status as MarketGroupStatus,
    totalMarkets: sdkFormatted.totalMarkets || "0",
    activeMarketCount: sdkFormatted.activeMarketCount || "0",
    resolvedMarketId: sdkFormatted.resolvedMarketId || "0",
    tags: rawGroup.tags || [],
    createdAt: sdkFormatted.createdAt || "0",
    activatedAt: rawGroup.activatedAt || null,
    resolvedAt: rawGroup.resolvedAt || null,
    creator: rawGroup.creator?.address || "",
    outcomes,
    totalVolume,
    volumeFormatted: formatVolume(totalVolume, 6),
  };
}

type UnifiedFeedPage = {
  items: UnifiedFeedItem[];
  hasMore: boolean;
};

export function useUnifiedFeed(sortBy: "created" | "volume" = "created") {
  const client = useOddMakiClient();
  const venueId = getVenueId();

  return useInfiniteQuery({
    queryKey: queryKeys.unifiedFeed.list(venueId?.toString(), sortBy),
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<UnifiedFeedPage> => {
      const feedData = await client.public.getUnifiedMarketFeed({
        venueId,
        first: UNIFIED_FEED_PAGE_SIZE,
        skip: pageParam,
        sortBy,
      });

      const merged = client.public.mergeAndSortFeed(feedData, sortBy);

      const items = merged.map((item: any): UnifiedFeedItem => {
        if (item.type === "standalone") {
          return { type: "standalone", data: formatStandaloneMarket(item) };
        } else if (item.type === "series") {
          return { type: "series", data: formatPriceMarketSeries(item) };
        } else {
          const formatted = client.public.formatMarketGroupForDisplay(item);

          return { type: "group", data: formatGroup(formatted, item) };
        }
      });

      // SDK fetches up to `first` of each kind. If any bucket came back
      // full, there is likely another page.
      const standaloneCount = feedData?.standaloneMarkets?.length ?? 0;
      const groupCount = feedData?.marketGroups?.length ?? 0;
      const seriesCount = feedData?.priceMarketSeries?.length ?? 0;
      const hasMore =
        standaloneCount >= UNIFIED_FEED_PAGE_SIZE ||
        groupCount >= UNIFIED_FEED_PAGE_SIZE ||
        seriesCount >= UNIFIED_FEED_PAGE_SIZE;

      return { items, hasMore };
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length * UNIFIED_FEED_PAGE_SIZE : undefined,
    enabled: !!client && venueId !== undefined,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
