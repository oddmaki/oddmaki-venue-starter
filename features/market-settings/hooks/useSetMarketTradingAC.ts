"use client";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useSetMarketTradingAC(marketId: string) {
  const client = useOddMakiClient();

  const {
    execute: executeSet,
    isLoading: isSettingAC,
    error: setError,
  } = useTransaction({
    pendingMessage: "Setting market trading access control...",
    successMessage: "Market trading access control updated!",
    errorMessage: "Failed to set access control",
    invalidateKeys: [
      queryKeys.accessControl.marketTradingAC(marketId),
      queryKeys.markets.detail(marketId),
    ],
  });

  const {
    execute: executeRemove,
    isLoading: isRemovingAC,
    error: removeError,
  } = useTransaction({
    pendingMessage: "Removing market trading access control...",
    successMessage: "Market trading access control removed!",
    errorMessage: "Failed to remove access control",
    invalidateKeys: [
      queryKeys.accessControl.marketTradingAC(marketId),
      queryKeys.markets.detail(marketId),
    ],
  });

  const setMarketTradingAC = async (acContract: `0x${string}`) => {
    return executeSet(() =>
      client.accessControl.setMarketTradingAC({
        marketId: BigInt(marketId),
        acContract,
      }),
    );
  };

  const removeMarketTradingAC = async () => {
    return executeRemove(() =>
      client.accessControl.removeMarketTradingAC({
        marketId: BigInt(marketId),
      }),
    );
  };

  return {
    setMarketTradingAC,
    removeMarketTradingAC,
    isLoading: isSettingAC || isRemovingAC,
    error: setError || removeError,
  };
}
