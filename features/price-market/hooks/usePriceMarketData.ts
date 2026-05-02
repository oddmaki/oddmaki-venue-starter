"use client";

import { useQuery } from "@tanstack/react-query";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

/**
 * Fetch price market data for a given market.
 * Returns isPriceMarket, priceMarket details, and canResolve flag.
 */
export function usePriceMarketData(marketId: bigint) {
  const client = useOddMakiClient();

  return useQuery({
    queryKey: queryKeys.priceMarket.detail(marketId),
    queryFn: async () => {
      const isPM = await client.priceMarket.isPriceMarket(marketId);

      if (!isPM) {
        return { isPriceMarket: false as const, data: null, canResolve: false };
      }

      const [data, canResolve] = await Promise.all([
        client.priceMarket.get(marketId),
        client.priceMarket.canResolve(marketId),
      ]);

      return { isPriceMarket: true as const, data, canResolve };
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}
