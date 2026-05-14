"use client";

import { useQuery } from "@tanstack/react-query";

import { formatPriceMarketSeries } from "../utils/format";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { getVenueId } from "@/config/venue.config";

/**
 * Fetch a price market series by seriesKey for the configured venue.
 *
 * Returns null when the seriesKey is null/empty — used on the detail page
 * to conditionally fetch only when the current market belongs to a series.
 */
export function usePriceMarketSeries(seriesKey: string | null) {
  const client = useOddMakiClient();
  const venueId = getVenueId();

  return useQuery({
    queryKey: ["priceMarketSeries", venueId?.toString(), seriesKey],
    queryFn: async () => {
      if (!seriesKey || venueId === undefined) return null;
      const raw = await client.public.getPriceMarketSeries({
        venueId,
        seriesKey,
      });

      return raw ? formatPriceMarketSeries(raw) : null;
    },
    enabled: !!client && venueId !== undefined && !!seriesKey,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
