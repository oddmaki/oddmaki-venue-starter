"use client";

import { useQuery } from "@tanstack/react-query";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useMarketTopHolders(marketId: string, first: number = 20) {
  const client = useOddMakiClient();

  return useQuery({
    queryKey: queryKeys.marketHolders.top(marketId),
    queryFn: async () => {
      const result = await client.public.getMarketTopHolders({
        marketId,
        first,
      });

      return result.traderPositions ?? [];
    },
    enabled: !!marketId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
