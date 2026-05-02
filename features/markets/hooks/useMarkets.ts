"use client";

import type { Market, FormattedMarket } from "../types";

import { useQuery } from "@tanstack/react-query";
import { parseAncillaryData } from "@oddmaki-protocol/sdk";

import { calculateMarketPrices, formatVolume } from "../utils/formatting";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { getVenueId } from "@/config/venue.config";

/**
 * Transform raw market data to formatted market
 */
function formatMarket(market: Market): FormattedMarket {
  const { yesPrice, noPrice } = calculateMarketPrices(market);

  // Parse question to get title
  const { title } = parseAncillaryData(market.question);

  return {
    ...market,
    question: title, // Override with just the title
    yesPrice,
    noPrice,
    volumeFormatted: formatVolume(market.totalVolume || "0", 6), // USDC has 6 decimals
  };
}

export function useMarkets() {
  const client = useOddMakiClient();
  const venueId = getVenueId();

  return useQuery({
    queryKey: ["markets", venueId?.toString()],
    queryFn: async () => {
      const result = (await client.public.getMarketsWithPricing({
        venueId,
        first: 100,
        skip: 0,
      })) as any;

      const markets = result.markets || [];

      return markets.map(formatMarket);
    },
    enabled: !!client && venueId !== undefined,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  });
}
