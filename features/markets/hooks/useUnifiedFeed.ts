"use client";

import type { Market, FormattedMarket, UnifiedFeedItem } from "../types";
import type {
  FormattedMarketGroup,
  FormattedGroupOutcome,
  MarketGroupStatus,
} from "@/features/market-groups/types";

import { useQuery } from "@tanstack/react-query";
import { parseAncillaryData } from "@oddmaki-protocol/sdk";

import { calculateMarketPrices, formatVolume } from "../utils/formatting";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { getVenueId } from "@/config/venue.config";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

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

export function useUnifiedFeed(sortBy: "created" | "volume" = "created") {
  const client = useOddMakiClient();
  const venueId = getVenueId();

  return useQuery<UnifiedFeedItem[]>({
    queryKey: queryKeys.unifiedFeed.list(venueId?.toString(), sortBy),
    queryFn: async () => {
      const feedData = await client.public.getUnifiedMarketFeed({
        venueId,
        first: 50,
        sortBy,
      });

      const merged = client.public.mergeAndSortFeed(feedData, sortBy);

      return merged.map((item: any): UnifiedFeedItem => {
        if (item.type === "standalone") {
          return { type: "standalone", data: formatStandaloneMarket(item) };
        } else {
          const formatted = client.public.formatMarketGroupForDisplay(item);

          return { type: "group", data: formatGroup(formatted, item) };
        }
      });
    },
    enabled: !!client && venueId !== undefined,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
