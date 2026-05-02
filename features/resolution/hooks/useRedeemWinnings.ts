"use client";

import { useConnection } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useRedeemWinnings(marketId: string) {
  const client = useOddMakiClient();
  const { address } = useConnection();

  const marketIdBig = BigInt(marketId || "0");

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Redeeming winnings...",
    successMessage: "Winnings redeemed",
    errorMessage: "Redemption failed",
    invalidateKeys: address
      ? [
          queryKeys.positions.byMarketUser(marketIdBig, address),
          queryKeys.balance.usdc(address),
          queryKeys.resolution.status(marketIdBig),
        ]
      : [],
  });

  const redeemWinnings = async () => {
    if (!address) return;

    return execute(async () => {
      return client.uma.redeemWinnings(marketIdBig);
    });
  };

  return { redeemWinnings, isLoading, error };
}
