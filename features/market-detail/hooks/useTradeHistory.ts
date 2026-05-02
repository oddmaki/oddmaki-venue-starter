"use client";

import { useQuery } from "@tanstack/react-query";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export interface Trade {
  id: string;
  market: { marketId: string };
  outcome: string;
  tick: string;
  amount: string;
  cost: string;
  tradeType: string;
  buyTrader: { id: string } | null;
  sellTrader: { id: string } | null;
  avgPrice: string | null;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
}

/**
 * Hook to fetch recent trade history for a market.
 */
export function useTradeHistory(marketId: string) {
  const client = useOddMakiClient();

  return useQuery<Trade[]>({
    queryKey: queryKeys.trades.byMarket(marketId),
    queryFn: async () => {
      const result = (await client.public.getTradeHistory({
        marketId: BigInt(marketId),
        first: 50,
      })) as any;

      return result.trades || [];
    },
    enabled: !!marketId,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
