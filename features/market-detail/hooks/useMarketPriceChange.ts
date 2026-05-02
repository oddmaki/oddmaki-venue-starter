"use client";

import { useQuery } from "@tanstack/react-query";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export interface PriceChange {
  /** Absolute change in percentage points (e.g., +3.5 or -2.1) */
  change: number;
  /** Whether the price went up, down, or stayed the same */
  direction: "up" | "down" | "flat";
}

/**
 * Fetches the first trade for a market and computes the price change
 * from market inception to the current YES price.
 */
export function useMarketPriceChange(
  marketId: string,
  tickSize: string,
  currentYesPrice: number,
) {
  const client = useOddMakiClient();

  return useQuery<PriceChange | null>({
    queryKey: queryKeys.trades.chart(marketId, "priceChange"),
    queryFn: async () => {
      // Fetch early trades (oldest first, ascending order)
      // Pass timestampGte=0 to avoid null filter issues in subgraph
      const result = (await client.public.getChartTrades({
        marketId: BigInt(marketId),
        timestampGte: BigInt(0),
        first: 20,
      })) as any;

      const trades = result.trades || [];

      if (trades.length === 0) return null;

      // Find the first YES (outcome 0) trade
      const firstYesTrade = trades.find((t: any) => String(t.outcome) === "0");

      if (!firstYesTrade) return null;

      return computeChange(firstYesTrade, tickSize, currentYesPrice);
    },
    enabled: !!marketId && !!tickSize && currentYesPrice > 0,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

function computeChange(
  trade: { tick: string },
  tickSize: string,
  currentYesPrice: number,
): PriceChange {
  const tickSizeNum = parseFloat(tickSize);
  const initialPrice = (parseFloat(trade.tick) * tickSizeNum) / 1e18;
  const initialPercentage = parseFloat((initialPrice * 100).toFixed(2));

  const change = parseFloat((currentYesPrice - initialPercentage).toFixed(1));

  return {
    change,
    direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
  };
}
