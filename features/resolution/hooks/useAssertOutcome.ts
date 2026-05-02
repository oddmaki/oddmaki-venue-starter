"use client";

import { useConnection } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useAssertOutcome(marketId: string) {
  const client = useOddMakiClient();
  const { address } = useConnection();

  const marketIdBig = BigInt(marketId || "0");

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Asserting outcome...",
    successMessage: "Outcome asserted — liveness period started",
    errorMessage: "Assertion failed",
    invalidateKeys: [
      queryKeys.resolution.status(marketIdBig),
      queryKeys.resolution.assertion(marketIdBig),
      queryKeys.markets.detail(marketId),
    ],
  });

  const assertOutcome = async (outcome: string) => {
    if (!address) return;

    return execute(async () => {
      return client.uma.assertMarketOutcome({
        marketId: marketIdBig,
        outcome,
        autoApprove: true,
      });
    });
  };

  return { assertOutcome, isLoading, error };
}
