"use client";

import { useConnection } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

/**
 * Submits a dispute for an active UMA assertion via the SDK.
 *
 * `client.uma.disputeAssertion` resolves the oracle address, reads the
 * assertion's currency/bond, approves the oracle if needed, then calls
 * disputeAssertion(assertionId, disputer) on the Optimistic Oracle V3.
 * Once submitted, the oracle escalates the assertion to UMA's DVM.
 */
export function useDisputeAssertion(marketId: string) {
  const client = useOddMakiClient();
  const { address } = useConnection();

  const marketIdBig = BigInt(marketId || "0");

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Disputing assertion...",
    successMessage: "Dispute submitted — escalated to UMA DVM",
    errorMessage: "Dispute failed",
    invalidateKeys: [
      queryKeys.resolution.status(marketIdBig),
      queryKeys.resolution.assertion(marketIdBig),
      queryKeys.markets.detail(marketId),
    ],
  });

  const disputeAssertion = async (assertionId: string) => {
    if (!address) return;

    return execute(async () => {
      return client.uma.disputeAssertion({
        assertionId: assertionId as `0x${string}`,
        autoApprove: true,
      });
    });
  };

  return { disputeAssertion, isLoading, error };
}
