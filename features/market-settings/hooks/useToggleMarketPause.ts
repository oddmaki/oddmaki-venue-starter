"use client";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useToggleMarketPause(marketId: string) {
  const client = useOddMakiClient();

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Updating market trading status...",
    successMessage: "Market trading status updated!",
    errorMessage: "Failed to update market status",
    invalidateKeys: [
      queryKeys.markets.trading(BigInt(marketId)),
      queryKeys.markets.detail(marketId),
    ],
  });

  const pauseMarket = async () => {
    return execute(() => client.market.pauseMarket(BigInt(marketId)));
  };

  const unpauseMarket = async () => {
    return execute(() => client.market.unpauseMarket(BigInt(marketId)));
  };

  return { pauseMarket, unpauseMarket, isLoading, error };
}
