"use client";

import type { Address } from "viem";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { UmaOracleABI } from "@oddmaki-protocol/sdk";

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
    disputer: string;
    currency: Address;
    bond: bigint;
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
  const publicClient = usePublicClient();

  return useQuery<MarketResolutionStatus>({
    queryKey: queryKeys.resolution.status(BigInt(marketId)),
    queryFn: async () => {
      const status = await client.uma.getMarketStatus(BigInt(marketId));

      let phase: ResolutionPhase;
      let assertionDetails: MarketResolutionStatus["assertionDetails"] = null;

      if (status.isResolved) {
        phase = "RESOLVED";
      } else if (status.canReportResolution) {
        phase = "SETTLED_NOT_REPORTED";
      } else if (status.assertion.hasAssertion && !status.assertion.settled) {
        try {
          const details = await client.uma.getAssertionDetails(
            status.assertion.assertionId as `0x${string}`,
          );

          // For disputed assertions the time-based canSettle is meaningless —
          // settling depends on the DVM having pushed a price. Probe by
          // simulating settleAssertion on the oracle: it succeeds iff the
          // DVM (or mock OracleAncillary in tests) has resolved.
          let canSettle = details.canSettle;

          if (details.isDisputed) {
            const oracleAddress = await client.uma.getUmaOracleAddress();

            try {
              await publicClient!.simulateContract({
                address: oracleAddress,
                abi: UmaOracleABI,
                functionName: "settleAssertion",
                args: [status.assertion.assertionId as `0x${string}`],
              });
              canSettle = true;
            } catch {
              canSettle = false;
            }
          }

          assertionDetails = {
            asserter: details.asserter,
            expirationTime: details.expirationTime,
            canSettle,
            isDisputed: details.isDisputed,
            disputer: details.disputer,
            currency: details.currency,
            bond: details.bond,
          };
          phase = canSettle ? "ASSERTION_EXPIRED" : "ASSERTION_PENDING";
        } catch {
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
    enabled: !!marketId && !!publicClient,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
