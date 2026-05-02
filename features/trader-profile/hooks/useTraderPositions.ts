"use client";

import { useQuery } from "@tanstack/react-query";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useTraderPositions(address: string) {
  const client = useOddMakiClient();

  return useQuery({
    queryKey: queryKeys.trader.positions(address),
    queryFn: async () => {
      const result = await client.public.getTraderPositions({
        trader: address,
      });

      return result.traderPositions ?? [];
    },
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useTraderClosedPositions(address: string) {
  const client = useOddMakiClient();

  return useQuery({
    queryKey: queryKeys.trader.closedPositions(address),
    queryFn: async () => {
      const result = await client.public.getTraderClosedPositions({
        trader: address,
      });

      return result.traderPositions ?? [];
    },
    enabled: !!address,
    staleTime: 30_000,
  });
}
