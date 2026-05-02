"use client";

import { useQuery } from "@tanstack/react-query";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export type ResolutionPhase =
  | "ACTIVE_NO_ASSERTION"
  | "ASSERTION_PENDING"
  | "ASSERTION_EXPIRED"
  | "SETTLED_NOT_REPORTED"
  | "RESOLVED";

export interface MarketResolutionStatus {
  phase: ResolutionPhase;
  marketStatus: string;
  assertion: {
    hasAssertion: boolean;
    assertionId: string | null;
    outcome: string | null;
    settled: boolean;
  };
  assertionDetails: {
    asserter: string;
    expirationTime: number;
    canSettle: boolean;
    isDisputed: boolean;
  } | null;
  question: {
    requiredBond: bigint;
    currency: string;
    liveness: bigint;
  };
  resolution: {
    reportedToCTF: boolean;
    winningOutcome: string | null;
  };
}

/**
 * Hook to fetch full resolution lifecycle state for a market.
 * Determines which phase of the UMA resolution the market is in.
 */
export function useMarketStatus(marketId: string) {
  const client = useOddMakiClient();

  return useQuery<MarketResolutionStatus>({
    queryKey: queryKeys.resolution.status(BigInt(marketId)),
    queryFn: async () => {
      const status = await client.uma.getMarketStatus(BigInt(marketId));

      // Determine phase
      let phase: ResolutionPhase;
      let assertionDetails: MarketResolutionStatus["assertionDetails"] = null;

      if (status.isResolved) {
        phase = "RESOLVED";
      } else if (status.canReportResolution) {
        phase = "SETTLED_NOT_REPORTED";
      } else if (status.assertion.hasAssertion && !status.assertion.settled) {
        // Fetch assertion details to check expiration
        try {
          const details = await client.uma.getAssertionDetails(
            status.assertion.assertionId as `0x${string}`,
          );

          assertionDetails = {
            asserter: details.asserter,
            expirationTime: details.expirationTime,
            canSettle: details.canSettle,
            isDisputed: details.isDisputed,
          };
          phase = details.canSettle ? "ASSERTION_EXPIRED" : "ASSERTION_PENDING";
        } catch {
          // If we can't fetch details, assume pending
          phase = "ASSERTION_PENDING";
        }
      } else {
        phase = "ACTIVE_NO_ASSERTION";
      }

      return {
        phase,
        marketStatus: status.marketStatus,
        assertion: status.assertion,
        assertionDetails,
        question: status.question,
        resolution: status.resolution,
      };
    },
    enabled: !!marketId,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
