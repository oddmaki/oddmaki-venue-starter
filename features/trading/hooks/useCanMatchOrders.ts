"use client";

import { useQuery } from "@tanstack/react-query";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

/**
 * MatchPreview from the canMatchOrders view function.
 * Viem decodes the ABI tuple into an object with these named fields.
 */
export interface MatchPreview {
  normalYesCross: boolean;
  normalNoCross: boolean;
  mintFeasible: boolean;
  mergeFeasible: boolean;
  anyMatchable: boolean;
  yesBestBid: bigint;
  yesBestAsk: bigint;
  noBestBid: bigint;
  noBestAsk: bigint;
  yesBidHeadExpired: boolean;
  yesAskHeadExpired: boolean;
  noBidHeadExpired: boolean;
  noAskHeadExpired: boolean;
}

/**
 * Polls canMatchOrders every 10 seconds to detect matchable order conditions.
 * Free eth_call (view function) — no gas cost.
 */
export function useCanMatchOrders(marketId: string) {
  const client = useOddMakiClient();

  return useQuery<MatchPreview>({
    queryKey: queryKeys.orderbook.matchPreview(marketId),
    queryFn: async () => {
      const result = await client.trade.canMatchOrders(BigInt(marketId));

      return result as MatchPreview;
    },
    enabled: !!marketId,
    staleTime: 5_000,
    refetchInterval: 10_000,
  });
}
