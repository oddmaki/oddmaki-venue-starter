"use client";

import type { Address } from "viem";

import { useQuery } from "@tanstack/react-query";
import { useConnection } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export interface UserPositions {
  YES: string;
  NO: string;
}

/**
 * Hook to fetch the user's YES/NO token balances for a market.
 * Returns formatted decimal strings (e.g. "10.50").
 */
export function useUserPositions(marketId: string) {
  const client = useOddMakiClient();
  const { address } = useConnection();

  return useQuery<UserPositions>({
    queryKey: queryKeys.positions.byMarketUser(BigInt(marketId), address!),
    queryFn: async () => {
      const balances = await client.market.getUserBalances(
        BigInt(marketId),
        address as Address,
        { formatted: true },
      );

      return balances as UserPositions;
    },
    enabled: !!address && !!marketId,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
