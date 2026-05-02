"use client";

import { useQuery } from "@tanstack/react-query";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useTraderTrades(address: string) {
  const client = useOddMakiClient();

  return useQuery({
    queryKey: queryKeys.trader.trades(address),
    queryFn: async () => {
      const result = await client.public.getTraderTrades({ trader: address });

      return result.fills ?? [];
    },
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
