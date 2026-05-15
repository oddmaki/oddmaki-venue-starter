"use client";

import { useAccount } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useReportResolution(marketId: string) {
  const client = useOddMakiClient();
  const { address } = useAccount();

  const marketIdBig = BigInt(marketId || "0");

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Reporting resolution...",
    successMessage: "Resolution reported to CTF",
    errorMessage: "Report failed",
    invalidateKeys: [
      queryKeys.resolution.status(marketIdBig),
      queryKeys.resolution.assertion(marketIdBig),
      queryKeys.markets.detail(marketId),
      queryKeys.markets.all,
    ],
  });

  const reportResolution = async (outcome: string) => {
    if (!address) return;

    return execute(async () => {
      return client.uma.reportResolution({
        marketId: marketIdBig,
        outcome,
      });
    });
  };

  return { reportResolution, isLoading, error };
}
