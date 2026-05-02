"use client";

import { useQuery } from "@tanstack/react-query";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

/**
 * Fetch the market-level trading AC override address from the Diamond.
 * Returns address(0) if no override is set.
 */
export function useMarketTradingAC(marketId: bigint | undefined) {
  const client = useOddMakiClient();

  return useQuery<`0x${string}`>({
    queryKey: queryKeys.accessControl.marketTradingAC(
      marketId?.toString() ?? "",
    ),
    queryFn: async () => {
      return client.accessControl.getMarketTradingAC({ marketId: marketId! });
    },
    enabled: marketId !== undefined,
    staleTime: 30_000,
  });
}
