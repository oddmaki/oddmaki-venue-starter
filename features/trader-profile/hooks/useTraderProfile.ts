"use client";

import { useQuery } from "@tanstack/react-query";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useTraderProfile(address: string) {
  const client = useOddMakiClient();

  return useQuery({
    queryKey: queryKeys.trader.profile(address),
    queryFn: async () => {
      const result = await client.public.getTraderProfile(address);

      return result.user ?? null;
    },
    enabled: !!address,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
