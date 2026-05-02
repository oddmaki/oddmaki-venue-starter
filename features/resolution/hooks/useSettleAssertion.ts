"use client";

import { useConnection } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useSettleAssertion(marketId: string) {
  const client = useOddMakiClient();
  const { address } = useConnection();

  const marketIdBig = BigInt(marketId || "0");

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Settling assertion...",
    successMessage: "Assertion settled",
    errorMessage: "Settlement failed",
    invalidateKeys: [
      queryKeys.resolution.status(marketIdBig),
      queryKeys.resolution.assertion(marketIdBig),
      queryKeys.markets.detail(marketId),
    ],
  });

  const settleAssertion = async (assertionId: string) => {
    if (!address) return;

    return execute(async () => {
      return client.uma.settleAssertion(assertionId as `0x${string}`);
    });
  };

  return { settleAssertion, isLoading, error };
}
