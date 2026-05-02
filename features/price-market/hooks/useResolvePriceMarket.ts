"use client";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useResolvePriceMarket(marketId: bigint) {
  const client = useOddMakiClient();

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Resolving price market...",
    successMessage: "Price market resolved!",
    errorMessage: "Failed to resolve price market",
    invalidateKeys: [
      queryKeys.priceMarket.detail(marketId),
      queryKeys.markets.detail(marketId.toString()),
      queryKeys.resolution.all,
    ],
  });

  const resolvePriceMarket = async () => {
    return execute(async () => {
      return client.priceMarket.resolvePyth(marketId);
    });
  };

  return { resolvePriceMarket, isLoading, error };
}
